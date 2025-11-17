"""
Tests for graph validation script.

Following TDD: These tests are written BEFORE implementation.
"""

import json
import subprocess
import sys
from pathlib import Path
from typing import Any, Dict

import pytest


# Test fixtures setup
FIXTURES_DIR = Path(__file__).parent / "fixtures"
SCRIPT_PATH = Path(__file__).parent.parent / "validate.py"


def create_temp_graph(tmp_path: Path, nodes: list[Dict[str, Any]], edges: list[str] = None) -> Path:
    """Helper to create temporary graph structure for testing."""
    nodes_dir = tmp_path / "nodes"
    nodes_dir.mkdir()

    for i, node in enumerate(nodes):
        node_file = nodes_dir / f"node{i}.json"
        node_file.write_text(json.dumps(node, indent=2))

    if edges:
        edges_dir = tmp_path / "edges"
        edges_dir.mkdir()
        edge_file = edges_dir / "test.jsonl"
        edge_file.write_text("\n".join(edges))

    return tmp_path


def run_validate(graph_dir: Path, strict: bool = False) -> subprocess.CompletedProcess:
    """Helper to run validation script."""
    cmd = [sys.executable, str(SCRIPT_PATH), str(graph_dir)]
    if strict:
        cmd.append("--strict")
    return subprocess.run(cmd, capture_output=True, text=True)


class TestValidateAcceptsValidGraph:
    """Test that validator accepts valid graphs."""

    def test_validate_accepts_single_valid_node(self, tmp_path):
        """Valid node with all required fields should pass."""
        nodes = [{
            "id": "abc123",
            "type": "proposition",
            "domain": "philosophy",
            "title": "Test"
        }]
        graph_dir = create_temp_graph(tmp_path, nodes)

        result = run_validate(graph_dir)

        assert result.returncode == 0, f"Validation failed: {result.stderr}"
        assert "valid" in result.stdout.lower() or "success" in result.stdout.lower()

    def test_validate_accepts_multiple_valid_nodes(self, tmp_path):
        """Multiple valid nodes should all pass."""
        nodes = [
            {"id": "abc123", "type": "proposition", "domain": "philosophy", "title": "Test 1"},
            {"id": "def456", "type": "theorem", "domain": "mathematics", "title": "Test 2"},
            {"id": "ghi789", "type": "theory", "domain": "physics", "title": "Test 3"},
        ]
        graph_dir = create_temp_graph(tmp_path, nodes)

        result = run_validate(graph_dir)

        assert result.returncode == 0

    def test_validate_accepts_node_with_optional_fields(self, tmp_path):
        """Nodes with optional fields should pass."""
        nodes = [{
            "id": "abc123",
            "type": "proposition",
            "domain": "philosophy",
            "title": "Test",
            "content": "This is content",
            "formal": "∀x: P(x)",
            "tags": ["test", "example"],
            "metadata": {"certainty": 0.8},
            "sources": ["ref1"],
            "created": "2025-01-01T00:00:00Z"
        }]
        graph_dir = create_temp_graph(tmp_path, nodes)

        result = run_validate(graph_dir)

        assert result.returncode == 0


class TestValidateRejectsInvalidNodeSchema:
    """Test that validator rejects invalid node schemas."""

    def test_validate_rejects_missing_required_field(self, tmp_path):
        """Node missing required fields should fail."""
        nodes = [{"id": "abc123"}]  # Missing type, domain, title
        graph_dir = create_temp_graph(tmp_path, nodes)

        result = run_validate(graph_dir)

        assert result.returncode != 0
        assert "abc123" in result.stderr or "node0.json" in result.stderr

    def test_validate_rejects_invalid_id_pattern(self, tmp_path):
        """Node with invalid ID pattern should fail."""
        nodes = [{
            "id": "INVALID_ID",  # Should be lowercase alphanumeric, 6 chars
            "type": "proposition",
            "domain": "philosophy",
            "title": "Test"
        }]
        graph_dir = create_temp_graph(tmp_path, nodes)

        result = run_validate(graph_dir)

        assert result.returncode != 0
        assert "id" in result.stderr.lower() or "pattern" in result.stderr.lower()

    def test_validate_rejects_invalid_type(self, tmp_path):
        """Node with invalid type should fail."""
        nodes = [{
            "id": "abc123",
            "type": "invalid_type",
            "domain": "philosophy",
            "title": "Test"
        }]
        graph_dir = create_temp_graph(tmp_path, nodes)

        result = run_validate(graph_dir)

        assert result.returncode != 0


