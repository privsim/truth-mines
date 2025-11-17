# Truth Mines Example Knowledge Graph

This directory contains a sample knowledge graph demonstrating the Truth Mines data model across philosophy, mathematics, and physics domains.

## Contents

### Sample Nodes (`sample-nodes/`)

**20 nodes** across three domains:

**Philosophy (7 nodes):**
- `k7x9m2` - Knowledge requires safety (epistemology)
- `p8k2n1` - Justified true belief (JTB analysis)
- `m4k2p9` - Gettier cases refute JTB
- `q3p8n5` - No false lemmas condition
- `g8t2r1` - Reliability condition for knowledge
- `c001` - Formal systems (concept, bridges to math)
- `p9k1m3` - Modal realism
- `ep001` - Empiricism

**Mathematics (8 nodes):**
- `t4k2p9` - Fundamental Theorem of Algebra
- `t8k3m1` - Completeness of complex numbers
- `m7n3k2` - Pythagorean theorem
- `l2p9k4` - Continuity of functions (definition)
- `d5k7n8` - Gödel's First Incompleteness Theorem
- `ax001` - Axiom of Choice
- `th001` - Cantor's Theorem
- `prf001` - Existence of transcendental numbers

**Physics (5 nodes):**
- `gr001` - General Relativity
- `qm001` - Quantum Mechanics
- `sr001` - Special Relativity
- `nm001` - Newton's Second Law
- `obs001` - Gravitational lensing observation
- `obs003` - Double-slit interference observation

### Sample Edges (`sample-edges/`)

**~30 edges** across multiple relation types:

- **supports.jsonl** - Evidential support relationships (7 edges)
- **attacks.jsonl** - Counterarguments and refutations (2 edges)
- **proves.jsonl** - Mathematical proofs (3 edges)
- **predicts.jsonl** - Theory → observation predictions (3 edges)
- **entails.jsonl** - Logical entailment (4 edges)
- **defines.jsonl** - Definitional relationships (3 edges)
- **formalizes.jsonl** - Philosophy → Math bridges (3 edges)
- **models.jsonl** - Math → Physics bridges (3 edges)

## Graph Structure

The sample graph demonstrates:

1. **Epistemological Debate:**
   - Traditional JTB analysis (`p8k2n1`)
   - Gettier problem (`m4k2p9` attacks `p8k2n1`)
   - Alternative conditions: Safety (`k7x9m2`), No false lemmas (`q3p8n5`), Reliability (`g8t2r1`)

2. **Mathematical Foundations:**
   - Set theory and foundations (Axiom of Choice, Cantor's Theorem, Gödel's Incompleteness)
   - Analysis (Completeness, Continuity, Fundamental Theorem of Algebra)
   - Geometry (Pythagorean theorem)

3. **Physical Theories:**
   - Classical mechanics (Newton's Laws)
   - Relativity (Special and General)
   - Quantum Mechanics
   - Supporting observations

4. **Cross-Domain Bridges:**
   - Formal systems concept bridges philosophy and mathematics
   - Mathematical structures model physical theories
   - Modal realism connects to formal logic

## Usage

This sample data can be used for:

- **Testing** - Validation scripts, graph algorithms, visualization
- **Development** - Iterating on UI/UX with realistic data
- **Documentation** - Examples in tutorials and README
- **Demonstrations** - Showing cross-domain connections

## Validation

All nodes and edges validate against the JSON schemas in `schemas/`:

```bash
# Validate nodes
python scripts/validate.py docs/examples/sample-nodes/

# Build manifest and graph summary
python scripts/build_index.py docs/examples/sample-nodes/ docs/examples/sample-edges/
```

## Extending

To add more nodes:

1. Create `{id}.json` file in `sample-nodes/` following `schemas/node.schema.json`
2. Use 6-character alphanumeric ID (lowercase)
3. Ensure domain is one of: `philosophy`, `mathematics`, `physics`
4. Add relevant tags and metadata

To add more edges:

1. Add line to appropriate `{relation}.jsonl` file in `sample-edges/`
2. Ensure `f` and `t` reference existing node IDs
3. Use weight `w` between 0 and 1 (optional)
4. Set domain (or `bridge:X→Y` for cross-domain)

## Visualization

Load this sample graph in the Truth Mines web application to explore:
- 2D force-directed overview
- 3D truth mine with depth-based layout
- Justification trees for propositions
- Cross-domain bridge highlighting
