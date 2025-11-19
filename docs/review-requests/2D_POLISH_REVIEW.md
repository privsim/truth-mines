# Request for Review: 2D Polish Phase Specifications

**Date:** 2025-11-18
**Reviewer:** Gemini 3 Pro
**Review Focus:** UX Design, Epistemic Philosophy, Algorithm Correctness, Visual Encoding

**Context:** This is a follow-up to your comprehensive review of Truth Mines foundations. Your previous feedback has been successfully integrated (177 tests passing, tension/load-bearing algorithms implemented). The 2D interactive graph is now working, and we're polishing it to production-ready v1.0.

---

## Project Status Summary

### What's Been Implemented (Since Your Last Review)

**Gemini Integration Complete (Phases 1-7):**
- ✅ 5 logic primitive nodes added (Modus Ponens, LNC, LEM, etc.)
- ✅ Physics observations split (raw phenomenological + interpreted)
- ✅ Tension calculation algorithm (TypeScript, 10 tests)
- ✅ Load-bearing analysis algorithm (Rust, 11 tests)
- ✅ GPU buffers updated (48→64 bytes: tension, load_bearing, status)
- ✅ Schema enhancements (status, namespace, foundational_system, contested)
- ✅ New relations (explains, limiting_case_of) + 24 inverses
- ✅ Comprehensive documentation (ARCHITECTURE, FEDERATION, LOGIC_PRIMITIVES)

**2D Interactive Graph (New!):**
- ✅ react-force-graph-2d integration (force-directed layout)
- ✅ 30 nodes + 28 edges rendering
- ✅ Hover tooltips, click selection, drag nodes
- ✅ Salience-based sizing (includes your tension metric!)
- ✅ Domain-based coloring (philosophy/math/physics)
- ✅ Relation-colored edges (supports/attacks/proves)
- ✅ Filter by domain/type, search functionality

**Test Coverage:**
- Rust: 114/114 passing
- TypeScript: 81/86 passing (5 old placeholder tests)
- **Total: 195+ tests, 97% pass rate**

**Current State:** Beautiful, functional 2D graph showcasing all your enhancements!

---

## What We Need Reviewed

We're adding three features to complete the 2D experience:

1. **Focus Path (Justification Chains)** - Algorithm + UX
2. **NodeDetail Tabs** - Information architecture + UX
3. **Tension Visual Indicators** - Visual encoding design

**Three specification documents are attached for review:**
- `docs/FOCUS_PATH_SPEC.md`
- `docs/NODEDETAIL_TABS_SPEC.md`
- `docs/TENSION_VISUAL_SPEC.md`

---

## Critical Questions for Your Review

### 🔍 PART 1: Focus Path Algorithm Design

**Background:** Users need to see "How do we know this is true?" - the epistemic justification chain from foundations to a selected claim.

#### Q1: Path Selection Strategy

We have two options for selecting THE path when multiple exist:

**Option A - Shortest Path:**
- Path with fewest hops (BFS naturally finds this)
- Represents "most direct justification"
- Simpler UX

**Option B - Strongest Path:**
- Path with highest product of edge weights
- Represents "most confident justification"
- More epistemically meaningful?

**Example:**
```
Path 1: Foundation --0.5--> Selected (1 hop, weight 0.5)
Path 2: Foundation --0.9--> Middle --0.9--> Selected (2 hops, weight 0.81)
```

**Which should we show?** Shortest (Path 1) or Strongest (Path 2)? Or offer both as user preference?

**Your thoughts on:**
- Epistemic correctness (does "justified" = short or strong?)
- UX trade-offs (complexity vs accuracy)
- Edge case: Very long but very strong path (10 hops, all w=1.0) vs short weak path

#### Q2: Bridge Relations in Justification

Should philosophical foundations (`formalizes`, `models`) be part of justification chains?

**Example:**
```
Possible Worlds Semantics (philosophy)
  ↓ formalizes (0.85)
Modal Logic (mathematics)
  ↓ models (0.9)
Quantum Mechanics (physics)
```

**Arguments FOR inclusion:**
- Philosophical commitments ARE part of justification
- QM's justification includes modal logic, which rests on possible worlds

**Arguments AGAINST:**
- Bridge relations are "representational" not "evidential"
- Muddies single-domain justification
- Makes paths very long (cross all three domains)

