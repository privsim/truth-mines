# Ontological Foundation for Truth Mines Knowledge Graph

**Purpose:** Define the philosophical, mathematical, and physical commitments that structure the Truth Mines knowledge graph.

**Status:** DRAFT - Awaiting multi-agent review

**Reviewers:** Please critique these commitments and suggest alternatives where appropriate.

---

## 1. Epistemological Framework

### 1.1 Core Commitment: Modest Foundationalism

**Position:**
We adopt a **modest foundationalist** structure for epistemological justification:

- **Foundation nodes:** Basic beliefs that don't require further justification within the graph
  - Perceptual experiences (observation nodes)
  - A priori intuitions (mathematical/logical axioms)
  - Conceptual truths (definitions)

- **Superstructure:** Derived beliefs justified by foundation + inference

**Rationale:**
- Enables clear "depth" computation (distance from foundations)
- Compatible with 3D truth mine visualization (foundations at bottom)
- Doesn't commit to strong foundationalism (foundations can be defeasible)

**Alternatives to Consider:**
- Pure coherentism (no foundations, just mutual support - harder to visualize depth)
- Infinitism (infinite justification chains - depth becomes meaningless)
- Mixed approach (some nodes foundational, others coherentist)

**Question for Review:** Is this the right structural choice for a knowledge graph? How would coherentist structure work?

### 1.2 Justification Relations Semantics

**"supports" relation:**
- **Meaning:** A provides evidential/argumentative support for B
- **Weight:** Subjective degree of support (0-1 scale)
  - 0.9-1.0: Very strong support (nearly entails)
  - 0.7-0.89: Strong support
  - 0.5-0.69: Moderate support
  - 0.3-0.49: Weak support
  - <0.3: Very weak (barely relevant)
