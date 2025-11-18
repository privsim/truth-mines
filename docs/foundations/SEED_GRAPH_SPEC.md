# Seed Graph Specification

**Purpose:** Proposed foundational nodes (30-40) to seed the Truth Mines knowledge graph across philosophy, mathematics, and physics.

**Status:** DRAFT - Awaiting multi-agent review

**Review Focus:** Are these the right foundational nodes? What's missing? What shouldn't be here?

---

## Proposed Seed Graph Structure

### Overview

**Total Nodes:** 38 proposed
- Epistemology: 12 nodes
- Mathematics: 14 nodes
- Physics: 9 nodes
- Cross-domain bridges: 3 nodes

**Total Edges:** ~60 proposed (will create dense justification structure)

---

## 1. Epistemology Foundation (12 nodes)

### 1.1 Core Concepts (Depth 0 or foundational definitions)

**EP001: Perceptual Experience**
- Title: "Perceptual experiences exist"
- Type: axiom (foundational claim)
- Content: "I have perceptual experiences (seeing, hearing, feeling). This is immediate and undeniable."
- **Why foundational:** Cartesian certainty, basis for empiricism
- **Depth:** 0 (no further justification needed/possible)
- **Question:** Is this too strong? Alternatively: "Seemings exist" (more neutral)

**EP002: Belief**
- Title: "Beliefs exist"
- Type: axiom
- Content: "Agents have beliefs (propositional attitudes toward propositions)."
- **Why foundational:** Necessary for epistemic theorizing
- **Depth:** 0

**EP003: Truth**
- Title: "Truth is a property of propositions"
- Type: definition
- Content: "Propositions are truth-apt: they can be true or false."
- **Why foundational:** Presupposed by knowledge theories
- **Depth:** 0

### 1.2 Knowledge Analysis (Depth 1-2)

**EP004: Justified True Belief Analysis**
- Title: "Knowledge is justified true belief (JTB)"
- Type: proposition (contested)
- Content: "S knows p iff: (1) p is true, (2) S believes p, (3) S is justified in believing p"
- **Depth:** 1 (built on EP002, EP003)
- **Edges:**
  - presupposes → EP002 (Belief)
  - presupposes → EP003 (Truth)

**EP005: Gettier Problem**
- Title: "Gettier cases refute JTB"
- Type: proposition
- Content: "There exist cases where S has JTB but not knowledge (Gettier 1963)."
- **Depth:** 2
- **Edges:**
  - attacks → EP004 (JTB analysis) [w=0.95]
  - supports → EP006 (JTB insufficient)

**EP006: JTB Insufficient**
- Title: "JTB is insufficient for knowledge"
- Type: proposition
- Content: "Justified true belief is not enough for knowledge; a fourth condition is needed."
- **Depth:** 2
- **Edges:**
  - supported_by ← EP005 (Gettier problem) [w=0.95]

### 1.3 Post-Gettier Theories (Depth 2-3)

**EP007: Safety Condition**
- Title: "Knowledge requires safety"
- Type: proposition
- Content: "S knows p only if: in nearby possible worlds where S believes p, p is true (safety condition)."
- **Depth:** 2
- **Edges:**
  - supports → EP006 (solves Gettier) [w=0.8]

**EP008: Sensitivity Condition**
- Title: "Knowledge requires sensitivity"
- Type: proposition
- Content: "S knows p only if: if p were false, S would not believe p (sensitivity)."
- **Depth:** 2
- **Edges:**
  - supports → EP006 (alternative Gettier solution) [w=0.75]
  - attacks ← EP009 (closure problem) [w=0.7]

**EP009: Closure Failure**
- Title: "Sensitivity violates epistemic closure"
- Type: proposition
- Content: "Sensitivity condition implies knowledge is not closed under known entailment."
- **Depth:** 3
- **Edges:**
  - attacks → EP008 (Sensitivity) [w=0.7]

**EP010: Reliabilism**
- Title: "Knowledge requires reliable process"
- Type: proposition
- Content: "S knows p iff: S's belief was formed via a reliable cognitive process."
- **Depth:** 2
- **Edges:**
  - supports → EP006 (externalist alternative) [w=0.7]

**EP011: No False Lemmas**
- Title: "Knowledge requires no false lemmas"
- Type: proposition
- Content: "S knows p only if S's justification doesn't essentially depend on false lemmas."
- **Depth:** 2
- **Edges:**
  - supports → EP006 (internalist solution) [w=0.7]

