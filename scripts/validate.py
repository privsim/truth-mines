#!/usr/bin/env python3
"""
Graph validation script for Truth Mines.

Validates all nodes and edges against JSON schemas and checks referential integrity.
"""

import argparse
import json
import sys
from pathlib import Path
from typing import Dict, List, Set, Tuple

import jsonschema
import toml


def load_json_schema(schema_path: Path) -> dict:
    """Load and return a JSON schema."""
    with open(schema_path) as f:
        return json.load(f)


def load_schema_config(config_path: Path) -> dict:
    """Load schema configuration from TOML."""
    with open(config_path) as f:
        return toml.load(f)


def validate_nodes(
    nodes_dir: Path,
    node_schema: dict,
    strict: bool = False,
    allowed_domains: Set[str] = None
) -> Tuple[List[str], Set[str]]:
    """
    Validate all nodes in the directory.

    Returns:
        Tuple of (error_messages, node_ids)
    """
    errors = []
    node_ids = set()

    if not nodes_dir.exists():
        return errors, node_ids

    node_files = list(nodes_dir.glob("**/*.json"))

    for node_file in node_files:
        try:
            with open(node_file) as f:
                node = json.load(f)

            # Validate against schema
            try:
                jsonschema.validate(node, node_schema)
            except jsonschema.ValidationError as e:
                errors.append(f"{node_file.name}: Schema validation failed: {e.message}")
                continue

            # Track node ID
            node_id = node.get("id")
            if node_id:
                node_ids.add(node_id)

            # Strict mode: check domain
            if strict and allowed_domains:
                domain = node.get("domain")
                if domain and domain not in allowed_domains:
                    errors.append(
                        f"{node_file.name}: Invalid domain '{domain}'. "
                        f"Allowed: {sorted(allowed_domains)}"
                    )

        except json.JSONDecodeError as e:
            errors.append(f"{node_file.name}: Invalid JSON: {e}")
        except Exception as e:
            errors.append(f"{node_file.name}: Error: {e}")

    return errors, node_ids


def validate_edges(
    edges_dir: Path,
    edge_schema: dict,
    node_ids: Set[str],
    strict: bool = False,
    allowed_relations: Set[str] = None
) -> List[str]:
    """
    Validate all edges in the directory.

    Returns:
        List of error messages
    """
    errors = []

    if not edges_dir.exists():
        return errors

    edge_files = list(edges_dir.glob("**/*.jsonl"))

    for edge_file in edge_files:
        try:
            with open(edge_file) as f:
                for line_num, line in enumerate(f, 1):
                    line = line.strip()
                    if not line:
                        continue

                    try:
                        edge = json.loads(line)

                        # Validate against schema
                        try:
                            jsonschema.validate(edge, edge_schema)
                        except jsonschema.ValidationError as e:
                            errors.append(
                                f"{edge_file.name}:{line_num}: Schema validation failed: {e.message}"
                            )
                            continue

                        # Check referential integrity
                        from_id = edge.get("f")
                        to_id = edge.get("t")

                        if from_id and from_id not in node_ids:
                            errors.append(
                                f"{edge_file.name}:{line_num}: Reference to non-existent node '{from_id}' not found"
                            )

                        if to_id and to_id not in node_ids:
                            errors.append(
                                f"{edge_file.name}:{line_num}: Reference to non-existent node '{to_id}' not found"
                            )

                        # Strict mode: check relation
                        if strict and allowed_relations:
                            relation = edge.get("relation")
                            if relation and relation not in allowed_relations:
                                errors.append(
                                    f"{edge_file.name}:{line_num}: Invalid relation '{relation}'. "
                                    f"Allowed: {sorted(allowed_relations)}"
                                )

                    except json.JSONDecodeError as e:
                        errors.append(f"{edge_file.name}:{line_num}: Invalid JSON: {e}")

        except Exception as e:
            errors.append(f"{edge_file.name}: Error: {e}")

    return errors


def main() -> int:
    """Main entry point."""
    parser = argparse.ArgumentParser(description="Validate Truth Mines graph data")
    parser.add_argument(
        "graph_dir",
        type=Path,
        nargs="?",
        default=Path.cwd(),
        help="Graph directory to validate (default: current directory)",
    )
    parser.add_argument(
        "--strict",
        action="store_true",
        help="Enforce domain/relation validity against schema.toml",
    )
    args = parser.parse_args()

    graph_dir = args.graph_dir.resolve()

    # Locate schema files
    project_root = Path(__file__).parent.parent
    node_schema_path = project_root / "schemas" / "node.schema.json"
    edge_schema_path = project_root / "schemas" / "edge.schema.json"
    config_path = project_root / ".truth-mines" / "schema.toml"

    # Load schemas
    try:
        node_schema = load_json_schema(node_schema_path)
        edge_schema = load_json_schema(edge_schema_path)
    except FileNotFoundError as e:
        print(f"Error: Schema file not found: {e}", file=sys.stderr)
        return 1

    # Load config for strict mode
    allowed_domains = None
    allowed_relations = None

    if args.strict:
        try:
            config = load_schema_config(config_path)
            allowed_domains = set(config.get("domains", {}).get("known", []))

            # Collect all allowed relations
            relations = config.get("relations", {})
            allowed_relations = set()
            for category in ["universal", "philosophy", "mathematics", "physics", "bridges"]:
                allowed_relations.update(relations.get(category, {}).get("values", []))

        except FileNotFoundError:
            print(f"Warning: schema.toml not found at {config_path}", file=sys.stderr)

    # Validate nodes
    nodes_dir = graph_dir / "nodes"
    node_errors, node_ids = validate_nodes(
        nodes_dir, node_schema, args.strict, allowed_domains
    )

    # Validate edges
    edges_dir = graph_dir / "edges"
    edge_errors = validate_edges(
        edges_dir, edge_schema, node_ids, args.strict, allowed_relations
    )

    # Report results
    all_errors = node_errors + edge_errors

    if all_errors:
        print("Validation FAILED:", file=sys.stderr)
        print(file=sys.stderr)
        for error in all_errors:
            print(f"  ✗ {error}", file=sys.stderr)
        print(file=sys.stderr)
        print(f"Total errors: {len(all_errors)}", file=sys.stderr)
        return 1
    else:
        print("✓ Graph validation successful")
        print(f"  Nodes: {len(node_ids)}")

        # Count edges
        edge_count = 0
        if edges_dir.exists():
            for edge_file in edges_dir.glob("**/*.jsonl"):
                with open(edge_file) as f:
                    edge_count += sum(1 for line in f if line.strip())
        print(f"  Edges: {edge_count}")

        if len(node_ids) == 0:
            print("  (Empty graph)")

        return 0


if __name__ == "__main__":
    sys.exit(main())
