# Truth Mines Architecture

**Version:** 1.1.0 (Gemini 3 Pro enhancements integrated)
**Updated:** 2025-11-18

---

## Overview

Truth Mines is a **Git-native, GPU-accelerated knowledge graph visualization system** for exploring epistemic relationships across philosophy, mathematics, and physics.

**Architecture Principles:**
1. **Git-Native:** Each node is a JSON file, full version control
2. **Local-First:** No cloud dependency, runs entirely in browser
3. **GPU-Accelerated:** WebGPU for 60fps rendering of thousands of nodes
4. **Spec-Driven:** JSON Schema validation, strict TDD (ADR-001)
5. **Multi-Format:** JSON (storage), TOON (LLM-optimized), GPU buffers (rendering)

---

## Technology Stack

### Core Engine (Rust)
- **Language:** Rust (compile to WASM for browser, native for CLI)
- **Graph:** Custom adjacency list structure (`GraphStore`)
- **Layout:** Depth-based (epistemic distance) + force-directed (2D/3D positioning)
- **GPU:** bytemuck for zero-copy buffer generation
- **Parsing:** TOON (custom format), JSON (fallback)

### Web Frontend (TypeScript + React)
- **Framework:** React 18 + TypeScript 5
- **3D Rendering:** WebGPU (custom shaders)
- **2D Rendering:** cosmos.gl (GPU force graph)
- **State:** React hooks (useSalience, useNeighbors, etc.)
- **Testing:** Vitest + React Testing Library

### Build System (Python)
- **Indexing:** `scripts/build_index.py` (JSON → dist/manifest.json)
- **Validation:** `scripts/validate.py` (JSON Schema validation)
- **TOON Generation:** `scripts/build_toon.py` (JSON → TOON)
- **Future:** `scripts/build_federated.py` (multi-module resolution)

---

## Data Flow

```
User creates nodes/edges (JSON files)
         ↓
Python build script
         ├→ dist/manifest.json (index)
         ├→ dist/graph.json (summary)
         └→ dist/edges.toon (LLM-optimized)
         ↓
Rust engine (WASM)
         ├→ Parse TOON/JSON
         ├→ Compute depth layers
         ├→ Compute tension (Gemini)
         ├→ Compute load-bearing (Gemini)
         ├→ Run force layout
         └→ Generate GPU buffers
         ↓
React frontend
         ├→ Load graph summary
         ├→ Compute salience (focus + tension)
         ├→ Upload to WebGPU
         └→ Render 60fps
```

---

## Module Structure

```
truth-mines/
├── .truth-mines/
│   └── schema.toml           # Validation rules, relations, inverses
├── nodes/                     # One JSON file per node
│   ├── 0lg001.json           # Modus Ponens (logic)
│   ├── 0ax001.json           # Axiom of Choice (math)
│   ├── obs001.json           # Gravitational Lensing (physics)
│   └── ...
├── dist/                      # Build artifacts (gitignored)
│   ├── manifest.json         # Node index
│   ├── graph.json            # Summary for quick load
│   ├── edges.toon            # LLM-optimized edge format
│   └── exports.json          # Public interface (future)
├── schemas/                   # JSON Schema definitions
│   ├── node.schema.json
│   └── edge.schema.json
├── styles/                    # Visual style configurations
│   ├── default.toml
│   └── dark.toml (future)
├── engine/                    # Rust core (compiles to WASM)
│   └── src/
│       ├── graph/            # Graph data structures
│       ├── layout/           # Layout algorithms
│       ├── gpu/              # GPU buffer types
│       ├── parsers/          # TOON, JSON parsers
│       ├── analysis/         # Metrics (Gemini additions)
│       └── wasm.rs           # WebAssembly bindings
├── web/                       # React frontend
│   └── src/
│       ├── components/       # Graph2D, Graph3D, NodeDetail, etc.
│       ├── hooks/            # useSalience, useNeighbors, etc.
│       └── types/            # TypeScript definitions
├── scripts/                   # Python build/validation tools
│   ├── build_index.py
│   ├── build_toon.py
│   └── validate.py
└── docs/                      # Specifications and design docs
    ├── foundations/          # Ontological foundations
    ├── SALIENCE_MODEL.md
    ├── GEMINI_REVIEW.md
    ├── FEDERATION.md
    └── JOURNAL.md
```

---

## Namespace System (Gemini 3 Pro Future-Proofing)

### Overview

**Purpose:** Enable federated knowledge bases without ID collisions.

**Status:** Schema-ready (namespace field exists), build tooling not yet implemented.

