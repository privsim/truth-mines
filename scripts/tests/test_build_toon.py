"""
Tests for TOON builder script.

Following TDD: These tests are written BEFORE implementation.
"""

import subprocess
import sys
from pathlib import Path
from typing import Any, Dict, List

import pytest


SCRIPT_PATH = Path(__file__).parent.parent / "build_toon.py"


def create_test_edges(tmp_path: Path, edges_by_relation: Dict[str, List[str]]) -> Path:
    """Helper to create test edge files."""
    edges_dir = tmp_path / "edges"
    edges_dir.mkdir()

    for relation, edge_lines in edges_by_relation.items():
        edge_file = edges_dir / f"{relation}.jsonl"
        edge_file.write_text("\n".join(edge_lines) + "\n")

    return tmp_path


def run_build_toon(graph_dir: Path) -> subprocess.CompletedProcess:
    """Helper to run TOON builder script."""
    cmd = [sys.executable, str(SCRIPT_PATH), str(graph_dir)]
    return subprocess.run(cmd, capture_output=True, text=True)


def parse_toon(toon_content: str) -> Dict[str, List[List[str]]]:
    """
    Parse TOON format into structured data.

    Returns dict of relation → list of rows.
    """
    tables = {}
    current_relation = None
    current_rows = []

    for line in toon_content.strip().split("\n"):
        line = line.strip()
        if not line:
            continue

        if line.endswith(":"):
            # Header line: relation[count]{fields}:
            if current_relation:
                tables[current_relation] = current_rows
            current_relation = line.split("[")[0]
            current_rows = []
        else:
            # Data row
            current_rows.append(line.split(","))

    if current_relation:
        tables[current_relation] = current_rows

    return tables


class TestTOONGeneration:
    """Test TOON file generation."""

    def test_build_toon_generates_file(self, tmp_path):
        """Script should create dist/edges.toon."""
        edges = {
            "supports": [
                '{"f":"abc123","t":"def456","relation":"supports","w":0.9,"domain":"philosophy"}'
            ]
        }
        graph_dir = create_test_edges(tmp_path, edges)

        result = run_build_toon(graph_dir)

        assert result.returncode == 0, f"Build failed: {result.stderr}"
        toon_path = graph_dir / "dist" / "edges.toon"
        assert toon_path.exists(), "edges.toon not created"

    def test_toon_header_format(self, tmp_path):
        """TOON should have proper header: relation[count]{fields}:"""
        edges = {
            "supports": [
                '{"f":"abc123","t":"def456","relation":"supports","w":0.9,"domain":"philosophy"}',
                '{"f":"ghi789","t":"jkl012","relation":"supports","w":0.85,"domain":"philosophy"}',
            ]
        }
        graph_dir = create_test_edges(tmp_path, edges)

        run_build_toon(graph_dir)

        toon_content = (graph_dir / "dist" / "edges.toon").read_text()

        # Should have header with count
        assert "supports[2]" in toon_content
        # Should specify fields
        assert "{f,t,w,domain}" in toon_content or "{f,t,domain,w}" in toon_content

    def test_toon_groups_by_relation(self, tmp_path):
        """TOON should have separate table for each relation."""
        edges = {
            "supports": ['{"f":"abc123","t":"def456","relation":"supports","domain":"philosophy"}'],
            "proves": ['{"f":"ghi789","t":"jkl012","relation":"proves","domain":"mathematics"}'],
        }
        graph_dir = create_test_edges(tmp_path, edges)

        run_build_toon(graph_dir)

        toon_content = (graph_dir / "dist" / "edges.toon").read_text()

        assert "supports[" in toon_content
        assert "proves[" in toon_content

    def test_toon_row_format(self, tmp_path):
        """TOON rows should be comma-separated values."""
        edges = {
            "supports": [
                '{"f":"abc123","t":"def456","relation":"supports","w":0.9,"domain":"philosophy"}'
            ]
        }
        graph_dir = create_test_edges(tmp_path, edges)

        run_build_toon(graph_dir)

        toon_content = (graph_dir / "dist" / "edges.toon").read_text()
        lines = [l for l in toon_content.split("\n") if l and not l.endswith(":")]

        assert len(lines) >= 1
        # Should have data row with commas
        data_row = lines[0]
        assert "abc123" in data_row
        assert "def456" in data_row
        assert "," in data_row

    def test_toon_handles_missing_weight(self, tmp_path):
        """TOON should handle edges without weight field."""
        edges = {
            "supports": [
                '{"f":"abc123","t":"def456","relation":"supports","domain":"philosophy"}'  # No weight
            ]
        }
        graph_dir = create_test_edges(tmp_path, edges)

        result = run_build_toon(graph_dir)

        assert result.returncode == 0
        toon_content = (graph_dir / "dist" / "edges.toon").read_text()
        # Should still generate valid TOON
        assert "supports[" in toon_content


