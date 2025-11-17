# Truth Mines Engine

Rust-based graph processing engine for the Truth Mines knowledge system, compiled to WebAssembly for browser use.

## Building

### Prerequisites

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Add WASM target
rustup target add wasm32-unknown-unknown

# Install wasm-pack
cargo install wasm-pack
```

### Development Build

```bash
# Native build (for testing)
cargo build

# WASM build (for browser)
wasm-pack build --target web --dev
```

### Production Build

```bash
# Optimized WASM build
wasm-pack build --target web --release
```

## Testing

```bash
# Run all tests
cargo test

# Run with coverage
cargo tarpaulin --out Html

# Run benchmarks
cargo bench
```

## Code Quality

```bash
# Format code
cargo fmt

# Check formatting
cargo fmt --check

# Run linter
cargo clippy

# Strict linting (CI mode)
cargo clippy -- -D warnings
```

## Architecture

- **graph/**: Core graph data structures (Node, Edge, GraphStore)
- **layout/**: Layout algorithms (force-directed, truth mine)
- **gpu/**: GPU-friendly buffer types
- **style/**: Visual style mapping
- **parsers/**: JSON and TOON parsers
- **wasm.rs**: WebAssembly bindings (WASM target only)

## Usage from JavaScript

```javascript
import init, { GraphEngine } from './pkg/truth_mines_engine.js';

await init();

const engine = new GraphEngine(styleConfig);
engine.load_nodes_json(nodesJson);
engine.load_edges_toon(edgesToon);
engine.compute_layout_truth_mine();

const buffers = engine.get_gpu_buffers();
// buffers.nodes: Uint8Array
// buffers.edges: Uint8Array
```

## Development

This crate follows strict Test-Driven Development (TDD). See [ADR 001](../docs/ADRs/001-strict-tdd-workflow.md) for details.

**Coverage Target:** 95%

All public APIs must have doc comments with examples.
