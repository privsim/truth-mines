# Context for Multi-Agent Foundation Review

**Purpose:** This document provides complete context for reviewing the Truth Mines foundational documents.

**For Reviewers:** Read this first to understand the project, then review the foundation documents.

---

## Executive Summary: What is Truth Mines?

**Truth Mines** is a Git-native, multi-domain formal knowledge system that represents philosophy, mathematics, and physics as a unified directed graph.

**Think of it as:** A "personal knowledge base as code" where:
- **Nodes** = Claims, theorems, theories, observations (JSON files in Git)
- **Edges** = Typed relations with weights (supports, proves, attacks, etc.)
- **Depth** = Epistemic distance from foundational nodes
- **Visualization** = 3D "truth mine" where you explore argument structures
- **LLM Integration** = Export subgraphs as compact TOON format for AI reasoning

**Primary Use Case:** Personal cognitive augmentation - building, visualizing, and exploring your own explicit knowledge structures with justification chains from foundations to derived claims.

**Not:** Collaborative wiki, public knowledge base (yet), or consensus-seeking tool. It's a single-user research tool.

---

## Current Status: Production-Ready System

### What's Been Built (100% of Original Roadmap)

**Complete working system with 194 passing tests:**

1. **Python Build Pipeline** (39 tests)
   - Graph validation (schema + referential integrity)
   - Manifest generation
   - TOON format export for LLMs
   - Subgraph extraction

2. **Rust WASM Engine** (105 tests)
   - Graph storage with O(1) lookups, adjacency lists
   - BFS k-hop neighbors, DFS path finding
   - JSON & TOON parsers
   - Depth computation (topological sort)
   - 2D/3D layout algorithms
   - GPU buffer generation
   - JavaScript API for browser

3. **React Frontend** (53 tests)
   - Filters (domain, type)
   - Search (debounced, multi-field)
   - Node detail panel with tabs
   - Graph2D visualization (ready for cosmos.gl)
   - Graph3D (ready for WebGPU)
   - Hover tooltips (NEW!)
   - Visual salience system (NEW!)

4. **CI/CD** (5 GitHub Actions workflows)
   - Automated testing on every push
   - Graph validation enforcement
   - Dependency management

5. **Documentation** (24 comprehensive files)
   - API references, tutorials, guides
   - Architecture decision records
   - Performance and integration guides

### Current Graph: 22 Sample Nodes

**Domain distribution:**
- 8 philosophy (epistemology focus)
- 8 mathematics (set theory, theorems)
- 6 physics (theories, observations)

**Edge types:** 28 edges across 8 relation types
- supports, attacks, proves, entails, predicts, formalizes, models, defines

**Purpose:** Demonstrates the system but not actual research content yet.

---

## Data Model & Schema (What You Need to Understand)

### Node Structure (JSON)

**Schema:** `schemas/node.schema.json`

**Required fields:**
```json
{
  "id": "abc123",           // 6-char lowercase alphanumeric
  "type": "proposition",    // Type: proposition, theorem, theory, axiom, etc.
  "domain": "philosophy",   // Domain: philosophy, mathematics, physics
  "title": "Short title"    // Human-readable title
}
```

**Optional fields:**
- `content` - Natural language explanation (200-600 chars typical)
- `formal` - Formal notation (∀x: P(x), equations, etc.)
- `tags` - Categorization tags
- `metadata` - Domain-specific data (difficulty, importance, axiom_system, etc.)
- `sources` - Citations
- `created`, `updated` - Timestamps

**Storage:** One JSON file per node in `nodes/` directory

### Edge Structure (JSONL)

**Schema:** `schemas/edge.schema.json`

**Required fields:**
```json
{"f":"abc123","t":"def456","relation":"supports","domain":"philosophy","w":0.9}
```

- `f` - From node ID
- `t` - To node ID
- `relation` - Relation type (supports, proves, attacks, etc.)
- `domain` - Domain or bridge (e.g., "bridge:phil→math")
- `w` - Weight (optional, 0-1 scale)

**Storage:** One JSONL file per relation type in `edges/` directory

### Allowed Domains & Relations