class TestMultipleRelations:
    """Test handling of multiple relation types."""

    def test_toon_includes_all_relations(self, tmp_path):
        """All relation types should be in TOON output."""
        edges = {
            "supports": ['{"f":"a","t":"b","relation":"supports","domain":"philosophy"}'],
            "attacks": ['{"f":"c","t":"d","relation":"attacks","domain":"philosophy"}'],
            "proves": ['{"f":"e","t":"f","relation":"proves","domain":"mathematics"}'],
        }
        graph_dir = create_test_edges(tmp_path, edges)

        run_build_toon(graph_dir)

        toon_content = (graph_dir / "dist" / "edges.toon").read_text()

        assert "supports[" in toon_content
        assert "attacks[" in toon_content
        assert "proves[" in toon_content

    def test_toon_correct_counts(self, tmp_path):
        """Each relation table should show correct count."""
        edges = {
            "supports": [
                '{"f":"a","t":"b","relation":"supports","domain":"philosophy"}',
                '{"f":"c","t":"d","relation":"supports","domain":"philosophy"}',
                '{"f":"e","t":"f","relation":"supports","domain":"philosophy"}',
            ],
            "proves": [
                '{"f":"g","t":"h","relation":"proves","domain":"mathematics"}',
            ],
        }
        graph_dir = create_test_edges(tmp_path, edges)

        run_build_toon(graph_dir)

        toon_content = (graph_dir / "dist" / "edges.toon").read_text()

        assert "supports[3]" in toon_content
        assert "proves[1]" in toon_content


class TestDistDirectoryCreation:
    """Test dist/ directory handling."""

    def test_creates_dist_directory(self, tmp_path):
        """Should create dist/ if missing."""
        edges = {
            "supports": ['{"f":"a","t":"b","relation":"supports","domain":"philosophy"}']
        }
        graph_dir = create_test_edges(tmp_path, edges)

        dist_dir = graph_dir / "dist"
        assert not dist_dir.exists()

        run_build_toon(graph_dir)

        assert dist_dir.exists()


class TestEmptyEdges:
    """Test behavior with no edges."""

    def test_handles_empty_edges_directory(self, tmp_path):
        """Should handle empty edges/ gracefully."""
        edges_dir = tmp_path / "edges"
        edges_dir.mkdir()

        result = run_build_toon(tmp_path)

        assert result.returncode == 0
        toon_path = tmp_path / "dist" / "edges.toon"
        # Should create file even if empty
        assert toon_path.exists()


class TestRealGraphData:
    """Test with actual repository data."""

    def test_builds_toon_from_project_edges(self):
        """Should successfully build TOON from project's edges."""
        project_root = Path(__file__).parent.parent.parent
        result = run_build_toon(project_root)

        assert result.returncode == 0, f"Build failed: {result.stderr}"

        toon_path = project_root / "dist" / "edges.toon"
        assert toon_path.exists()

        toon_content = toon_path.read_text()
        # Should have our sample relations
        assert "supports[" in toon_content
        assert "proves[" in toon_content


class TestTOONParsing:
    """Test that generated TOON is parseable."""

    def test_generated_toon_is_parseable(self, tmp_path):
        """Generated TOON should be parseable."""
        edges = {
            "supports": [
                '{"f":"abc123","t":"def456","relation":"supports","w":0.9,"domain":"philosophy"}',
                '{"f":"ghi789","t":"jkl012","relation":"supports","w":0.85,"domain":"philosophy"}',
            ],
            "proves": [
                '{"f":"mno345","t":"pqr678","relation":"proves","w":1.0,"domain":"mathematics"}',
            ],
        }
        graph_dir = create_test_edges(tmp_path, edges)

        run_build_toon(graph_dir)

        toon_content = (graph_dir / "dist" / "edges.toon").read_text()
        tables = parse_toon(toon_content)

        assert "supports" in tables
        assert "proves" in tables
        assert len(tables["supports"]) == 2
        assert len(tables["proves"]) == 1


class TestGoldenOutput:
    """Test against expected format."""

    def test_toon_format_matches_spec(self, tmp_path):
        """TOON format should match PRD specification."""
        edges = {
            "supports": [
                '{"f":"id1","t":"id2","relation":"supports","w":0.9,"domain":"domain1"}',
                '{"f":"id3","t":"id4","relation":"supports","w":0.85,"domain":"domain2"}',
            ]
        }
        graph_dir = create_test_edges(tmp_path, edges)

        run_build_toon(graph_dir)

        toon_content = (graph_dir / "dist" / "edges.toon").read_text()

        # Check header format
        assert "supports[2]" in toon_content
        # Check field specification
        assert "{" in toon_content and "}" in toon_content
        # Should have colon after header
        lines = toon_content.strip().split("\n")
        header_line = [l for l in lines if "supports[" in l][0]
        assert header_line.endswith(":")
