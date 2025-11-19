# NodeDetail Tabs Specification

**Version:** 1.0.0
**Status:** DRAFT - Awaiting Gemini 3 Pro Review
**Purpose:** Define structure and content of NodeDetail panel tabs

**Epic:** 2D Polish Phase (Option 1)
**Related:** Focus path, epistemic tension, cross-domain bridges

---

## Overview

### Current State

**NodeDetail Component:** Functional but incomplete
- ✅ **Overview Tab:** Shows title, type, domain, content, formal notation, tags, sources
- ⏸️ **Justification Tab:** Placeholder (shows "Justification tree coming soon")
- ⏸️ **Attacks Tab:** Placeholder (shows "Attacks view coming soon")
- ⏸️ **Cross-Domain Tab:** Placeholder (shows "Cross-domain links coming soon")

### Goal

Transform placeholders into functional tabs that expose the graph's epistemic structure.

---

## ✅ Tab Order Decision (Gemini 3 Pro)

**Recommendation:** **1. Overview → 2. Justification → 3. Attacks → 4. Cross-Domain**

**Rationale (Gemini):** "Users first need to establish *identity* (What is this?) before *justification* (Why is it true?). Putting Justification second makes it a natural 'next step' click."

**Cognitive Flow:**
1. **Overview:** Establish identity and understand the claim
2. **Justification:** See why it's true (epistemic support)
3. **Attacks:** See challenges and controversy
4. **Cross-Domain:** See broader context (bridges)

**Keep Attacks Separate (Gemini):** "Merging it with Justification dilutes the 'Justification' narrative. Justification should be the 'Happy Path' (Proponents); Attacks should be the 'Hostile Path' (Opponents)."

---

## Tab 1: Overview (Identity & Metadata)

**Status:** Already implemented ✓

**Shows:** Title, type, domain, content, formal notation, tags, sources

**Addition (Gemini):** Include tension score in metadata section

---

## Tab 2: Justification (Epistemic Support Chain)

### Purpose

**Question Answered:** "How do we know this claim is true?"

**Shows:** The chain of epistemic support from foundational nodes to the selected node.

### Data Source

- **Primary:** `useFocusPath(selectedNodeId, edges)` hook
- **Returns:** `string[]` - Path from foundation → selected
- **Falls back:** If no path, show "No foundational path"

### UI Layout

**Linear Chain Display (MVP):**

```
┌─────────────────────────────────────┐
│ 🏛️ FOUNDATION                       │
│ Modus Ponens                        │
│ Type: Axiom | Domain: Mathematics   │
└─────────────────────────────────────┘
           ↓
     supports (1.0)
           ↓
┌─────────────────────────────────────┐
│ 📊 DEPTH 1                          │
│ Axiom of Choice                     │
│ Type: Axiom | Domain: Mathematics   │
└─────────────────────────────────────┘
           ↓
     proves (0.9)
     Axiom System: ZFC
           ↓
┌─────────────────────────────────────┐
│ 🎯 CURRENT NODE (Depth 2)           │
│ Gödel's Incompleteness Theorem      │
│ Type: Theorem | Domain: Mathematics │
└─────────────────────────────────────┘

Path Strength: 0.9 (product of weights)
Path Length: 2 hops
```

**Components:**
- Node cards (title, type, domain, icon)
- Edge labels (relation type, weight, metadata if present)
- Path statistics (length, accumulated weight, depth)

**Interactivity:**
- Click any node card → Navigate to that node (close current detail, open new)
- Hover edge label → Show full edge metadata (axiom_system, conditions, etc.)

### Empty States

**No Path Found:**
```
🚫 No Foundational Path

This node is either:
• A foundational node itself (depth 0)
• Part of a disconnected component
• In a coherentist cluster (mutual support without foundation)

Depth: [depth value]
Foundation Status: [Yes/No]
```

**Loading State:**
```
⏳ Computing justification chain...
```

---

**Path Type Indicator (Gemini Addition):**
```
Path Type: Mixed (Deductive + Inductive)
Path Strength: 0.81
━━━ Deductive edge (proves/entails)
┅┅┅ Inductive edge (supports/predicts)
```

---

## Tab 3: Attacks (Epistemic Challenges)

### Purpose

**Question Answered:** "What challenges or refutes this claim?"

**Shows:** All incoming attack edges + tension score

### Data Source

- **Edges:** Filter for `edge.to === selectedNodeId` AND `edge.relation in ['attacks', 'refutes']`
- **Tension:** From `computeTension(selectedNodeId, edges)` (already implemented!)

### UI Layout