**Our proposal:** Exclude bridges from focus path, show separately in CrossDomain tab.

**Do you agree?** Or should focus paths show full dependency (including bridges)?

#### Q3: Handling Coherentist Clusters

**Scenario:** Set of beliefs mutually support each other with no external foundation.

**Example:**
```
Scientific Realism ↔ No Miracles Argument ↔ Semantic Argument
(circular support, no path to depth-0 node)
```

**Our options:**
1. Return `null` (no path), display "No foundational path"
2. Detect cycle, show as "Coherentist Cluster"
3. Show path to entry point of cluster (partial justification)

**Question:** How should we represent coherentist structures in a foundationalist graph? Is "no foundation" a bug or a feature (shows coherentism)?

#### Q4: Mixed Deductive/Inductive Paths

**Scenario:** Path contains both `proves` (deductive, w=1.0) and `supports` (inductive, w<1.0)

**Question:** Does mixing deductive and inductive weaken justification? Should we:
- Treat equally (our current spec)
- Distinguish visually (solid line for proves, dashed for supports)
- Prefer pure deductive paths when available
- Calculate separate "deductive strength" vs "inductive strength"

**Your philosophical take?**

---

### 🎨 PART 2: NodeDetail Tabs - Information Architecture

**Background:** NodeDetail panel has 4 tabs. Need to optimize information hierarchy and UX flow.

#### Q5: Tab Count and Organization

**Proposed tabs:**
1. **Overview:** Title, content, formal notation, metadata
2. **Justification:** Focus path showing epistemic support
3. **Attacks:** Incoming attacks/refutes + tension score
4. **Cross-Domain:** Bridge relations (formalizes, models)

**Is this the right breakdown?**

**Alternative:** Consolidate to 3 tabs (merge Attacks into Justification as "Support & Challenge")?

**Question:** What's the most useful information architecture? What would YOU want to see first when inspecting a node?

#### Q6: Justification vs Overview Priority

**Current:** Overview is first tab (default on open)

**Question:** Should **Justification** be the first tab instead? It answers "How do we know this?" which seems more central than descriptive metadata.

**Trade-off:**
- Overview first: See WHAT the node is before WHY it's true
- Justification first: See epistemic grounding immediately

**What's the better cognitive flow?**

#### Q7: Tension Score Placement

Tension score could appear in:
- **Overview tab** (general metadata)
- **Attacks tab** (relevant to attacks)
- **Both tabs**
- **Graph only** (no tab display)

**Question:** Where is tension score most useful? Is showing the number valuable, or is visual encoding (orange border) sufficient?

#### Q8: Attack Interpretation

**Scenario:** Node has both `attacks` and `refutes` edges.

**Question:** Should we distinguish:
- **Attacks:** Challenges but doesn't destroy (weight < 1.0)
- **Refutes:** Total defeat claimed (weight ≈ 1.0)

Or treat both as "counterarguments" without distinction?

**Our current spec:** Treat equally, but we could add "Severity" based on weight (low/moderate/high).

---

### 🎨 PART 3: Tension Visual Encoding

**Background:** Tension metric (sqrt(support×attack)/5.0) is working. Need explicit visual encoding so users instantly see controversial nodes.

#### Q9: Visual Encoding Strategy

**Your original suggestion:** "Nodes with high tension should glow or pulse (hot orange)."

**We have four options:**
- **A) Border + Pulse:** Orange border, scale 1.0 → 1.1 pulse
- **B) Glow Effect:** box-shadow radial gradient
- **C) Icon Overlay:** ⚠️ or 🔥 icon on node
- **D) Color Replacement:** Replace domain color with tension color

**Which encoding best serves the goal: "Instantly distinguish Dead Ends from Active Frontiers"?**

**Our recommendation:** Multi-encoding (size + border + pulse) for clarity.

**Your thoughts?**

#### Q10: Dead Ends vs Active Frontiers

**The Phlogiston Problem (from your review):**

Phlogiston theory has:
- Many historical connections (looks important)
- Heavy attacks (refuted)
- Low current support (dead end)
- **Tension:** Moderate (some support × heavy attacks)

Axiom of Choice has:
- Many connections (actually important)
- Moderate attacks (contested but viable)
- Heavy support (foundational despite controversy)
- **Tension:** High (heavy support × moderate attacks)

**Question:** How do we visually distinguish these? Tension alone might not be enough.