**Trigger:** Implement when graph reaches 500+ nodes or collaboration begins.

### Node ID Format

**Internal (within a module):**
```
"id": "k7x9m2"
```

Standard 6-character alphanumeric ID (unchanged).

**External (cross-module reference):**
```
@namespace/id
```

Examples:
- `@std-math/t4k2p9` - Fundamental Theorem of Algebra from std-math module
- `@local/k7x9m2` - User's own node (local is default namespace)
- `@gregegan-diaspora/concept1` - Concept from imported module

### Schema Support

**Node Schema (Already Added):**
```json
{
  "id": "t4k2p9",
  "namespace": "std-math",  // Optional, defaults to "local"
  "type": "theorem",
  ...
}
```

**Edge References:**
```json
{
  "f": "@std-math/t4k2p9",
  "t": "@local/k7x9m2",
  "relation": "supports"
}
```

### Build-Time Resolution

When `knowledge.toml` exists with dependencies:

```python
# Pseudocode for scripts/build_federated.py (not yet implemented)

1. Parse knowledge.toml
2. Load all dependency modules (Git clone/fetch)
3. For each module:
   - Load nodes with namespace prefix
   - Resolve cross-module edge references
4. Merge into unified graph
5. Assign global integer IDs for GPU (0, 1, 2, ...)
6. Generate dist/manifest.json with namespace mapping
```

### Collision Detection

```python
def check_collisions(modules):
    seen_ids = {}
    for module_name, nodes in modules.items():
        for node in nodes:
            full_id = f"@{module_name}/{node['id']}"
            if full_id in seen_ids:
                raise ValueError(
                    f"Namespace collision: {full_id} "
                    f"defined in both {seen_ids[full_id]} and {module_name}"
                )
            seen_ids[full_id] = module_name
```

### Implementation Checklist

- [ ] `engine/src/graph/namespace.rs` - Parser for `@namespace/id`
- [ ] `scripts/build_federated.py` - Multi-module build script
- [ ] Test: Namespace parsing
- [ ] Test: Collision detection
- [ ] Test: Cross-module edge resolution
- [ ] Documentation: Module creation guide

**Estimated Effort:** 8-10 hours (when needed)

For detailed roadmap, see `docs/FEDERATION.md`.

---

## Depth Calculation Algorithm

### Epistemic Distance

**Definition:** Depth represents epistemic distance from foundational nodes.

**Algorithm:** Topological sort with BFS layering (see `engine/src/layout/depth.rs`)

```rust
pub fn compute_depths(graph: &GraphStore) -> HashMap<String, u32> {
    // 1. Find foundation nodes (depth 0): no incoming epistemic edges
    let foundations = find_foundations(graph);

    // 2. BFS layering from foundations
    let mut depths = HashMap::new();
    let mut queue = VecDeque::new();

    for foundation_id in foundations {
        depths.insert(foundation_id, 0);
        queue.push_back(foundation_id);
    }

    while let Some(node_id) = queue.pop_front() {
        let current_depth = depths[&node_id];

        for successor in get_successors(graph, &node_id) {
            let new_depth = current_depth + 1;

            depths.entry(successor)
                .and_modify(|d| *d = (*d).max(new_depth))
                .or_insert(new_depth);

            queue.push_back(successor);
        }
    }

    depths
}
```

**Epistemic Relations (used for depth):**
- `supports`, `proves`, `entails`, `predicts`
- These are transitive and cumulative

**Non-Epistemic Relations (ignored for depth):**
- `attacks`, `defines`, `cites`
- These don't create epistemic dependence

### Y-Axis Mapping

```rust
fn depth_to_y(depth: u32, spacing: f32) -> f32 {
    depth as f32 * spacing
}
```

Default spacing: 5.0 units per depth level

**Visual Result:**
- Depth 0 (foundations): y = 0 (bottom of mine)
- Depth 1: y = 5
- Depth 2: y = 10
- ...

**Mine Metaphor:** Deeper (higher y) = more epistemic distance from foundations.

---

## Salience System (Gemini 3 Pro Enhancements)

### Overview

**Salience** is a dynamic visual weight (0-1) that makes relevant nodes larger, brighter, and labeled.

**Updated Formula (Gemini additions in bold):**
```
salience = clamp(
    w_focus × I_focus
  + w_path × I_path
  + w_neighbor × I_neighbor
  + w_tension × I_tension         // ← Gemini: Highlight controversy
  + w_meta × I_metadata
  , 0, 1
)
```

### Components