```
┌─────────────────────────────────────────────────┐
│ ⚡ EPISTEMIC TENSION: 0.75 (High Controversy)   │
│                                                 │
│ This node is heavily contested.                 │
│ [See tension visualization in graph →]         │
└─────────────────────────────────────────────────┘

🔴 ATTACKS (2 found)

┌─────────────────────────────────────┐
│ Gettier Case 1 (m4k2p9)            │
│ ────────────────────────────────── │
│ Relation: attacks                   │
│ Weight: 0.95 (very strong)          │
│ Domain: philosophy                  │
│                                     │
│ "Gettier's counterexample shows..." │
│ [Click to view →]                   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Constructivist Critique (c7x2m1)   │
│ ────────────────────────────────── │
│ Relation: refutes                   │
│ Weight: 0.70 (moderate)             │
│ Domain: mathematics                 │
│                                     │
│ "Proof requires construction..."    │
│ [Click to view →]                   │
└─────────────────────────────────────┘

📊 SUPPORTS (3 found) - See Justification tab
```

### Tension Score Display

**Color Coding:**
- **0.0-0.3:** 🟢 Green "Settled" (low/no attacks)
- **0.3-0.7:** 🟡 Yellow "Debated" (moderate controversy)
- **0.7-1.0:** 🔴 Red "Intense Controversy" (high tension)

**Explanation Text:**
- Low: "This node has minimal controversy."
- Medium: "This node is actively debated in the literature."
- High: "This node is intensely controversial with strong arguments on both sides."

### Empty State

```
✅ No Attacks Found

This node is not currently challenged by any counterarguments in the graph.

Tension Score: 0.0 (no controversy)
```

---

### ✅ Gemini Decision: Tension Score Placement

**Recommendation:** "**Overview Tab (Metadata) + Visual Graph.** The number is less important than the visual 'heat' in the graph."

**Implementation:**
- Tension score in Overview tab metadata section
- Visual encoding (orange border) in graph
- NOT in Attacks tab (reduces redundancy)

### Attack Interpretation (Gemini)

**Decision:** "**Treat as Continuum.** Use weight (w). w>0.95 is effectively a refutation. No need for explicit binary categories."

**Display:**
```
🔴 Strong Attack (w=0.95) - Effectively Refutes
🟠 Moderate Attack (w=0.7)
🟡 Weak Challenge (w=0.4)
```

---

## Tab 4: Cross-Domain (Bridge Relations)

### Purpose

**Question Answered:** "How does this node connect across domains?"

**Shows:** Bridge relations (philosophy ↔ mathematics ↔ physics)

### Data Source

Filter edges where:
- `edge.domain.startsWith('bridge:')`
- `edge.from === selectedNodeId OR edge.to === selectedNodeId`

### UI Layout

```
🌉 CROSS-DOMAIN BRIDGES

📚 Philosophical Foundations (2)
  ┌─────────────────────────────────┐
  │ Formal Systems Concept          │
  │ ←  formalizes (0.85)           │
  │ This philosophical concept is   │
  │ formalized by this node.        │
  └─────────────────────────────────┘

🔢 Mathematical Models (1)
  ┌─────────────────────────────────┐
  │ Riemannian Geometry            │
  │ →  models (0.9)                │
  │ This math models GR theory.     │
  └─────────────────────────────────┘

🔬 Physical Applications (0)
  No physical applications found.

📊 Other Bridges
  • applies_to: Formal Logic (0.7)
```

**Grouping:**
- **Incoming bridges:** Other domains → This node
- **Outgoing bridges:** This node → Other domains
- **By domain pair:** phil→math, math→phys, etc.

### Empty State

```
🔗 No Cross-Domain Bridges

This node operates within a single domain.
It does not bridge to other areas of knowledge.
```

---

## Tab 4: Related (Optional - All Connections)

**Question for Gemini:** Do we need a 4th tab showing ALL edges (including non-epistemic)?

**Purpose:** Complete edge list (supports, defines, cites, etc.)

**Layout:**
```
OUTGOING (5)
  • supports → Theorem X (0.8)
  • defines → Concept Y (1.0)
  • cites → Paper Z

INCOMING (3)
  • supported by ← Axiom A (1.0)
  • cited by ← Paper B
```

**Pros:** Completeness, useful for graph editing
**Cons:** Redundant with Justification + Attacks tabs, cluttered

**Proposed:** Defer to future, 3 tabs sufficient for MVP

---

## Component Architecture

### File Structure

```
components/NodeDetail/
├── index.tsx                    # Main component (tab switcher)
├── OverviewTab.tsx              # ✅ Already implemented
├── JustificationTab.tsx         # ⏸️ To implement
├── AttacksTab.tsx               # ⏸️ To implement
├── CrossDomainTab.tsx           # ⏸️ To implement
├── NodeCard.tsx                 # Shared: Node display card
├── EdgeLabel.tsx                # Shared: Edge info display
└── NodeDetail.css               # Styling
```

### Shared Components

**NodeCard.tsx:**
- Displays node info (title, type, domain, icon)
- Accepts `onClick` for navigation
- Shows depth badge
- Reusable across tabs