**EP012: Modal Knowledge**
- Title: "Modal epistemology framework"
- Type: concept
- Content: "Framework for analyzing knowledge using possible worlds (safety, sensitivity)."
- **Depth:** 1
- **Edges:**
  - supports → EP007 (Safety)
  - supports → EP008 (Sensitivity)

---

## 2. Mathematics Foundation (14 nodes)

### 2.1 Logic (Depth 0)

**MA001: Law of Identity**
- Title: "A → A (law of identity)"
- Type: axiom
- Content: "Every proposition implies itself."
- **Depth:** 0 (logical axiom)

**MA002: Modus Ponens**
- Title: "Modus ponens inference rule"
- Type: axiom
- Content: "From A and A→B, infer B."
- **Depth:** 0

**MA003: Law of Excluded Middle**
- Title: "A ∨ ¬A (excluded middle)"
- Type: axiom
- Content: "For every proposition A, either A or not-A is true."
- **Depth:** 0
- **Question:** Include this? Constructivists reject it. Flag as contested?

### 2.2 Set Theory Axioms (Depth 0-1)

**MA004: Axiom of Extensionality**
- Title: "Sets equal if same elements"
- Type: axiom
- Content: "∀A ∀B: (∀x: x∈A ↔ x∈B) → A=B"
- **System:** ZFC
- **Depth:** 0

**MA005: Axiom of Pairing**
- Title: "Pairs exist"
- Type: axiom
- Content: "For any a, b, there exists a set {a, b}."
- **System:** ZFC
- **Depth:** 0

**MA006: Axiom of Union**
- Title: "Unions exist"
- Type: axiom
- Content: "For any set A, there exists a set ∪A containing all elements of elements of A."
- **System:** ZFC
- **Depth:** 0

**MA007: Axiom of Power Set**
- Title: "Power sets exist"
- Type: axiom
- Content: "For any set A, there exists a set P(A) = {x : x ⊆ A}."
- **System:** ZFC
- **Depth:** 0

**MA008: Axiom of Infinity**
- Title: "Infinite sets exist"
- Type: axiom
- Content: "There exists an infinite set (containing ∅, {∅}, {{∅}}, ...)."
- **System:** ZFC
- **Depth:** 0

**MA009: Axiom of Choice**
- Title: "Choice functions exist"
- Type: axiom
- Content: "For any collection of non-empty sets, there exists a choice function."
- **System:** ZFC
- **Depth:** 0
- **Controversy:** Contested by constructivists

### 2.3 Basic Theorems (Depth 1-2)

**MA010: Cantor's Theorem**
- Title: "Power set has greater cardinality"
- Type: theorem
- Content: "For any set A, |A| < |P(A)|."
- **Depth:** 1
- **Edges:**
  - proves_from ← MA007 (Power set axiom) [w=1.0]

**MA011: Well-Ordering Theorem**
- Title: "Every set can be well-ordered"
- Type: theorem
- Content: "For every set S, there exists a well-ordering."
- **Depth:** 1
- **Edges:**
  - proves_from ← MA009 (Axiom of Choice) [w=1.0]
  - equivalent ↔ MA009 (Axiom of Choice) [w=1.0]

**MA012: Fundamental Theorem of Algebra**
- Title: "Polynomials over ℂ have roots"
- Type: theorem
- Content: "Every non-constant polynomial over ℂ has at least one root."
- **Depth:** 2 (requires complex analysis)
- **Note:** Current sample includes this (t4k2p9)

