# Truth Mines - Foundational Documents

This directory contains specifications for the philosophical, mathematical, and physical foundations of the Truth Mines knowledge graph.

**Purpose:** Establish clear ontological commitments and relation semantics **before** building extensive content, validated by multi-agent review.

---

## Documents

### 1. ONTOLOGICAL_FOUNDATION.md (~4,500 words)

**Defines:**
- Epistemological framework (modest foundationalism)
- Mathematical axiom system (ZFC + classical logic)
- Physical theory structure (effective field theory hierarchy)
- Cross-domain bridge principles
- Open questions for review

**Key Decisions:**
- What counts as "foundational" (depth 0)?
- How justification chains work
- Which axiom systems to use
- How theories relate (approximation, reduction, unification)

### 2. RELATION_SEMANTICS.md (~3,800 words)

**Defines:**
- Precise semantics for all 20+ edge relation types
- Usage criteria (when to use "proves" vs "entails")
- Weight interpretation (0-1 scale meanings)
- Transitivity properties
- Metadata standards for each relation
- Decision trees for choosing relations

**Relations Covered:**
- Universal: supports, attacks, entails, defines, cites
- Philosophy: presupposes, refutes
- Mathematics: proves, lemma_for, generalizes, equivalent
- Physics: predicts, tests, approximates, reduces_to, unifies
- Bridges: formalizes, models, philosophical_foundation

### 3. SEED_GRAPH_SPEC.md (~3,200 words)

**Proposes:**
- 38 specific foundational nodes:
  - 12 epistemology (JTB debate, post-Gettier solutions)
  - 14 mathematics (logic, ZFC axioms, basic theorems)
  - 9 physics (observations, classical, modern theories)
  - 3 cross-domain bridges
- ~60 edges connecting them
- Rationale for each inclusion
- Alternative structures to consider

**Provides:**
- Concrete starting point for content creation
- Testable foundation
- Basis for multi-agent review

### 4. MULTI_AGENT_REVIEW_TEMPLATE.md

**Provides:**
- Structured review request
- 26 specific questions across all areas
- Review output format
- Prompts tailored to different AI strengths
- Synthesis process instructions

**Use:**
- Send to 2-3 different AI systems
- Collect systematic critiques
- Synthesize feedback
- Revise foundation documents

---

## Process

### Step 1: Read Foundation Documents

Review all three specs:
1. ONTOLOGICAL_FOUNDATION.md (framework)
2. RELATION_SEMANTICS.md (edge semantics)
3. SEED_GRAPH_SPEC.md (concrete nodes)

Understand the commitments and open questions.

### Step 2: Multi-Agent Review

**Send to multiple AI systems:**

**Agent 1 (e.g., Claude - Philosophy Focus):**
```
[Copy MULTI_AGENT_REVIEW_TEMPLATE.md]
[Attach all three foundation docs]
[Use philosophy-focused prompt]
```

**Agent 2 (e.g., GPT-4/5 - Mathematics Focus):**
```
[Same template + docs]
[Use mathematics-focused prompt]
```

**Agent 3 (Optional - Physics/Integration Focus):**
```
[Same template + docs]
[Use integration-focused prompt]
```

### Step 3: Collect & Synthesize

**Create:** `FOUNDATION_REVIEW_SYNTHESIS.md`

**Include:**
- Summary of each agent's review
- Consensus points (all agree)
- Disagreements (agents differ)
- Critical issues (multiple agents flagged)
- Your decisions on contentious points
- Action items (concrete changes to make)

### Step 4: Revise

**Update the three foundation documents based on synthesis:**
- Address critical issues
- Clarify ambiguities
- Add missing foundations
- Refine relation semantics

**Mark as:** `REVIEWED - [Date]` and note which agents reviewed.

### Step 5: Validate with Implementation

**Create the seed graph:**
1. Implement 38 nodes as JSON files
2. Create ~60 edges in JSONL files
3. Run: `python scripts/validate.py --strict`
4. Fix any schema violations
5. Commit as "Initial seed graph (multi-agent reviewed)"

### Step 6: Test with LLM

**Export and query:**
```bash
python scripts/extract_subgraph.py --node EP004 --depth 3 --output seed.toon
```

