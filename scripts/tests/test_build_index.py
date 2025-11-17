"""
Tests for manifest builder script.

Following TDD: These tests are written BEFORE implementation.
"""

import json
import subprocess
import sys
from pathlib import Path
from typing import Any, Dict

import pytest


SCRIPT_PATH = Path(__file__).parent.parent / "build_index.py"


def create_test_nodes(tmp_path: Path, nodes: list[Dict[str, Any]]) -> Path:
    """Helper to create test node files."""
    nodes_dir = tmp_path / "nodes"
    nodes_dir.mkdir()

    for i, node in enumerate(nodes):
        node_file = nodes_dir / f"{node['id']}.json"
        node_file.write_text(json.dumps(node, indent=2))

    return tmp_path


def run_build_index(graph_dir: Path) -> subprocess.CompletedProcess:
    """Helper to run manifest builder script."""
    cmd = [sys.executable, str(SCRIPT_PATH), str(graph_dir)]
    return subprocess.run(cmd, capture_output=True, text=True)


class TestManifestGeneration:
    """Test manifest.json generation."""

    def test_build_index_generates_manifest_file(self, tmp_path):
        """Script should create dist/manifest.json."""
        nodes = [
            {"id": "abc123", "type": "proposition", "domain": "philosophy", "title": "Test 1"},
            {"id": "def456", "type": "theorem", "domain": "mathematics", "title": "Test 2"},
        ]
        graph_dir = create_test_nodes(tmp_path, nodes)

        result = run_build_index(graph_dir)

        assert result.returncode == 0, f"Build failed: {result.stderr}"
        manifest_path = graph_dir / "dist" / "manifest.json"
        assert manifest_path.exists(), "manifest.json not created"

    def test_manifest_has_required_structure(self, tmp_path):
        """Manifest should have version, generated, nodes, stats."""
        nodes = [{"id": "abc123", "type": "proposition", "domain": "philosophy", "title": "Test"}]
        graph_dir = create_test_nodes(tmp_path, nodes)

        run_build_index(graph_dir)

        manifest_path = graph_dir / "dist" / "manifest.json"
        manifest = json.loads(manifest_path.read_text())

        assert "version" in manifest
        assert "generated" in manifest
        assert "nodes" in manifest
        assert "stats" in manifest

    def test_manifest_nodes_mapping(self, tmp_path):
        """Manifest should map id → {file, domain, type}."""
        nodes = [
            {"id": "abc123", "type": "proposition", "domain": "philosophy", "title": "Test 1"},
            {"id": "def456", "type": "theorem", "domain": "mathematics", "title": "Test 2"},
        ]
        graph_dir = create_test_nodes(tmp_path, nodes)

        run_build_index(graph_dir)

        manifest = json.loads((graph_dir / "dist" / "manifest.json").read_text())

        assert "abc123" in manifest["nodes"]
        assert "def456" in manifest["nodes"]

        node1 = manifest["nodes"]["abc123"]
        assert "file" in node1
        assert node1["domain"] == "philosophy"
        assert node1["type"] == "proposition"

        node2 = manifest["nodes"]["def456"]
        assert node2["domain"] == "mathematics"
        assert node2["type"] == "theorem"

    def test_manifest_stats_total_nodes(self, tmp_path):
        """Stats should include total node count."""
        nodes = [
            {"id": "abc123", "type": "proposition", "domain": "philosophy", "title": "Test 1"},
            {"id": "def456", "type": "theorem", "domain": "mathematics", "title": "Test 2"},
            {"id": "ghi789", "type": "theory", "domain": "physics", "title": "Test 3"},
        ]
        graph_dir = create_test_nodes(tmp_path, nodes)

        run_build_index(graph_dir)

        manifest = json.loads((graph_dir / "dist" / "manifest.json").read_text())

        assert manifest["stats"]["total_nodes"] == 3

    def test_manifest_stats_by_domain(self, tmp_path):
        """Stats should count nodes by domain."""
        nodes = [
            {"id": "abc123", "type": "proposition", "domain": "philosophy", "title": "Test 1"},
            {"id": "def456", "type": "proposition", "domain": "philosophy", "title": "Test 2"},
            {"id": "ghi789", "type": "theorem", "domain": "mathematics", "title": "Test 3"},
        ]
        graph_dir = create_test_nodes(tmp_path, nodes)

        run_build_index(graph_dir)

        manifest = json.loads((graph_dir / "dist" / "manifest.json").read_text())

        assert manifest["stats"]["by_domain"]["philosophy"] == 2
        assert manifest["stats"]["by_domain"]["mathematics"] == 1

    def test_manifest_stats_by_type(self, tmp_path):
        """Stats should count nodes by type."""
        nodes = [
            {"id": "abc123", "type": "proposition", "domain": "philosophy", "title": "Test 1"},
            {"id": "def456", "type": "proposition", "domain": "philosophy", "title": "Test 2"},
            {"id": "ghi789", "type": "theorem", "domain": "mathematics", "title": "Test 3"},
        ]
        graph_dir = create_test_nodes(tmp_path, nodes)

        run_build_index(graph_dir)

        manifest = json.loads((graph_dir / "dist" / "manifest.json").read_text())

        assert manifest["stats"]["by_type"]["proposition"] == 2
        assert manifest["stats"]["by_type"]["theorem"] == 1


