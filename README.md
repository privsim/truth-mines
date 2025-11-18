# Truth Mines

[![Rust CI](https://github.com/yourusername/truth-mines/workflows/Rust%20CI/badge.svg)](https://github.com/yourusername/truth-mines/actions/workflows/ci-rust.yml)
[![Frontend CI](https://github.com/yourusername/truth-mines/workflows/Frontend%20CI/badge.svg)](https://github.com/yourusername/truth-mines/actions/workflows/ci-frontend.yml)
[![Python Scripts CI](https://github.com/yourusername/truth-mines/workflows/Python%20Scripts%20CI/badge.svg)](https://github.com/yourusername/truth-mines/actions/workflows/ci-scripts.yml)
[![Validate Knowledge Graph](https://github.com/yourusername/truth-mines/workflows/Validate%20Knowledge%20Graph/badge.svg)](https://github.com/yourusername/truth-mines/actions/workflows/validate-graph.yml)

**A Git-native, multi-domain formal knowledge system with 2D/3D visualization and LLM integration.**

Truth Mines represents philosophy, mathematics, and physics in a unified graph structure, providing:
- Visual "truth mine" exploration in 3D
- Justification path tracing from foundational axioms to derived claims
- Cross-domain bridge highlighting
- LLM integration via token-efficient TOON format
- Git-based version control for knowledge evolution

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development](#development)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Core Capabilities

- **Multi-Domain Knowledge Graph**: Unified representation across philosophy, mathematics, and physics
- **2D Overview**: GPU-accelerated force-directed graph visualization (WebGL via cosmos.gl)
- **3D Truth Mine**: Depth-based 3D exploration with epistemic layering (WebGPU)
- **Justification Trees**: Trace support paths from foundations to derived claims
- **Attack/Objection View**: Explore counterarguments and refutations
- **Cross-Domain Bridges**: Highlight connections between domains (e.g., philosophy → math formalizations)
- **LLM Integration**: Export subgraphs as compact TOON artifacts for AI reasoning
- **Git-Native Storage**: Full version control with diff, branch, and merge support

### Visualization Features

- **Depth-Based Layout**: Y-axis represents epistemic/derivational depth
- **Domain Colors**: Philosophy (purple), Mathematics (blue), Physics (red)
- **Relation Types**: Visual encoding for supports, attacks, proves, predicts, etc.
- **Interactive Navigation**: Pan, zoom, orbit camera; click to select; double-click to focus
- **Filters**: By domain, type, relation, or search query
- **Performance**: 60fps rendering with 1k+ visible nodes

---

## Architecture

```
┌─────────────────────────────────────┐
│  React Frontend (TypeScript)        │
│  ├─ 2D Graph (cosmos.gl / WebGL)   │
│  └─ 3D Truth Mine (WebGPU)         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Rust Engine (WebAssembly)         │
│  ├─ GraphStore                      │
│  ├─ Layout Algorithms               │
│  ├─ Query Operations                │
│  └─ GPU Buffer Generation           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Git Repository Storage             │
│  ├─ nodes/*.json (Node data)       │
│  ├─ edges/*.jsonl (Edge data)      │
│  └─ notes/*.md (Optional notes)    │
└─────────────────────────────────────┘
```

**Tech Stack:**
- **Engine**: Rust → WebAssembly (wasm-pack, wasm-bindgen)
- **Frontend**: React + TypeScript + Vite
- **2D Viz**: cosmos.gl (WebGL force graph)
- **3D Viz**: WebGPU (or Three.js WebGPURenderer)
- **Build Scripts**: Python 3.11+
- **Storage**: Git + JSON/JSONL files

---

## Getting Started

### Prerequisites

**Required:**
- **Rust** (1.70+): [Install Rust](https://rustup.rs/)
- **Node.js** (18+): [Install Node](https://nodejs.org/)
- **Python** (3.11+): System Python or via [pyenv](https://github.com/pyenv/pyenv)
- **Git**: For version control

**WASM Target:**
```bash
rustup target add wasm32-unknown-unknown
cargo install wasm-pack
```

### Quick Start

```bash
# Clone repository
git clone https://github.com/yourusername/truth-mines.git
cd truth-mines

# Setup Python environment
python3 -m venv venv
source venv/bin/activate  # On macOS/Linux
pip install -r scripts/requirements.txt

# Build graph artifacts
python scripts/build_index.py
python scripts/build_toon.py

# Build Rust engine (optional for now)
cd engine
wasm-pack build --target web --dev
cd ..

# Setup and run frontend
cd web
npm install

# Copy graph data for dev server
bash scripts/copy-graph-data.sh

# Start dev server
npm run dev
# Opens at http://localhost:3000

# In another terminal, validate sample graph
python scripts/validate.py
```

### Try the Sample Graph

The repository includes a sample knowledge graph in `docs/examples/`:
- **20 nodes** across philosophy, mathematics, and physics
- **30+ edges** with various relation types
- **Cross-domain bridges** demonstrating connections

```bash
# Validate sample data
python scripts/validate.py

# Build index (when implemented)
python scripts/build_index.py

# Generate TOON format (when implemented)
python scripts/build_toon.py
```

---

## Project Structure

```
truth-mines/
├── .github/workflows/     # CI/CD (GitHub Actions)
├── .truth-mines/          # Core configuration
│   └── schema.toml        # Domain and relation definitions
├── engine/                # Rust WebAssembly engine
│   ├── src/
│   │   ├── graph/         # Node, Edge, GraphStore
│   │   ├── layout/        # Layout algorithms
│   │   ├── gpu/           # GPU buffer types
│   │   └── wasm.rs        # WebAssembly bindings
│   └── Cargo.toml
├── web/                   # React frontend (to be initialized)
│   ├── src/
│   │   ├── components/    # React components
│   │   └── hooks/         # Custom hooks
│   └── package.json
├── scripts/               # Python build/validation scripts
│   ├── validate.py        # Graph validation
│   ├── build_index.py     # Manifest generation
│   └── build_toon.py      # TOON format conversion
├── nodes/                 # Knowledge graph nodes (JSON)
├── edges/                 # Knowledge graph edges (JSONL)
├── notes/                 # Optional markdown notes
├── styles/                # Visual style configuration
│   └── default.toml
├── schemas/               # JSON schemas
│   ├── node.schema.json
│   └── edge.schema.json
├── docs/                  # Documentation
│   ├── ADRs/              # Architecture Decision Records
│   └── examples/          # Sample data
├── dist/                  # Build artifacts (gitignored)
├── PRD.md                 # Product Requirements Document
├── ROADMAP.md             # Development roadmap (66 issues)
└── README.md              # This file
```

---

## Development

### Development Methodology

Truth Mines follows **strict Test-Driven Development (TDD)**. See [ADR 001](docs/ADRs/001-strict-tdd-workflow.md) for details.

**Coverage Targets:**
- Rust: 95%
- TypeScript: 80%
- Python: 90%

### Coding Standards

**Rust:**
```bash
cargo fmt              # Format code
cargo clippy           # Lint (zero warnings required)
cargo test             # Run tests
cargo bench            # Run benchmarks
```

**Python:**
```bash
black scripts/         # Format code
ruff scripts/          # Lint
mypy scripts/          # Type check
pytest                 # Run tests
```

**TypeScript (when implemented):**
```bash
npm run lint           # ESLint
npm run type-check     # TypeScript compiler
npm test               # Vitest
npm run test:e2e       # Playwright
```

### Running Tests

```bash
# Rust
cd engine && cargo test

# Python
pytest scripts/tests/

# All (via CI locally)
# .github/workflows/ scripts
```

---

## Documentation

- **[PRD.md](PRD.md)**: Complete product requirements
- **[ROADMAP.md](ROADMAP.md)**: Development roadmap with 66 issues across 8 epics
- **[Architecture Decision Records](docs/ADRs/)**: Key architectural decisions
  - [ADR 001: Strict TDD Workflow](docs/ADRs/001-strict-tdd-workflow.md)
  - [ADR 002: WASM as Engine](docs/ADRs/002-wasm-engine.md)
- **[Example Graph](docs/examples/)**: Sample knowledge graph for testing

---

## Contributing

### Workflow

1. **Check ROADMAP.md** for open issues
2. **Follow TDD**: Write failing test first
3. **Code**: Implement to pass tests
4. **Lint**: Ensure zero warnings
5. **Commit**: Follow commit message format
6. **PR**: Submit for review

**Commit Message Format:**
```
<type>(<scope>): <subject>

feat(engine): add depth computation algorithm
fix(validation): handle missing weight field
docs(readme): update setup instructions
test(graph): add path finding edge cases
```

**Branch Naming:**
```
<type>/<issue-number>-<short-description>

feat/16-graph-store-implementation
fix/42-edge-validation-bug
docs/62-comprehensive-readme
```

### Getting Help

- **Issues**: [GitHub Issues](https://github.com/yourusername/truth-mines/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/truth-mines/discussions)
- **Documentation**: See `docs/` directory

---

## Roadmap

**Current Status:** Initial Setup (Epic 0-1)

**Milestones:**
- ✅ **Foundation**: Repository structure, schemas, ADRs
- 🚧 **Milestone 1** (In Progress): Data model & validation scripts
- ⏳ **Milestone 2**: Rust engine core
- ⏳ **Milestone 3**: 2D overview UI
- ⏳ **Milestone 4**: 3D truth mine visualization
- ⏳ **Milestone 5**: Multi-domain features
- ⏳ **Milestone 6**: LLM integration
- ⏳ **CI/CD**: Continuous integration (ongoing)
- ⏳ **Polish**: Documentation and performance (final)

See [ROADMAP.md](ROADMAP.md) for complete details on all 66 issues.

---

## License

MIT License - See [LICENSE](LICENSE) for details

---

## Acknowledgments

**Meta Transparency:**

This project was developed through:
1. Multi-agent brainstorming between Claude Sonnet 4.5 and GPT-5 Pro
2. PRD creation with GPT-5 Pro
3. Roadmap and initial implementation with Claude Code (Sonnet 4.5, 1M context)

All architectural decisions documented in [docs/ADRs/](docs/ADRs/).

---

**Built with:**
- [Rust](https://www.rust-lang.org/) & [WebAssembly](https://webassembly.org/)
- [React](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
- [cosmos.gl](https://cosmograph.app/) for 2D visualization
- [WebGPU](https://www.w3.org/TR/webgpu/) for 3D rendering
