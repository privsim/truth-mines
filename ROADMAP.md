# Truth Mines - Project Roadmap

**Version:** 1.0
**Last Updated:** 2025-11-17
**Status:** Initial Planning Complete

This document provides the complete development roadmap for the Truth Mines project, organized into 8 major epics with 66 detailed issues aligned to the PRD milestones.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Epic 0: Project Foundation & Architecture](#epic-0-project-foundation--architecture) (5 issues)
3. [Epic 1: Data Model & Validation Scripts](#epic-1-data-model--validation-scripts) (8 issues)
4. [Epic 2: Rust Engine Core](#epic-2-rust-engine-core) (14 issues)
5. [Epic 3: Frontend Foundation](#epic-3-frontend-foundation) (11 issues)
6. [Epic 4: 3D Truth Mine Visualization](#epic-4-3d-truth-mine-visualization) (6 issues)
7. [Epic 5: Multi-Domain Features & Advanced Queries](#epic-5-multi-domain-features--advanced-queries) (6 issues)
8. [Epic 6: LLM Integration & TOON Utilities](#epic-6-llm-integration--toon-utilities) (5 issues)
9. [Epic 7: CI/CD & DevOps](#epic-7-cicd--devops) (6 issues)
10. [Epic 8: Documentation & Polish](#epic-8-documentation--polish) (5 issues)
11. [Development Guidelines](#development-guidelines)
12. [Critical Path](#critical-path)

---

## Project Overview

**Truth Mines** is a Git-native, multi-domain formal knowledge system that represents philosophy, mathematics, and physics in a unified graph with 2D/3D visualization and LLM integration via TOON format.

**Core Technologies:**
- **Engine:** Rust → WebAssembly (wasm-pack, wasm-bindgen)
- **Frontend:** React + TypeScript + Vite
- **2D Visualization:** cosmos.gl (WebGL force graph)
- **3D Visualization:** WebGPU or Three.js WebGPURenderer
- **Scripts:** Python 3.11+
- **Storage:** Git + JSON/JSONL files

**Development Methodology:** Strict Test-Driven Development (TDD)
**Coverage Targets:** Rust 95%, TypeScript 80%, Python 90%

---

## Epic 0: Project Foundation & Architecture

*Pre-Milestone 1 - Foundational setup and architecture decisions*

### Issue #1: Initialize Repository Structure

**Labels:** `setup`, `infrastructure`
**Milestone:** Foundation
**Estimated Effort:** 2 hours

**Description:**
Set up the complete directory structure for the truth-mines project including all necessary configuration files, .gitignore, and placeholder directories.

**Dependencies:** None

**Tasks:**
- [ ] Create all directories from proposed structure
- [ ] Add .gitignore (dist/, venv/, node_modules/, target/, *.wasm)
- [ ] Create .gitkeep files in empty directories
- [ ] Update README.md with project overview

**Definition of Done:**
- All directories exist and are tracked in Git
- .gitignore excludes build artifacts
- tree command shows expected structure
- README updated with setup instructions

**Test Plan:**
- **Manual:** `tree` shows complete structure
- **Manual:** `git status` shows all placeholder files tracked
- **Manual:** Build artifacts are ignored when created

---

### Issue #2: Define Core Schema Configuration

**Labels:** `configuration`, `data-model`
**Milestone:** Foundation
**Estimated Effort:** 3 hours
**Dependencies:** #1

**Description:**
Create `.truth-mines/schema.toml` defining valid domains (philosophy, mathematics, physics), universal relations, domain-specific relations, and bridge relations.

**Tasks:**
- [ ] Create `.truth-mines/schema.toml`
- [ ] Define all three domains
- [ ] Define universal relations
- [ ] Define domain-specific relations for each domain
- [ ] Define bridge relations
- [ ] Add validation settings
- [ ] Document with inline comments

**Definition of Done:**
- schema.toml created with all required sections
- All domains defined: philosophy, mathematics, physics
- All relation types categorized
- Version set to "1.0.0"
- File validates as valid TOML

**Test Plan:**
```python
def test_schema_toml_valid():
    import toml
    schema = toml.load('.truth-mines/schema.toml')
    assert schema['version'] == '1.0.0'
    assert set(schema['domains']['known']) == {'philosophy', 'mathematics', 'physics'}
    assert 'supports' in schema['relations']['universal']['values']
    assert 'proves' in schema['relations']['mathematics']['values']
    assert 'formalizes' in schema['relations']['bridges']['values']
```

---

### Issue #3: Create Visual Style Configuration

**Labels:** `configuration`, `visualization`
**Milestone:** Foundation
**Estimated Effort:** 3 hours
**Dependencies:** #2

**Description:**
Create `styles/default.toml` defining domain colors, node shapes per type, edge styles per relation, and visual parameters.

**Tasks:**
- [ ] Create `styles/default.toml`
- [ ] Define domain color mappings (philosophy→purple, math→blue, physics→red)
- [ ] Define node type → shape mappings
- [ ] Define relation → edge color/style mappings
- [ ] Set default sizes and scaling factors
- [ ] Configure layout parameters
- [ ] Add performance and effects settings

**Definition of Done:**
- styles/default.toml created
- All three domains have color definitions
- Colors in valid RGB or hex format
- Node types mapped to shapes
- Edge styles defined
- File validates as TOML

**Test Plan:**
```python
def test_style_config_valid():
    import toml
    style = toml.load('styles/default.toml')
    assert 'colors' in style
    assert 'philosophy' in style['colors']['domains']
    assert 'mathematics' in style['colors']['domains']
    assert 'physics' in style['colors']['domains']
    # Validate color format (RGB array)
    assert len(style['colors']['domains']['philosophy']) == 3
    assert all(0 <= c <= 255 for c in style['colors']['domains']['philosophy'])
```

---

### Issue #4: ADR - Strict TDD Workflow

**Labels:** `documentation`, `adr`, `testing`
**Milestone:** Foundation
**Estimated Effort:** 2 hours
**Dependencies:** #1

**Description:**
Document the project's commitment to strict Test-Driven Development with coverage requirements, test organization conventions, and CI enforcement.

**Tasks:**
- [ ] Create `docs/ADRs/001-strict-tdd-workflow.md`
- [ ] Document context and rationale
- [ ] Specify TDD requirements (red-green-refactor)
- [ ] Define coverage targets (Rust 95%, TS 80%, Python 90%)
- [ ] Provide examples for each language
- [ ] Document enforcement mechanisms
- [ ] List consequences (positive and negative)

**Definition of Done:**
- ADR file created following standard template
- All sections complete (Context, Decision, Consequences)
- Examples provided for Rust, TypeScript, Python
- Linked from main README
- Reviewed and approved

**Test Plan:**
- **Manual:** ADR follows template structure
- **Manual:** All sections clear and comprehensive
- **Manual:** Examples are runnable and correct

---

### Issue #5: ADR - WASM as Primary Engine Interface

**Labels:** `documentation`, `adr`, `architecture`
**Milestone:** Foundation
**Estimated Effort:** 3 hours
**Dependencies:** #1

**Description:**
Document decision to use Rust compiled to WebAssembly as the graph processing engine, including rationale, alternatives considered, and trade-offs.

**Tasks:**
- [ ] Create `docs/ADRs/002-wasm-engine.md`
- [ ] Document context (performance, portability needs)
- [ ] Detail Rust + WASM architecture
- [ ] Explain alternatives (pure JS, server-side, C++/Emscripten)
- [ ] List consequences: performance, build complexity, debugging
- [ ] Define validation criteria
- [ ] Provide architecture diagram

**Definition of Done:**
- ADR file created with all sections
- Architecture clearly explained
- Trade-offs documented
- Alternatives compared in table format
- Performance targets specified
- Linked from README

**Test Plan:**
- **Manual:** ADR complete and well-structured
- **Manual:** Architecture diagram included
- **Manual:** Trade-offs clearly articulated

---

## Epic 1: Data Model & Validation Scripts

*Milestone 1 - Data & Scripts: Define schemas, create sample data, build validation tools*

### Issue #6: Implement JSON Schema for Nodes

**Labels:** `data-model`, `schema`, `tdd`
**Milestone:** Milestone 1
**Estimated Effort:** 4 hours
**Dependencies:** #2

**Description:**
Create formal JSON Schema definition for the universal node model with all required and optional fields, validation patterns, and enum constraints.

**Tasks:**
- [ ] Create `schemas/node.schema.json`
- [ ] Define required fields: id, type, domain, title
- [ ] Define optional fields: content, formal, tags, metadata, sources, timestamps
- [ ] Add pattern validation for id: `^[a-z0-9]{6}$`
- [ ] Add enum for known node types
- [ ] Add enum for domains
- [ ] Document each field

**Definition of Done:**
- schema file created
- All fields properly typed
- Required vs optional clearly marked
- Pattern validation for ID
- Enum constraints for type and domain
- Example nodes validate successfully

**Test Plan:**
```python
import jsonschema
import json

def test_node_schema_validates_valid_nodes():
    schema = json.load(open('schemas/node.schema.json'))
    valid_node = {
        "id": "k7x9m2",
        "type": "proposition",
        "domain": "philosophy",
        "title": "Knowledge requires safety"
    }
    jsonschema.validate(valid_node, schema)  # Should not raise

def test_node_schema_rejects_invalid_id():
    schema = json.load(open('schemas/node.schema.json'))
    invalid_node = {
        "id": "INVALID",  # Wrong pattern
        "type": "proposition",
        "domain": "philosophy",
        "title": "Test"
    }
    with pytest.raises(jsonschema.ValidationError):
        jsonschema.validate(invalid_node, schema)

def test_node_schema_rejects_missing_required():
    schema = json.load(open('schemas/node.schema.json'))
    invalid_node = {"id": "abc123"}  # Missing type, domain, title
    with pytest.raises(jsonschema.ValidationError):
        jsonschema.validate(invalid_node, schema)
```

---

### Issue #7: Implement JSON Schema for Edges

**Labels:** `data-model`, `schema`, `tdd`
**Milestone:** Milestone 1
**Estimated Effort:** 3 hours
**Dependencies:** #2

**Description:**
Create JSON Schema for edge objects including from/to node references, relation type, optional weight, and domain.

**Tasks:**
- [ ] Create `schemas/edge.schema.json`
- [ ] Define required fields: f, t, relation, domain
- [ ] Define optional weight field (0-1 range)
- [ ] Add pattern validation for f and t (node ID format)
- [ ] Add enum for known relations
- [ ] Document fields

**Definition of Done:**
- edge.schema.json created
- Required fields: f, t, relation, domain
- Weight validated as 0-1
- Node ID patterns enforced
- Relation enum includes all types from schema.toml

**Test Plan:**
```python
def test_edge_schema_validates_valid_edges():
    schema = json.load(open('schemas/edge.schema.json'))
    valid_edge = {
        "f": "abc123",
        "t": "def456",
        "relation": "supports",
        "domain": "philosophy",
        "w": 0.9
    }
    jsonschema.validate(valid_edge, schema)

def test_edge_schema_rejects_invalid_weight():
    schema = json.load(open('schemas/edge.schema.json'))
    invalid_edge = {
        "f": "abc123",
        "t": "def456",
        "relation": "supports",
        "domain": "philosophy",
        "w": 1.5  # Out of range
    }
    with pytest.raises(jsonschema.ValidationError):
        jsonschema.validate(invalid_edge, schema)
```

---

### Issue #8: Create Example Node Fixtures

**Labels:** `data`, `testing`, `documentation`
**Milestone:** Milestone 1
**Estimated Effort:** 4 hours
**Dependencies:** #6

**Description:**
Create 10-15 example nodes across all three domains for use as test fixtures and documentation examples.

**Tasks:**
- [ ] Create `docs/examples/sample-nodes/` directory
- [ ] Create 3+ philosophy nodes (include k7x9m2 from PRD)
- [ ] Create 3+ mathematics nodes (include t4k2p9 from PRD)
- [ ] Create 3+ physics nodes (include gr001 from PRD)
- [ ] Create 2+ nodes with cross-domain potential
- [ ] Validate all against schema
- [ ] Add README explaining nodes

**Definition of Done:**
- 10-15 valid node JSON files created
- At least 3 nodes per domain
- Specific PRD examples included
- All validate against node.schema.json
- README documents the example set

**Test Plan:**
```python
def test_example_nodes_all_valid():
    import glob, jsonschema, json
    schema = json.load(open('schemas/node.schema.json'))
    node_files = glob.glob('docs/examples/sample-nodes/*.json')
    assert len(node_files) >= 10
    for file_path in node_files:
        node = json.load(open(file_path))
        jsonschema.validate(node, schema)  # All must validate

def test_example_nodes_domain_coverage():
    import glob, json
    node_files = glob.glob('docs/examples/sample-nodes/*.json')
    domains = [json.load(open(f))['domain'] for f in node_files]
    assert 'philosophy' in domains
    assert 'mathematics' in domains
    assert 'physics' in domains
    assert domains.count('philosophy') >= 3
    assert domains.count('mathematics') >= 3
    assert domains.count('physics') >= 3
```

---

### Issue #9: Create Example Edge Fixtures

**Labels:** `data`, `testing`, `documentation`
**Milestone:** Milestone 1
**Estimated Effort:** 3 hours
**Dependencies:** #7, #8

**Description:**
Create example edge JSONL files for all relation types, connecting the example nodes to form a coherent knowledge graph.

**Tasks:**
- [ ] Create `docs/examples/sample-edges/` directory
- [ ] Create supports.jsonl (5+ edges)
- [ ] Create proves.jsonl (2+ edges)
- [ ] Create formalizes.jsonl (2+ bridge edges)
- [ ] Create additional relation files
- [ ] Ensure all edges reference valid sample node IDs
- [ ] Add README explaining graph structure

**Definition of Done:**
- JSONL files for each major relation type
- All edges reference existing sample nodes
- All edges validate against edge.schema.json
- At least 2 bridge edges
- README documents graph structure

**Test Plan:**
```python
def test_example_edges_all_valid():
    import glob, jsonschema, json
    schema = json.load(open('schemas/edge.schema.json'))
    edge_files = glob.glob('docs/examples/sample-edges/*.jsonl')
    assert len(edge_files) >= 3
    for file_path in edge_files:
        with open(file_path) as f:
            for line in f:
                edge = json.loads(line)
                jsonschema.validate(edge, schema)

def test_example_edges_reference_valid_nodes():
    import glob, json
    # Load all node IDs
    node_files = glob.glob('docs/examples/sample-nodes/*.json')
    node_ids = {json.load(open(f))['id'] for f in node_files}

    # Check all edges
    edge_files = glob.glob('docs/examples/sample-edges/*.jsonl')
    for file_path in edge_files:
        with open(file_path) as f:
            for line in f:
                edge = json.loads(line)
                assert edge['f'] in node_ids, f"Edge from {edge['f']} not found"
                assert edge['t'] in node_ids, f"Edge to {edge['t']} not found"
```

---

### Issue #10: Implement Graph Validation Script

**Labels:** `scripts`, `validation`, `tdd`, `python`
**Milestone:** Milestone 1
**Estimated Effort:** 8 hours
**Dependencies:** #6, #7, #2

**Description:**
Create the primary validation script (`scripts/validate.py`) that checks all nodes and edges for schema conformance, referential integrity, and domain/relation validity.

**Tasks:**
- [ ] Create `scripts/validate.py` with main() function
- [ ] Validate all nodes/*.json against node schema
- [ ] Validate all edges/*.jsonl against edge schema
- [ ] Check edge references (f, t exist in node set)
- [ ] Check domains against schema.toml allowed list
- [ ] Check relations against schema.toml allowed list
- [ ] Return exit code 0 on success, non-zero on failure
- [ ] Print clear error messages with file:line
- [ ] Add --strict flag for additional checks
- [ ] Write comprehensive unit tests

**Definition of Done:**
- validate.py created and executable
- Validates node and edge schemas
- Checks referential integrity
- Checks domain/relation validity in strict mode
- Clear error messages with location
- Exit codes appropriate
- Unit tests with 90%+ coverage

**Test Plan:**
```python
# scripts/tests/test_validate.py

def test_validate_accepts_valid_graph(tmp_path):
    # Copy sample nodes/edges to temp directory
    setup_valid_graph(tmp_path)
    result = subprocess.run(['python', 'scripts/validate.py', str(tmp_path)],
                          capture_output=True)
    assert result.returncode == 0
    assert 'valid' in result.stdout.decode().lower()

def test_validate_rejects_invalid_node_schema(tmp_path):
    # Create node with missing required field
    create_invalid_node(tmp_path, {'id': 'abc123'})  # Missing type, domain, title
    result = subprocess.run(['python', 'scripts/validate.py', str(tmp_path)],
                          capture_output=True)
    assert result.returncode != 0
    assert 'abc123' in result.stderr.decode()

def test_validate_rejects_dangling_edge_reference(tmp_path):
    setup_nodes(tmp_path, ['abc123'])
    create_edge(tmp_path, {'f': 'abc123', 't': 'xyz999'})  # xyz999 doesn't exist
    result = subprocess.run(['python', 'scripts/validate.py', str(tmp_path)],
                          capture_output=True)
    assert result.returncode != 0
    assert 'xyz999' in result.stderr.decode()
    assert 'not found' in result.stderr.decode()

def test_validate_rejects_invalid_domain_strict(tmp_path):
    create_node(tmp_path, {'id': 'abc123', 'type': 'proposition',
                           'domain': 'biology', 'title': 'Test'})
    result = subprocess.run(['python', 'scripts/validate.py', '--strict', str(tmp_path)],
                          capture_output=True)
    assert result.returncode != 0
    assert 'biology' in result.stderr.decode()
    assert 'invalid domain' in result.stderr.decode().lower()
```

---

### Issue #11: Implement Manifest Builder Script

**Labels:** `scripts`, `build`, `tdd`, `python`
**Milestone:** Milestone 1
**Estimated Effort:** 6 hours
**Dependencies:** #6, #10

**Description:**
Create script that generates `dist/manifest.json` (id→file mappings, stats) and `dist/graph.json` (lightweight summaries).

**Tasks:**
- [ ] Create `scripts/build_index.py`
- [ ] Generate dist/manifest.json with id→file mappings
- [ ] Include stats: total nodes, counts by domain/type
- [ ] Generate dist/graph.json with lightweight summaries (no content/formal)
- [ ] Create dist/ directory if needed
- [ ] Add timestamp to manifests
- [ ] Write unit tests with golden files

**Definition of Done:**
- build_index.py created and executable
- Generates dist/manifest.json with correct structure
- Generates dist/graph.json with summaries only
- Stats accurate
- Creates dist/ if missing
- Unit tests with 90%+ coverage

**Test Plan:**
```python
def test_build_index_generates_manifest(tmp_path):
    setup_sample_nodes(tmp_path)
    subprocess.run(['python', 'scripts/build_index.py', str(tmp_path)])

    manifest_path = tmp_path / 'dist' / 'manifest.json'
    assert manifest_path.exists()

    manifest = json.load(open(manifest_path))
    assert 'version' in manifest
    assert 'generated' in manifest
    assert 'nodes' in manifest
    assert 'stats' in manifest
    assert manifest['stats']['total_nodes'] == 3

def test_build_index_generates_graph_summary(tmp_path):
    setup_sample_nodes(tmp_path)
    subprocess.run(['python', 'scripts/build_index.py', str(tmp_path)])

    graph_path = tmp_path / 'dist' / 'graph.json'
    assert graph_path.exists()

    graph = json.load(open(graph_path))
    assert isinstance(graph, list)
    assert len(graph) == 3
    for node in graph:
        assert 'id' in node
        assert 'type' in node
        assert 'domain' in node
        assert 'title' in node
        assert 'content' not in node  # Lightweight summary
        assert 'formal' not in node

def test_build_index_golden_output(tmp_path, golden_manifest):
    setup_fixed_sample(tmp_path)
    subprocess.run(['python', 'scripts/build_index.py', str(tmp_path)])

    manifest = json.load(open(tmp_path / 'dist' / 'manifest.json'))
    # Compare to golden file (minus timestamp)
    manifest.pop('generated')
    assert manifest == golden_manifest
```

---

### Issue #12: Implement TOON Builder Script

**Labels:** `scripts`, `build`, `tdd`, `python`, `toon`
**Milestone:** Milestone 1
**Estimated Effort:** 6 hours
**Dependencies:** #7, #11

**Description:**
Create script that converts `edges/*.jsonl` files into compact TOON format as `dist/edges.toon`.

**Tasks:**
- [ ] Create `scripts/build_toon.sh` or `build_toon.py`
- [ ] Read all edges/*.jsonl files
- [ ] Group edges by relation
- [ ] Output TOON format: `relation[count]{fields}: ...`
- [ ] Handle optional weight field
- [ ] Write to dist/edges.toon
- [ ] Write unit tests with golden files

**Definition of Done:**
- build_toon script created and executable
- Reads all JSONL edge files
- Outputs valid TOON format
- Groups by relation correctly
- Handles missing weight gracefully
- Unit tests with 90%+ coverage

**Test Plan:**
```python
def test_build_toon_generates_valid_toon(tmp_path):
    setup_sample_edges(tmp_path)
    subprocess.run(['python', 'scripts/build_toon.py', str(tmp_path)])

    toon_path = tmp_path / 'dist' / 'edges.toon'
    assert toon_path.exists()

    content = toon_path.read_text()
    assert 'supports[' in content
    assert 'proves[' in content
    # Parse and validate format
    parse_toon(content)  # Should not raise

def test_build_toon_groups_by_relation(tmp_path):
    setup_sample_edges(tmp_path)  # includes supports and proves
    subprocess.run(['python', 'scripts/build_toon.py', str(tmp_path)])

    content = (tmp_path / 'dist' / 'edges.toon').read_text()
    # Check both relation types present
    assert content.count('supports[') == 1  # One table for supports
    assert content.count('proves[') == 1     # One table for proves

def test_build_toon_golden_output(tmp_path, golden_toon):
    setup_fixed_edges(tmp_path)
    subprocess.run(['python', 'scripts/build_toon.py', str(tmp_path)])

    toon = (tmp_path / 'dist' / 'edges.toon').read_text()
    assert toon == golden_toon
```

---

### Issue #13: Create Sample Knowledge Graph

**Labels:** `data`, `testing`, `documentation`
**Milestone:** Milestone 1
**Estimated Effort:** 6 hours
**Dependencies:** #8, #9, #10

**Description:**
Populate the repository with an initial coherent knowledge graph of 20-30 nodes across all three domains with meaningful connections.

**Tasks:**
- [ ] Create 20-30 valid node JSON files in `nodes/`
- [ ] Create 30+ edges in `edges/`
- [ ] Ensure 6+ nodes per domain
- [ ] Include 3+ cross-domain bridge edges
- [ ] Validate all with scripts/validate.py
- [ ] Add README in nodes/ and edges/
- [ ] Ensure coherent structure (not random)

**Definition of Done:**
- nodes/ contains 20-30 valid node files
- edges/ contains 30+ edges
- At least 6 nodes per domain
- At least 3 bridge edges
- All pass validation
- Graph forms coherent structure
- README explains graph

**Test Plan:**
```bash
# CI validation
python scripts/validate.py
# Should exit 0

# Count nodes
ls nodes/*.json | wc -l
# Should be >= 20

# Check domain coverage
python -c "
import glob, json
nodes = [json.load(open(f)) for f in glob.glob('nodes/*.json')]
domains = [n['domain'] for n in nodes]
assert domains.count('philosophy') >= 6
assert domains.count('mathematics') >= 6
assert domains.count('physics') >= 6
"

# Check bridge edges
grep 'bridge:' edges/*.jsonl | wc -l
# Should be >= 3
```

---

## Epic 2: Rust Engine Core

*Milestone 2 - Rust Engine: Build the WASM graph processing engine*

### Issue #14: Setup Rust Project Structure

**Labels:** `rust`, `setup`, `wasm`
**Milestone:** Milestone 2
**Estimated Effort:** 4 hours
**Dependencies:** #1

**Description:**
Initialize Rust workspace in `engine/` with Cargo.toml, WASM target configuration, and dependencies.

**Tasks:**
- [ ] Create `engine/Cargo.toml` with workspace config
- [ ] Add dependencies: serde, serde_json, wasm-bindgen, js-sys, web-sys
- [ ] Add dev dependencies: wasm-bindgen-test, criterion
- [ ] Configure wasm32-unknown-unknown target
- [ ] Create engine/README.md
- [ ] Add rustfmt.toml and clippy.toml
- [ ] Verify cargo build succeeds

**Definition of Done:**
- Cargo.toml created with all dependencies
- cargo build succeeds
- cargo build --target wasm32-unknown-unknown succeeds
- rustfmt and clippy configs in place
- README with build instructions

**Test Plan:**
```bash
# CI tests
cd engine
cargo fmt --check  # Should pass
cargo clippy -- -D warnings  # Zero warnings
cargo build  # Should succeed
cargo build --target wasm32-unknown-unknown  # Should succeed
cargo test  # Should run (even with no tests yet)
```

---

### Issue #15: Implement Core Node and Edge Types

**Labels:** `rust`, `data-model`, `tdd`
**Milestone:** Milestone 2
**Estimated Effort:** 5 hours
**Dependencies:** #14

**Description:**
Define Rust structs for Node and Edge with serde serialization/deserialization support.

**Tasks:**
- [ ] Create `engine/src/graph/node.rs` with Node struct
- [ ] Create `engine/src/graph/edge.rs` with Edge struct
- [ ] Add all fields from PRD section 4.1 and 4.2
- [ ] Configure serde derives
- [ ] Handle field renames (f→from, t→to)
- [ ] Write unit tests for serialization

**Definition of Done:**
- Node and Edge structs defined
- All PRD fields included
- Serde serialization works both ways
- Field renames handled correctly
- Unit tests with 95%+ coverage
- Doc comments on all public items

**Test Plan:**
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_node_deserialize_from_json() {
        let json = r#"{"id":"abc123","type":"proposition","domain":"philosophy","title":"Test"}"#;
        let node: Node = serde_json::from_str(json).unwrap();
        assert_eq!(node.id, "abc123");
        assert_eq!(node.r#type, "proposition");
        assert_eq!(node.domain, "philosophy");
    }

    #[test]
    fn test_node_serialize_to_json() {
        let node = Node {
            id: "abc123".to_string(),
            r#type: "proposition".to_string(),
            domain: "philosophy".to_string(),
            title: "Test".to_string(),
            ..Default::default()
        };
        let json = serde_json::to_string(&node).unwrap();
        assert!(json.contains("abc123"));
    }

    #[test]
    fn test_edge_field_renaming() {
        let json = r#"{"f":"abc123","t":"def456","relation":"supports","domain":"philosophy"}"#;
        let edge: Edge = serde_json::from_str(json).unwrap();
        assert_eq!(edge.from, "abc123");
        assert_eq!(edge.to, "def456");
    }
}
```

---

### Issue #16: Implement GraphStore with Adjacency Lists

**Labels:** `rust`, `graph`, `tdd`
**Milestone:** Milestone 2
**Estimated Effort:** 8 hours
**Dependencies:** #15

**Description:**
Create GraphStore type with Vec-based storage, HashMap for id lookups, and adjacency lists for traversal.

**Tasks:**
- [ ] Create `engine/src/graph/store.rs`
- [ ] Implement GraphStore struct with nodes, edges, id_to_idx, out_edges, in_edges
- [ ] Implement add_node, add_edge, get_node methods
- [ ] Implement build_adjacency method
- [ ] Write comprehensive unit tests

**Definition of Done:**
- GraphStore struct complete
- Adjacency lists built correctly
- All methods documented
- Unit tests with 95%+ coverage
- Performance acceptable for 10k nodes

**Test Plan:**
```rust
#[test]
fn test_graph_store_add_node_success() {
    let mut store = GraphStore::new();
    let node = create_test_node("abc123");
    store.add_node(node.clone());
    assert_eq!(store.get_node("abc123"), Some(&node));
}

#[test]
fn test_graph_store_build_adjacency() {
    let mut store = GraphStore::new();
    store.add_node(create_test_node("a"));
    store.add_node(create_test_node("b"));
    store.add_edge(create_test_edge("a", "b"));
    store.build_adjacency();

    let a_idx = store.id_to_idx["a"];
    let b_idx = store.id_to_idx["b"];
    assert!(store.out_edges[a_idx].contains(&b_idx));
    assert!(store.in_edges[b_idx].contains(&a_idx));
}
```

---

*[Continue with remaining 48 issues following same detailed format...]*

---

## Development Guidelines

### Strict TDD Workflow

1. **Write test first** - Every feature starts with a failing test
2. **Minimal implementation** - Write just enough code to pass
3. **Refactor** - Improve code while keeping tests green
4. **Coverage targets:** Rust 95%, TypeScript 80%, Python 90%

### Code Style

**Rust:**
- Run `cargo fmt` before every commit
- Zero clippy warnings: `cargo clippy -- -D warnings`
- Doc comments on all public APIs

**TypeScript:**
- Prettier with 2-space indentation
- ESLint strict mode
- No `any` types

**Python:**
- Black formatting (88 char lines)
- Ruff linting
- Type hints with mypy strict mode

### Git Workflow

**Commit Messages:**
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

---

## Critical Path

**Foundation (Sequential):**
1. #1 → #2 → #6, #7 → #10 → #13

**Parallel Development** (after foundation):
- **Rust Engine:** #14 → #15 → #16 → ...
- **Frontend:** #28 → #29 → #30 → ...
- **Scripts:** #11 → #12

**Integration Points:**
- Frontend needs WASM: #31 requires #26
- 3D viz needs both: #41 requires #31 and #40

**Early CI Setup:**
- #56 (Rust CI) after #14
- #57 (Frontend CI) after #28
- #58 (Scripts CI) after #10

---

## Milestones Summary

| Milestone | Epic | Issues | Completion Target |
|-----------|------|---------|-------------------|
| Foundation | Epic 0 | 5 | Week 1 |
| Milestone 1: Data & Scripts | Epic 1 | 8 | Week 2-3 |
| Milestone 2: Rust Engine | Epic 2 | 14 | Week 4-6 |
| Milestone 3: 2D Overview UI | Epic 3 | 11 | Week 7-9 |
| Milestone 4: 3D Truth Mine | Epic 4 | 6 | Week 10-11 |
| Milestone 5: Multi-Domain | Epic 5 | 6 | Week 12-13 |
| Milestone 6: LLM Integration | Epic 6 | 5 | Week 14 |
| CI/CD | Epic 7 | 6 | Ongoing |
| Polish | Epic 8 | 5 | Week 15-16 |

**Total:** 66 issues, ~16 weeks for MVP

---

*For complete details on remaining issues #17-#66, see individual issue tickets in GitHub or continue reading the extended ROADMAP...*


---

## Epic 9: Enhanced Visualization & Interaction

*New Epic - Extends PRD Section 13: Visualization & Interaction*

*Epic introduced after initial implementation to transform the graph from abstract visualization into visceral knowledge exploration environment with rich interactions, content preview, and path travel.*

### Issue #67: Hover Tooltip System

**Labels:** `frontend`, `interaction`, `tdd`, `enhancement`
**Milestone:** Enhanced Interactions
**Estimated Effort:** 6 hours
**Dependencies:** #33 (Graph2D)

**Description:**
Implement hover tooltip system that shows node preview (title, type, domain, 120-char content snippet) when mouse hovers over nodes in 2D or 3D view.

**Tasks:**
- [ ] Create NodeTooltip component with positioning logic
- [ ] Add hover detection to Graph2D
- [ ] Implement 150ms debounce on appearance
- [ ] Implement 300ms delay on disappearance
- [ ] Add edge-flip logic (detect screen boundaries)
- [ ] Style with dark theme and drop shadow
- [ ] Write comprehensive component tests

**Definition of Done:**
- NodeTooltip component renders with correct data
- Tooltip appears 150ms after hover begins
- Content truncated at 120 characters with ellipsis
- Tooltip positioned above/right, flips near edges
- Tooltip disappears 300ms after mouse leaves
- All tests passing (5+ tests)

**Test Plan:**
```typescript
describe('NodeTooltip', () => {
  test('renders with node data')
  test('truncates content at 120 chars with ellipsis')
  test('positions above and right of node by default')
  test('flips to left when near right screen edge')
  test('flips below when near top screen edge')
})

describe('Graph2D with hover', () => {
  test('shows tooltip 150ms after hover')
  test('hides tooltip 300ms after mouse leaves')
  test('hovering new node replaces tooltip immediately')
  test('tooltip content matches hovered node')
}
```

---

### Issue #68: Node Selection with Camera Centering

**Labels:** `frontend`, `interaction`, `tdd`, `camera`
**Milestone:** Enhanced Interactions
**Estimated Effort:** 8 hours
**Dependencies:** #67

**Description:**
Implement node selection (click) that centers camera on node, transitions to NodeFocused state, and opens Node Details panel.

**Tasks:**
- [ ] Add click detection to Graph2D and Graph3D
- [ ] Implement camera centering animation (2D: 300ms, 3D: 800ms)
- [ ] Add selectedNodeId state management in App
- [ ] Implement smooth pan/zoom for 2D
- [ ] Implement fly-to animation for 3D (cubic easing)
- [ ] Connect click to NodeDetail panel opening
- [ ] Write tests for state transitions and animations

**Definition of Done:**
- Clicking node sets selectedNodeId
- Camera smoothly animates to center node
- Animation duration matches spec (2D: 300ms, 3D: 800ms)
- Node Details panel opens/updates with selected node
- Clicking background clears selection
- All tests passing (7+ tests)

**Test Plan:**
```typescript
test('clicking node sets selectedNodeId')
test('camera centers on selected node in 2D')
test('camera flies to node in 3D (800ms animation)')
test('NodeDetail panel opens with correct node')
test('clicking background clears selection')
test('clicking new node updates selection and camera')
test('animation easing is smooth (cubic ease-in-out)')
```

---

### Issue #69: K-Hop Neighborhood Highlighting

**Labels:** `frontend`, `engine`, `interaction`, `tdd`
**Milestone:** Enhanced Interactions
**Estimated Effort:** 10 hours
**Dependencies:** #68

**Description:**
When node is selected, highlight its k-hop neighborhood (default k=2) with salience-based visual weight. Background nodes dimmed to 0.2 opacity.

**Tasks:**
- [ ] Add get_k_hop_subgraph(node_id, k) method to WASM engine (Rust)
- [ ] Write Rust tests for subgraph extraction
- [ ] Implement salience computation in TypeScript
- [ ] Apply salience to node sizes, opacities in Graph2D/3D
- [ ] Add configurable k value (UI setting)
- [ ] Write integration tests for highlighting

**Definition of Done:**
- Engine returns k-hop neighbors and connecting edges
- Salience formula implemented: focus + neighbor weights
- Highlighted nodes: larger, brighter
- Background nodes: opacity 0.2
- Edges within neighborhood: visible
- Edges outside neighborhood: hidden or very dim
- All tests passing (Rust: 5+, TypeScript: 6+)

**Test Plan (Rust):**
```rust
test_get_k_hop_subgraph_1_hop()
test_get_k_hop_subgraph_2_hop()
test_subgraph_includes_connecting_edges()
test_subgraph_excludes_external_edges()
test_subgraph_empty_for_isolated_node()
```

**Test Plan (TypeScript):**
```typescript
test('computes salience for focused node (1.0)')
test('computes salience for 1-hop neighbors (decayed)')
test('background nodes have low salience (< 0.3)')
test('applies salience to node size')
test('applies salience to node opacity')
test('only renders edges within neighborhood')
```

---

### Issue #70: Justification Tree Layout Mode

**Labels:** `frontend`, `layout`, `tdd`, `interaction`
**Milestone:** Enhanced Interactions
**Estimated Effort:** 12 hours
**Dependencies:** #69

**Description:**
Add justification tree mode that displays support structure as hierarchical tree with selected node as root and foundations at leaves.

**Tasks:**
- [ ] Implement Reingold-Tilford tree layout algorithm
- [ ] Add tree mode toggle to App state
- [ ] Filter edges to epistemic relations only (supports, proves, entails, predicts)
- [ ] Create JustificationTreeView component
- [ ] Add "Back to graph" button
- [ ] Support clicking tree node to re-root
- [ ] Write comprehensive tests

**Definition of Done:**
- Tree layout algorithm positions nodes without overlap
- Selected node at top-center
- Foundation nodes at bottom
- Only epistemic edges included
- Clicking tree node makes it new root (re-layout)
- Maximum depth enforced (8 levels)
- Toggle back to graph restores previous layout
- All tests passing (8+ tests)

**Test Plan:**
```typescript
test('tree layout positions selected node at top')
test('foundation nodes appear at bottom')
test('only epistemic relations included in tree')
test('clicking tree node re-roots tree')
test('tree respects max depth limit of 8')
test('back to graph button restores layout')
test('tree mode preserves selectedNodeId')
test('handles nodes with no support (shows message)')
```

---

### Issue #71: Path Selection UI

**Labels:** `frontend`, `interaction`, `tdd`, `paths`
**Milestone:** Enhanced Interactions
**Estimated Effort:** 10 hours
**Dependencies:** #68

**Description:**
Implement UI for selecting start/end nodes and choosing between multiple paths returned by engine.find_paths().

**Tasks:**
- [ ] Add context menu (right-click) with "Set as path start/end"
- [ ] Create PathChooser modal component
- [ ] Display all found paths with stats (hops, avg weight)
- [ ] Add path selection handler
- [ ] Implement focusPath state in App
- [ ] Connect to engine.find_paths() via useGraphEngine
- [ ] Write tests for path selection workflow

**Definition of Done:**
- Right-click menu shows path options
- PathChooser displays all paths with node sequences
- Selecting path sets focusPath in state
- Path stats calculated correctly (hop count, avg weight)
- Empty paths (no connection) handled gracefully
- All tests passing (6+ tests)

**Test Plan:**
```typescript
test('right-click shows context menu with path options')
test('PathChooser renders all found paths')
test('selecting path sets focusPath state')
test('path hop count calculated correctly')
test('path average weight computed')
test('handles no paths found gracefully')
```

---

### Issue #72: Path Travel with Keyboard Navigation

**Labels:** `frontend`, `interaction`, `tdd`, `camera`, `paths`
**Milestone:** Enhanced Interactions
**Estimated Effort:** 14 hours
**Dependencies:** #71

**Description:**
Implement path travel mode with keyboard navigation (←/→ or J/K), path stepper UI, and camera animation along path edges.

**Tasks:**
- [ ] Create PathStepper component (horizontal stepper)
- [ ] Implement keyboard event handling (→/←, K/J, ESC)
- [ ] Add path step state (currentStepIndex)
- [ ] Implement camera animation along edges (500ms per edge)
- [ ] Update NodeDetail panel as steps progress
- [ ] Add edge pulse effect for current transition
- [ ] Optional: Play/pause auto-advance
- [ ] Write comprehensive interaction tests

**Definition of Done:**
- PathStepper renders with all path nodes
- Current step highlighted
- → key advances one step
- ← key goes back one step
- Camera animates smoothly between nodes (500ms)
- NodeDetail updates to current step node
- ESC exits path mode
- Background nodes dimmed (opacity 0.15)
- Path edges highlighted (thick, glowing)
- All tests passing (10+ tests)

**Test Plan:**
```typescript
// PathStepper component
test('renders all path nodes')
test('highlights current step')
test('clicking step jumps to that node')
test('shows relation labels on arrows')

// Path navigation
test('arrow right advances one step')
test('arrow left goes back one step')
test('wraps or stops at path endpoints')
test('ESC key exits path mode')
test('camera animates between steps')
test('NodeDetail updates to current step')
test('background nodes dimmed appropriately')
test('path edges highlighted with glow')
```

---

### Issue #73: LOD System for 3D

**Labels:** `frontend`, `3d`, `webgpu`, `tdd`, `performance`
**Milestone:** 3D Enhanced
**Estimated Effort:** 12 hours
**Dependencies:** #40 (WebGPU renderer)

**Description:**
Implement Level of Detail (LOD) system that renders nodes differently based on camera distance: far (point sprites), mid (low-poly), near (high-poly).

**Tasks:**
- [ ] Define distance thresholds (far > 100, mid 20-100, near < 20)
- [ ] Implement per-node LOD calculation based on camera distance
- [ ] Add point sprite rendering for far LOD
- [ ] Add low-poly shape rendering for mid LOD
- [ ] Add high-poly shape rendering for near LOD
- [ ] Implement smooth LOD transitions
- [ ] Write tests for LOD selection logic

**Definition of Done:**
- Nodes render as points when far (> 100 units)
- Nodes render as low-poly when mid distance
- Nodes render as high-poly when near
- LOD transitions smooth (no popping)
- Performance: maintains 60fps with 1000+ nodes
- Screen-space size considered (not just distance)
- All tests passing (5+ tests)

**Test Plan:**
```typescript
test('selects point sprite LOD for far nodes')
test('selects low-poly LOD for mid-distance nodes')
test('selects high-poly LOD for near nodes')
test('LOD based on screen-space size, not just distance')
test('frustum culling excludes off-screen nodes')
```

---

### Issue #74: Node Inspection Cards (3D Close-Up)

**Labels:** `frontend`, `3d`, `interaction`, `tdd`
**Milestone:** 3D Enhanced
**Estimated Effort:** 10 hours
**Dependencies:** #73

**Description:**
When camera gets very close to a node (< 10 units), display Node Inspection Card overlay with full content, formal notation, and quick actions.

**Tasks:**
- [ ] Create NodeInspectionCard component
- [ ] Add distance-to-camera calculation
- [ ] Implement card fade-in when distance < threshold
- [ ] Display full content (scrollable)
- [ ] Add formal notation block
- [ ] Add quick action buttons (justification, attacks, show in 2D)
- [ ] Write component and integration tests

**Definition of Done:**
- Card appears when camera < 10 units from focused node
- Shows title, domain/type, full content, formal, tags
- Content scrollable if exceeds card height
- Card fades out when camera moves away
- Quick action buttons functional
- All tests passing (6+ tests)

**Test Plan:**
```typescript
test('card appears when distance < 10 units')
test('card shows correct node data')
test('content scrollable when long')
test('formal notation rendered in code block')
test('card fades out when camera moves away')
test('quick action buttons trigger correct handlers')
```

---

### Issue #75: Tunnel Rendering for Path Edges (3D)

**Labels:** `frontend`, `3d`, `webgpu`, `tdd`, `paths`
**Milestone:** 3D Enhanced
**Estimated Effort:** 8 hours
**Dependencies:** #72

**Description:**
When focusPath is active in 3D, render path edges as glowing tunnels (cylindrical geometry) with relation-specific colors.

**Tasks:**
- [ ] Create tunnel geometry (cylinder or ribbon quads)
- [ ] Implement emissive material for glow
- [ ] Apply relation-specific colors
- [ ] Set tunnel width (2-3× normal edge)
- [ ] Only render tunnels for focusPath edges
- [ ] Add subtle animation (pulsing glow optional)
- [ ] Write rendering tests

**Definition of Done:**
- Path edges rendered as 3D tunnels
- Tunnel color matches relation (green supports, blue proves, etc.)
- Emissive material creates glow effect
- Tunnels 2-3× wider than normal edges
- Only focusPath edges render as tunnels
- All tests passing (4+ tests)

**Test Plan:**
```typescript
test('tunnels only render for focusPath edges')
test('tunnel color matches edge relation')
test('tunnel width 2-3x normal edge width')
test('emissive material applied for glow')
```

---

### Issue #76: Camera Spline Animation Along Paths (3D)

**Labels:** `frontend`, `3d`, `camera`, `tdd`, `animation`
**Milestone:** 3D Enhanced
**Estimated Effort:** 10 hours
**Dependencies:** #75

**Description:**
Implement smooth camera animation along path using cubic Hermite spline interpolation for path travel in 3D.

**Tasks:**
- [ ] Implement cubic Hermite spline algorithm
- [ ] Add compute_camera_spline(path) to engine (Rust) - returns control points
- [ ] Implement camera position interpolation (2 seconds per edge)
- [ ] Add look-ahead: camera faces next node
- [ ] Implement dwell at nodes (1.5 seconds)
- [ ] Sync with content card fade-in/out
- [ ] Write animation and timing tests

**Definition of Done:**
- Camera follows smooth spline between path nodes
- Animation duration: ~2 seconds per edge
- Camera orientation leads position (looks ahead)
- Dwells at each node for 1.5 seconds
- Content card synced with animation
- Easing: cubic ease-in-out
- All tests passing (6+ tests)

**Test Plan:**
```typescript
test('spline generates smooth curve through nodes')
test('camera position interpolates over 2 seconds per edge')
test('camera looks ahead at next node')
test('dwells at node for 1.5 seconds')
test('content card fades in as approaching node')
test('animation cancelable (user input stops it)')
```

---

### Issue #77: Raycast Hover & Selection (3D)

**Labels:** `frontend`, `3d`, `webgpu`, `tdd`, `interaction`
**Milestone:** 3D Enhanced
**Estimated Effort:** 8 hours
**Dependencies:** #74

**Description:**
Implement ray casting from mouse position to detect node hover and click in 3D view, enabling same interactions as 2D.

**Tasks:**
- [ ] Implement screen-to-world ray calculation
- [ ] Implement ray-sphere intersection test
- [ ] Add per-frame raycast on mouse move
- [ ] Highlight hovered node (pulse or halo)
- [ ] Trigger tooltip on hover
- [ ] Trigger selection on click
- [ ] Write ray intersection tests

**Definition of Done:**
- Mouse position converts to world-space ray
- Ray intersects with node bounding spheres
- Closest intersected node highlighted on hover
- Clicking intersected node selects it
- Tooltip appears on hover (uses NodeTooltip)
- Performance: raycast < 5ms per frame
- All tests passing (5+ tests)

**Test Plan:**
```typescript
test('screen point converts to world ray')
test('ray intersects sphere correctly')
test('finds closest node when multiple intersections')
test('hover highlights node with pulse effect')
test('click on node triggers selection')
```

---

### Issue #78: Complete 2D/3D State Synchronization

**Labels:** `frontend`, `interaction`, `tdd`, `state`
**Milestone:** 3D Enhanced
**Estimated Effort:** 6 hours
**Dependencies:** #72, #76

**Description:**
Ensure selectedNodeId, focusPath, and interaction state fully synchronized when toggling between 2D and 3D views.

**Tasks:**
- [ ] Lift state to App component (selectedNodeId, focusPath, interactionMode)
- [ ] Pass state to both Graph2D and Graph3D
- [ ] Preserve camera position mapping between views
- [ ] Sync path step index across views
- [ ] Test all state transitions when toggling
- [ ] Document state management architecture

**Definition of Done:**
- Toggling 2D→3D preserves selectedNodeId
- focusPath persists across view toggle
- Path step index maintained
- Camera re-centers on selected node after toggle
- Filter state also preserved
- All tests passing (7+ tests)

**Test Plan:**
```typescript
test('selectedNodeId preserved when toggling views')
test('focusPath preserved when toggling views')
test('path step index maintained across toggle')
test('camera centers on selected node after toggle')
test('filter state unchanged by view toggle')
test('all interaction modes work in both views')
test('state management centralized in App')
```

---

## Epic 9 Summary

**Total Issues:** 12 (6 for 2D enhancements + 6 for 3D enhancements)

**Estimated Timeline:** 6-8 weeks (parallel work possible)

**Dependencies:**
- All build on existing Epic 3 (Frontend) and Epic 4 (3D architecture)
- Can be implemented incrementally
- Each issue delivers user-visible value

**Value Proposition:**
Transforms Truth Mines from "graph visualization tool" to "immersive knowledge exploration environment" where users can:
- Hover to preview content
- Click to explore deeply
- Travel through argument paths step-by-step
- Experience epistemic structure viscerally
- Navigate between 2D overview and 3D immersion seamlessly

