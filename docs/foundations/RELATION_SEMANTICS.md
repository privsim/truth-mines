# Relation Semantics for Truth Mines

**Purpose:** Precise semantic definitions for all edge relation types in the knowledge graph.

**Status:** DRAFT - Awaiting multi-agent review

**Use:** Reference when deciding which relation to use for a new edge.

---

## Universal Relations

### supports(A, B, weight)

**Semantic Definition:**
Node A provides epistemic support for node B. If A is true/justified, this raises the probability or justification level of B.

**Usage Criteria:**
- Use for: Arguments, evidence, reasons
- Don't use for: Deductive proofs (use "proves"), predictions (use "predicts")
- Weight: Your subjective degree of support (0-1)
  - 0.9-1.0: A nearly entails B (very strong)
  - 0.7-0.89: Strong argument
  - 0.5-0.69: Moderate support
  - 0.3-0.49: Weak but relevant
  - <0.3: Marginal relevance

**Examples:**
```json
{"f":"gettier_cases","t":"jtb_insufficient","relation":"supports","w":0.95,"domain":"philosophy"}
```
Gettier cases strongly support that JTB is insufficient for knowledge.

```json
{"f":"empirical_success","t":"scientific_realism","relation":"supports","w":0.7,"domain":"philosophy"}
```
Scientific success moderately supports realism.

