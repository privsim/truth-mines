# Multi-Agent Review Template for Truth Mines Foundations

**Purpose:** Structured template for getting systematic critiques from multiple AI systems.

**Usage:** Send this + the three foundation documents to 2-3 different AI agents.

---

## Review Request

I'm building a formal knowledge graph system called **Truth Mines** that represents philosophy, mathematics, and physics in a unified directed graph structure.

**Before populating the graph with 100+ nodes, I need foundational commitments reviewed.**

I've created three specification documents:
1. **ONTOLOGICAL_FOUNDATION.md** - Philosophical and mathematical framework
2. **RELATION_SEMANTICS.md** - Precise definitions for 20+ edge relation types
3. **SEED_GRAPH_SPEC.md** - Proposed 38 foundational nodes

**Your task:** Critique these foundations and help identify problems before I build on them.

---

## Context: The Graph System

**Data Model:**
- **Nodes:** Propositions, theorems, theories, observations, concepts (JSON files)
- **Edges:** Typed directed edges with weights (supports, proves, attacks, entails, etc.)
- **Depth:** Computed from "foundational" nodes via epistemic edges (supports, proves, entails, predicts)
- **Domains:** Philosophy, mathematics, physics (with cross-domain bridges)

**Visualization:**
- 3D "truth mine" where depth = epistemic distance from foundations
- 2D overview with filtering and search
- Interactive exploration with hover previews and path travel

**Purpose:**
- Personal knowledge management
- Argument structure visualization
- LLM-augmented reasoning (export subgraphs as TOON)
- Cross-domain connection discovery

---

## Review Questions

### Section 1: Epistemological Framework

**Context:** ONTOLOGICAL_FOUNDATION.md proposes modest foundationalism as structural framework.

**Questions:**

1. **Is modest foundationalism appropriate for a knowledge graph structure?**
   - Does it make sense to have "depth 0" foundation nodes?
   - Alternative: Could coherentism be represented (mutual support cycles)?
   - How would you structure justification chains?

2. **What should be depth 0 (foundational)?**
   - Observations? ("I see red")
   - A priori intuitions? ("A → A")
   - Self-evident truths? ("I think, therefore I am")
   - Or is all knowledge theory-laden (no true foundations)?

3. **Are the proposed relation semantics for "supports", "attacks", "entails" clear and distinct enough?**
   - Where might they overlap confusingly?
   - Are there important epistemic relations missing?

4. **For the Gettier debate specifically:**
   - Are the proposed nodes (EP004-EP011) the right ones?
   - What's missing? (Virtue epistemology? Contextualism?)
   - Is "attacks" the right relation for Gettier → JTB?

### Section 2: Mathematical Framework

**Context:** ONTOLOGICAL_FOUNDATION.md proposes ZFC set theory + classical first-order logic.

**Questions:**

5. **Is ZFC the right foundation for a knowledge graph?**
   - Alternative: Type theory (HoTT, Martin-Löf)?
   - Alternative: Category theory?
   - Should we support multiple foundations in parallel?

6. **Should logic be explicit in the graph (depth 0 nodes) or implicit (meta-system)?**
   - If explicit: Which axioms/rules to include?
   - If implicit: Does this hide important dependencies?

7. **"proves" vs "entails" distinction - is this the right boundary?**
   - Proves = formal derivation in specified axiom system
   - Entails = logical implication (broader)
   - Does this work? Or too confusing?

8. **For the proposed math nodes (MA001-MA014):**
   - Is this the right starting set?
   - Too many axioms? Too few?
   - Should Gödel's incompleteness be in the seed (it's metamathematical)?

### Section 3: Physics Framework

**Context:** Effective field theory hierarchy with observations as foundations.

**Questions:**

9. **Are observations really "foundational" (depth 0)?**
   - Or are they theory-laden (already interpreted)?
   - Example: "Gravitational lensing observed" presupposes light propagation theory
   - How to handle this?

10. **Is effective field theory hierarchy the right structure?**
    - Alternative: Historical development (Galileo → Newton → Einstein)?
    - Alternative: Pure reductionism (everything → QFT)?
    - Which best represents physics knowledge?

11. **Theory replacement vs approximation:**
    - Is Newton "wrong" or "approximately right"?
    - Does "approximates" accurately capture the relationship?
    - Or should we say "reduces_to" in appropriate limits?

12. **For the proposed physics nodes (PH001-PH009):**
    - Is this covering the essential theories?
    - Jumping too quickly from Newton to QM/GR?
    - Should we include Maxwell, thermodynamics in seed?

### Section 4: Cross-Domain Bridges

**Context:** Three bridge nodes proposed (formal systems, modal logic, differential geometry).

**Questions:**

13. **What makes a good "formalization"?**
    - Is "modal logic formalizes possibility" a good bridge?
    - Criteria: Captures essential structure? Enables derivations?
    - How to assess quality (the weight)?

14. **What bridges are essential for the seed graph?**
    - Probability theory? (epistemology ↔ math ↔ physics)
    - Set theory? (formalizes mereology)
    - Group theory? (symmetries in physics)
    - What else?

15. **Should philosophical foundations of physics be explicit?**
    - "Empiricism → grounds scientific method"
    - "Realism → justifies theoretical entities"
    - Or is this too speculative for the graph?

### Section 5: Relation Semantics

**Context:** RELATION_SEMANTICS.md defines 20+ edge types precisely.

**Questions:**

16. **Are the relation definitions precise enough to use consistently?**
    - Where are ambiguities?
    - Which relations might overlap confusingly?

17. **Weight interpretation:**
    - Is subjective probability the right interpretation?
    - Should weights be normalized globally or context-dependent?
    - How to handle inter-personal disagreement on weights?

