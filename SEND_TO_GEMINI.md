# What to Send to Gemini for Foundation Review

## 📦 Quick Start: Copy These 6 Files

**Location:** All in `docs/foundations/`

**Send to Gemini in this order:**

1. ✅ `CONTEXT_FOR_REVIEW.md` - Read this FIRST (project overview)
2. ✅ `MULTI_AGENT_REVIEW_TEMPLATE.md` - Your review task (26 questions)
3. ✅ `ONTOLOGICAL_FOUNDATION.md` - Framework to critique
4. ✅ `RELATION_SEMANTICS.md` - Edge semantics to validate
5. ✅ `SEED_GRAPH_SPEC.md` - 38 proposed nodes to evaluate
6. ✅ `SAMPLE_GRAPH.toon` - Concrete examples

**Optional:** Also include schemas (../schemas/*.json) and PRD.md (Sections 1-5)

---

## 💬 What to Say to Gemini

### Opening Message:

```
I'm building a formal knowledge graph system called Truth Mines that represents philosophy, mathematics, and physics as a unified directed graph.

Before populating the graph with 100+ nodes, I need my foundational commitments reviewed by multiple AI systems.

I've attached 6 documents:
1. CONTEXT_FOR_REVIEW.md - Start here (explains the project)
2. MULTI_AGENT_REVIEW_TEMPLATE.md - Your review task
3-5. Three foundation specifications to critique
6. SAMPLE_GRAPH.toon - Current example graph

Please read CONTEXT_FOR_REVIEW.md first, then provide systematic critique of the three foundation documents following the template structure.

Focus areas:
- Philosophical soundness of foundationalist framework
- Semantic clarity of 20+ edge relation types
- Completeness of 38 proposed seed nodes
- Practical usability for building 150+ node graph

Thank you for your systematic review!
```

---

## 🎯 What You'll Get Back

**Gemini should provide:**

✓ **Executive Summary** - Overall assessment
✓ **Strengths** - What works well
✓ **Critical Issues** - What MUST be fixed (prioritized)
✓ **Concerns by Section** - Epistemology, math, physics, relations
✓ **Missing Foundations** - Crucial nodes we overlooked
✓ **Ambiguities** - Where definitions unclear
✓ **Top 5 Priorities** - Most important changes

---

## 🔄 After Gemini Reviews

**Also send to:**
- **Claude** (fresh conversation) - Philosophy/epistemology focus
- **GPT-4 or GPT-5** - Mathematics/logic focus
- **Optional:** Perplexity or other AI

**Then:**
1. Create `FOUNDATION_REVIEW_SYNTHESIS.md`
2. Compare all reviews
3. Identify consensus vs disagreements
4. Make decisions on contentious points
5. Revise the three foundation documents
6. Create 38-node seed graph
7. Start building!

---

## ⚡ Quick Reference

**Files in `docs/foundations/`:**
```
REQUIRED (send these 6):
├── CONTEXT_FOR_REVIEW.md          ⭐ Read first
├── MULTI_AGENT_REVIEW_TEMPLATE.md ⭐ Review task
├── ONTOLOGICAL_FOUNDATION.md      ⭐ Critique this
├── RELATION_SEMANTICS.md          ⭐ Critique this
├── SEED_GRAPH_SPEC.md             ⭐ Critique this
└── SAMPLE_GRAPH.toon              📊 Examples

OPTIONAL (deeper context):
├── ../schemas/node.schema.json
├── ../schemas/edge.schema.json
├── ../.truth-mines/schema.toml
├── ../../PRD.md
└── ../../README.md
```

**Time estimate:** Gemini needs ~1.5-2 hours for comprehensive review

---

## ✨ Why This Matters

**Getting this right means:**
- ✅ Consistent relation usage across 100+ nodes
- ✅ Coherent foundational structure
- ✅ No massive refactoring needed later
- ✅ Philosophically defensible commitments
- ✅ Clear guidance for content creation

**Getting this wrong means:**
- ❌ Semantic drift (mixing "supports" and "proves")
- ❌ Structural incoherence (unclear foundations)
- ❌ Refactoring 100 edges because semantics were vague
- ❌ Epistemic confusion

**1-2 days of review prevents weeks of refactoring!**

---

## 🚀 After Review is Complete

**You'll have:**
- Validated foundational framework
- Clarified relation semantics
- Refined seed graph (38 nodes)
- Confidence to build 150+ nodes rapidly
- Multi-agent validated structure

**Then:**
- Build epistemology cluster (50 nodes)
- Build mathematics cluster (50 nodes)
- Build physics cluster (30 nodes)
- Let Epic 9 UX needs emerge from real use

---

**READY TO SEND! 🎊**

Copy the 6 required files from `docs/foundations/` to Gemini and request systematic critique!
