# Truth Mines Scripts

Python scripts for validation, indexing, and TOON generation.

## Setup

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On macOS/Linux

# Install dependencies
pip install -r requirements.txt
```

## Scripts

### validate.py

Validates all nodes and edges against schemas and checks referential integrity.

```bash
python validate.py [--strict]
```

Options:
- `--strict`: Enforce domain and relation validity against schema.toml

### build_index.py

Generates `dist/manifest.json` and `dist/graph.json` from nodes and edges.

```bash
python build_index.py
```

Output:
- `dist/manifest.json`: ID → file mappings and statistics
- `dist/graph.json`: Lightweight node summaries (no content/formal)

### build_toon.py

Converts `edges/*.jsonl` to compact TOON format in `dist/edges.toon`.

```bash
python build_toon.py
```

### extract_subgraph.py

Extracts k-hop subgraph as TOON for LLM consumption.

```bash
python extract_subgraph.py --node <id> --depth <k> --output <file.toon>
```

## Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=scripts --cov-report=html

# Coverage target: 90%
```

## Code Quality

```bash
# Format code
black scripts/

# Lint
ruff scripts/

# Type check
mypy scripts/
```

## Development

All scripts follow strict TDD. See [ADR 001](../docs/ADRs/001-strict-tdd-workflow.md).

**Coverage Target:** 90%
