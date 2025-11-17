# ADR 002: Rust + WebAssembly as Graph Processing Engine

**Status:** Accepted
**Date:** 2025-11-17
**Deciders:** Project Team
**Related Issues:** Epic 2 (Rust Engine Core)

## Context

The Truth Mines application requires a high-performance graph processing engine that can:

1. Load and index 10k-100k nodes and edges efficiently
2. Compute graph layouts (force-directed, depth-based) at interactive speeds
3. Execute graph queries (neighborhood, path finding) quickly
4. Generate GPU-ready buffer data for visualization
5. Run entirely client-side (no server dependency for MVP)
6. Work across platforms (Linux, macOS, browsers)

We evaluated several approaches:

### Option 1: Pure JavaScript/TypeScript
**Pros:**
- No build complexity
- Easy debugging in browser
- Native browser integration

**Cons:**
- Slower execution for intensive algorithms (5-10x slower than native)
- Limited parallelization options
- Higher memory usage
- Difficult to achieve 60fps layout updates with large graphs

### Option 2: Server-Side Processing (Python/Node.js backend)
**Pros:**
- Can use native libraries (NetworkX, igraph)
- More mature graph algorithm implementations
- Easier debugging

**Cons:**
- Requires server infrastructure (against MVP goal)
- Network latency for queries
- Complicates deployment
- User data leaves browser (privacy concern)
- Multi-user coordination needed

### Option 3: Rust Compiled to WebAssembly
**Pros:**
- Near-native performance (1-2x slower than native, 5-10x faster than JS)
- Memory safety without garbage collection pauses
- Runs entirely in browser (client-side)
- Same codebase can target native and WASM
- Excellent tooling (wasm-pack, wasm-bindgen)
- Strong type system catches errors at compile time
- Zero-cost abstractions

**Cons:**
- More complex build pipeline
- Rust learning curve for contributors
- WASM debugging less mature than JavaScript
- Binary size overhead (mitigated by compression)
- WASM-JavaScript boundary has some overhead

### Option 4: C++/Emscripten
**Pros:**
- Mature ecosystem
- Maximum performance

**Cons:**
- Memory safety burden (manual memory management)
- More complex than Rust
- Emscripten quirks and maintenance

## Decision

We will implement the graph processing engine in **Rust** and compile it to **WebAssembly** using `wasm-pack` and `wasm-bindgen`.

### Architecture

```
┌─────────────────────────────────────────┐
│  React Frontend (TypeScript)            │
│  - UI Components                        │
│  - 2D/3D Renderers (WebGL/WebGPU)      │
└─────────────┬───────────────────────────┘
              │ JavaScript API
              ▼
┌─────────────────────────────────────────┐
│  WASM Bindings (wasm-bindgen)          │
│  - GraphEngine class                    │
│  - Exported methods for JS              │
└─────────────┬───────────────────────────┘
              │ Rust API
              ▼
┌─────────────────────────────────────────┐
│  Rust Engine (engine/ crate)           │
│  ├── GraphStore (Vec, HashMap)         │
│  ├── Query algorithms (BFS, DFS)       │
│  ├── Layout algorithms (force, depth)  │
│  ├── GPU buffer generation             │
│  └── Parsers (JSON, TOON)              │
└─────────────────────────────────────────┘
```

### Implementation Details

1. **Rust Workspace Structure**
   ```
   engine/
   ├── Cargo.toml
   ├── src/
   │   ├── lib.rs           # Core library
   │   ├── wasm.rs          # WASM bindings
   │   ├── graph/           # Graph data structures
   │   ├── layout/          # Layout algorithms
   │   ├── gpu/             # GPU buffer types
   │   └── parsers/         # Data parsers
   ```

2. **Build Process**
   ```bash
   # Development build
   wasm-pack build --target web --dev

   # Production build (optimized, small)
   wasm-pack build --target web --release
   ```

3. **JavaScript Integration**
   ```typescript
   import init, { GraphEngine } from './engine/pkg';

   await init();
   const engine = new GraphEngine(styleConfig);
   engine.load_nodes_json(nodesJson);
   engine.load_edges_toon(edgesToon);
   engine.compute_layout_truth_mine();

   const buffers = engine.get_gpu_buffers();
   // buffers.nodes is Uint8Array
   // buffers.edges is Uint8Array
   ```

4. **Data Exchange Strategy**
   - **Large data (nodes, edges):** Pass as JSON strings, parse in Rust
   - **Small queries:** Pass node IDs as strings
   - **Results:** Return as JsValue (arrays/objects) or typed arrays
   - **GPU buffers:** Return as Uint8Array (zero-copy where possible)

