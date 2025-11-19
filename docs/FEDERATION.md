# Truth Mines Federation & Modularization Roadmap

**Status:** FUTURE ROADMAP (not implemented)
**Inspired by:** Gemini 3 Pro Multi-Agent Review
**Trigger:** Implement when graph reaches ~500+ nodes

---

## Overview

Truth Mines is designed as a **personal knowledge graph** for individual use. However, as the graph grows, modularization becomes necessary for:
1. **Performance:** Loading 10,000+ nodes is slow
2. **Collaboration:** Sharing domain-specific subgraphs (e.g., "my QM interpretations")
3. **Standard Libraries:** Community-maintained "std-math", "std-physics" modules
4. **Specialization:** Deep dives into niche topics without bloating main graph

**Gemini's Vision:** "This moves you from a 'Graph Viewer' to a 'Civilization-Scale Knowledge Engine.'"

---

## The "Knowledge Crate" System

### Inspired By: Rust's Cargo

Adopt a package manager approach for knowledge modules.

### knowledge.toml Manifest

```toml
[package]
name = "my-personal-truth"
version = "0.1.0"
authors = ["Your Name <your.email@example.com>"]
description = "My personal knowledge graph"

[dependencies]
# Standard library of mathematical truth
std-math = { git = "https://github.com/truth-mines/std-math", tag = "v1.2" }

# Standard physics knowledge base
std-physics = { git = "https://github.com/truth-mines/std-physics", branch = "main" }

# Friend's philosophy module
greg-egan-ideas = { git = "https://github.com/gregegan/ontology", path = "diaspora" }

# Local private module (not published)
my-quantum-interpretations = { path = "../quantum-interp" }
```

### Module Structure

Each module is a valid Truth Mines repository:

```
std-math/
├── knowledge.toml          # Package metadata
├── nodes/
│   ├── 0ax001.json        # Axiom of Choice
│   ├── t4k2p9.json        # Fundamental Theorem of Algebra
│   └── ...
├── dist/
│   ├── edges.toon         # Module edges
│   ├── manifest.json
│   └── graph.json
├── schemas/               # Standard schemas (same as main)
└── docs/
    └── README.md          # Module documentation
```

---

## Namespaced IDs

### Problem

6-character IDs (`k7x9m2`) risk collisions when merging multiple modules.

### Solution: Namespace Prefixes

**Internal IDs (within a module):** `k7x9m2` (6-char, no prefix)

**External References (cross-module):**
- Format: `@{namespace}/{id}`
- Example: `@std-math/t4k2p9` references Fundamental Theorem of Algebra in std-math module

**Default Namespace:**
- `@local/` for user's own nodes (implicit, can be omitted in local context)

### Resolution Algorithm

**Build-time Resolution (Python script):**

```python
def resolve_namespaces(graph, dependencies):
    """
    Resolve @namespace/id references to absolute IDs.
    Assign global integer IDs for GPU buffers.
    """
    id_map = {}
    global_counter = 0

    for module_name, module_path in dependencies.items():
        # Load module manifest
        manifest = load_manifest(f"{module_path}/dist/manifest.json")

        for node_id in manifest['nodes']:
            # Map namespaced ID to global integer
            namespaced_id = f"@{module_name}/{node_id}"
            id_map[namespaced_id] = global_counter
            global_counter += 1

    # Process edges, resolve cross-module references
    for edge in graph.edges:
        if edge['f'].startswith('@'):
            edge['f_global'] = id_map[edge['f']]
        if edge['t'].startswith('@'):
            edge['t_global'] = id_map[edge['t']]

    return id_map
```

**GPU Upload:**
- Namespaced IDs resolved to sequential integers (0, 1, 2, ...)
- GPU buffers use integer indices
- String IDs only in metadata/debugging

### Collision Detection

```python
def check_namespace_collisions(modules):
    """Error if two modules define same namespaced ID."""
    seen = set()
    for module_name, nodes in modules.items():
        for node_id in nodes:
            full_id = f"@{module_name}/{node_id}"
            if full_id in seen:
                raise ValueError(f"Namespace collision: {full_id} defined in multiple modules")
            seen.add(full_id)
```

---

## Public vs. Private Nodes

### Problem

When Module A depends on Module B, importing ALL nodes from B pollutes A's namespace.

### Solution: Visibility Field

**Schema Addition (already implemented):**
```json
{
  "id": "lemma1",
  "type": "lemma",
  "visibility": "private",
  ...
}
```

**Values:**
- `public`: Exposed to consumers (major theorems, definitions, principles)
- `private`: Internal to module (intermediate lemmas, proof steps)

**Default:** `public` (safe default for backward compatibility)

### Export Manifest

Each module generates a public interface:

```json
// dist/exports.json
{
  "public_nodes": ["0ax001", "t4k2p9", "d5k7n8"],
  "entry_points": ["0ax001"],  // Recommended starting nodes
  "interfaces": {
    "zfc_axioms": ["0ax001", "0ax002", "..."],
    "complex_analysis": ["t4k2p9", "..."]
  }
}
```

### Module Importing