**EdgeLabel.tsx:**
- Displays relation type (supports, attacks, proves)
- Shows weight (if present)
- Shows metadata (axiom system, conditions, etc.)
- Color-coded by relation type

### State Management

**Props Flow:**
```
App.tsx
  ├─ selectedNodeId (state)
  ├─ edges (from useEdges)
  └─ focusPath (from useFocusPath)
       ↓
  NodeDetail
    ├─ JustificationTab (uses focusPath)
    ├─ AttacksTab (filters edges)
    └─ CrossDomainTab (filters edges)
```

**Navigation:**
- Tab clicks node → `onNavigate(nodeId)` callback
- App updates `selectedNodeId`
- All tabs re-render with new selection

---

## Visual Design

### Tab Bar

```
┌─────────────────────────────────────────────┐
│ [Overview] [Justification] [Attacks] [Cross-Domain] │
└─────────────────────────────────────────────┘
```

**Active tab:** Underline or background highlight

### Node Cards

**Icon by Type:**
- 🏛️ Axiom
- 📊 Theorem
- 🔬 Theory
- 📝 Proposition
- 🧪 Observation

**Color by Domain:**
- Border: Philosophy (purple), Math (blue), Physics (red)

### Tension Indicator

**In Attacks Tab:**
```
┌────────────────────────────────┐
│ ⚡ Tension: 0.85               │
│ ████████████████░░ (85%)       │
│ Status: Intense Controversy    │
└────────────────────────────────┘
```

**Progress bar colored:**
- 0-30%: Green
- 30-70%: Yellow
- 70-100%: Red

---

## Accessibility

### Keyboard Navigation

- **Tab key:** Navigate between node cards
- **Enter:** Click to navigate
- **Escape:** Close NodeDetail panel
- **Arrow keys:** Scroll within tab content

### Screen Reader

- **ARIA labels:** "Justification chain", "Attacking nodes", etc.
- **Role:** Each node card has `role="button"`
- **Live region:** Tab content updates announce to screen readers

### Motion

- **Respect `prefers-reduced-motion`** for animations
- **Alternative:** Static display if motion disabled

---

## Performance Targets

### Rendering

- **Path display:** <50ms to render
- **Tab switching:** <100ms
- **Navigation:** <200ms (includes path recomputation)

### Data Processing

- **Edge filtering:** <10ms for 50 edges
- **Path computation:** Handled by useFocusPath (memoized)
- **No unnecessary re-renders** (use React.memo where appropriate)

---

## Test Coverage Goals

**Component Tests:**
- JustificationTab: 8 tests (rendering, navigation, empty states)
- AttacksTab: 6 tests (filtering, tension display, empty state)
- CrossDomainTab: 5 tests (bridge filtering, grouping, empty state)

**Integration Tests:**
- Tab switching preserves state: 2 tests
- Navigation updates all tabs: 3 tests
- Performance: 2 tests

**Total New Tests:** ~25-30

**Target:** 100% coverage for new tab components

---

## Questions for Gemini Review

### Information Architecture

1. **Tab Order:** Justification first or Overview first? What's most useful on first load?
2. **Tab Count:** Are 4 tabs too many? Should we consolidate (e.g., merge Attacks into Justification)?
3. **Content Priority:** What information is MOST important for each node?

### Epistemic Display

4. **Justification Completeness:** Show one path or all paths? How to avoid overwhelming user?
5. **Attack Interpretation:** Should we distinguish "refuted" (fatal) vs "challenged" (debate)?
6. **Bridge Relations:** Are these equally important as epistemic edges, or secondary?

### UX Details

7. **Path Navigation:** Should clicking a node in justification chain open it in SAME panel or NEW panel?
8. **Empty States:** Are our "No path found" / "No attacks" messages clear?
9. **Tension Score:** Should it be in Attacks tab, Overview tab, or both?
10. **Visual Hierarchy:** How to distinguish between "This node supports X" vs "X supports this node"?

### Edge Cases

11. **Very Long Paths:** If path is 15+ hops, how to display readably? (Collapse middle? Paginate?)
12. **Many Attacks:** If node has 20 attacking nodes, how to organize? (Sort by weight? Group by domain?)
13. **Bidirectional Relations:** `A equivalent B` - show in both directions or just once?

---

## Success Criteria

- [ ] Tabs provide clear epistemic insight (not just data dump)
- [ ] Navigation flow is intuitive
- [ ] All empty states handled gracefully
- [ ] Performance <200ms for tab rendering
- [ ] Accessible (keyboard, screen reader)
- [ ] Tests cover all interaction paths

---

**Status:** Ready for Gemini review
**Next:** Integrate with FOCUS_PATH_SPEC for coherent design

---

*Specification created: 2025-11-18*