**Defined in:** `.truth-mines/schema.toml`

**Domains:**
- philosophy, mathematics, physics

**Universal relations:**
- supports, attacks, entails, defines, cites

**Domain-specific:**
- Philosophy: presupposes, refutes, explicates
- Mathematics: proves, generalizes, equivalent, lemma_for, corollary_of
- Physics: predicts, tests, approximates, reduces_to, unifies

**Bridge relations:**
- formalizes (phil→math), models (math→phys), philosophical_foundation, empirical_grounding, applies_to

### Depth Computation

**Epistemic relations** (supports, proves, entails, predicts) determine depth:
- **Depth 0:** Foundation nodes (no incoming epistemic edges)
- **Depth n:** Longest epistemic support chain from any foundation is n hops

**Non-epistemic relations** (attacks, defines, cites) don't affect depth but are visualized.

**Purpose:** 3D visualization places nodes at Y-coordinate based on depth (foundations at bottom, derived claims higher).

---

## What's Being Reviewed: The Foundation Documents

### You're Reviewing 3 Specifications

**Located in:** `docs/foundations/`

#### 1. ONTOLOGICAL_FOUNDATION.md

**What it specifies:**
- Epistemological framework: Modest foundationalism proposed
- Mathematical axiom system: ZFC + classical first-order logic proposed
- Physical theory structure: Effective field theory hierarchy proposed
- Cross-domain bridge principles
- **36 open questions** for your critique

**What we need from you:**
- Is foundationalism the right structure for a knowledge graph?
- Are these the right starting commitments?
- What are we missing or getting wrong?

#### 2. RELATION_SEMANTICS.md

**What it specifies:**
- Precise definitions for all 20+ edge relation types
- Usage criteria (when to use "proves" vs "entails" vs "supports")
- Weight interpretation (what does 0.8 mean?)
- Transitivity properties (which relations compose?)
- Decision trees for consistent usage

**What we need from you:**
- Are these semantics clear and distinct enough?
- Where might they overlap confusingly?
- Are we missing important relation types?
- Is weight interpretation sound?

#### 3. SEED_GRAPH_SPEC.md

**What it specifies:**
- 38 specific foundational nodes proposed:
  - 12 epistemology (JTB, Gettier debate, post-Gettier solutions)
  - 14 mathematics (logic axioms, ZFC axioms, basic theorems)
  - 9 physics (observations, classical theories, modern theories)
  - 3 cross-domain bridges
- ~60 proposed edges connecting them
- Rationale for each inclusion

**What we need from you:**
- Are these the right foundational nodes?
- What crucial foundations are we missing?
- Is this the right starting structure?
- Should we add/remove/change any nodes?

---

## Why This Review Matters

### The Problem

**Before building 150+ nodes, we need:**
- Consistent relation usage (not mixing "supports" and "proves" arbitrarily)
- Coherent foundational structure (clear depth 0 starting points)
- Philosophically defensible commitments (not naive about e.g., theory-ladenness)
- Semantic clarity (what does each edge type actually mean?)