**Selective Import:**
```toml
[dependencies.std-math]
git = "https://github.com/truth-mines/std-math"
# Only import public nodes
public_only = true
# Or specify interfaces
interfaces = ["zfc_axioms", "algebra"]
```

**Full Import (for exploration):**
```toml
[dependencies.std-math]
git = "https://github.com/truth-mines/std-math"
public_only = false  # Import everything, including intermediate proofs
```

---

## Dependency Resolution

### Build Process

```python
# scripts/build_federated.py

1. Parse knowledge.toml
2. Clone/fetch all dependencies (Git repos)
3. Load each module's dist/manifest.json
4. Resolve @namespace/id references in edges
5. Filter to public_only if specified
6. Detect circular dependencies (Error: A depends on B, B depends on A)
7. Merge all nodes/edges into unified dist/graph.json
8. Assign global integer IDs for GPU
9. Generate unified dist/edges.toon (preserves namespaces in metadata)
```

### Circular Dependency Handling

**Error on Cycles:**
```
Error: Circular dependency detected:
  my-personal-truth -> std-math -> std-logic -> my-personal-truth
```

**Exception:** Allow cycles if explicitly marked:
```toml
[dependencies.my-extensions]
path = "../extensions"
allow_cycle = true  # For experimental cross-references
```

---

## Versioning & Updates

### Semantic Versioning

Modules use semver:
- **Major:** Breaking changes (node removed, relation semantics changed)
- **Minor:** New nodes/edges added (backward compatible)
- **Patch:** Metadata updates, typo fixes

### Update Strategy

```bash
# Update a specific dependency
truth-mines update std-math

# Update all dependencies
truth-mines update --all

# Show outdated dependencies
truth-mines outdated
```

### Version Conflicts

```toml
[dependencies]
std-math = { version = "1.2" }
std-physics = { version = "0.5" }

# If std-physics requires std-math = "1.0", conflict occurs
# Resolution: Upgrade std-physics or downgrade std-math
```

---

## Implementation Checklist (When Ready)

**Trigger Conditions:**
1. Main graph reaches 500+ nodes (unwieldy to manage as monolith)
2. User wants to share a subgraph (e.g., "my philosophy of QM")
3. Community interest in standard libraries

**Phase 1: Namespace Support (DONE)**
- ✅ Add `namespace` field to node schema
- ✅ Parser for `@namespace/id` format (planned)
- ⏸️ Collision detection tests

**Phase 2: Visibility & Exports**
- Add `visibility` field to node schema (public/private)
- Generate `dist/exports.json` during build
- Implement public-only filtering

**Phase 3: knowledge.toml**
- Define manifest schema
- Implement dependency resolution
- Git integration (clone, fetch, checkout)

**Phase 4: Build System**
- `scripts/build_federated.py` (multi-module build)
- Namespace resolution algorithm
- Global integer ID assignment

**Phase 5: CLI Commands**
- `truth-mines update`
- `truth-mines outdated`
- `truth-mines publish` (for sharing modules)

**Phase 6: Community Infrastructure**
- Create `truth-mines/std-math` repository
- Create `truth-mines/std-physics` repository
- Create `truth-mines/std-philosophy` repository
- Package registry (optional, could just use Git)

---

## Module Best Practices

### Creating a Module

**1. Focus:** One coherent domain (e.g., "Complex Analysis", "Modal Logic", "QM Interpretations")

**2. Entry Points:** Mark 3-5 key nodes as entry points

**3. Public Interface:** Expose major results, hide intermediate proofs

**4. Documentation:** Include README.md with:
   - Module purpose
   - Key nodes
   - Recommended paths
   - Dependencies

**5. Stability:** Use semver, minimize breaking changes

### Consuming a Module

**1. Review Exports:** Check `dist/exports.json` for public nodes

**2. Selective Import:** Use `interfaces` to avoid namespace pollution

**3. Version Pinning:** Pin to specific tag/commit for reproducibility

**4. Trust:** Only import modules from trusted sources (review nodes before importing)

---

## Alternative Designs Considered

### Design 1: Subgraph Files (Rejected)

Store subgraphs as `.toon` files, import via file path.
- **Problem:** No versioning, no dependency management, manual updates

### Design 2: Monolithic with Tags (Current, OK for <500 nodes)

Use tags to categorize nodes, no actual modules.
- **Pros:** Simple, no federation complexity
- **Cons:** Doesn't scale to 10k+ nodes

### Design 3: Database Backend (Rejected)

Use Postgres/SQLite with schemas.
- **Pros:** Better for huge graphs (100k+ nodes)
- **Cons:** Loses Git-native benefits (history, diff, merge)

**Selected:** Knowledge Crate System (Design 2 → Design 3 transition)

---

## Security & Trust Model

### Trust Assumptions

**Importing a module = trusting its contents.**

Malicious module could:
1. Add false claims (e.g., "Euclid proved P=NP")
2. Attack foundational nodes (e.g., "Modus Ponens is invalid")
3. Create circular reasoning

### Mitigations

**1. Review Before Import:**
```bash
truth-mines review std-math --diff
# Shows all nodes/edges that would be added
```

