# Focus Path Specification

**Version:** 1.0.0
**Status:** DRAFT - Awaiting Gemini 3 Pro Review
**Purpose:** Define how to compute and visualize epistemic justification chains in Truth Mines

**Epic:** 2D Polish Phase (Option 1)
**Related:** Salience system, NodeDetail Justification tab

---

## Overview

### What is a Focus Path?

A **focus path** is the chain of epistemic support from foundational nodes (depth 0) to a selected node. It answers: **"How do we know this is true?"**

**Example:**
```
Modus Ponens (depth 0)
  ↓ supports
Axiom of Choice (depth 1)
  ↓ proves
Gödel's Incompleteness Theorem (depth 2)
```

The path shows the dependency chain: Gödel's theorem rests on Axiom of Choice, which rests on Modus Ponens.

### Why It Matters

**Epistemic Value:**
- Reveals justification structure
- Shows how claims are grounded
- Exposes weak links (low-weight edges)
- Demonstrates foundationalism in action

**UX Value:**
- "Show me why this is true" button
- Navigate epistemic dependencies
- Understand depth assignments
- Explore justification trees

---

## Algorithm Specification

### Input
- `selectedNodeId: string` - The node to find justification for
- `edges: Edge[]` - All graph edges
- `pathType: 'shortest' | 'strongest'` - Path selection strategy

### Output
- `string[] | null` - Array of node IDs from foundation → selected, or null if no path exists

### Core Algorithm: Dijkstra's Maximum Probability (Gemini-Approved)

**Implementation Strategy:**
- Use Dijkstra's algorithm with negative log probabilities
- Traverse backward from selected node to foundations
- Select path with highest accumulated probability (lowest cost)

```typescript
function computeFocusPath(
  selectedNodeId: string,
  edges: Edge[]
): FocusPathResult | null {
  // 1. Find foundation nodes (depth 0)
  const foundations = findFoundations(edges);

  if (foundations.has(selectedNodeId)) {
    return [selectedNodeId]; // Selected IS a foundation
  }

  // 2. Build reverse adjacency (for backward traversal)
  const incoming = buildIncomingEdges(edges);

  // 3. BFS from selected node BACKWARD to foundations
  const queue: PathNode[] = [{ nodeId: selectedNodeId, path: [selectedNodeId], weight: 1.0 }];
  const visited = new Set<string>();
  const foundPaths: Path[] = [];

  while (queue.length > 0) {
    const { nodeId, path, weight } = queue.shift()!;

    if (visited.has(nodeId)) continue;
    visited.add(nodeId);

    // Check if we reached a foundation
    if (foundations.has(nodeId) && nodeId !== selectedNodeId) {
      foundPaths.push({ path: [...path].reverse(), weight });
      continue; // Found a path, keep searching for others
    }

    // Explore incoming epistemic edges
    const incomingEdges = incoming.get(nodeId) || [];
    for (const edge of incomingEdges) {
      if (!visited.has(edge.from)) {
        queue.push({
          nodeId: edge.from,
          path: [...path, edge.from],
          weight: weight * (edge.weight || 0.7), // Accumulate weights
        });
      }
    }
  }

  // 4. Select path based on strategy
  if (foundPaths.length === 0) {
    return null; // No path to any foundation
  }

  if (pathType === 'shortest') {
    return foundPaths.reduce((shortest, current) =>
      current.path.length < shortest.path.length ? current : shortest
    ).path;
  } else {
    // Strongest path (highest weight product)
    return foundPaths.reduce((strongest, current) =>
      current.weight > strongest.weight ? current : strongest
    ).path;
  }
}
```

### Edge Selection Criteria

**Included (Epistemic Relations):**
- `supports` - Inductive/abductive support
- `proves` - Deductive proof
- `entails` - Logical entailment
- `predicts` - Empirical prediction (for physics)