**MA013: Gödel's First Incompleteness**
- Title: "Consistent formal systems are incomplete"
- Type: theorem
- Content: "Any consistent formal system F capable of arithmetic contains undecidable statements."
- **Depth:** 2
- **Edges:**
  - attacks → MA014 (Hilbert's program) [w=0.9]
- **Note:** Current sample includes this (d5k7n8)

**MA014: Hilbert's Program**
- Title: "Mathematics can be completely formalized"
- Type: proposition (refuted)
- Content: "Mathematics can be reduced to a finite, consistent, complete set of axioms."
- **Depth:** 1
- **Edges:**
  - attacked_by ← MA013 (Gödel) [w=0.9]

---

## 3. Physics Foundation (9 nodes)

### 3.1 Observations (Depth 0)

**PH001: Galilean Observations**
- Title: "Objects fall at same rate (Galileo)"
- Type: observation
- Content: "Heavy and light objects fall at the same rate in vacuum (experimental fact)."
- **Depth:** 0 (observational foundation)

**PH002: Gravitational Lensing Observation**
- Title: "Light bends near massive objects"
- Type: observation
- Content: "Eddington 1919 eclipse observation showed starlight deflection near sun."
- **Depth:** 0
- **Note:** Current sample includes this (obs001)

**PH003: Double-Slit Interference**
- Title: "Quantum interference pattern"
- Type: observation
- Content: "Single particles create interference pattern in double-slit experiment."
- **Depth:** 0
- **Note:** Current sample includes this (obs003)

### 3.2 Classical Principles (Depth 1)

**PH004: Newton's Second Law**
- Title: "F = ma"
- Type: principle
- Content: "Force equals mass times acceleration."
- **Depth:** 1
- **Edges:**
  - predicts → PH001 (falling bodies) [w=0.95]
- **Note:** Current sample includes this (0nm001)

**PH005: Conservation of Energy**
- Title: "Energy is conserved"
- Type: principle
- Content: "In a closed system, total energy remains constant."
- **Depth:** 1

### 3.3 Modern Theories (Depth 2)

**PH006: Special Relativity**
- Title: "Spacetime is Minkowski"
- Type: theory
- Content: "Space and time are unified; speed of light is constant in all inertial frames."
- **Depth:** 2
- **Note:** Current sample includes this (0sr001)

**PH007: General Relativity**
- Title: "Gravity is spacetime curvature"
- Type: theory
- Content: "Mass-energy curves spacetime; curvature determines motion (Einstein field equations)."
- **Depth:** 2
- **Edges:**
  - predicts → PH002 (gravitational lensing) [w=0.99]
  - reduces_to ← PH004 (weak field limit) [w=0.9]
- **Note:** Current sample includes this (0gr001)

**PH008: Quantum Mechanics**
- Title: "Wave function evolution (Schrödinger)"
- Type: theory
- Content: "Physical states described by wave functions evolving via Schrödinger equation."
- **Depth:** 2
- **Edges:**
  - predicts → PH003 (double-slit) [w=0.95]
- **Note:** Current sample includes this (0qm001)

**PH009: Standard Model**
- Title: "Standard Model of particle physics"
- Type: theory
- Content: "Quantum field theory describing electromagnetic, weak, and strong interactions."
- **Depth:** 3
- **Edges:**
  - unifies → PH006 (SR) and PH008 (QM) [w=0.95]

---

## 4. Cross-Domain Bridges (3 nodes)

**BR001: Formal Systems Concept**
- Title: "Formal systems (meta-mathematical concept)"
- Type: concept
- Domain: philosophy (but bridges to math)
- Content: "A formal system consists of syntax + axioms + inference rules."
- **Depth:** 1
- **Edges:**
  - formalizes → MA002 (Modus ponens represents inference rules) [w=0.9] [bridge:phil→math]
  - formalizes → MA013 (Gödel about formal systems) [w=0.95] [bridge:phil→math]
- **Note:** Current sample includes similar (00c001)

**BR002: Modal Logic**
- Title: "Modal propositional logic (◇, □)"
- Type: concept
- Domain: mathematics (but bridges from phil)
- Content: "Formal system with operators for possibility and necessity."
- **Depth:** 1
- **Edges:**
  - formalizes ← EP012 (modal epistemology) [w=0.85] [bridge:phil→math]
  - used_in → EP007 (safety condition uses possible worlds) [w=0.8]

**BR003: Differential Geometry**
- Title: "Riemannian geometry"
- Type: concept
- Domain: mathematics (but bridges to physics)
- Content: "Geometry of curved manifolds with metric tensor."
- **Depth:** 2 (built on set theory, analysis)
- **Edges:**
  - models → PH007 (GR uses Riemannian geometry) [w=1.0] [bridge:math→phys]

---

## 5. Proposed Edge Structure

### 5.1 Epistemology Edges

**Foundation → Analysis:**
- EP002 (Belief) → presupposes → EP004 (JTB)
- EP003 (Truth) → presupposes → EP004 (JTB)

**Gettier Debate:**
- EP005 (Gettier problem) → attacks → EP004 (JTB) [w=0.95]
- EP005 → supports → EP006 (JTB insufficient) [w=0.95]

**Post-Gettier Solutions:**
- EP007 (Safety) → supports → EP006 [w=0.8]
- EP008 (Sensitivity) → supports → EP006 [w=0.75]
- EP010 (Reliabilism) → supports → EP006 [w=0.7]
- EP011 (No false lemmas) → supports → EP006 [w=0.7]

**Internal Debates:**
- EP009 (Closure failure) → attacks → EP008 (Sensitivity) [w=0.7]
- EP007 (Safety) → attacks → EP008 (Sensitivity incompatible?) [w=0.5]

### 5.2 Mathematics Edges

**Logic → Set Theory:**
- MA002 (Modus ponens) → proves → MA010 (Cantor's theorem) [w=1.0, indirect]

**Set Axioms → Theorems:**
- MA007 (Power set) → proves → MA010 (Cantor) [w=1.0]
- MA009 (Choice) → proves → MA011 (Well-ordering) [w=1.0]
- MA009 (Choice) → equivalent ↔ MA011 (Well-ordering) [w=1.0]

**Metamathematics:**
- MA001-MA009 (Logic + ZFC) → proves → MA013 (Gödel) [w=1.0]
- MA013 (Gödel) → attacks → MA014 (Hilbert's program) [w=0.9]

### 5.3 Physics Edges

**Observations → Laws:**
- PH001 (Falling bodies) → supports → PH004 (Newton's 2nd law) [w=0.9]
- PH002 (Lensing) → supports → PH007 (GR) [w=0.95]
- PH003 (Double-slit) → supports → PH008 (QM) [w=0.95]

**Predictions:**
- PH004 (Newton) → predicts → PH001 (Falling) [w=0.95]
- PH007 (GR) → predicts → PH002 (Lensing) [w=0.99]
- PH008 (QM) → predicts → PH003 (Interference) [w=0.95]

**Theory Relations:**
- PH004 (Newton) → approximates → PH007 (GR) [w=0.95, condition: weak fields]
- PH004 (Newton) → reduces_to → PH008 (QM) [w=0.9, limit: ℏ→0]
- PH006 (SR) + PH008 (QM) → unifies_to → PH009 (Standard Model) [w=0.95]

### 5.4 Bridge Edges

**Philosophy → Math:**
- BR001 (Formal systems) → formalizes → MA013 (Gödel) [w=0.9]
- EP012 (Modal framework) → formalizes → BR002 (Modal logic) [w=0.85]

**Math → Physics:**
- BR003 (Riemannian geometry) → models → PH007 (GR) [w=1.0]

---

## 6. Rationale for These Specific Nodes

### 6.1 Epistemology Justification

**Why this cluster:**
- JTB is the natural starting point (traditional analysis)
- Gettier problem is the most important challenge (20th century epistemology)
- Post-Gettier solutions represent major schools (safety, sensitivity, reliabilism, no-false-lemmas)
- Captures rich debate structure (support, attack, responses)

**What's missing (intentionally):**
- Virtue epistemology (add later)
- Feminist epistemology (add later)
- Social epistemology (add later)
- Skepticism (could add as foundational challenge)

**Question for Review:** Should we add skepticism as foundational opposition? Or start with knowledge-positive theories?

### 6.2 Mathematics Justification

**Why this cluster:**
- ZFC is standard modern foundation
- Basic logical axioms needed for any proof
- Cantor, Gödel are landmark results with philosophical implications
- Hilbert's program shows metamathematical ambition + limits

**What's missing (intentionally):**
- Category theory (alternative foundation - add if needed)
- Type theory (add parallel branch later if desired)
- Detailed analysis, algebra, topology (build out later)
- Most of mathematics (!)

**Question for Review:** Is this enough to bootstrap? Or should we add more basic theorems (Pythagorean, basic algebra)?

### 6.3 Physics Justification

**Why this cluster:**
- Observations ground empirical science
- Newton represents classical physics
- SR/GR/QM are 20th century revolutions
- Standard Model is current best theory
- Shows theory hierarchy and replacement

**What's missing (intentionally):**
- Thermodynamics (add later)
- Classical electromagnetism (add later)
- Quantum field theory details (Standard Model is placeholder)
- Quantum gravity (too speculative for seed?)

**Question for Review:** Should we include more classical physics before jumping to modern? Or is this skeleton enough?

### 6.4 Bridge Justification

**Why so few:**
- Bridges are complex and contested
- Better to start minimal and add carefully
- These three are uncontroversial

**Obvious additions:**
- Probability theory (bridges epistemology and physics)
- Set theory (formalizes mereology)
- Group theory (symmetries in physics)

**Question for Review:** What bridges are essential for seed graph? What can wait?

---

## 7. Alternative Seed Graphs to Consider

### Alternative A: Historical Development

**Instead of systematic foundation:**
- Start with historical origins (Aristotle, Euclid, Galileo)
- Build forward chronologically
- Show how ideas developed and replaced each other

**Pros:** Narrative structure, shows actual history
**Cons:** Less aligned with logical justification structure

### Alternative B: Problem-Centered

**Instead of domain silos:**
- Start with key problems (mind-body, foundations of math, quantum interpretation)
- Build out attempted solutions
- Cross-cutting structure

**Pros:** More integrated, problem-focused
**Cons:** Harder to navigate, less clear structure

### Alternative C: Minimalist

**Bare minimum:**
- 5 epistemology nodes (JTB, Gettier, one solution)
- 5 math nodes (ZFC as group + one theorem)
- 5 physics nodes (one classical, one modern, observations)
- 3 bridges

**Total: 18 nodes**

**Pros:** Easier to review, faster to build
**Cons:** Less rich, less interesting

**Question for Review:** Which approach is best? Systematic (proposed), historical, problem-centered, or minimalist?

---

## 8. Implementation Plan

### 8.1 Phase 1: Create Seed Nodes (Week 1)

**Create JSON files for all 38 proposed nodes:**
- Following node.schema.json exactly
- With meaningful content (200-400 characters each)
- With formal notation where applicable
- With appropriate metadata

### 8.2 Phase 2: Create Edges (Week 1)

**Create ~60 edges:**
- Following relation semantics exactly
- With weights calibrated consistently
- In appropriate JSONL files by relation type

### 8.3 Phase 3: Validate (Week 1)

```bash
python scripts/validate.py --strict
# Should pass with 38 nodes, 60 edges
```

### 8.4 Phase 4: Review (Week 2)

**Export for multi-agent review:**
```bash
python scripts/build_toon.py
# Send dist/edges.toon + this spec to multiple AIs
```

### 8.5 Phase 5: Revise & Expand (Week 2+)

Based on feedback:
- Adjust foundational commitments
- Refine relation usage
- Add missing foundations identified by reviewers
- **Then expand aggressively** (10-20 nodes/week)

---

## 9. Success Criteria for Seed Graph

**The seed graph is successful if:**

1. ✅ All 38 nodes validate against schema
2. ✅ Edge relations follow semantic definitions
3. ✅ Depth computation produces sensible layers
4. ✅ Multi-agent review identifies gaps we can address
5. ✅ Structure supports first real use cases:
   - Explore Gettier problem and responses
   - See how GR is supported by observations
   - Trace proof of Cantor's theorem from axioms
   - Understand philosophy-math formalizations

6. ✅ Ready to expand in all three directions:
   - More epistemology (virtue, feminist, social)
   - More mathematics (analysis, algebra, topology)
   - More physics (QFT, thermodynamics, cosmology)

---

## 10. Questions for Multi-Agent Review

**Please review and answer:**

### Foundational Choices

1. Is modest foundationalism the right epistemological framework for a knowledge graph?
2. Is ZFC the right mathematical foundation, or should we use type theory/category theory?
3. Should observations be depth 0, or is this too naive about theory-ladenness?

### Node Selection

4. Are these 38 nodes the right foundations, or are we missing crucial nodes?
5. Should we add more basic logic (more axioms, inference rules)?
6. Should we add more classical physics before modern physics?
7. What cross-domain bridges are we missing that are essential?

### Relation Usage

8. Are the relation semantics clear enough to guide consistent edge creation?
9. Should we distinguish "attacks" vs "refutes"? "supports" vs "strong_supports"?
10. Should "equivalent" be one bidirectional edge or two directed edges?

### Structure

11. How should we handle coherentist positions if we're using foundationalist structure?
12. Should proof steps be individual nodes, or just reference proof IDs?
13. What's the right granularity (fine-grained axioms vs coarse-grained "ZFC")?

### Practical

14. What should we build first after this seed (more epistemology, more math, or more bridges)?
15. Are there glaring omissions that will cause problems when we scale to 200+ nodes?

---

**This seed graph spec is ready for rigorous multi-agent critique!**

Please identify weaknesses, suggest alternatives, and help refine before we commit to this structure and build 100+ nodes on top of it.
