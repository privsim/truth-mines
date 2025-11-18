"""Tests for subgraph extraction script."""

import json
import subprocess
import sys
from pathlib import Path

import pytest


SCRIPT_PATH = Path(__file__).parent.parent / "extract_subgraph.py"


def test_extract_subgraph_from_sample_graph(tmp_path):
    """Extract subgraph from actual sample graph."""
    project_root = Path(__file__).parent.parent.parent
    output_file = tmp_path / "subgraph.toon"

    # Use actual sample graph
    result = subprocess.run(
        [
            sys.executable,
            str(SCRIPT_PATH),
            "--node",
            "k7x9m2",  # Actual node from sample graph
            "--depth",
            "1",
            "--output",
            str(output_file),
            "--graph-dir",
            str(project_root),
        ],
        capture_output=True,
        text=True,
    )

    assert result.returncode == 0, f"Failed: {result.stderr}"
    assert output_file.exists()

    content = output_file.read_text()
    assert "nodes[" in content
    assert "k7x9m2" in content


def test_extract_subgraph_nonexistent_node(tmp_path):
    """Should error on non-existent node."""
    project_root = Path(__file__).parent.parent.parent
    output_file = tmp_path / "subgraph.toon"

    result = subprocess.run(
        [
            sys.executable,
            str(SCRIPT_PATH),
            "--node",
            "nonexistent",
            "--depth",
            "1",
            "--output",
            str(output_file),
        ],
        capture_output=True,
        text=True,
    )

    assert result.returncode != 0
    assert "not found" in result.stderr.lower()
