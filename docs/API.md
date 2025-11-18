# Truth Mines API Documentation

## Python Scripts API

### validate.py

```bash
python scripts/validate.py [graph_dir] [--strict]
```

**Arguments:**
- `graph_dir` - Directory containing nodes/ and edges/ (default: current dir)
- `--strict` - Enforce domain/relation validity against schema.toml

**Exit Codes:**
- `0` - Validation successful
- `non-zero` - Validation failed

**Example:**
```bash
python scripts/validate.py --strict
# ✓ Graph validation successful
#   Nodes: 22
#   Edges: 28
```

### build_index.py

```bash
python scripts/build_index.py [graph_dir]
```

**Generates:**
- `dist/manifest.json` - Node index with stats
- `dist/graph.json` - Lightweight node summaries

**Example:**
```bash
python scripts/build_index.py
# ✓ Created dist/manifest.json
# ✓ Created dist/graph.json
```

### build_toon.py

```bash
python scripts/build_toon.py [graph_dir]
```

**Generates:**
- `dist/edges.toon` - Compact edge format for LLMs

### extract_subgraph.py

```bash
python scripts/extract_subgraph.py --node <id> --depth <k> --output <file>
```

**Arguments:**
- `--node` - Starting node ID (required)
- `--depth` - K-hop depth (default: 2)
- `--output` - Output TOON file path (required)
- `--graph-dir` - Graph directory (default: current)

**Example:**
```bash
python scripts/extract_subgraph.py \
  --node k7x9m2 \
  --depth 2 \
  --output subgraphs/knowledge-safety.toon
```

---

## Rust Engine API

### GraphStore

```rust
use truth_mines_engine::{GraphStore, Node, Edge};

let mut store = GraphStore::new();

// Add nodes
store.add_node(node);

// Add edges
store.add_edge(edge);

// Build adjacency lists
store.build_adjacency();

// Query
let node = store.get_node("abc123");
let neighbors = store.neighbors("abc123", 2);  // 2-hop
let paths = store.find_paths("abc123", "def456", 10);  // max depth 10
```

### Parsers

```rust
use truth_mines_engine::parsers::{json, toon};

// Load nodes from directory
let nodes = json::load_nodes_from_dir(Path::new("nodes"))?;

// Parse TOON edges
let edges = toon::parse_toon(&toon_content)?;

// Parse JSONL edges (fallback)
let edges = toon::parse_jsonl(&jsonl_content)?;
```

### Layout

```rust
use truth_mines_engine::layout::{
    depth::compute_depths,
    truth_mine::compute_truth_mine_layout,
};

// Compute epistemic depths
let depths = compute_depths(&graph);

// Compute 3D layout
let layout_3d = compute_truth_mine_layout(&graph, &depths, 5.0);
```

### GPU Buffers

```rust
use truth_mines_engine::gpu::buffers::{
    generate_node_buffer,
    generate_edge_buffer,
};
use truth_mines_engine::style::StyleConfig;

let style = StyleConfig::from_toml(&toml_str)?;

// Generate GPU buffers
let node_buffer = generate_node_buffer(&graph, &layout, &depths, &style);
let edge_buffer = generate_edge_buffer(&graph, &style);

// Buffers are Vec<u8> ready for GPU upload
```

---

## WASM API (JavaScript/TypeScript)

### GraphEngine

```typescript
import init, { GraphEngine } from './engine/pkg';

// Initialize WASM module
await init();

// Create engine
const engine = new GraphEngine(styleConfigToml);

// Load data
engine.load_nodes_json(nodesJson);      // JSON array or single node
engine.load_edges_toon(edgesToon);      // TOON format

// Compute layout
engine.compute_layout_truth_mine();

// Get GPU buffers
const buffers = engine.get_gpu_buffers();
// buffers.nodes: Uint8Array (GpuNode array)
// buffers.edges: Uint8Array (GpuEdge array)

// Query
const nodeCount = engine.node_count();
const edgeCount = engine.edge_count();
```

---

## React Hooks API

### useGraphData

```typescript
import { useGraphData } from './hooks/useGraphData';

function MyComponent() {
  const { manifest, graphSummary, loading, error } = useGraphData();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>Loaded {graphSummary?.length} nodes</div>;
}
```

### useGraphEngine

```typescript
import { useGraphEngine } from './hooks/useGraphEngine';

function MyComponent() {
  const { buffers, loading, error, loadGraph, computeLayout } = useGraphEngine();

  // Usage (when WASM integrated):
  // await loadGraph(nodesJson, edgesToon);
  // computeLayout();
  // const gpuBuffers = buffers;  // Use with WebGL/WebGPU
}
```

---

## React Components API

### Graph2D

```typescript
import { Graph2D } from './components/Graph2D';

<Graph2D
  nodes={graphSummary}
  onNodeSelect={(nodeId) => setSelectedNode(nodeId)}
/>
```

### NodeDetail

```typescript
import { NodeDetail } from './components/NodeDetail';

<NodeDetail
  nodeId={selectedNodeId}
  onClose={() => setSelectedNode(null)}
/>
```

### Filters

```typescript
import { Filters, type FilterState } from './components/Filters';

<Filters onChange={(filters: FilterState) => setFilters(filters)} />

// FilterState: { domains: Set<string>, types: Set<string> }
```

### Search

```typescript
import { Search } from './components/Search';

<Search
  nodes={graphSummary}
  onResults={(matchingIds: string[]) => setSearchResults(matchingIds)}
/>
```

---

## Data Model API

### Node Structure (JSON)

```json
{
  "id": "abc123",           // Required: 6-char alphanumeric
  "type": "proposition",    // Required: node type
  "domain": "philosophy",   // Required: philosophy|mathematics|physics
  "title": "Node Title",    // Required: short title
  "content": "...",         // Optional: explanation
  "formal": "∀x: P(x)",    // Optional: formal notation
  "tags": ["tag1"],        // Optional: tags
  "metadata": {...},       // Optional: domain-specific data
  "sources": ["ref1"],     // Optional: citations
  "created": "2025-...",   // Optional: ISO timestamp
  "updated": "2025-..."    // Optional: ISO timestamp
}
```

### Edge Structure (JSONL)

```json
{"f":"abc123","t":"def456","relation":"supports","domain":"philosophy","w":0.9}
```

**Fields:**
- `f` - From node ID (required)
- `t` - To node ID (required)
- `relation` - Relation type (required)
- `domain` - Domain or bridge (required)
- `w` - Weight 0-1 (optional)

---

## Testing API

### Python

```bash
# Run all tests
pytest scripts/tests/

# With coverage
pytest scripts/tests/ --cov=scripts --cov-report=html
```

### Rust

```bash
cd engine

# Unit tests
cargo test

# Integration tests
cargo test --test integration_test

# With output
cargo test -- --nocapture
```

### TypeScript

```bash
cd web

# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage
npm test -- --coverage
```

---

## Performance Targets

- **Graph Loading:** 10k nodes in < 500ms
- **Layout Computation:** 10k nodes in < 2s
- **Neighbor Query:** k=2 depth in < 10ms
- **Path Finding:** depth 10 in < 50ms
- **Buffer Generation:** < 100ms
- **Frontend Rendering:** 60fps with 1k visible nodes

See [ROADMAP.md](../ROADMAP.md) for detailed issue tracking.