**If we get this wrong:**
- Massive refactoring later (changing 100 edges because semantics were unclear)
- Structural incoherence (can't compute meaningful depth)
- Epistemic confusion (is this "supports" or "proves"?)

### The Opportunity

**Multi-agent review catches:**
- Blind spots (philosophical positions we're ignoring)
- Ambiguities (where semantics aren't clear)
- Inconsistencies (proposed nodes/edges that conflict)
- Missing pieces (essential foundations we overlooked)
- Alternative structures (better ways to organize)

**Different AIs bring different perspectives:**
- Claude: Strong on philosophy, epistemology
- GPT-4/5: Broad knowledge, mathematical rigor
- Gemini: Different training data, fresh perspective
- Specialized models: Domain expertise

---

## Key Documents to Review (In Order)

### **REQUIRED READING (Review Request Package):**

**Read in this order:**

1. **THIS FILE** (CONTEXT_FOR_REVIEW.md)
   - Understand what Truth Mines is
   - Understand the data model
   - Understand what needs review

2. **MULTI_AGENT_REVIEW_TEMPLATE.md**
   - Structured review questions (26 specific questions)
   - Output format
   - Your review task

3. **ONTOLOGICAL_FOUNDATION.md**
   - The philosophical framework
   - Epistemology, mathematics, physics commitments
   - 36 open questions embedded

4. **RELATION_SEMANTICS.md**
   - Precise edge semantics
   - Usage criteria
   - Weight interpretation
   - Decision trees

5. **SEED_GRAPH_SPEC.md**
   - 38 proposed nodes
   - 60 proposed edges
   - Rationales and alternatives

### **OPTIONAL CONTEXT (If You Want Deeper Understanding):**

**To understand the system:**
- `PRD.md` (Section 1-12 for original vision, Section 13 for interaction specs)
- `schemas/node.schema.json` (data model)
- `schemas/edge.schema.json` (edge model)
- `.truth-mines/schema.toml` (allowed domains/relations)

**To see current implementation:**
- `README.md` (project overview)
- `API.md` (how the system works)

**To see sample data:**
- `SAMPLE_GRAPH.toon` (attached - see below)

---

## Sample Graph for Concrete Reference

**We'll attach:** `SAMPLE_GRAPH.toon`

**This shows:**
- Current 22-node sample graph in TOON format
- Concrete examples of all relation types
- How nodes and edges actually look
- Edge weight usage in practice

**Use this to:**
- See concrete instances of "supports", "proves", "attacks" edges
- Understand weight usage (0.7, 0.9, 1.0, etc.)
- Validate that proposed relation semantics match actual usage
- Suggest improvements based on real examples

**Example from SAMPLE_GRAPH.toon:**
```
supports[7]{f,t,w,domain}:
k7x9m2,q3p8n5,0.9,philosophy
m4k2p9,q3p8n5,0.85,philosophy
...

attacks[2]{f,t,w,domain}:
m4k2p9,p8k2n1,0.95,philosophy
d5k7n8,00c001,0.8,philosophy

proves[3]{f,t,w,domain}:
t4k2p9,prf001,1.0,mathematics
...
```

---

## Specific Review Focus Areas

### 1. Epistemological Structure

**Question:** Is modest foundationalism the right framework?

**Context needed:**
- We want depth computation (distance from foundations)
- This requires identifying "depth 0" nodes
- But philosophy has alternatives (coherentism, infinitism)

**Your task:** Evaluate whether foundationalism works for a knowledge graph, or suggest how to represent alternatives.

### 2. Relation Semantics Precision

**Question:** Are "supports", "proves", "entails" sufficiently distinct?

**Context needed:**
- Users will add hundreds of edges
- Must choose consistently
- Semantic drift would corrupt the graph

**Your task:** Identify ambiguities, suggest clarifications, propose decision criteria.

### 3. Mathematical Foundations

**Question:** Is ZFC the right choice?

**Context needed:**
- We need a foundation for mathematical proofs
- Type theory, category theory are alternatives
- Choice affects what theorems can be represented

**Your task:** Validate ZFC choice or suggest alternatives, identify what's missing.

### 4. Physics Theory Structure

**Question:** Should observations be depth 0 or are they theory-laden?

**Context needed:**
- Naive: Observations are foundation (depth 0)
- Sophisticated: All observation is theory-laden (depth 1+)
- Affects entire physical theory structure

**Your task:** Critique the effective field theory hierarchy, suggest improvements.

### 5. Cross-Domain Bridges

**Question:** What makes a good "formalization"? What bridges are essential?

**Context needed:**
- Bridges connect philosophy→math→physics
- Quality matters (weight represents adequacy)
- Too few: Miss connections. Too many: Dilutes meaning.

**Your task:** Identify essential bridges, suggest quality criteria.

---

## What We DON'T Need Review On

**Already Complete and Working:**
- ✅ The software architecture (Rust + WASM + React)
- ✅ The test infrastructure (194 passing tests)
- ✅ The build pipeline (Python scripts)
- ✅ The visualization approach (2D/3D)
- ✅ The Epic 9 interaction specifications (those are for later)

**Focus your review on:**
- ✅ Philosophical soundness of foundations
- ✅ Mathematical rigor of commitments
- ✅ Semantic clarity of relations
- ✅ Completeness of seed graph
- ✅ Practical usability of specifications

---

## Output Format Requested

**Please structure your review as:**

### Executive Summary (2-3 paragraphs)
Overall assessment: Are these foundations sound? Major concerns?

### Strengths (bullet list)
What works well? What should definitely be kept?

### Critical Issues (numbered list, prioritized)
What MUST be addressed before building content?

### Concerns & Suggestions (by section)
**Epistemology:** ...
**Mathematics:** ...
**Physics:** ...
**Relations:** ...
**Seed Graph:** ...

### Missing Foundations (bullet list)
What crucial nodes are we missing?

### Ambiguities to Clarify (bullet list)
Where are the definitions unclear?

### Alternative Approaches (if applicable)
Fundamentally different ways to structure this that might be better?

### Top 5 Priorities
If we can only address 5 things, what are they?

---

## Documents Included in This Review Package

### Core Foundation Documents (REQUIRED)

1. **CONTEXT_FOR_REVIEW.md** (this file)
   - What Truth Mines is
   - Data model explanation
   - What needs review

2. **MULTI_AGENT_REVIEW_TEMPLATE.md**
   - 26 structured review questions
   - Expected output format

3. **ONTOLOGICAL_FOUNDATION.md**
   - Epistemological framework (modest foundationalism)
   - Mathematical framework (ZFC)
   - Physics framework (effective field theory)
   - 36 open questions

4. **RELATION_SEMANTICS.md**
   - All 20+ relation type definitions
   - Usage criteria, weight interpretation
   - Transitivity properties
   - Decision trees

5. **SEED_GRAPH_SPEC.md**
   - 38 proposed foundational nodes
   - 60 proposed edges
   - Rationales and alternatives

### Schema & Configuration (REFERENCE)

6. **schemas/node.schema.json**
   - JSON schema for nodes
   - Required fields, optional fields
   - Validation rules

7. **schemas/edge.schema.json**
   - JSON schema for edges
   - Field definitions

8. **.truth-mines/schema.toml**
   - Allowed domains
   - Allowed relations by category
   - Validation settings

### Sample Data (CONCRETE EXAMPLES)

9. **SAMPLE_GRAPH.toon**
   - Current 22-node graph in TOON format
   - Shows actual relation usage
   - Concrete examples of weights
   - Edge type diversity

### Optional Context (DEEPER UNDERSTANDING)

10. **PRD.md** - Product Requirements Document
    - Original vision (Sections 1-12)
    - Interaction specs (Section 13 - Epic 9)
    - Use cases and goals

11. **README.md** - Project overview
    - Quick start guide
    - Architecture diagram
    - Current status

---

## How to Use This Package

### Recommended Reading Order

**Phase 1: Understand the Project (15 min)**
1. Read CONTEXT_FOR_REVIEW.md (this file)
2. Skim README.md or PRD.md Section 1-2
3. Look at SAMPLE_GRAPH.toon to see concrete examples

**Phase 2: Understand What Needs Review (20 min)**
4. Read MULTI_AGENT_REVIEW_TEMPLATE.md (review questions)
5. Read ONTOLOGICAL_FOUNDATION.md (foundational framework)

**Phase 3: Deep Review (45-60 min)**
6. Read RELATION_SEMANTICS.md carefully (precise definitions)
7. Read SEED_GRAPH_SPEC.md carefully (proposed 38 nodes)
8. Reference schemas as needed for clarification

**Phase 4: Provide Critique (30-45 min)**
9. Answer the 26 review questions
10. Identify critical issues
11. Suggest concrete improvements

**Total time:** ~2 hours for comprehensive review

---

## Key Questions We Need Answered

### Foundational Structure

**Q1:** Is modest foundationalism appropriate for a knowledge graph?
- **Context:** Enables depth computation (foundations at depth 0)
- **Alternative:** Coherentism (mutual support, no foundations)
- **Issue:** How to visualize without clear "bottom"?

**Q2:** What should be depth 0?
- **Proposed:** Observations + a priori intuitions
- **Concern:** Theory-laden observation problem
- **Alternative:** Nothing is truly foundational?

### Relation Precision

**Q3:** Are "supports", "proves", "entails" distinct enough?
- **Supports:** Epistemic support (inductive, abductive)
- **Proves:** Formal derivation in axiom system
- **Entails:** Logical implication (broader than proves)
- **Issue:** Where's the boundary? When is argument strong enough to be "proves"?

**Q4:** Should we have gradations? (strong_supports vs weak_supports?)
- **Current:** One "supports" with weight
- **Alternative:** Multiple relation types by strength
- **Trade-off:** Simplicity vs expressiveness

### Mathematical Commitments

**Q5:** ZFC vs type theory vs category theory?
- **Proposed:** ZFC (standard, well-understood)
- **Alternative:** Type theory (HoTT, constructive)
- **Alternative:** Category theory (structural approach)
- **Issue:** Affects what mathematics can be represented

**Q6:** Should logic be explicit (nodes) or implicit (meta-system)?
- **Explicit:** Logic axioms as depth 0 nodes (shows dependencies)
- **Implicit:** Logic assumed (reduces clutter)
- **Trade-off:** Completeness vs simplicity

### Physics Structure

**Q7:** Are observations depth 0 or theory-laden?
- **Naive:** "I see gravitational lensing" = depth 0
- **Sophisticated:** Lensing observation presupposes light propagation theory
- **Issue:** Affects entire physics structure

**Q8:** How to represent theory replacement?
- **Newton → Einstein:** Approximates? Reduces_to? Superseded_by?
- **Issue:** Is Newton "wrong" or "approximately right"?

### Practical Usage

**Q9:** What granularity for nodes?
- **Fine:** Each ZFC axiom separate (9 nodes)
- **Coarse:** "ZFC axioms" as one node
- **Trade-off:** Precision vs manageability

**Q10:** How to handle controversial claims?
- **Proposed:** Include with both supporting and attacking edges
- **Alternative:** Mark as contested in metadata
- **Alternative:** Represent competing views as separate branches

---

## What Success Looks Like

**After multi-agent review, we'll have:**

1. ✅ Validation of foundational choices (or concrete alternatives)
2. ✅ Clarified relation semantics (removed ambiguities)
3. ✅ Identified gaps (missing essential foundations)
4. ✅ Refined seed graph (38 nodes → revised set)
5. ✅ Confidence to build 150+ nodes without structural refactoring

**NOT expecting:**
- Universal consensus (philosophy has none!)
- Perfect certainty (knowledge evolves)
- Addressing every possible critique
- Complete specification (some questions remain open)

**Expecting:**
- Multiple perspectives highlighting different issues
- Consensus on critical problems
- Actionable suggestions for improvement
- Validation that structure is sound enough to build on

---

## After Your Review

**We will:**

1. **Synthesize** all reviews into FOUNDATION_REVIEW_SYNTHESIS.md
2. **Decide** on contentious points based on multiple perspectives + user's philosophical commitments
3. **Revise** the three foundation documents
4. **Implement** 38-node seed graph
5. **Validate** with existing tools
6. **Build** 10-20 nodes per session to reach 150-200 nodes

**Goal:** Solid foundation enabling rapid, consistent content creation.

---

## Your Reviewer Expertise

**We're asking you to evaluate:**
- **Philosophical soundness** (epistemology, metaphysics)
- **Mathematical rigor** (axiom systems, proof semantics)
- **Scientific coherence** (physics theory structure)
- **Semantic clarity** (relation definitions)
- **Structural practicality** (will this work at scale?)

**You don't need to know:**
- The software implementation (that's working)
- React/Rust/WebAssembly details
- Graph visualization algorithms
- The UI interaction specs

**Focus on:** Conceptual foundations, relation semantics, node structure.

---

## Thank You!

**Your critique will:**
- Prevent structural problems before they occur
- Ensure philosophical defensibility
- Clarify ambiguous semantics
- Identify missing foundations
- Improve the seed graph

**This is spec-driven content creation:** Get the foundations right, then build with confidence.

---

**Ready for your comprehensive review!**

Please read the foundation documents and provide systematic critique following the template structure.