**Navigational (Focus/Path/Neighbor):**
- Selected node and active path: high salience
- Nearby nodes (1-3 hops): medium salience
- Background nodes: low salience (0-0.3)

**Epistemic (Tension) - Gemini Addition:**
- **Tension = sqrt(support_strength × attack_strength) / 5.0**
- Highlights **active frontiers** vs. **settled foundations** vs. **dead ends**
- High tension (0.7+): Controversial nodes (e.g., Axiom of Choice, Gettier vs JTB)
- Zero tension: Nodes with only support OR only attacks (not both)

**Structural (Load-Bearing) - Gemini Addition:**
- **Load-Bearing = orphaned_descendants / total_nodes**
- Identifies critical "pillars" of the graph
- High load (0.3+): Remove this node → large collapse (e.g., Modus Ponens)
- Zero load: Leaf nodes or non-critical

### Visual Mappings

**Size:**
```
size = baseSize × (0.5 + 1.5 × salience)
```
Range: 50%-200% of base

**Opacity:**
```
opacity = 0.2 + 0.8 × salience
```
Range: 20%-100%

**Label Threshold:**
```
showLabel = salience > 0.4
```

**Tension Effects (Gemini):**
- tension > 0.7: Orange/red glow, pulsing animation
- tension > 0.5: Yellow tint
- tension < 0.3: No special effect

**Load-Bearing Effects (Gemini):**
- load > 0.3: Pillar geometry (taller, thicker)
- load > 0.4: Blue/white structural glow
- load < 0.05: Normal geometry

**Combined (Tension + Load):**
- High both: Critical controversy (bright orange + pillar)
- Low tension + high load: Settled foundation (blue + pillar)
- High tension + low load: Active debate (orange + normal)
- Low both: Background (gray + small)

For full specs, see `docs/SALIENCE_MODEL.md`.

---

## GPU Buffer Format

### GpuNode (64 bytes, Gemini-enhanced)

```rust
#[repr(C)]
pub struct GpuNode {
    position: [f32; 3],           // 12 bytes - 3D position [x, y, z]
    size: f32,                     // 4 bytes - Base scale
    color: [f32; 4],               // 16 bytes - RGBA
    domain_id: u32,                // 4 bytes - Encoded domain
    type_id: u32,                  // 4 bytes - Encoded type
    flags: u32,                    // 4 bytes - Rendering flags
    scalar: f32,                   // 4 bytes - Generic importance
    tension: f32,                  // 4 bytes - Epistemic tension (Gemini)
    load_bearing: f32,             // 4 bytes - Structural criticality (Gemini)
    status: u32,                   // 4 bytes - Lifecycle flags (Gemini)
    _padding: u32,                 // 4 bytes - Alignment
}
// Total: 64 bytes
```

**Status Flags (Gemini Addition):**
- Bit 0: `contested` (has significant attacks/controversy)
- Bit 1: `refuted` (status = "refuted")
- Bit 2: `draft` (status = "draft")
- Bit 3: `archived` (status = "archived")

### GpuEdge (40 bytes, unchanged)

```rust
#[repr(C)]
pub struct GpuEdge {
    from: u32,           // 4 bytes - Source node index
    to: u32,             // 4 bytes - Target node index
    color: [f32; 4],     // 16 bytes - RGBA
    weight: f32,         // 4 bytes - Relation strength
    relation_id: u32,    // 4 bytes - Encoded relation type
    flags: u32,          // 4 bytes - Rendering flags
    padding: u32,        // 4 bytes - Alignment
}
// Total: 40 bytes
```

---

## File Formats

### JSON (Storage)

**nodes/0lg001.json:**
```json
{
  "id": "0lg001",
  "type": "axiom",
  "domain": "mathematics",
  "title": "Modus Ponens",
  "status": "stable",
  "namespace": "local",
  "content": "If P, and P→Q, then Q...",
  "formal": "P, P → Q ⊢ Q",
  "tags": ["logic", "inference"],
  "metadata": {
    "foundational_system": "ClassicalLogic",
    "contested": false,
    "importance": 10
  }
}
```

### TOON (Token-Optimized)

**dist/edges.toon:**
```
supports[20]{f,t,w,domain}:
0lg001,0ax001,1.0,mathematics
0lg001,t4k2p9,1.0,mathematics
...
```

**Benefits:**
- 70-80% token reduction vs. JSON for LLM context
- Human-readable (easier than binary)
- Fast parsing (simple format)

### Manifest (Index)