**Properties:**
- **Transitivity:** Weak (weights don't simply multiply)
- **Symmetry:** Asymmetric (A supports B ≠ B supports A)
- **Defeaters:** Can be undermined by "attacks" edges
- **Additivity:** Multiple support edges can combine (don't auto-compute, just show multiple paths)

---

### attacks(A, B, weight)

**Semantic Definition:**
Node A is evidence or argument against node B. If A is true/justified, this lowers the probability or justification of B.

**Usage Criteria:**
- Use for: Counterarguments, refutations, counterexamples, conflicting evidence
- Don't use for: Logical contradictions (use metadata to flag inconsistency)
- Weight: Strength of counterargument

**Examples:**
```json
{"f":"gettier1963","t":"jtb_analysis","relation":"attacks","w":0.95,"domain":"philosophy"}
```
Gettier's counterexamples strongly attack JTB.

```json
{"f":"mercury_perihelion","t":"newtonian_gravity","relation":"attacks","w":0.6,"domain":"physics"}
```
Mercury's orbit anomaly attacks Newtonian gravity (partially).

**Properties:**
- **Transitivity:** None (A attacks B, B attacks C doesn't mean A attacks C)
- **Symmetry:** Can be symmetric (mutual attack) but not required
- **Coexistence:** A can attack B while B still has net support from other nodes
- **Resolution:** Graph shows conflict, doesn't resolve it

**Design Decision:** Should we have "refutes" (total defeat) vs "attacks" (partial)? Or use weight to indicate strength?

---

### entails(A, B, weight)

**Semantic Definition:**
Node A logically entails node B. If A is true, B must be true (material or formal implication).

**Usage Criteria:**
- Use for: Logical implications, conceptual necessities
- Weight:
  - 1.0 for strict entailment (A → B is logically necessary)
  - <1.0 for probabilistic or defeasible entailment
- Difference from "proves": Entails is broader (includes material conditionals), proves requires formal derivation

**Examples:**
```json
{"f":"knowledge_is_jtb","t":"knowledge_requires_truth","relation":"entails","w":1.0,"domain":"philosophy"}
```
If knowledge is JTB, it conceptually entails that knowledge requires truth.

```json
{"f":"special_relativity","t":"time_dilation","relation":"entails","w":1.0,"domain":"physics"}
```
SR entails time dilation.

**Properties:**
- **Transitivity:** Perfect (A entails B, B entails C → A entails C)
- **Monotonicity:** Adding premises preserves entailment
- **Weight composition:** weight(A→C) = min(weight(A→B), weight(B→C))

---

### defines(A, B, weight)

**Semantic Definition:**
Node A provides a definition for concept/term in node B.

**Usage Criteria:**
- Use for: Definitional relationships, conceptual analyses
- Weight: Adequacy of definition
  - 1.0: Universally accepted definition
  - <1.0: Contested or partial definition

**Examples:**
```json
{"f":"jtb_analysis","t":"knowledge_concept","relation":"defines","w":0.4,"domain":"philosophy"}
```
JTB analysis is a (contested) definition of knowledge.

**Properties:**
- **Circularity:** Can create definition cycles (interdefinition) - acceptable
- **Multiple definitions:** Same concept can have multiple "defines" edges (representing different analyses)

---

### cites(A, B, weight)

**Semantic Definition:**
Node A references or cites node B (bibliographic relation).

**Usage Criteria:**
- Use for: Citation trails, intellectual history
- Weight: Significance of citation (1.0 for central, lower for passing reference)

**Examples:**
```json
{"f":"gettier1963","t":"plato_theaetetus","relation":"cites","w":0.8,"domain":"philosophy"}
```

**Properties:**
- Non-epistemic (doesn't affect depth)
- Useful for tracking idea genealogy

---

## Domain-Specific Relations

### Philosophy

#### presupposes(A, B, weight)

**Semantic:** A conceptually presupposes B (A cannot be understood/evaluated without B).

**Examples:**
```json
{"f":"knowledge_analysis","t":"truth_concept","relation":"presupposes","w":1.0,"domain":"philosophy"}
```
Analyzing knowledge presupposes understanding truth.

---

#### refutes(A, B, weight)

**Semantic:** A is a philosophical refutation of B (stronger than attacks - aims for total defeat).

**Usage:** For direct rebuttals, counterexamples, reductios

**Difference from attacks:** Refutes claims total defeat, attacks allows partial undermining.

**Question for Review:** Do we need both attacks and refutes? Or just use attacks with weight?

---

### Mathematics

#### proves(A, B, weight)

**Semantic:** A is a formal proof of B within a specified axiom system.

**Refinement (Gemini 3 Pro):** `proves` implies a finite sequence of derivation steps exists *within the graph or referenced text*. This is syntactic/constructive. Contrast with `entails` (semantic, may not have explicit derivation).

**Usage Criteria:**
- **Requires:** Axiom system specified in metadata
- **Proof exists:** There must be a derivation sequence (formal, informal, or proof sketch)
- **Weight:**
  - 1.0: Complete formal proof
  - 0.8-0.99: Proof with minor gaps
  - 0.5-0.79: Proof sketch (informal but convincing)
  - <0.5: Claimed proof with significant gaps

**Examples:**
```json
{"f":"fundamental_theorem_algebra_proof","t":"fundamental_theorem_algebra","relation":"proves","w":1.0,"domain":"mathematics","metadata":{"axiom_system":"ZFC"}}
```

**Properties:**
- **Transitivity:** Perfect (proofs compose)
- **Formality:** Should reference proof object or ID
- **Axiom-relative:** Different axiom systems can give different proof weights

**Proves vs. Entails:**
- `proves`: Syntactic - a derivation exists
- `entails`: Semantic - the logical connection holds regardless of whether we have a derivation

---

#### lemma_for(A, B, weight)

**Semantic:** A is a lemma used in the proof of B.

**Usage:** When A is proven specifically to enable proof of B

**Weight:** 1.0 if A is proven, <1.0 if A is assumed

**Alternative Design:** Could use "proves" with metadata {"role": "lemma"}?

---

#### generalizes(A, B, weight)

**Semantic:** B is a generalization of A (A is a special case of B).

**Examples:**
```json
{"f":"pythagorean_theorem","t":"law_of_cosines","relation":"generalizes","w":1.0,"domain":"mathematics"}
```

**Direction:** A → B means "B generalizes A" (A is special case)

**Weight:** Completeness (1.0 if A is exactly a special case, lower if only partially)

---

#### equivalent(A, B, weight)

**Semantic:** A and B are logically or mathematically equivalent (A ↔ B).

**Usage:** For equivalent formulations, definitions, characterizations

**Weight:** 1.0 for strict equivalence, lower for approximate

**Symmetry Question:** Should create two edges (A→B and B→A) or one bidirectional?
- **Proposal:** Two directed edges for consistency (graph is directed)

---

### Physics

#### predicts(A, B, weight)

**Semantic:** Theory A predicts observation/phenomenon B.

**Usage Criteria:**
- A is a theory/model
- B is an observation, measurement, or phenomenon
- Prediction is quantitative (specificity increases weight)

**Weight Interpretation:**
- 1.0: Exact prediction within measurement uncertainty
- 0.8-0.99: Very close prediction
- 0.5-0.79: Qualitative or approximate prediction
- <0.5: Rough order of magnitude

**Examples:**
```json
{"f":"general_relativity","t":"gravitational_lensing","relation":"predicts","w":0.99,"domain":"physics"}
```
GR predicts lensing very precisely.

```json
{"f":"newtonian_gravity","t":"planetary_orbits","relation":"predicts","w":0.95,"domain":"physics"}
```
Newton predicts orbits accurately (but not perfectly - see Mercury).

**Falsification:** If prediction fails, create "attacks" edge from observation to theory!

---

#### tests(A, B, weight)

**Semantic:** Experiment/observation A is a test of theory B.

**Usage:** For experiments designed to test theories (outcome separate from prediction)

**Weight:** Significance of test (crucial experiments: 1.0)

**Difference from predicts:**
- "predicts" is theory→observation (directional claim)
- "tests" is experiment→theory (epistemic relation)

**Question:** Do we need both? Or just use "predicts" and infer testing?

---

#### approximates(A, B, weight)

**Semantic:** Theory A is an approximation of theory B under specified conditions.

**Usage Criteria:**
- **Metadata required:** domain_of_validity (e.g., low velocities, weak fields)
- **Weight:** Quality of approximation
  - 1.0: Exact limit
  - 0.8-0.99: Very good approximation
  - <0.8: Rough approximation

**Examples:**
```json
{"f":"newtonian_mechanics","t":"special_relativity","relation":"approximates","w":0.95,"domain":"physics","metadata":{"condition":"v << c"}}
```

---

#### reduces_to(A, B, weight)

**Semantic:** Theory A reduces to theory B (A is a limiting case or derivable from B).

**Usage:** For inter-theory reduction relations

**Weight:** Rigor of reduction (1.0 for proven reduction, lower for heuristic)

**Examples:**
```json
{"f":"classical_mechanics","t":"quantum_mechanics","relation":"reduces_to","w":0.9,"domain":"physics","metadata":{"limit":"ℏ→0"}}
```

---

#### explains(A, B, weight)

**Semantic:** Theory A explains phenomenon B (backward-looking unification).

**Gemini 3 Pro Addition:** This is the inverse of `predicts`. While `predicts` is forward-looking (theory → prediction), `explains` is backward-looking (theory → phenomenon already known).

**Usage Criteria:**
- A is a theory or principle
- B is an observed phenomenon or regularity
- A provides mechanistic or unifying explanation for why B occurs

**Weight Interpretation:**
- 1.0: Complete, widely accepted explanation
- 0.8-0.99: Very good explanation with minor gaps
- 0.6-0.79: Partial explanation
- <0.6: Speculative or incomplete explanation

**Examples:**
```json
{"f":"general_relativity","t":"gravitational_lensing_phenomenon","relation":"explains","w":0.99,"domain":"physics"}
```
GR explains why light bends around massive objects.

```json
{"f":"quantum_mechanics","t":"discrete_spectral_lines","relation":"explains","w":1.0,"domain":"physics"}
```
QM explains atomic spectra that classical physics could not.

**Explains vs. Predicts:**
- `explains`: Theory accounts for known phenomenon (historical/mechanistic)
- `predicts`: Theory forecasts unknown observation (prospective/empirical)
- Often both exist: Theory predicts X, then after observation, theory explains X

---

#### limiting_case_of(A, B, weight)

**Semantic:** Theory A is a limiting case of theory B (stronger than `approximates`).

**Gemini 3 Pro Addition:** This relation is stronger than `approximates` because it specifies a precise mathematical limit where A is derivable from B, not just empirically similar.

**Usage Criteria:**
- **Requires metadata:** Limiting condition (e.g., `v << c`, `ℏ → 0`, `G → 0`)
- A is mathematically derivable from B in the specified limit
- Not just empirical approximation - there's a formal reduction

**Weight Interpretation:**
- 1.0: Proven limiting case (formal derivation exists)
- 0.8-0.99: Strong arguments for limit, minor gaps
- <0.8: Heuristic or approximate limit

**Examples:**
```json
{"f":"newtonian_mechanics","t":"special_relativity","relation":"limiting_case_of","w":1.0,"domain":"physics","metadata":{"condition":"v << c"}}
```
Newtonian mechanics is the low-velocity limit of special relativity.

```json
{"f":"newtonian_gravity","t":"general_relativity","relation":"limiting_case_of","w":0.95,"domain":"physics","metadata":{"condition":"weak_field_limit"}}
```
Newtonian gravity is the weak-field, low-velocity limit of GR.

**Limiting_case_of vs. Approximates:**
- `limiting_case_of`: Formal mathematical derivation in limit
- `approximates`: Empirical similarity under conditions (may lack formal derivation)

---

## Bridge Relations

### formalizes(A, B, weight)

**Semantic:** Philosophical concept A has mathematical formalization B.

**Domain:** "bridge:phil→math"

**Usage Criteria:**
- A is a philosophical concept (modality, causation, belief, etc.)
- B is a mathematical structure (modal logic, causal models, probability)
- Formalization captures essential structure

**Weight Criteria (Gemini 3 Pro Refinement):**
- **1.0:** Isomorphism - perfect structural correspondence
- **0.9:** Near-perfect, minor aspects not captured
- **0.7:** Strong analogy - captures essential structure
- **0.5:** Weak analogy - captures some aspects, toy model
- **<0.5:** Metaphorical or highly incomplete

**Examples:**
```json
{"f":"metaphysical_modality","t":"modal_logic","relation":"formalizes","w":0.85,"domain":"bridge:phil→math"}
```

---

### models(A, B, weight)

**Semantic:** Mathematical structure A is used to model physical theory B.

**Domain:** "bridge:math→phys"

**Usage Criteria:**
- A is a mathematical structure (Hilbert space, differential manifold, etc.)
- B is a physical theory
- A is essential to formulating B

**Weight:** Essentiality
- 1.0: Cannot formulate theory without this math
- 0.5-0.99: Important but alternatives exist
- <0.5: Useful but not fundamental

**Examples:**
```json
{"f":"riemannian_geometry","t":"general_relativity","relation":"models","w":1.0,"domain":"bridge:math→phys"}
```
Can't formulate GR without Riemannian geometry.

---

### philosophical_foundation(A, B, weight)

**Semantic:** Philosophical principle A is presupposed by or grounds theory B.

**Domain:** "bridge:phil→X" (where X is any domain)

**Usage:** For philosophical commitments underlying theories

**Examples:**
```json
{"f":"empiricism","t":"scientific_method","relation":"philosophical_foundation","w":0.8,"domain":"bridge:phil→physics"}
```

**Question for Review:** Is this relation too vague? Should we be more specific about types of philosophical grounding?

---

## Relation Inverses

**Gemini 3 Pro Suggestion:** To enable backward reasoning (especially for LLMs reading TOON format), we define inverse relations without requiring explicit reverse edges.

**Implementation:** In `.truth-mines/schema.toml`, add `inverses` mapping:

```toml
[relations.inverses]
supports = "supported_by"
attacks = "attacked_by"
entails = "entailed_by"
proves = "proven_by"
predicts = "predicted_by"
explains = "explained_by"
defines = "defined_by"
generalizes = "specialized_by"
approximates = "approximated_by"
reduces_to = "reduces_from"
limiting_case_of = "limiting_case_yields"
formalizes = "formalized_by"
models = "modeled_by"
presupposes = "presupposed_by"
refutes = "refuted_by"
lemma_for = "has_lemma"
equivalent = "equivalent_to"  # symmetric
tests = "tested_by"
```

**Usage:**
- When LLM reads: "A supports B" → can infer "B is supported_by A"
- Graph traversal: Can find incoming edges without explicit storage
- Reduces storage: Don't need to create bidirectional edges explicitly

**Implementation Note:** This is metadata for reasoning, not storage. Actual edges remain directed. Renderer/query engine can use inverses for bidirectional queries.

---

## Usage Decision Tree

**When adding a new edge, ask:**

### Q1: Is this epistemic (affects justification)?

**YES → Continue to Q2**
**NO → Use "cites" or consider if edge is needed**

### Q2: Is this in mathematics with formal proof?

**YES → Use "proves" (with axiom system in metadata)**
**NO → Continue to Q3**

### Q3: Is this logical entailment?

**YES → Use "entails" (weight 1.0 if strict, lower if defeasible)**
**NO → Continue to Q4**

### Q4: Is this a theory predicting an observation?

**YES → Use "predicts" (weight = accuracy)**
**NO → Continue to Q5**

### Q5: Is this a counterargument or refutation?

**YES → Use "attacks" (weight = strength)**
**NO → Continue to Q6**

### Q6: Is this general epistemic support?

**YES → Use "supports" (weight = your judgment)**
**NO → Check domain-specific or bridge relations**

---

## Weight Interpretation Guidelines

### General Principle

**Weight represents:**
- **Epistemic relations:** Strength of justification (how much does A raise confidence in B?)
- **Logical relations:** Degree of necessity (1.0 = must be true, <1.0 = defeasible)
- **Empirical relations:** Accuracy of prediction or quality of approximation

**Calibration suggestions:**
- 1.0: Reserved for deductive certainty or perfect predictions
- 0.9-0.99: Very strong but not absolute
- 0.8-0.89: Strong
- 0.7-0.79: Good
- 0.6-0.69: Moderate
- 0.5-0.59: Weak but positive
- <0.5: Very weak (consider if edge is needed)

**Subjectivity:** Weights reflect your epistemic state. Two people can have different weights for same edge (that's okay - personal knowledge graph).

### Weight Absence

**If no weight provided:**
- Default interpretation: Moderate strength (0.7-0.8 equivalent)
- Some relations don't need weights (e.g., "defines" - it either defines or doesn't)

---

## Relation Composition & Transitivity

### Transitive Relations

**Perfect transitivity (chain freely):**
- `entails`: If A entails B and B entails C, then A entails C
  - Weight composition: min(w_AB, w_BC) or product
- `proves`: Proofs compose perfectly

**Weak transitivity (decay):**
- `supports`: Chains degrade
  - Weight composition: w_AB × w_BC × decay_factor (decay_factor < 1)
- `predicts`: Indirect predictions weaken

**No transitivity:**
- `attacks`: A attacks B, B attacks C doesn't imply A attacks C
- `defines`: Not transitive

### Practical Implication

**For depth computation:**
- Only use transitive epistemic relations: supports, proves, entails, predicts
- These accumulate to show justification distance

**For path finding:**
- Any edge can be in a path (graph traversal)
- Transitivity affects interpretation, not traversal

---

## Conflict Resolution

### Can Conflicting Edges Coexist?

**YES - by design!**

**Example:**
```
Scientific Realism
  ← supports (0.7) — No miracles argument
  ← supports (0.6) — Semantic argument
  ← attacks (0.8) — Pessimistic meta-induction
  ← attacks (0.7) — Underdetermination
```

**Graph shows epistemic conflict.** Depth computation uses support edges, visualizing attacks separately.

**Resolution:** User's judgment or meta-level node ("Realism debate unresolved")

---

## Domain-Specific Semantic Notes

### Philosophy Relations

**presupposes:** Conceptual dependency (A needs B to make sense)
- Example: "Knowledge" presupposes "Truth"
- Not epistemic (doesn't justify), but structural

**refutes:** Total philosophical defeat (stronger than attacks)
- Should we distinguish? Or use attacks(w=1.0)?

### Mathematics Relations

**lemma_for:** Structural (A is a step in proof of B)
- Could be subsumed by proves + metadata?

**generalizes:** Subset/superset relation on theorems
- Useful for showing theory structure

**equivalent:** Logical equivalence
- Question: One bidirectional edge or two directed?

### Physics Relations

**approximates:** Theory relation (A ≈ B under conditions)
**reduces_to:** Limiting case (A is limit of B)
**unifies:** B brings together A and C (e.g., QFT unifies QM and SR)

**Distinction:** Reduces vs approximates?
- **reduces_to:** Derivable limit (QM → classical as ℏ→0)
- **approximates:** Practical approximation (Newtonian for v<<c)

---

## Edge Metadata Standards

### Recommended Metadata Fields

**For "proves" edges:**
```json
{
  "f": "proof_node_id",
  "t": "theorem_id",
  "relation": "proves",
  "w": 1.0,
  "domain": "mathematics",
  "metadata": {
    "axiom_system": "ZFC",
    "proof_id": "proof_001",
    "formality": "informal"|"formal"|"sketch"
  }
}
```

**For "approximates" edges:**
```json
{
  "f": "newtonian_gravity",
  "t": "general_relativity",
  "relation": "approximates",
  "w": 0.95,
  "domain": "physics",
  "metadata": {
    "conditions": "weak gravitational fields, low velocities",
    "domain_of_validity": {"min_scale": 1e-10, "max_scale": 1e20}
  }
}
```

**For "supports" edges (optional but helpful):**
```json
{
  "f": "argument_node",
  "t": "conclusion_node",
  "relation": "supports",
  "w": 0.8,
  "domain": "philosophy",
  "metadata": {
    "argument_type": "abductive"|"inductive"|"analogical",
    "proponent": "author_name",
    "contested": true|false
  }
}
```

---

## Common Pitfalls & How to Avoid

### Pitfall 1: Relation Type Confusion

**Problem:** Using "entails" when you mean "supports"

**Test:** Ask "If A is true, MUST B be true?"
- If yes → entails
- If "makes more likely" → supports

### Pitfall 2: Weight Inconsistency

**Problem:** Using 0.9 for weak arguments and 1.0 for strong arguments (weight inflation)

**Solution:** Calibrate against examples:
- 1.0 = deductive proof or perfect prediction
- 0.9 = exceptionally strong (almost deductive)
- 0.8 = very strong
- 0.7 = strong
- Below 0.7 = moderate to weak

### Pitfall 3: Missing Attacks

**Problem:** Only adding supports edges (confirmation bias in graph!)

**Solution:** For controversial nodes, actively search for counterarguments and add attacks edges

**Example:** If adding "Scientific realism" with 3 supports, also add 2-3 attacks (underdetermination, pessimistic meta-induction, etc.)

### Pitfall 4: Circular "Proves"

**Problem:** A proves B, B proves A (invalid!)

**Check:** Proofs can't be circular (DAG in proof structure)

**Allowed:** A and B are equivalent (use "equivalent" relation, not proves)

---

## Validation Checks

### Automated Checks (Future Enhancement)

**Semantic validity checks:**
1. "proves" edges form DAG (no cycles)
2. Foundation nodes have no incoming epistemic edges
3. Bridge edges have correct domain format ("bridge:X→Y")
4. Weights are in [0,1]
5. Epistemic edges (supports, proves, entails, predicts) don't create contradictions (optional)

**Consistency checks:**
1. If A entails B (w=1.0) and A attacks B, flag inconsistency
2. If A proves B and A proves ¬B, flag contradiction
3. If support chain has product of weights < 0.1, flag weak justification

---

## Questions for Multi-Agent Review

### Semantic Clarity

1. **Are these definitions precise enough?**
   - Where are ambiguities?
   - What edge cases aren't covered?

2. **Overlap between relations:**
   - Is "proves" vs "entails" distinction clear?
   - Is "attacks" vs "refutes" distinction necessary?
   - Should "tests" and "predicts" be separate?

3. **Weight interpretation:**
   - Is subjective probability the right interpretation?
   - Should weights be normalized or context-dependent?
   - How to handle inter-subjective disagreement on weights?

### Structural Questions

4. **Transitivity:**
   - Is the transitivity specification correct for each relation?
   - Should "supports" compose at all?
   - How to compute composed weights?

5. **Conflict handling:**
   - Is allowing both supports and attacks edges the right approach?
   - Should there be a "balance" or "net support" computation?
   - Or leave conflict resolution to user interpretation?

6. **Missing relations:**
   - Are there important relation types we're missing?
   - Temporal relations (A came before B)?
   - Causal relations (A caused B to be discovered)?
   - Dependence relations?

### Practical Usage

7. **When in doubt:**
   - Default to "supports" or be more specific?
   - Use higher or lower weights?
   - Add edge or leave implicit?

8. **Evolution:**
   - How to refactor if relation semantics change?
   - Version relation definitions?

---

## Conclusion

**These semantics are proposed starting points.**

**Multi-agent review should:**
- Identify ambiguities
- Suggest refinements
- Catch overlooked cases
- Validate against philosophical/mathematical standards

**Once reviewed and revised:**
- These definitions guide all edge creation
- Consistency in usage enables meaningful queries
- Clear semantics enable LLM reasoning about the graph

**Goal:** Precise, usable, philosophically defensible relation semantics that support rigorous knowledge representation.

---

**Ready for multi-agent critique!**
