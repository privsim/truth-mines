#!/usr/bin/env python3
"""
TOON builder script for Truth Mines.

Converts edges/*.jsonl to dist/edges.toon format.
"""

import argparse
import json
import sys
from collections import defaultdict
from pathlib import Path
from typing import Any, Dict, List


def load_edges(edges_dir: Path) -> Dict[str, List[Dict[str, Any]]]:
    """
    Load all edge JSONL files and group by relation.

    Returns dict of relation → list of edges.
    """
    edges_by_relation = defaultdict(list)

    if not edges_dir.exists():
        return dict(edges_by_relation)

    for edge_file in edges_dir.glob("**/*.jsonl"):
        try:
            with open(edge_file) as f:
                for line in f:
                    line = line.strip()
                    if not line:
                        continue

                    try:
                        edge = json.loads(line)
                        relation = edge.get("relation", "unknown")
                        edges_by_relation[relation].append(edge)
                    except json.JSONDecodeError as e:
                        print(f"Warning: Invalid JSON in {edge_file}: {e}", file=sys.stderr)

        except IOError as e:
            print(f"Warning: Failed to read {edge_file}: {e}", file=sys.stderr)

    return dict(edges_by_relation)


def generate_toon(edges_by_relation: Dict[str, List[Dict[str, Any]]]) -> str:
    """
    Generate TOON format from edges grouped by relation.

    Returns TOON formatted string.
    """
    toon_lines = []

    for relation, edges in sorted(edges_by_relation.items()):
        if not edges:
            continue

        # Header: relation[count]{fields}:
        count = len(edges)

        # Determine if we have weights
        has_weights = any(e.get("w") is not None for e in edges)

        if has_weights:
            fields = "f,t,w,domain"
        else:
            fields = "f,t,domain"

        header = f"{relation}[{count}]{{{fields}}}:"
        toon_lines.append(header)

        # Data rows
        for edge in edges:
            from_id = edge.get("f", "")
            to_id = edge.get("t", "")
            domain = edge.get("domain", "")
            weight = edge.get("w")

            if has_weights:
                # Include weight (or empty if missing)
                weight_str = str(weight) if weight is not None else ""
                row = f"{from_id},{to_id},{weight_str},{domain}"
            else:
                row = f"{from_id},{to_id},{domain}"

            toon_lines.append(row)

        # Empty line between tables
        toon_lines.append("")

    return "\n".join(toon_lines)


def main() -> int:
    """Main entry point."""
    parser = argparse.ArgumentParser(description="Build TOON format from edges")
    parser.add_argument(
        "graph_dir",
        type=Path,
        nargs="?",
        default=Path.cwd(),
        help="Graph directory (default: current directory)",
    )
    args = parser.parse_args()

    graph_dir = args.graph_dir.resolve()
    edges_dir = graph_dir / "edges"
    dist_dir = graph_dir / "dist"

    # Create dist directory if needed
    dist_dir.mkdir(exist_ok=True)

    # Load edges grouped by relation
    print(f"Loading edges from {edges_dir}...")
    edges_by_relation = load_edges(edges_dir)

    total_edges = sum(len(edges) for edges in edges_by_relation.values())
    print(f"Loaded {total_edges} edges across {len(edges_by_relation)} relation types")

    # Generate TOON format
    print("Generating TOON format...")
    toon_content = generate_toon(edges_by_relation)

    # Write edges.toon
    toon_path = dist_dir / "edges.toon"
    with open(toon_path, "w") as f:
        f.write(toon_content)
    print(f"✓ Created {toon_path}")

    # Summary
    print()
    print("Summary:")
    for relation, edges in sorted(edges_by_relation.items()):
        print(f"  {relation}: {len(edges)} edges")

    return 0


if __name__ == "__main__":
    sys.exit(main())