- **Transitivity:** Weak (support doesn't fully chain)
- **Defeaters:** "attacks" edges can undermine

**"attacks" relation:**
- **Meaning:** A is evidence/argument against B
- **Weight:** Strength of counterargument
- **Coexistence:** A can attack B while B still has net support from other nodes
- **Resolution:** Don't automatically remove attacked nodes; show epistemic conflict

**"entails" relation:**
- **Meaning:** A logically entails B (material or formal implication)
- **Weight:** Degree of entailment (1.0 for strict entailment, lower for probabilistic)
- **Transitivity:** Strong (entailment chains)
- **Difference from "proves":** entails is broader (includes material conditionals)

### 1.3 Epistemic Depth Interpretation

**Depth = 0 (Foundation nodes):**
- Nodes with no incoming supports/proves/entails/predicts edges
- Examples:
  - Perceptual observations ("I see a red apple")
  - A priori intuitions ("If A then A" - logic)
  - Conceptual definitions ("Knowledge = JTB" as definition, not claim)

**Depth = 1:**
- Directly supported by foundations
- Examples: Basic empirical generalizations, simple theorems from axioms

**Depth = n:**
- Longest support chain from foundation is n steps

**Question for Review:** Should observations really be depth 0? Or should there be a pre-foundational layer of sense data?

---

## 2. Mathematical Framework

### 2.1 Core Commitment: ZFC Set Theory

**Position:**
- **Axiom system:** Zermelo-Fraenkel with Axiom of Choice (ZFC)
- **Logic:** Classical first-order logic
- **Proof system:** Natural deduction or sequent calculus

**Rationale:**
- Standard foundation for modern mathematics
- Well-understood
- Sufficient for philosophy, math, physics in graph

**Alternatives to Consider:**
- Type theory (HoTT, Martin-Löf)
- Category theory as foundations
- Constructive mathematics (reject excluded middle)
- Second-order logic

**Question for Review:** Is ZFC the right choice? Many modern foundations use type theory. Should we support both?

### 2.2 Mathematical Relation Semantics

**"proves" relation:**
- **Meaning:** A is a formal proof of B within specified axiom system
- **Axiom system:** Specified in node metadata (e.g., "ZFC", "PA", "Euclidean geometry")
- **Weight:** Typically 1.0 (deductive certainty), lower if proof has gaps/informal steps
- **Transitivity:** Perfect (proofs compose)
- **Formality:** Should reference actual proof (in formal field or proof ID)

**"lemma_for" relation:**
- **Meaning:** A is a lemma used in the proof of B
- **Weight:** 1.0 (if A is proven) or <1.0 (if A is assumed/conjectured)
- **Direction:** A → B (A is lemma FOR B)

**"generalizes" relation:**
- **Meaning:** B is a generalization of A (A is special case of B)
- **Example:** Pythagorean theorem → generalized by law of cosines
- **Weight:** Degree of generalization completeness

**"equivalent" relation:**
- **Meaning:** A and B are logically equivalent (A ↔ B)
- **Weight:** 1.0 for strict equivalence
- **Symmetric:** Should create two directed edges or one undirected?

**Question for Review:** Do we need both "proves" and "lemma_for"? Is the distinction meaningful in graph form?

### 2.3 Mathematical Foundations Structure

**Layer 0: Logic**
- Modus ponens
- Law of excluded middle (or not, if constructive)
- Basic logical axioms

**Layer 1: Set Theory Axioms**
- Axiom of extensionality
- Axiom of pairing
- Axiom of union
- Axiom of power set
- Axiom of infinity
- Axiom schema of separation
- Axiom schema of replacement
- Axiom of regularity
- Axiom of choice

**Layer 2: Basic Constructions**
- Natural numbers (ω)
- Ordered pairs, relations, functions
- Cardinals and ordinals

**Layer 3+: Derived Mathematics**
- Real analysis
- Abstract algebra
- Topology
- etc.

**Question for Review:** Should logic be in the graph or assumed as meta-system? Include proof theory nodes?

---

## 3. Physical Theory Framework

### 3.1 Core Commitment: Effective Field Theory Hierarchy

**Position:**
Physics nodes represent theories at different scales, related by:
- **reduces_to:** Classical mechanics reduces to QM in appropriate limit
- **approximates:** Newtonian gravity approximates GR for weak fields
- **predicts:** Theory predicts experimental observation
- **unifies:** QFT unifies QM and SR

**Rationale:**
- Captures modern understanding of physics
- Avoids "one true fundamental theory" assumption
- Shows domain of validity for each theory

**Alternatives to Consider:**
- Historical development order (Galileo → Newton → Einstein → QM)
- Pure reductionism (everything reduces to QFT/string theory)
- Instrumentalism (theories as calculational tools, not truth-bearers)

**Question for Review:** Is effective field theory hierarchy the right framing? Or historical development?

### 3.2 Physical Relation Semantics

**"predicts" relation:**
- **Meaning:** Theory A predicts observation B
- **Weight:** Precision/accuracy of prediction (0-1)
  - 1.0: Exact prediction within measurement error
  - <1.0: Approximate or probabilistic prediction
- **Falsifiability:** If prediction fails, "attacks" edge from observation to theory

**"tests" relation:**
- **Meaning:** Experiment A tests theory B
- **Weight:** Significance of test (crucial experiments: 1.0, routine: lower)
- **Outcome:** Separate from prediction (experiment can test without confirming)

**"approximates" relation:**
- **Meaning:** A is an approximation of B under specified conditions
- **Weight:** Quality of approximation
- **Metadata:** domain_of_validity specifies when approximation holds

**"reduces_to" relation:**
- **Meaning:** A is a limiting case of B
- **Example:** Classical mechanics reduces_to QM (ℏ → 0 limit)
- **Weight:** Rigor of reduction (1.0 for proven reduction, lower for heuristic)

### 3.3 Physical Foundations Structure

**Layer 0: Observations**
- Experimental results
- Measurement data
- Depth = 0 (empirical foundations)

**Layer 1: Phenomenological Laws**
- Newton's laws
- Maxwell's equations
- Thermodynamics principles
- (Directly supported by observations)

**Layer 2: Theoretical Frameworks**
- Special Relativity
- General Relativity
- Quantum Mechanics
- Standard Model

**Layer 3+: Speculative/Unifying Theories**
- Quantum Gravity
- String Theory
- (Higher depth, less empirical support)

**Question for Review:** Should observations be depth 0, or should there be a theory-laden observation layer on top of raw sense data?

---

## 4. Cross-Domain Bridges

### 4.1 Philosophy → Mathematics ("formalizes")

**Criteria for "formalizes" edge:**
1. Philosophical concept A has a mathematical model B
2. B captures essential structure of A
3. Formal system allows derivations that match informal reasoning about A

**Examples:**
- Modal operators (◇, □) formalize metaphysical possibility/necessity
- Probability theory formalizes degrees of belief
- Set theory formalizes mereology (part-whole relations)
- Formal logic formalizes argument structure

**Weight:**
- 1.0: Widely accepted formalization (modal logic for modality)
- 0.5-0.9: Partially adequate or contentious formalization
- <0.5: Toy model or severely limited formalization

**Question for Review:** What makes a formalization "good"? Should we have criteria in metadata?

### 4.2 Mathematics → Physics ("models")

**Criteria for "models" edge:**
1. Mathematical structure A is used in physical theory B
2. A provides quantitative predictions
3. A's structure matches physical symmetries/constraints

**Examples:**
- Differential geometry models spacetime (GR)
- Hilbert spaces model quantum states
- Group theory models symmetries
- Probability theory models quantum measurements

**Weight:**
- 1.0: Essential to theory (can't formulate without it)
- 0.5-0.9: Important but not essential
- <0.5: Useful calculational tool but not fundamental

### 4.3 Philosophy → Physics ("philosophical_foundation")

**Criteria:**
1. Philosophical principle A grounds/justifies theory B
2. A is presupposed by B's interpretation

**Examples:**
- Empiricism → grounds inductive inferences in physics
- Realism about unobservables → justifies theoretical entities
- Principle of relativity → philosophical prior to SR/GR

**Weight:** Degree of dependence

**Question for Review:** Are these edges too speculative? Should philosophical foundations be explicit in the graph?

---

## 5. Contentious Choices & Open Questions

### 5.1 Areas Needing Review

**Epistemology:**
1. **Foundationalism vs Coherentism:** Current structure assumes foundationalism. How to represent coherentist positions?
2. **Basic beliefs:** What qualifies? Observations only? A priori intuitions?
3. **Justification transmission:** Does "supports" chain transitively? If A supports B (0.8) and B supports C (0.8), does A support C (0.64)?

**Mathematics:**
1. **Axiom system:** ZFC vs alternatives (type theory, category theory)?
2. **Constructive vs classical:** Should we mark which theorems require excluded middle?
3. **Proof formality:** Require fully formal proofs or accept informal mathematical reasoning?

**Physics:**
1. **Fundamentality:** Is QFT "more true" than Newtonian mechanics, or just more general?
2. **Observation theory-ladenness:** Are observations foundation (depth 0) or already theoretical?
3. **Instrumentalism:** Are theories truth-apt or just predictive instruments?

**Cross-Domain:**
1. **Formalization quality:** What makes a formalization adequate?
2. **Multiple formalizations:** If a concept has 2+ formalizations (e.g., probability: frequentist, Bayesian, logical), how to represent?
3. **Reduction:** Is mathematical modeling "reduction" or just "representation"?

### 5.2 Graph-Structural Questions

**Relation overlap:**
- When to use "entails" vs "proves"? (Entails is broader, proves requires formal derivation?)
- When to use "supports" vs "predicts"? (Supports for epistemic, predicts for empirical?)

**Weight interpretation:**
- Is weight subjective probability? Objective chance? Argumentative strength?
- Can weights be inter-agent comparable?

**Symmetry:**
- Should "equivalent" create one bidirectional edge or two directed edges?
- Should "attacks" be symmetric (A attacks B ↔ B attacks A)?

**Cycles:**
- Allowed in non-epistemic relations? (e.g., A defines B, B defines C, C defines A via interdefinition)
- How to handle in epistemic depth computation? (Already handled: assign reasonable depth)

---

## 6. Proposed Starting Commitments

### 6.1 Epistemology

**Commitment:** Modest foundationalism
- **Foundations:** Observations + a priori intuitions
- **Support chains:** Depth tracks inferential distance
- **Defeaters:** Attacks can undermine support without removing nodes

**Agnostic on:**
- Internalism vs externalism (represent both positions as nodes)
- Specific analysis of knowledge (JTB, safety, reliability all represented)

### 6.2 Mathematics

**Commitment:** Classical ZFC
- **Axioms:** ZFC as depth 0 (or depth 1 if logic is depth 0)
- **Logic:** Classical first-order logic with identity
- **Proofs:** Accept informal mathematical proofs with "proves" relation (weight < 1.0 if gaps)

**Agnostic on:**
- Platonism vs nominalism (meta-question, not in graph structure)
- Constructive alternatives (could add parallel branch later)

### 6.3 Physics

**Commitment:** Effective field theory hierarchy
- **Observations:** Depth 0
- **Theories:** Layered by domain of validity and empirical support
- **Relations:** Approximates, reduces_to, unifies show inter-theory connections

**Agnostic on:**
- Realism vs instrumentalism (represent theories, let interpretation be meta)
- Which unification is "correct" (represent competing theories)

### 6.4 Cross-Domain

**Commitment:** Liberal bridge edges
- **Formalizations:** Mark when philosophical concept has mathematical model
- **Models:** Mark when math structure is essential to physics theory
- **Weights:** Reflect quality/adequacy of formalization/modeling

**Criteria:**
- Formalization is "good" if formal derivations match informal arguments
- Modeling is "essential" if theory can't be formulated without it

---

## 7. Implementation Guidelines

### 7.1 When Adding Nodes

**Foundation node criteria:**
- No incoming epistemic edges (supports, proves, entails, predicts)
- Justification is "obvious", "self-evident", or "observational"
- Examples: "2+2=4" (definition), "I see red" (observation), "A→A" (logical axiom)

**Derived node criteria:**
- Has incoming epistemic edges showing justification
- Depth computed from longest support chain

### 7.2 When Adding Edges

**Check:**
1. Does this relation type match the semantic definition?
2. Is the weight appropriate (0-1 scale, interpretation clear)?
3. Does this create a justification chain (affects depth)?
4. Are there defeaters/attacks to also represent?

### 7.3 Handling Disagreement

**For contentious claims:**
- Add the claim node with metadata indicating controversy
- Add support edges from proponents
- Add attack edges from opponents
- Let the graph show epistemic conflict (not resolve it)

**Example:**
```
Modal Realism (Lewis)
  ← supports (0.7) — "Semantic utility" argument
  ← attacks (0.8) — "Ontological profligacy" objection
  ← attacks (0.7) — "Incredulous stare"
```

Graph shows the debate, doesn't settle it.

---

## 8. Questions for Multi-Agent Review

### 8.1 Structural Questions

1. **Is modest foundationalism the right framework?**
   - Alternative: Could coherentism be represented with high-weight mutual support cycles?
   - Alternative: Could we mark some nodes as "mutually supporting cluster" without foundations?

2. **Should logic be in the graph or meta-system?**
   - Option A: Logic axioms as depth 0 nodes (explicit)
   - Option B: Logic assumed, not represented (implicit)
   - Trade-off: Explicit shows dependencies, implicit reduces clutter

3. **How to handle theory-ladenness of observation?**
   - Are observations "direct" (depth 0) or already interpreted (depth 1+)?
   - Example: "Gravitational lensing observed" presupposes light theory

### 8.2 Relation Semantic Questions

4. **"supports" vs "proves" distinction:**
   - Is this the right boundary? (epistemic vs deductive?)
   - Should there be gradations? (strong_supports, weak_supports?)

5. **Weight interpretation:**
   - Subjective credence? Objective probability? Argumentative strength?
   - Should weights be normalized across all edges or context-dependent?

6. **Transitivity handling:**
   - Should "supports" edges compose? If A→0.8→B and B→0.8→C, is there implicit A→0.64→C?
   - Or leave composition to depth computation?

### 8.3 Content Questions

7. **Starting foundations for each domain:**
   - **Epistemology:** What are the actual foundational claims? "I have perceptual experiences"? "Cogito ergo sum"?
   - **Mathematics:** Just ZFC axioms? Or include logic separately?
   - **Physics:** Specific observations (Eddington 1919) or general principles (conservation laws)?

8. **Cross-domain bridges:**
   - Which formalizations are essential to include?
   - Modal logic → metaphysics: essential
   - Probability → epistemology: essential
   - What else?

9. **Controversial areas to represent:**
   - Should we include speculative physics (string theory, multiverse)?
   - Should we include fringe epistemology?
   - Criteria: Minimum threshold of academic respectability?

### 8.4 Practical Questions

10. **Granularity:**
    - Fine-grained: "Axiom of pairing" as separate node
    - Coarse-grained: "ZFC axioms" as single node
    - Recommendation?

11. **Proof detail:**
    - Should we model individual proof steps as nodes?
    - Or just theorem → proof_id → conclusion?

12. **Metadata richness:**
    - What metadata is essential? (difficulty, importance, certainty)
    - What's optional? (sources, dates, proponents)

---

## 9. Proposed Resolution Process

### 9.1 Multi-Agent Review

**Send this document + RELATION_SEMANTICS.md + SEED_GRAPH_SPEC.md to:**
1. Claude (fresh context, philosophy-strong)
2. GPT-4 or GPT-5 (different training, broad knowledge)
3. Optional: Specialized philosophy/math model if available

**Ask each:**
- Critique the foundational commitments
- Suggest missing fundamental nodes
- Identify semantic ambiguities in relations
- Propose alternative structures

### 9.2 Synthesis

**Create FOUNDATION_REVIEW_SYNTHESIS.md:**
- **Consensus:** What all reviewers agree on
- **Disagreements:** Where reviewers differ (your judgment call)
- **Gaps identified:** Missing foundations all agents noted
- **Structural issues:** Problems with proposed framework
- **Recommendations:** Concrete changes to make

### 9.3 Revision

**Update:**
- This document (ONTOLOGICAL_FOUNDATION.md) with decisions
- RELATION_SEMANTICS.md with clarified semantics
- SEED_GRAPH_SPEC.md with revised node set

**Then:** Start building with confidence!

---

## 10. Success Criteria

**This foundation is good enough when:**

1. ✅ Philosophical commitments are explicit and justified
2. ✅ Relation semantics are clear and non-overlapping
3. ✅ Multiple expert AI systems have reviewed and critiqued
4. ✅ Major gaps/issues have been identified and addressed
5. ✅ You (the user) understand and endorse the choices
6. ✅ Structure supports intended use cases:
   - Visualizing justification chains
   - Exploring cross-domain connections
   - LLM-augmented reasoning
   - Personal knowledge management

**Not required:**
- Universal consensus (impossible in philosophy!)
- Complete certainty (foundational choices are contestable)
- Covering all possible positions (start focused, expand later)

---

## Appendix: Inspirations & References

**Epistemology:**
- SEP: [Foundationalist Theories of Epistemic Justification](https://plato.stanford.edu/entries/justep-foundational/)
- Pollock & Cruz: Contemporary Theories of Knowledge
- BonJour: The Structure of Empirical Knowledge

**Mathematics:**
- Kunen: Set Theory: An Introduction to Independence Proofs
- HoTT Book (alternative foundation)
- SEP: [Foundations of Mathematics](https://plato.stanford.edu/entries/philosophy-mathematics/)

**Physics:**
- Weinberg: Lectures on Quantum Mechanics (effective field theory)
- Rovelli: Reality Is Not What It Seems (relationalism)
- SEP: [Scientific Realism](https://plato.stanford.edu/entries/scientific-realism/)

---

**This document is a starting point for discussion. All commitments are provisional pending multi-agent review!**