5. **Performance Targets**
   - Graph load (10k nodes): < 500ms
   - Layout computation (10k nodes): < 2s
   - Neighbor query (k=2): < 10ms
   - Path finding (depth 10): < 50ms
   - GPU buffer generation: < 100ms

## Consequences

### Positive

1. **Performance**
   - 5-10x faster than pure JavaScript for graph algorithms
   - Can handle 100k+ node graphs in browser
   - Layout updates fast enough for interactive exploration
   - Predictable performance (no GC pauses)

2. **Memory Efficiency**
   - Compact binary representation
   - Explicit memory management
   - Lower memory footprint than equivalent JS

3. **Type Safety**
   - Rust's type system catches errors at compile time
   - Fewer runtime bugs
   - Refactoring confidence

4. **Portability**
   - Same Rust code can compile to:
     - WASM (browser)
     - Native binary (CLI tools)
     - Library (for Python bindings via PyO3)

5. **Ecosystem**
   - Access to Rust crates (serde, rayon, petgraph)
   - Active WebAssembly tooling development
   - Strong community support

6. **Client-Side Execution**
   - No server required
   - User data stays in browser
   - Offline-capable
   - Simpler deployment

### Negative

1. **Build Complexity**
   - Requires Rust toolchain installation
   - WASM build step in CI/CD pipeline
   - Longer build times than pure JavaScript

2. **Learning Curve**
   - Contributors need Rust knowledge
   - Smaller contributor pool than JavaScript
   - Ownership/borrowing concepts take time to learn

3. **Debugging Experience**
   - WASM debugging less mature than JavaScript
   - Source maps work but not perfect
   - Need to debug Rust separately from JS

4. **Binary Size**
   - Initial WASM binary: ~500KB-1MB (before compression)
   - Mitigated by: gzip (reduces to ~150KB), lazy loading
   - Acceptable for modern web apps

5. **WASM-JS Boundary Overhead**
   - String passing involves UTF-8 conversion
   - Struct serialization has cost
   - Mitigated by: batching, typed arrays for hot paths

6. **Browser Compatibility**
   - Requires WebAssembly support
   - Available in all modern browsers (Chrome 57+, Firefox 52+, Safari 11+)
   - IE11 not supported (acceptable for MVP)

### Mitigations

1. **Developer Experience**
   - Comprehensive documentation
   - Example code and tutorials
   - Fast iteration via `wasm-pack build --dev`
   - Good error messages at WASM boundary

2. **Build Optimization**
   - Use `wasm-opt` for size reduction
   - Enable `lto` and `opt-level = "z"` for production
   - Strip debug symbols in release builds
   - Lazy-load WASM module

3. **Debugging Strategy**
   - Extensive unit tests in pure Rust (fast iteration)
   - Integration tests with wasm-bindgen-test
   - Console logging via web-sys
   - Panic messages propagated to JavaScript

4. **Performance Monitoring**
   - Benchmarks via `criterion`
   - Profile with Rust tooling before WASM compile
   - Browser DevTools for WASM profiling

## Alternatives Considered and Rejected

### AssemblyScript
Compile TypeScript to WASM. **Rejected** because:
- Less mature tooling than Rust
- Performance not as good as Rust
- Smaller ecosystem
- Still need to learn new patterns

### Go + TinyGo
Compile Go to WASM. **Rejected** because:
- Larger WASM binaries (includes garbage collector)
- TinyGo more limited than standard Go
- Less control over memory layout

### Pure WebGL Compute Shaders
Run graph algorithms on GPU. **Rejected** because:
- Complex graph algorithms hard to parallelize
- Difficult to debug
- Limited by shader capabilities
- Still need CPU fallback

## Validation Plan

Success criteria for this decision:

1. ✅ Rust engine passes all tests (95% coverage)
2. ✅ WASM build completes in < 2 minutes
3. ✅ WASM binary size < 200KB gzipped
4. ✅ Performance targets met (see above)
5. ✅ No WASM-related bugs in production for 1 month

If performance targets are not met, we can:
- Optimize Rust code (profiling, algorithmic improvements)
- Use native binary for CLI, keep WASM for web
- Consider hybrid approach (critical path in WASM, rest in JS)

## References

- Rust and WebAssembly Book: https://rustwasm.github.io/book/
- wasm-bindgen Guide: https://rustwasm.github.io/wasm-bindgen/
- WebAssembly Performance: https://hacks.mozilla.org/category/webassembly/
- Case Study: Figma using WASM: https://www.figma.com/blog/webassembly-cut-figmas-load-time-by-3x/

## Revision History

- **2025-11-17**: Initial version accepted
