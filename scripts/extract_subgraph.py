#!/usr/bin/env python3
"""
Subgraph extraction script for Truth Mines.

Extracts k-hop subgraph around a node and generates TOON pack for LLM consumption.
"""

import argparse
import json
import sys
from collections import deque
from pathlib import Path
from typing import Any, Dict, List, Set


def load_graph(nodes_dir: Path, edges_dir: Path) -> tuple[Dict[str, Any], List[Dict[str, Any]]]:
    """Load all nodes and edges from directories."""
    nodes_map = {}
    edges = []

    # Load nodes
    if nodes_dir.exists():
        for node_file in nodes_dir.glob("**/*.json"):
            with open(node_file) as f:
                node = json.load(f)
                nodes_map[node["id"]] = node

    # Load edges
    if edges_dir.exists():
        for edge_file in edges_dir.glob("**/*.jsonl"):
            with open(edge_file) as f:
                for line in f:
                    line = line.strip()
                    if line:
                        edges.append(json.loads(line))

    return nodes_map, edges


def extract_k_hop_subgraph(
    start_node_id: str,
    depth: int,
    nodes_map: Dict[str, Any],
    edges: List[Dict[str, Any]],
) -> tuple[Set[str], List[Dict[str, Any]]]:
    """Extract k-hop neighborhood using BFS."""
    if start_node_id not in nodes_map:
        raise ValueError(f"Node {start_node_id} not found")

    # Build adjacency for BFS
    adjacency: Dict[str, List[str]] = {node_id: [] for node_id in nodes_map}
    for edge in edges:
        if edge["f"] in adjacency:
            adjacency[edge["f"]].append(edge["t"])

    # BFS to find k-hop neighbors
    visited = {start_node_id}
    queue = deque([(start_node_id, 0)])
    subgraph_node_ids = {start_node_id}

    while queue:
        current_id, current_depth = queue.popleft()

        if current_depth < depth:
            for neighbor_id in adjacency.get(current_id, []):
                if neighbor_id not in visited and neighbor_id in nodes_map:
                    visited.add(neighbor_id)
                    subgraph_node_ids.add(neighbor_id)
                    queue.append((neighbor_id, current_depth + 1))

    # Filter edges to only those in subgraph
    subgraph_edges = [
        edge
        for edge in edges
        if edge["f"] in subgraph_node_ids and edge["t"] in subgraph_node_ids
    ]

    return subgraph_node_ids, subgraph_edges


def generate_toon_pack(
    node_ids: Set[str], nodes_map: Dict[str, Any], edges: List[Dict[str, Any]]
) -> str:
    """Generate TOON format for subgraph."""
    from collections import defaultdict

    lines = []

    # Node summaries
    lines.append(f"nodes[{len(node_ids)}]{{id,type,domain,title}}:")
    for node_id in sorted(node_ids):
        node = nodes_map[node_id]
        lines.append(f"{node['id']},{node['type']},{node['domain']},{node['title']}")
    lines.append("")

    # Edges grouped by relation
    edges_by_relation = defaultdict(list)
    for edge in edges:
        edges_by_relation[edge["relation"]].append(edge)

    for relation, rel_edges in sorted(edges_by_relation.items()):
        has_weights = any(e.get("w") is not None for e in rel_edges)

        if has_weights:
            lines.append(f"{relation}[{len(rel_edges)}]{{f,t,w,domain}}:")
            for edge in rel_edges:
                w = edge.get("w", "")
                lines.append(f"{edge['f']},{edge['t']},{w},{edge['domain']}")
        else:
            lines.append(f"{relation}[{len(rel_edges)}]{{f,t,domain}}:")
            for edge in rel_edges:
                lines.append(f"{edge['f']},{edge['t']},{edge['domain']}")
        lines.append("")

    return "\n".join(lines)


def main() -> int:
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Extract k-hop subgraph as TOON for LLM use"
    )
    parser.add_argument("--node", required=True, help="Starting node ID")
    parser.add_argument(
        "--depth", type=int, default=2, help="K-hop depth (default: 2)"
    )
    parser.add_argument(
        "--output", type=Path, required=True, help="Output TOON file path"
    )
    parser.add_argument(
        "--graph-dir",
        type=Path,
        default=Path.cwd(),
        help="Graph directory (default: current)",
    )
    args = parser.parse_args()

    graph_dir = args.graph_dir.resolve()
    nodes_dir = graph_dir / "nodes"
    edges_dir = graph_dir / "edges"

    # Load graph
    print(f"Loading graph from {graph_dir}...")
    nodes_map, edges = load_graph(nodes_dir, edges_dir)
    print(f"Loaded {len(nodes_map)} nodes and {len(edges)} edges")

    # Extract subgraph
    print(
        f"Extracting {args.depth}-hop subgraph from node {args.node}..."
    )
    try:
        subgraph_node_ids, subgraph_edges = extract_k_hop_subgraph(
            args.node, args.depth, nodes_map, edges
        )
    except ValueError as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1

    print(
        f"Subgraph: {len(subgraph_node_ids)} nodes, {len(subgraph_edges)} edges"
    )

    # Generate TOON
    print("Generating TOON format...")
    toon_content = generate_toon_pack(subgraph_node_ids, nodes_map, subgraph_edges)

    # Write output
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(toon_content)
    print(f"✓ Created {args.output}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