18. **Do we have too many or too few relation types?**
    - Too many: Confusion about which to use
    - Too few: Can't express important distinctions
    - Just right: ...?

19. **Transitivity specifications:**
    - Are the transitivity properties correct?
    - Should "supports" compose (A supports B, B supports C → A supports C)?
    - If yes, how to compute composite weight?

### Section 6: Structural & Practical

20. **Granularity:**
    - Should "ZFC axioms" be one node or 9 separate nodes?
    - Should "Law of Cosines" be separate from "Pythagorean theorem" or generalization edge enough?
    - What's the right level of detail?

21. **Handling controversy:**
    - For contested claims, should we:
      - Include with both supporting and attacking edges? (Proposed)
      - Flag in metadata as "controversial"?
      - Have confidence/credence field?
      - Other approaches?

22. **Proof detail:**
    - Should proofs be:
      - Black box (just edge: axioms → theorem)?
      - Referenced (edge with proof_id in metadata)?
      - Explicit (individual proof steps as nodes)?

23. **Evolution and refactoring:**
    - If we discover our foundational choices are wrong (e.g., should have used type theory)?
    - How hard to refactor?
    - Should we design for easier foundation swapping?

### Section 7: Missing Perspectives

24. **What major philosophical perspectives are not represented?**
    - Pragmatism?
    - Phenomenology?
    - Eastern philosophy?
    - Should seed graph include these or add later?

25. **What mathematical foundations are we ignoring?**
    - Constructive mathematics (intuitionism)?
    - Paraconsistent logic?
    - Should these be parallel branches or alternatives?

26. **What physics we're leaving out:**
    - Statistical mechanics?
    - Cosmology?
    - Quantum gravity approaches (string, loop)?
    - Too early to include, or should seed hint at these?

---

## Review Output Format

**Please structure your review as:**

### ✅ Strengths

What works well in these foundational commitments?

### ⚠️ Concerns

What are the biggest problems or risks with this approach?

### 🔍 Gaps

What crucial foundations are missing?

### 💡 Suggestions

Concrete improvements to make before building.

### 🤔 Ambiguities

Where are the semantic definitions unclear or ambiguous?

### 🎯 Priorities

If I can only address 3-5 issues from your review, which are most critical?

---

## Specific Prompts for Different Agents

### Prompt for Philosophy-Strong Agent (Claude, etc.)

"Focus on the epistemological framework. Is modest foundationalism defensible? What am I missing in the Gettier debate? How should I represent coherentism if users want it? Are the relation semantics philosophically sound?"

### Prompt for Mathematics-Strong Agent (GPT-4, etc.)

"Focus on the mathematical foundations. Is ZFC the right choice? Should logic be explicit? Are the proof semantics rigorous enough? What basic theorems am I missing that would cause problems later?"

### Prompt for Physics-Strong Agent

"Focus on the physics structure. Is effective field theory hierarchy the right frame? Should observations really be depth 0? Is my handling of theory reduction/approximation correct? What am I missing?"

### Prompt for Integration-Focused Agent

"Focus on cross-domain bridges. What makes a good formalization? Are the three proposed bridges enough? What other bridges are essential? How should philosophical foundations of science be represented?"

---

## Synthesis Process

### After Getting 2-3 Reviews

**Create FOUNDATION_REVIEW_SYNTHESIS.md with:**

**Consensus Points:**
- What all reviewers agreed on (high confidence)

**Disagreements:**
- Where reviewers differed (need your judgment)
- Present both sides
- Your tentative decision

**Critical Issues:**
- Problems multiple reviewers identified
- Prioritized by severity

**Recommended Changes:**
- Concrete revisions to make
- New nodes to add
- Relation semantics to clarify
- Edges to reconsider

**Open Questions:**
- Issues raised but not resolved
- Flag for future consideration

### Then Revise

1. Update ONTOLOGICAL_FOUNDATION.md with final commitments
2. Update RELATION_SEMANTICS.md with clarified semantics
3. Update SEED_GRAPH_SPEC.md with revised node list
4. **Mark as REVIEWED** and date stamp
5. Begin content creation with confidence!

---

## Example Review (What Good Feedback Looks Like)

**From Agent A:**

✅ **Strengths:** Modest foundationalism is pragmatic for graph structure. Relation semantics are mostly clear.

⚠️ **Concerns:** Theory-laden observation problem not adequately addressed. Should observations be depth 1 (interpreted) rather than depth 0 (direct)?

🔍 **Gaps:** Missing probability theory (essential bridge between epistemology and physics). Missing skepticism as epistemological challenge.

💡 **Suggestions:** Add "Probability theory" as bridge node. Add "Skeptical challenge" as attack on empirical knowledge. Clarify "tests" vs "predicts" - maybe collapse into one relation?

🤔 **Ambiguities:** "supports" weight interpretation vague. Is 0.8 my credence? Objective evidential strength? Inter-agent comparable?

🎯 **Priorities:** (1) Add probability theory, (2) Clarify observation depth, (3) Define weight interpretation.

---

**This review would be actionable and help refine the foundations!**

---

## Timeline

**Suggested:**
1. **Send reviews:** (1-2 hours to prepare, send)
2. **Wait for responses:** (async, could be minutes to hours)
3. **Synthesize:** (2-3 hours to analyze, compare, decide)
4. **Revise documents:** (1-2 hours to update)
5. **Validate with schema:** (scripts already work!)
6. **Begin building:** (Week 2+, with confidence)

**Total:** ~1 day to get solid foundations with multi-agent validation.

---

**Ready to send for review!**

Copy this template + the three foundation docs to fresh AI conversations and collect systematic critiques.