**Send to LLM:**
"Here's my knowledge graph foundation. Can you explain the Gettier problem and post-Gettier solutions based on this structure?"

**If LLM can reason about it clearly:** ✅ Foundation is sound!

**If LLM is confused:** Revise for clarity.

---

## Decision Points Requiring Your Judgment

**These documents present options but need YOUR philosophical commitments:**

### Epistemology

**You must decide:**
- Are you a foundationalist or coherentist?
- What's foundational: observations, a priori, both?
- Which post-Gettier account do you lean toward?
- Include skepticism as serious challenge or just as historical position?

### Mathematics

**You must decide:**
- ZFC or type theory or both?
- Classical or constructive logic?
- How formal must "proves" be?
- Include intuitionistic alternatives?

### Physics

**You must decide:**
- Are observations "direct" or theory-laden?
- Realism or instrumentalism about theories?
- Historical development or systematic structure?
- Include speculative theories (string theory, multiverse)?

### Bridges

**You must decide:**
- Which formalizations are "good enough" to include?
- How much philosophy of science to represent?
- Should mathematical Platonism be in the graph?

**The multi-agent review will:**
- Present different perspectives
- Identify consequences of choices
- Suggest alternatives
- **But final decisions are yours!**

---

## Anti-Patterns to Avoid

### ❌ Building Without Foundation

**Don't:**
- Start adding nodes without clear relation semantics
- Mix "supports" and "proves" inconsistently
- Create edges without understanding transitivity
- Build 100 nodes then discover foundational incoherence

**Result:** Massive refactoring, inconsistent structure

### ❌ Paralysis by Analysis

**Don't:**
- Endlessly revise foundations without building
- Seek perfect consensus (impossible in philosophy!)
- Wait for complete certainty

**Result:** Never actually populate the graph

### ❌ Ignoring Review Feedback

**Don't:**
- Dismiss critiques without consideration
- Cherry-pick only agreeable feedback
- Ignore multiple agents raising same issue

**Result:** Blind spots become structural problems

---

## Success Criteria

**Foundations are ready when:**

✅ Multi-agent review complete (2-3 different AI systems)
✅ Major critiques addressed (not all, but serious ones)
✅ Relation semantics clear enough to use consistently
✅ You understand and endorse the commitments
✅ Seed graph (38 nodes) created and validates
✅ LLM can reason about seed graph via TOON export
✅ Ready to build with confidence!

**Not required:**
- Universal consensus (philosophy has none!)
- Addressing every critique (some are philosophical disagreements)
- Perfect certainty (knowledge graph can evolve)

---

## Timeline

**Recommended:**

**Day 1 (Today):**
- Read all three foundation documents carefully
- Identify your own philosophical commitments
- Note where you're uncertain or want external perspective

**Day 1-2 (Async):**
- Send documents to 2-3 AI systems for review
- Wait for comprehensive responses

**Day 2:**
- Read all reviews carefully
- Create FOUNDATION_REVIEW_SYNTHESIS.md
- Make decisions on contentious points

**Day 3:**
- Revise foundation documents based on synthesis
- Mark as REVIEWED
- Create seed graph (38 nodes, 60 edges)
- Validate with scripts

**Week 2+:**
- Build out from seed graph
- 10-20 nodes per session
- Follow relation semantics rigorously
- Discover what Epic 9 UX features you actually need!

---

## Current Status

**✅ Foundation documents created** (this session)
**⏳ Multi-agent review** (next step - YOU do this)
**⏳ Synthesis** (after reviews come back)
**⏳ Implementation** (create 38-node seed graph)
**⏳ Expansion** (build to 100-200 nodes)

---

## Questions?

**If uncertain about:**
- How to send to multiple AIs (just copy-paste to different conversations)
- How to synthesize conflicting feedback (your philosophical judgment!)
- Whether to address every critique (no - focus on critical issues)
- When to stop revising and start building (after synthesis, even if imperfect)

**Remember:** These foundations can evolve! Knowledge graphs are living documents. Start solid, refine as you build.

---

**Next Step:** Send MULTI_AGENT_REVIEW_TEMPLATE.md + foundation docs to 2-3 AI systems and collect critiques!
