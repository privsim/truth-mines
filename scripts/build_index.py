#!/usr/bin/env python3
"""
Index builder script for Truth Mines.

Generates dist/manifest.json and dist/graph.json from nodes and edges.
"""

import argparse
import json
import sys
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List


def load_nodes(nodes_dir: Path) -> List[Dict[str, Any]]:
    """Load all node JSON files from directory."""
    nodes = []

    if not nodes_dir.exists():
        return nodes

    for node_file in nodes_dir.glob("**/*.json"):
        try:
            with open(node_file) as f:
                node = json.load(f)
                nodes.append(node)
        except (json.JSONDecodeError, IOError) as e:
            print(f"Warning: Failed to load {node_file}: {e}", file=sys.stderr)

    return nodes


def build_manifest(nodes: List[Dict[str, Any]], nodes_dir: Path) -> Dict[str, Any]:
    """
    Build manifest.json structure.

    Returns dict with version, generated timestamp, nodes mapping, and stats.
    """
    manifest: Dict[str, Any] = {
        "version": "1.0.0",
        "generated": datetime.now(timezone.utc).isoformat(),
        "nodes": {},
        "stats": {
            "total_nodes": len(nodes),
            "by_domain": defaultdict(int),
            "by_type": defaultdict(int),
        },
    }

    for node in nodes:
        node_id = node.get("id")
        if not node_id:
            continue

        # Add to nodes mapping
        manifest["nodes"][node_id] = {
            "file": f"nodes/{node_id}.json",
            "domain": node.get("domain", ""),
            "type": node.get("type", ""),
        }

        # Update stats
        domain = node.get("domain")
        if domain:
            manifest["stats"]["by_domain"][domain] += 1

        node_type = node.get("type")
        if node_type:
            manifest["stats"]["by_type"][node_type] += 1

    # Convert defaultdicts to regular dicts for JSON serialization
    manifest["stats"]["by_domain"] = dict(manifest["stats"]["by_domain"])
    manifest["stats"]["by_type"] = dict(manifest["stats"]["by_type"])

    return manifest


def build_graph_summary(nodes: List[Dict[str, Any]]) -> List[Dict[str, str]]:
    """
    Build lightweight graph summary (graph.json).

    Returns array of {id, type, domain, title} without heavy fields.
    """
    summary = []

    for node in nodes:
        # Only include lightweight fields
        node_summary = {
            "id": node.get("id", ""),
            "type": node.get("type", ""),
            "domain": node.get("domain", ""),
            "title": node.get("title", ""),
        }
        summary.append(node_summary)

    return summary


def main() -> int:
    """Main entry point."""
    parser = argparse.ArgumentParser(description="Build Truth Mines index and manifest")
    parser.add_argument(
        "graph_dir",
        type=Path,
        nargs="?",
        default=Path.cwd(),
        help="Graph directory (default: current directory)",
    )
    args = parser.parse_args()

    graph_dir = args.graph_dir.resolve()
    nodes_dir = graph_dir / "nodes"
    dist_dir = graph_dir / "dist"

    # Create dist directory if needed
    dist_dir.mkdir(exist_ok=True)

    # Load all nodes
    print(f"Loading nodes from {nodes_dir}...")
    nodes = load_nodes(nodes_dir)
    print(f"Loaded {len(nodes)} nodes")

    # Build manifest
    print("Building manifest...")
    manifest = build_manifest(nodes, nodes_dir)

    # Build graph summary
    print("Building graph summary...")
    graph_summary = build_graph_summary(nodes)

    # Write manifest.json
    manifest_path = dist_dir / "manifest.json"
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)
    print(f"✓ Created {manifest_path}")

    # Write graph.json
    graph_path = dist_dir / "graph.json"
    with open(graph_path, "w") as f:
        json.dump(graph_summary, f, indent=2)
    print(f"✓ Created {graph_path}")

    # Summary
    print()
    print("Summary:")
    print(f"  Total nodes: {manifest['stats']['total_nodes']}")
    if manifest['stats']['by_domain']:
        print(f"  By domain: {dict(manifest['stats']['by_domain'])}")
    if manifest['stats']['by_type']:
        print(f"  By type: {dict(manifest['stats']['by_type'])}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