class TestValidateEdgeReferences:
    """Test that validator checks edge referential integrity."""

    def test_validate_rejects_dangling_edge_reference(self, tmp_path):
        """Edge referencing non-existent node should fail."""
        nodes = [{"id": "abc123", "type": "proposition", "domain": "philosophy", "title": "Test"}]
        edges = ['{"f":"abc123","t":"xyz999","relation":"supports","domain":"philosophy"}']
        graph_dir = create_temp_graph(tmp_path, nodes, edges)

        result = run_validate(graph_dir)

        assert result.returncode != 0
        assert "xyz999" in result.stderr
        assert "not found" in result.stderr.lower() or "reference" in result.stderr.lower()

    def test_validate_accepts_valid_edge_references(self, tmp_path):
        """Edges with valid node references should pass."""
        nodes = [
            {"id": "abc123", "type": "proposition", "domain": "philosophy", "title": "A"},
            {"id": "def456", "type": "proposition", "domain": "philosophy", "title": "B"},
        ]
        edges = ['{"f":"abc123","t":"def456","relation":"supports","domain":"philosophy","w":0.9}']
        graph_dir = create_temp_graph(tmp_path, nodes, edges)

        result = run_validate(graph_dir)

        assert result.returncode == 0


class TestValidateStrictMode:
    """Test strict validation mode for domains and relations."""

    def test_validate_strict_rejects_invalid_domain(self, tmp_path):
        """In strict mode, invalid domain should fail."""
        nodes = [{
            "id": "abc123",
            "type": "proposition",
            "domain": "biology",  # Not in allowed list
            "title": "Test"
        }]
        graph_dir = create_temp_graph(tmp_path, nodes)

        result = run_validate(graph_dir, strict=True)

        assert result.returncode != 0
        assert "biology" in result.stderr
        # Check that error mentions it's not in the allowed list
        assert ("not one of" in result.stderr.lower() or
                "invalid domain" in result.stderr.lower())

    def test_validate_strict_accepts_valid_domains(self, tmp_path):
        """In strict mode, valid domains should pass."""
        nodes = [
            {"id": "abc123", "type": "proposition", "domain": "philosophy", "title": "A"},
            {"id": "def456", "type": "theorem", "domain": "mathematics", "title": "B"},
            {"id": "ghi789", "type": "theory", "domain": "physics", "title": "C"},
        ]
        graph_dir = create_temp_graph(tmp_path, nodes)

        result = run_validate(graph_dir, strict=True)

        assert result.returncode == 0

    def test_validate_strict_rejects_invalid_relation(self, tmp_path):
        """In strict mode, invalid relation should fail."""
        nodes = [
            {"id": "abc123", "type": "proposition", "domain": "philosophy", "title": "A"},
            {"id": "def456", "type": "proposition", "domain": "philosophy", "title": "B"},
        ]
        edges = ['{"f":"abc123","t":"def456","relation":"invented_relation","domain":"philosophy"}']
        graph_dir = create_temp_graph(tmp_path, nodes, edges)

        result = run_validate(graph_dir, strict=True)

        assert result.returncode != 0
        assert "relation" in result.stderr.lower()


class TestValidateEmptyGraph:
    """Test validator behavior with empty graphs."""

    def test_validate_accepts_empty_nodes_directory(self, tmp_path):
        """Empty nodes directory should be valid."""
        nodes_dir = tmp_path / "nodes"
        nodes_dir.mkdir()

        result = run_validate(tmp_path)

        # Empty graph should either pass or have specific message
        # We'll accept either behavior
        assert "valid" in result.stdout.lower() or "empty" in result.stdout.lower()