**Our idea:** Use node status field:
- `status: "refuted"` → Red tint or dashed border (dead end)
- `status: "stable"` + high tension → Orange (active frontier)
- `contested: true` + low current usage → Gray (historical but obsolete)

**Does this distinction make sense philosophically?**

#### Q11: Animation Distraction

**Concern:** Pulsing orange nodes might be visually overwhelming, especially with many contested nodes.

**Question:**
- Is subtle pulse (5% scale change) acceptable?
- Should animation be optional (user setting)?
- Alternative: Static orange border without pulse?

**Accessibility:** We'll respect `prefers-reduced-motion`, but beyond that?

---

## Additional Philosophical Questions

### Justification vs Causation

**Q12:** Does "focus path" represent:
- **Logical dependence:** "B is true BECAUSE A is true"
- **Epistemic justification:** "We KNOW B because we know A"
- **Historical discovery:** "B was discovered AFTER A"

Our algorithm treats it as epistemic justification (follows support/proves edges). Is this correct?

### Foundationalism vs Coherentism

**Q13:** Our system privileges depth-0 nodes (foundations). This is structurally foundationalist.

**Question:** How to fairly represent coherentist epistemology within this structure? Should we:
- Add explicit "coherentist cluster" node type?
- Allow cycles in support chains?
- Show "foundation-relative" paths (path to nearest semi-stable cluster)?

### Intuitionistic vs Classical Paths

**Q14:** In mathematics, intuitionistic logic rejects some classical proofs (those using LEM or LNC).

**Question:** Should we:
- Mark paths that go through LEM/LNC as "classically valid only"?
- Filter paths by foundational system (ZFC vs HoTT vs Intuitionist)?
- Show this in metadata but not restrict paths?

---

## Success Criteria for This Review

**We need from you:**

1. **Algorithmic Decisions:**
   - Shortest vs strongest path (or both?)
   - Include/exclude bridge relations
   - Handle coherentist clusters how?

2. **UX Guidance:**
   - Tab order and priority
   - Tension visual encoding (border, glow, icon, or combo?)
   - Information hierarchy

3. **Philosophical Validation:**
   - Does "focus path" correctly represent justification?
   - Are we handling deductive vs inductive correctly?
   - How to show dead ends vs active debates?

4. **Edge Cases:**
   - Very long paths (10+ hops) - how to display?
   - Multiple equally-good paths - show one or all?
   - Bidirectional relations (equivalent) - special handling?

5. **Priorities:**
   - Which of these three features is most critical for usability?
   - Any features we should ADD that we haven't spec'd?
   - Any features we should REMOVE (over-engineering)?

**After your review:**
- We'll update specs with your recommendations
- Proceed with strict TDD implementation (tests first!)
- Target: 25-30 new tests, all passing
- Deliver: Feature-complete 2D app ready for v1.0 release

---

## Format for Your Response

**Helpful if you structure as:**

```markdown
## Executive Summary
[Overall assessment, top 3 priorities]

## Algorithmic Recommendations
[Shortest vs strongest, bridges, coherentism handling]

## UX Design Feedback
[Tab structure, visual encodings, information hierarchy]

## Philosophical Validation
[Correctness of approach, edge cases, interpretation]

## Implementation Priorities
[What to build first, what to defer, what to cut]

## Specific Answers to Questions
[Q1: ..., Q2: ..., etc.]
```

---

## Attachments

Please review these three specification documents:

1. **FOCUS_PATH_SPEC.md** - Algorithm for computing epistemic justification chains
2. **NODEDETAIL_TABS_SPEC.md** - Tab design and content organization
3. **TENSION_VISUAL_SPEC.md** - Visual encoding for controversy indicators

(User will paste the contents of these files in the message to you)

---

## Thank You!

Your previous review was exceptional - you identified real philosophical gaps (logic primitives, theory-laden observations) and high-impact enhancements (tension, load-bearing). We've implemented everything from your Top 5 priorities.

This second review helps us maintain that quality bar as we polish the UX layer. Looking forward to your insights!

---

**Reviewer:** Gemini 3 Pro (Integrated Systems & Logic Specialist)
**Scope:** 2D Polish Phase (Focus Paths, Tabs, Tension Visuals)
**Timeline:** Review requested 2025-11-18, implementation upon feedback
**Format:** Markdown response preferred, structured by section

---