**dist/manifest.json:**
```json
{
  "version": "1.0.0",
  "generated": "2025-11-18T20:00:00Z",
  "nodes": {
    "0lg001": {"file": "nodes/0lg001.json", "domain": "mathematics", "type": "axiom"},
    ...
  },
  "stats": {
    "total_nodes": 30,
    "by_domain": {"mathematics": 13, "physics": 8, "philosophy": 9},
    "by_type": {"axiom": 7, "theorem": 5, ...}
  }
}
```

---

## Relation Semantics

**Universal Relations:**
- `supports`: Epistemic support (raises probability)
- `attacks`: Counterargument (lowers probability)
- `entails`: Logical implication (deductive)
- `defines`: Definitional relationship
- `cites`: Bibliographic reference (non-epistemic)

**Domain-Specific:**
- Philosophy: `presupposes`, `refutes`, `explicates`
- Mathematics: `proves`, `generalizes`, `equivalent`, `lemma_for`
- Physics: `predicts`, `explains` (Gemini), `limiting_case_of` (Gemini), `approximates`, `reduces_to`

**Bridge Relations:**
- `formalizes` (Philosophy → Math)
- `models` (Math → Physics)
- `philosophical_foundation` (Philosophy → Any)

**Relation Inverses (Gemini Addition):**

Defined in `.truth-mines/schema.toml` for LLM backward reasoning:

```toml
[relations.inverses]
supports = "supported_by"
attacks = "attacked_by"
proves = "proven_by"
...
```

**Usage:** LLM can infer "B is supported_by A" from "A supports B" without explicit reverse edge.

For full semantics, see `docs/foundations/RELATION_SEMANTICS.md`.

---

## Analysis Algorithms (Gemini 3 Pro Additions)

### Tension Calculation

**Location:** `web/src/hooks/useSalience.ts` (TypeScript), could be moved to Rust

**Formula:**
```
tension(node) = min(sqrt(Σ support_weights × Σ attack_weights) / 5.0, 1.0)
```

**Interpretation:**
- Requires BOTH support AND attack edges
- Geometric mean ensures both factors needed
- Normalized to [0, 1]

**Visual:** Orange/red glow for high-tension nodes

**Test Coverage:** 10 comprehensive tests (all passing)

### Load-Bearing Analysis

**Location:** `engine/src/analysis/load_bearing.rs` (Rust)

**Algorithm:**
```rust
1. find_descendants(node) → Set of all reachable nodes
2. For each descendant:
   - Check if ALL paths from foundations go through node
   - If yes: descendant would be orphaned
3. Count orphaned descendants
4. Normalize: orphaned_count / total_nodes
```

**Complexity:** O(V × E) worst case (graph traversal for each descendant)

**Optimization:** Compute during build, cache in GPU buffers (not runtime)

**Visual:** Pillar geometry, blue glow for high-load nodes

**Test Coverage:** 11 comprehensive tests (all passing)

---

## Build Pipeline

### Current Process

```bash
# 1. Build graph index
python3 scripts/build_index.py
# → dist/manifest.json, dist/graph.json

# 2. Build TOON format
python3 scripts/build_toon.py
# → dist/edges.toon

# 3. Validate schemas (requires jsonschema)
python3 scripts/validate.py
# → Error reports if invalid nodes
```

### Future Process (With Federation)

```bash
# 1. Resolve dependencies (knowledge.toml)
python3 scripts/build_federated.py --resolve
# → Clone/fetch dependency modules

# 2. Build with namespaces
python3 scripts/build_federated.py --build
# → Resolve @namespace/id, merge modules, generate unified graph

# 3. Compute metrics
python3 scripts/build_federated.py --analyze
# → Compute tension, load-bearing, cache in buffers

# 4. Validate
python3 scripts/validate.py --strict
# → Consistency checks: circular reasoning, weight integrity
```

### Consistency Checks (Gemini Suggestions - Pending)

**Planned for `scripts/validate.py`:**

1. **Circular Reasoning Detection:**
   - Error if `A supports B` and `B supports A` (unless marked as coherentist cluster)
   - Proofs must form DAG

2. **Weight Integrity:**
   - Warn if `A entails B` (w=1.0) but B has low certainty metadata
   - Entailment transmits certainty

3. **Foundation Validation:**
   - Ensure at least some depth-0 nodes exist
   - Warn if large components are disconnected from foundations

4. **Relation Type Checking:**
   - `proves` edges must have `axiom_system` in metadata
   - `limiting_case_of` edges must have `condition` in metadata

**Status:** Specified in GEMINI_REVIEW.md, implementation pending