class TestGraphSummaryGeneration:
    """Test graph.json generation."""

    def test_build_index_generates_graph_summary(self, tmp_path):
        """Script should create dist/graph.json."""
        nodes = [{"id": "abc123", "type": "proposition", "domain": "philosophy", "title": "Test"}]
        graph_dir = create_test_nodes(tmp_path, nodes)

        result = run_build_index(graph_dir)

        assert result.returncode == 0
        graph_path = graph_dir / "dist" / "graph.json"
        assert graph_path.exists(), "graph.json not created"

    def test_graph_summary_is_array(self, tmp_path):
        """graph.json should be an array of node summaries."""
        nodes = [
            {"id": "abc123", "type": "proposition", "domain": "philosophy", "title": "Test 1"},
            {"id": "def456", "type": "theorem", "domain": "mathematics", "title": "Test 2"},
        ]
        graph_dir = create_test_nodes(tmp_path, nodes)

        run_build_index(graph_dir)

        graph = json.loads((graph_dir / "dist" / "graph.json").read_text())

        assert isinstance(graph, list)
        assert len(graph) == 2

    def test_graph_summary_has_lightweight_fields(self, tmp_path):
        """Graph summary should only have id, type, domain, title."""
        nodes = [{
            "id": "abc123",
            "type": "proposition",
            "domain": "philosophy",
            "title": "Test Node",
            "content": "This is heavy content that should not be in summary",
            "formal": "∀x: P(x)",
            "tags": ["tag1", "tag2"],
        }]
        graph_dir = create_test_nodes(tmp_path, nodes)

        run_build_index(graph_dir)

        graph = json.loads((graph_dir / "dist" / "graph.json").read_text())

        node = graph[0]
        assert "id" in node
        assert "type" in node
        assert "domain" in node
        assert "title" in node

        # Should NOT have heavy fields
        assert "content" not in node
        assert "formal" not in node
        assert "tags" not in node
        assert "metadata" not in node


class TestDistDirectoryCreation:
    """Test that dist/ directory is created."""

    def test_creates_dist_directory_if_missing(self, tmp_path):
        """Should create dist/ if it doesn't exist."""
        nodes = [{"id": "abc123", "type": "proposition", "domain": "philosophy", "title": "Test"}]
        graph_dir = create_test_nodes(tmp_path, nodes)

        # Ensure dist/ doesn't exist
        dist_dir = graph_dir / "dist"
        assert not dist_dir.exists()

        run_build_index(graph_dir)

        assert dist_dir.exists()
        assert dist_dir.is_dir()


class TestEmptyGraph:
    """Test behavior with empty graph."""

    def test_handles_empty_nodes_directory(self, tmp_path):
        """Should handle empty nodes/ gracefully."""
        nodes_dir = tmp_path / "nodes"
        nodes_dir.mkdir()

        result = run_build_index(tmp_path)

        assert result.returncode == 0
        manifest = json.loads((tmp_path / "dist" / "manifest.json").read_text())
        assert manifest["stats"]["total_nodes"] == 0
        assert len(manifest["nodes"]) == 0

        graph = json.loads((tmp_path / "dist" / "graph.json").read_text())
        assert len(graph) == 0


class TestRealGraphData:
    """Test with actual repository data."""

    def test_builds_index_from_project_graph(self):
        """Should successfully build index from project's sample graph."""
        project_root = Path(__file__).parent.parent.parent
        result = run_build_index(project_root)

        assert result.returncode == 0, f"Build failed: {result.stderr}"

        manifest_path = project_root / "dist" / "manifest.json"
        graph_path = project_root / "dist" / "graph.json"

        assert manifest_path.exists()
        assert graph_path.exists()

        manifest = json.loads(manifest_path.read_text())
        assert manifest["stats"]["total_nodes"] > 0

        graph = json.loads(graph_path.read_text())
        assert len(graph) > 0


class TestGoldenOutput:
    """Test against golden files for deterministic output."""

    def test_manifest_structure_matches_golden(self, tmp_path):
        """Manifest structure should match expected format."""
        nodes = [
            {"id": "test01", "type": "proposition", "domain": "philosophy", "title": "First"},
            {"id": "test02", "type": "theorem", "domain": "mathematics", "title": "Second"},
        ]
        graph_dir = create_test_nodes(tmp_path, nodes)

        run_build_index(graph_dir)

        manifest = json.loads((graph_dir / "dist" / "manifest.json").read_text())

        # Remove timestamp for comparison (non-deterministic)
        assert "generated" in manifest
        generated = manifest.pop("generated")
        assert generated  # Should be a non-empty timestamp

        # Check structure
        expected_keys = {"version", "nodes", "stats"}
        assert set(manifest.keys()) == expected_keys

        # Check stats structure
        assert "total_nodes" in manifest["stats"]
        assert "by_domain" in manifest["stats"]
        assert "by_type" in manifest["stats"]
