# Tutorial 1: Getting Started with Truth Mines

Welcome to Truth Mines! This tutorial will guide you through setting up the project and adding your first nodes.

## Prerequisites

- Rust 1.70+ ([install](https://rustup.rs/))
- Node.js 18+ ([install](https://nodejs.org/))
- Python 3.11+ ([install](https://python.org/))
- Git

## Step 1: Clone and Setup

```bash
# Clone repository
git clone https://github.com/yourusername/truth-mines.git
cd truth-mines

# Setup Python environment
python3 -m venv venv
source venv/bin/activate
pip install -r scripts/requirements.txt

# Install Rust WASM target
rustup target add wasm32-unknown-unknown
cargo install wasm-pack

# Setup frontend
cd web
npm install
cd ..
```

## Step 2: Explore the Sample Graph

The repository includes a 22-node sample graph:

```bash
# Validate the graph
python scripts/validate.py

# Output:
# ✓ Graph validation successful
#   Nodes: 22
#   Edges: 28
```

## Step 3: Build the Graph Artifacts

```bash
# Generate manifest and graph summary
python scripts/build_index.py

# Output files:
# - dist/manifest.json  (node index)
# - dist/graph.json     (lightweight summaries)

# Generate TOON format for LLMs
python scripts/build_toon.py

# Output:
# - dist/edges.toon
```

## Step 4: Add Your First Node

Create a new node file in `nodes/`:

```bash
# Generate a unique 6-character ID (lowercase alphanumeric)
# For this tutorial, let's use: mynode

cat > nodes/mynode.json << 'EOF'
{
  "id": "mynode",
  "type": "proposition",
  "domain": "philosophy",
  "title": "My First Claim",
  "content": "This is my first node in the Truth Mines knowledge graph.",
  "tags": ["tutorial", "example"],
  "metadata": {
    "certainty": 0.8
  },
  "created": "2025-11-17T12:00:00Z"
}
EOF
```

## Step 5: Validate Your New Node

```bash
python scripts/validate.py

# Should show:
# ✓ Graph validation successful
#   Nodes: 23  (was 22, now 23!)
#   Edges: 28
```

## Step 6: Add an Edge

Create a connection to an existing node:

```bash
# Add to edges/supports.jsonl
echo '{"f":"mynode","t":"k7x9m2","relation":"supports","w":0.8,"domain":"philosophy"}' >> edges/supports.jsonl
```

This creates a "supports" edge from your node to the "Knowledge requires safety" node.

## Step 7: Rebuild and Validate

```bash
python scripts/validate.py
# ✓ Nodes: 23, Edges: 29

python scripts/build_index.py
python scripts/build_toon.py
```

## Step 8: Commit Your Changes

```bash
git add nodes/mynode.json edges/supports.jsonl
git commit -m "feat(graph): add my first node and edge"
```

## Step 9: Build the Engine

```bash
cd engine
cargo test        # Run tests (should all pass)
cargo build       # Build native
wasm-pack build --target web --dev  # Build WASM for browser
```

## Step 10: Run the Frontend

```bash
cd ../web
npm run dev

# Open http://localhost:3000
```

You should see the Truth Mines interface with your graph data!

## Next Steps

- **Tutorial 2:** Exploring the graph in 2D and 3D
- **Tutorial 3:** Using TOON with LLMs
- **Tutorial 4:** Creating cross-domain bridges

## Common Issues

**Q: Validation fails with "does not match pattern"**
A: Node IDs must be exactly 6 lowercase alphanumeric characters

**Q: Edge validation fails with "not found"**
A: Ensure both `f` and `t` reference existing node IDs

**Q: WASM build fails**
A: Ensure you have `wasm32-unknown-unknown` target: `rustup target add wasm32-unknown-unknown`

## Learn More

- [ROADMAP.md](../../ROADMAP.md) - Full development plan
- [ADR 001](../ADRs/001-strict-tdd-workflow.md) - Development methodology
- [LLM Integration Guide](../llm-integration.md) - Using with AI

Congratulations! You've added your first node to Truth Mines! 🎉