---

## Performance Targets

### Build Time
- <1s for 30 nodes (current) ✅
- <2s for 500 nodes (target)
- <10s for 5000 nodes (with optimization)

### Runtime Rendering
- 60fps for 1000 nodes (target)
- 30fps for 5000 nodes (acceptable)
- Frustum culling + LOD for >10k nodes

### Memory
- ~2KB per node (JSON)
- ~64 bytes per node (GPU buffer)
- ~40 bytes per edge (GPU buffer)

**Example:** 5000 nodes + 15000 edges
- JSON: ~10MB
- GPU buffers: ~920KB (efficient!)

---

## Testing Strategy

### Rust (Engine)
- **114 tests** (all passing as of 2025-11-18)
- Unit tests for all modules
- Integration tests for graph operations
- Test coverage: ~85% (estimated)

**TDD Workflow (ADR-001):**
1. Write test first (spec-driven)
2. Run test (should fail)
3. Implement minimal code to pass
4. Refactor
5. Commit

### TypeScript (Frontend)
- **22 tests** for salience system (all passing)
- Component tests (Graph2D, Graph3D, etc.)
- Hook tests (useSalience, useNeighbors, etc.)
- Integration tests (pending)

### Python (Build Scripts)
- Schema validation tests
- TOON parsing tests (cross-check with Rust)
- Consistency check tests (pending)

---

## Deployment

### Web App (Current)
1. Build Rust → WASM: `cargo build --target wasm32-unknown-unknown --release`
2. Build TypeScript: `npm run build --prefix web`
3. Deploy: Static hosting (Netlify, Vercel, GitHub Pages)

### CLI Tool (Future)
1. Build Rust → Native: `cargo build --release`
2. Install: `cargo install --path engine`
3. Use: `truth-mines query "Gettier" --depth 3`

---

## Extension Points

### Custom Layouts
- Implement `layout::LayoutAlgorithm` trait
- Example: `CircularLayout`, `TreeLayout`, `ForceAtlas2`

### Custom Styles
- Create new `.toml` in `styles/`
- Override colors, shapes, sizes
- Example: `styles/colorblind.toml`, `styles/print.toml`

### Custom Analysis
- Add modules to `analysis/`
- Example: `centrality.rs`, `clustering.rs`, `critique_detection.rs`

### Custom Relations
- Add to `.truth-mines/schema.toml`
- Update `schemas/edge.schema.json`
- Implement in renderer if visual encoding needed

---

## Security & Privacy

### Local-First Architecture
- No telemetry, no cloud dependency
- All data stays on your machine
- Git commits are your backup

### Malicious Content (Federation Future)
- **Risk:** Importing untrusted module with false claims
- **Mitigation:** Review mode (`truth-mines review module --diff`)
- **Trust Model:** Only import from trusted sources

### Sensitive Knowledge
- Personal beliefs, research notes, unpublished ideas
- **Protection:** Don't push to public Git repos
- Use private repos or local-only mode

---

## Future Architecture Directions

### Scale (10k+ Nodes)
- Implement ghost nodes (LOD for distant clusters)
- Streaming: Load visible sector only
- IndexedDB caching in browser

### Collaboration
- Implement federation (see FEDERATION.md)
- Conflict resolution UI (when two modules attack each other)
- Merge strategies for diverged graphs

### AI Integration
- "Miner" agents: LLM-assisted node creation
- Contradiction detection: AI flags inconsistencies
- Similarity search: Embedding-based clustering

### Advanced Rendering
- Cable bundling (multiple supports → braided edge)
- Git diff mode (visualize graph changes over time)
- Temporal animation (watch graph grow historically)

---

## Version History

- **v1.0.0** (2025-01-06): Initial architecture (core graph, depth, styles)
- **v1.1.0** (2025-11-18): Gemini 3 Pro enhancements
  - Tension & load-bearing analysis
  - Logic primitive nodes
  - Physics observation restructuring
  - Namespace future-proofing
  - Enhanced visual systems

---

## References

- **Design Decisions:** See ADR documents (future)
- **Salience Model:** `docs/SALIENCE_MODEL.md`
- **Relation Semantics:** `docs/foundations/RELATION_SEMANTICS.md`
- **Federation:** `docs/FEDERATION.md`
- **Implementation Journal:** `docs/JOURNAL.md`

---

*This architecture enables Truth Mines to scale from a personal tool (30 nodes) to a collaborative knowledge ecosystem (10k+ nodes) while maintaining Git-native simplicity and local-first principles.*