**2. Sandboxing (Future):**
- Load module in "preview" mode
- Flag conflicting edges
- Require explicit approval for attacks on existing nodes

**3. Provenance Tracking:**
- Each node tagged with `source_module: "std-math"`
- Easy to filter/remove if module turns out to be bad

**4. Community Reputation:**
- Trusted modules: Official `truth-mines/*` org
- Community modules: Review star count, contributors
- Personal modules: Full trust required

---

## Migration Path (When Implementing)

**Zero Disruption:**
1. Existing graphs continue to work (no namespace = `@local/`)
2. `knowledge.toml` is optional (no dependencies = standalone mode)
3. Build system falls back to current behavior if no `knowledge.toml` exists

**Gradual Adoption:**
1. Add namespace field to new nodes (old nodes default to `@local/`)
2. Extract a subgraph (e.g., all logic nodes) into a module
3. Import as dependency: `my-logic = { path = "./modules/logic" }`
4. Iterate: Extract more modules as graph grows

---

## Performance Considerations

### Build Time

- **Local-only:** <1s for 500 nodes (current)
- **5 modules × 200 nodes:** ~2-3s (acceptable)
- **50 modules × 10k total:** ~10-15s (optimization needed)

**Optimizations:**
- Incremental builds (only rebuild changed modules)
- Parallel dependency resolution
- Cache resolved namespaces

### Runtime

- **GPU Upload:** Unified buffer (all modules merged)
- **Rendering:** No difference (modules resolved at build time)
- **Queries:** Namespace-aware filtering

---

## Community Standards (Future)

### Standard Library Modules

**std-math:**
- ZFC axioms
- Basic arithmetic, algebra, analysis
- Major theorems (Fundamental Theorem of Algebra, Cantor's Theorem, etc.)
- ~200-300 core nodes

**std-physics:**
- Newtonian mechanics, SR, GR, QM, QED
- Major observations (double-slit, lensing, perihelion, etc.)
- EFT hierarchy
- ~150-200 core nodes

**std-philosophy:**
- Epistemology (JTB, Gettier, safety, virtue)
- Logic primitives (Modus Ponens, LNC, LEM, etc.)
- Major philosophical positions
- ~100-150 core nodes

### Module Registry (Future)

**Option 1:** GitHub-based (simple, uses existing infra)
- Modules published as GitHub repos
- Discovery via `truth-mines/awesome-modules` list

**Option 2:** Centralized Registry (complex, better UX)
- `truth-mines.org/registry`
- `truth-mines install quantum-interpretations`
- Versioning, search, ratings

**MVP:** Stick with GitHub, consider registry if community grows.

---

## FAQ

### Q: Do I need modules for my 30-node graph?
**A:** No. Modules are for graphs >500 nodes or collaborative work.

### Q: Can I fork a module and modify it?
**A:** Yes! Fork the Git repo, make changes, import from your fork.

### Q: What if two modules define conflicting nodes?
**A:** Namespaces prevent ID collisions. Semantic conflicts (e.g., both claim "Riemann Hypothesis is proven") are flagged as attacks, not errors.

### Q: How do I contribute to std-math?
**A:** (Future) Submit PR to `truth-mines/std-math` repo. Maintainers review for correctness.

### Q: Can I have private dependencies (not public)?
**A:** Yes! Use `path = "../private-research"` instead of `git =` URL.

---

## Implementation Priority

**Priority 1 (MVP):** None - deferred until graph size justifies it

**Priority 2 (When Ready):**
1. Namespace parser (`@namespace/id`)
2. Basic `knowledge.toml` support
3. Build script for multi-module graphs
4. Public/private visibility

**Priority 3 (Community):**
1. std-math, std-physics, std-philosophy modules
2. CLI commands (update, outdated, publish)
3. Documentation and best practices

**Priority 4 (Scale):**
1. Incremental builds
2. Module registry
3. Dependency conflict resolution UI

---

## Current Status

**Implemented:**
- ✅ `namespace` field in node schema (optional, zero-cost if unused)
- ✅ Documentation (this file)

**Next Steps (When Triggered):**
1. Implement namespace parser in `engine/src/graph/namespace.rs`
2. Add namespace resolution to build pipeline
3. Create sample module (e.g., extract logic nodes into `my-logic` module)
4. Test cross-module references
5. Document module creation workflow

**Estimated Effort (When Needed):** 20-30 hours
- Namespace parser: 3-4h
- Build system: 8-10h
- Visibility filtering: 3-4h
- CLI commands: 5-6h
- Standard library setup: 4-6h
- Documentation: 2-3h

---

## Conclusion

The federation system is **architecturally prepared** (namespace field exists) but **not yet implemented** (no build tooling exists).

**Gemini's Recommendation:** "Implement the Namespace concept now (even if you don't use it yet) to prevent ID collisions later." ✅ DONE

**Next Milestone:** Extract first module when graph reaches 500 nodes or when collaboration begins.

This design enables Truth Mines to scale from a personal tool to a collaborative knowledge ecosystem without breaking existing workflows.

---

*Roadmap created: 2025-11-18*
*Status: FUTURE (revisit when graph >500 nodes)*