**Excluded (Non-Epistemic):**
- `attacks` - Counterargument (doesn't create dependency)
- `defines` - Definitional (circular definitions OK)
- `cites` - Bibliographic (not justification)
- `models`, `formalizes` - Bridge relations (debatable - see Questions)

**Question for Gemini:** Should bridge relations be included in focus paths? They show philosophical/mathematical grounding, which is arguably part of justification.

---

## Path Selection Strategy

### ✅ DECISION (Gemini 3 Pro): Strongest Path

**Gemini's Recommendation:** "**Option B (Strongest Path)** is epistemically superior."

**Rationale:** "A 1-hop weak argument (w=0.5) is worse than a 2-hop deductive argument (w=1.0 × 1.0 = 1.0). A long, rigorous proof is better justification than a short, weak hunch."

**Algorithm:** Use Dijkstra's adapted for maximum probability
- Convert weights to negative log probabilities: `cost = -log(weight)`
- Higher weight → lower cost → preferred path
- Dijkstra finds minimum cost = maximum probability product

**Example:**
```
Path 1: Foundation --0.5--> Selected (1 hop, weight: 0.5) ❌ Weaker
Path 2: Foundation --0.9--> Middle --0.9--> Selected (2 hops, weight: 0.81) ✅ Chosen
```

**Future Enhancement (v1.1):** "Show Direct Path" toggle if strongest path is significantly longer (>5 hops) than shortest

---

## Gemini 3 Pro Decisions - Integrated

### Bridge Relations: EXCLUDE

**Decision:** Exclude `formalizes`, `models`, `philosophical_foundation` from focus paths.

**Exception:** Include only if node has ZERO intra-domain epistemic support (orphaned).

**Rationale (Gemini):** "Bridge relations are *representational* mappings, not *evidential* support."

### Coherentist Clusters: DETECT & FLAG

**Decision:** When cycle detected, show path to entry point and flag as coherentist.

**Algorithm (v1.0):**
1. During backward traversal, maintain visited set
2. If encounter visited node → cycle detected
3. Entry point = the revisited node
4. Return path to entry point with `isCoherentist: true` flag

**UI Display:**
```
Path to Entry Point: Scientific Realism
⚠️ Coherentist Cluster Detected
This node is part of circular support structure.
```

**Deferred to v1.1:** Full SCC detection (Tarjan's algorithm) for complete cluster identification

### Deductive vs Inductive: DISTINGUISH VISUALLY

**Decision:** Mixed paths are acceptable, but distinguish edge types visually.

**Visual:**
- Solid lines: proves, entails (deductive)
- Dashed lines: supports, predicts (inductive)

**Path Type Classification:**
- All deductive → "Deductive Justification"
- All inductive → "Inductive Support"
- Mixed → "Mixed Justification (limited by inductive links)"

**Philosophical Principle (Gemini):** "Weakest link principle - mixed path is Inductive."

---

## Edge Cases & Design Questions

### Multiple Foundations

**Scenario:** Node has paths from BOTH "Modus Ponens" AND "Empirical Observation"

**Options:**
1. Show only one path (shortest or strongest)
2. Show all paths (multiple justifications)
3. Let user toggle between paths

**Current Spec:** Show one (simpler UI), but store all in metadata

**Question for Gemini:** Is showing one path philosophically misleading? Coherentism would say all paths matter.

### Circular Support (Coherentist Loops)

**Scenario:**
```
A supports B
B supports C
C supports A (cycle!)
```

**Handling:**
- BFS with `visited` set prevents infinite loop ✓
- If selected is IN a cycle, no path to foundation (return null)
- Or: Detect cycle, show as "Coherentist Cluster - No Foundation"

**Question for Gemini:** How to represent coherentist beliefs (mutually supporting, no foundation)?

### No Path to Foundation

**Scenario:** Selected node is in disconnected component (no path to depth-0 nodes)

**Options:**
1. Return `null` → Justification tab shows "No foundation path"
2. Return path to deepest reachable node → "Partial justification"
3. Flag as "Unfounded claim"

**Current Spec:** Return `null`, display explanatory message

### Mixed Relation Types

**Scenario:** Path includes both `proves` (deductive) and `supports` (inductive)

**Visualization Options:**
1. Show path as-is (mixed)
2. Distinguish visually: solid line (proves) vs dashed (supports)
3. Prefer deductive paths over inductive

### ✅ DECISION (Gemini 3 Pro): Distinguish Visually, Don't Privilege

**Gemini's Recommendation:** "**Distinguish Visually.** Use line styles (Solid vs Dashed). Philosophically, a mixed path is Inductive (weakest link principle)."

**Visual Encoding:**
- **Deductive edges** (proves, entails): Solid lines ━━━
- **Inductive edges** (supports, predicts): Dashed lines ┅┅┅
- **Path classification:** If ANY edge is inductive, entire path labeled "Inductive Support"

**Implementation in Graph2D:**
```typescript
const linkLineDash = (link: any) => {
  const isDeductive = ['proves', 'entails'].includes(link.relation);
  return isDeductive ? [] : [5, 5];  // Empty = solid, [5,5] = dashed
};
```

**UI Label:**
```
Path Type: Mixed (Deductive + Inductive)
Strength: 0.81 (limited by inductive links)
```

**Philosophical Principle:** Chain is only as strong as weakest link (inductive < deductive)

---

## Visual Encoding

### In Graph2D Component

**Focus Path Highlighting:**
- Nodes on path: `salience = w_path = 0.9` (already implemented in useSalience!)
- Edges on path: Render 2× thicker
- Edge color: Yellow/gold (distinct from relation colors)
- Animation (optional): Pulse along path direction

**Implementation:**
```typescript
// Update linkWidth callback
const linkWidth = useCallback((link: any) => {
  const isOnPath = focusPath && isLinkOnPath(link, focusPath);
  const baseWidth = (link.weight || 0.7) * 2;
  return isOnPath ? baseWidth * 2 : baseWidth;
}, [focusPath]);

// Update linkColor for path edges
const linkColor = useCallback((link: any) => {
  const isOnPath = focusPath && isLinkOnPath(link, focusPath);
  if (isOnPath) return '#FBBF24'; // Gold for path
  return relationColors[link.relation] || '#9CA3AF';
}, [focusPath]);
```

### In NodeDetail Justification Tab

**Linear Display (Simple):**
```
Foundation: Modus Ponens
  ↓ supports (1.0)
Axiom of Choice
  ↓ proves (0.9)
Gödel's Incompleteness Theorem ← YOU ARE HERE
```

**Tree Display (Complex, if multiple paths):**
```
YOU ARE HERE: Gödel's Theorem
  ↑
  ├─ Path 1 (shortest): Axiom of Choice ← Modus Ponens
  └─ Path 2 (strongest): Formal Systems ← Logic Primitives
```

**Current Spec:** Linear display for MVP, tree for future enhancement

---

## Test Cases

### Unit Tests (useFocusPath.test.ts)

1. **Foundation node** → Returns `[nodeId]` (path to self)
2. **Depth-1 node** → Returns `[foundation, node]` (2 elements)
3. **Linear chain** (A → B → C → D) → Returns `[A, B, C, D]`
4. **Multiple paths (diamond):**
   ```
   F → A → T
   F → B → T
   ```
   - Shortest path: Returns `[F, A, T]` or `[F, B, T]` (both same length)
5. **No path** (disconnected) → Returns `null`
6. **Cycle detection** → No infinite loop, returns `null` or valid path
7. **Mixed relations** (proves + supports) → Both included in path
8. **Non-epistemic edges** (defines, cites) → Ignored
9. **Multiple foundations** → Path to closest foundation
10. **Strongest path selection** → Highest weight product chosen
11. **Weight-less edges** → Default weight 0.7 used
12. **Self-loop** (A supports A) → Handled correctly
13. **Empty edges array** → Returns `null`
14. **Invalid selectedNodeId** → Returns `null`
15. **Performance** (50 nodes, 200 edges) → <100ms

### Integration Tests (Graph2D + JustificationTab)

1. Click node → Path highlights in graph
2. Path nodes have high salience (large, bright)
3. Path edges render thicker
4. Justification tab shows same path
5. Click node in justification → Navigate to it

---

## Performance Considerations

### Complexity
- **Worst Case:** O(V + E) for BFS (V = nodes, E = edges)
- **Typical:** Much less (stop at first foundation)
- **30 nodes, 50 edges:** <10ms
- **500 nodes, 2000 edges:** <50ms (acceptable)

### Optimization
- **Memoization:** useMemo with `[selectedNodeId, edges]` deps
- **Early Termination:** Stop BFS after finding first path (for shortest-path)
- **Visited Set:** Prevent re-exploring nodes

### Caching Strategy
- Path computed in hook (memoized)
- Graph highlighting uses cached path
- Tab component uses cached path
- **No redundant computation**

---

## Philosophical Questions for Gemini

### 1. Path Selection Philosophy

**Question:** Does "epistemic justification" mean shortest path or strongest path?

**Considerations:**
- **Shortest:** Occam's Razor (simpler explanation preferred)
- **Strongest:** Confidence matters (high-weight chains more justified)
- **Both:** Different notions of justification

**Proposed:** Default to shortest, allow toggle to strongest (advanced feature)

### 2. Bridge Relations in Justification

**Question:** Should `formalizes` (phil→math) and `models` (math→phys) be part of justification chains?

**Example:**
```
Possible worlds semantics (philosophy)
  ↓ formalizes
Modal logic (mathematics)
  ↓ models
Quantum mechanics (physics)
```

**Arguments For:**
- Philosophical commitments ARE part of justification
- Shows full dependency (QM depends on modal logic depends on possible worlds)

**Arguments Against:**
- Bridge relations are "representational" not "evidential"
- Muddies distinction between content domains
- Path becomes very long (crosses all three domains)

**Proposed:** Exclude bridges from focus path, show separately in CrossDomain tab

### 3. Handling Coherentist Clusters

**Scenario:** Set of nodes mutually support each other, no external foundation.

**Example:**
```
Scientific Realism ↔ No Miracles Argument ↔ Semantic Realism
(circular support, no path to deeper foundation)
```

**Options:**
1. Return `null` (no foundation)
2. Return path to entry point of cluster
3. Flag cluster, show as "Coherentist Web"

**Proposed:** Return `null`, display "No foundational path (coherentist cluster?)"

**Question for Gemini:** Should we explicitly detect and visualize coherentist clusters?

### 4. Inductive vs Deductive Paths

**Scenario:** Path mixing `proves` (deductive, w=1.0) and `supports` (inductive, w=0.7)

**Visualization Options:**
1. Treat equally (current spec)
2. Distinguish visually (solid vs dashed)
3. Separate into "Deductive Justification" and "Inductive Support"

**Question for Gemini:** Does mixing deductive and inductive weaken justification? Should we prefer pure deductive paths?

---

## UI/UX Specification

### Focus Path in Graph2D

**Visual Encoding:**
- **Path nodes:** High salience (w_path = 0.9 in salience formula)
- **Path edges:** 2× normal thickness, gold color (#FBBF24)
- **Selected node:** Highlighted border (already implemented)
- **Animation (optional):** Pulse along path direction (foundation → selected)

**Interaction:**
- Click node → Compute and display path
- Click node ON path → Navigate to that node (path updates)
- Hover edge on path → Show edge metadata (relation, weight)

### Focus Path in Justification Tab (NodeDetail)

**Layout:** Vertical list (foundation at top, selected at bottom)

**Format:**
```
🏛️ Foundation
  Modus Ponens

⬇️ supports (weight: 1.0)

📊 Axiom
  Axiom of Choice

⬇️ proves (weight: 0.9)

🎯 Selected Theorem
  Gödel's Incompleteness Theorem
```

**Interactivity:**
- Click any node in chain → Navigate to it (updates selection, recomputes path)
- Hover edge → Show metadata (axiom system, proof ID)
- Copy path as text (for export/citation)

**Empty States:**
- No path: "No foundational path found. This may be a foundational node, or part of a disconnected cluster."
- Loading: "Computing justification chain..."

---

## Implementation Checklist

### Hook: useFocusPath.ts

**Signature:**
```typescript
export function useFocusPath(
  selectedNodeId: string | null,
  edges: Edge[],
  pathType?: 'shortest' | 'strongest'
): string[] | null
```

**Dependencies:** useMemo on `[selectedNodeId, edges, pathType]`

**Returns:**
- Array of node IDs (foundation → selected)
- `null` if no path or selectedNodeId is null

**Complexity:** O(V + E) worst case, O(depth × branching) typical

### Component: JustificationTab.tsx

**Props:**
```typescript
interface JustificationTabProps {
  nodeId: string;
  focusPath: string[] | null;
  onNavigate: (nodeId: string) => void;
}
```

**Renders:**
- Path nodes with icons (based on type)
- Edge labels (relation + weight)
- Loading/empty states
- Click handlers for navigation

**Styling:** CSS in JustificationTab.css

### Graph2D Integration

**Changes:**
- Compute focusPath in App.tsx: `const focusPath = useFocusPath(selectedNodeId, edges)`
- Pass to Graph2D: `<Graph2D focusPath={focusPath} ... />`
- Pass to useSalience (already has parameter!)
- Update linkWidth and linkColor callbacks

---

## Testing Strategy

### Unit Tests (TDD)

**useFocusPath.test.ts:** 15 test cases (see Test Cases section)

**JustificationTab.test.tsx:**
1. Renders empty state when no path
2. Renders loading state
3. Renders path correctly (foundation → selected)
4. Displays relation types and weights
5. Navigation clicks work
6. Icons render based on node types

**Graph2D path highlighting:**
1. Path nodes have high salience
2. Path edges render thicker
3. Path edges render gold color
4. Updates when selection changes

### Integration Tests

1. **Full Flow:**
   - Load app → Click node → See path in graph AND tab
   - Click node in path → Selection updates → Path updates

2. **Edge Cases:**
   - Click foundation node → Path shows self only
   - Click disconnected node → "No path" message
   - Filter to hide path nodes → Path updates correctly

3. **Performance:**
   - Measure path computation time (<100ms for 30 nodes)
   - Test with larger graph (mock 100 nodes)

---

## Open Questions for Gemini 3 Pro Review

### Algorithm Design

1. **Path Strategy:** Shortest vs strongest vs user-configurable?
2. **Bridge Relations:** Include in path or exclude?
3. **Multiple Paths:** Show one or all?
4. **Weight Accumulation:** Multiply weights or use minimum?

### Philosophical Correctness

5. **Epistemic Distance:** Is hop count the right metric for justification distance?
6. **Mixed Paths:** Does mixing deductive (proves) and inductive (supports) weaken justification?
7. **Coherentist Clusters:** How to detect and visualize mutual support without foundation?
8. **Foundationalism:** Is privileging depth-0 nodes philosophically correct?

### UX Design

9. **Too Many Paths:** If node has 5 different foundation paths, how to display?
10. **Path Length:** If path is 10+ hops (very deep theorem), how to make UI readable?
11. **Path Confidence:** Should we display accumulated weight (confidence in chain)?
12. **Animation:** Is pulsing along path helpful or distracting?

### Implementation

13. **Performance:** Is BFS for every selection change acceptable, or pre-compute all paths?
14. **Caching:** Should we cache paths, or recompute (edges might change)?
15. **Accessibility:** How to make path navigation keyboard-accessible?

---

## Success Criteria

**Spec is complete when:**
- [ ] Algorithm is unambiguous (no implementation decisions left)
- [ ] All edge cases have specified behavior
- [ ] Test cases cover all branches
- [ ] UI mockups are clear
- [ ] Gemini feedback integrated
- [ ] Performance targets defined

**Implementation is complete when:**
- [ ] All 15 unit tests pass (TDD)
- [ ] Integration tests pass
- [ ] Manual testing confirms expected behavior
- [ ] Performance <100ms for path computation
- [ ] No console errors or warnings
- [ ] Accessible (keyboard navigation works)

---

## Future Enhancements (Out of Scope for MVP)

1. **Multiple Path Display:** Show all paths, let user select
2. **Path Comparison:** Compare two nodes' justification chains
3. **Path Export:** Copy as citation, markdown, or BibTeX
4. **Path Animation:** Animated traversal from foundation → selected
5. **Path Statistics:** Display path length, avg weight, confidence score
6. **Alternative Paths:** "Show me other justifications"

---

**Status:** Ready for Gemini 3 Pro review
**Next Step:** Create review request document, send to Gemini
**Blocked By:** Gemini feedback on algorithm choices

---

*Specification created: 2025-11-18*
*Awaiting review before TDD implementation*
