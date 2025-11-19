# Salience Model Specification

Mathematical specification for computing dynamic visual weight in Truth Mines.

## Overview

**Salience** is a scalar value (0-1) assigned to each node that determines its visual prominence. High salience = larger, brighter, labeled. Low salience = smaller, dimmer, no label.

This creates a **dynamic focus** where the graph reorganizes visually around what matters in the current interaction context.

---

## Mathematical Definition

### Core Formula

**Updated with Gemini 3 Pro Enhancements:**

```
salience(node) = clamp(
    w_focus × I_focus(node)
  + w_path × I_path(node)
  + w_neighbor × I_neighbor(node)
  + w_tension × I_tension(node)
  + w_meta × I_metadata(node)
  , 0, 1
)
```

Where:
- `I_focus` = focus indicator (0 or 1)
- `I_path` = path indicator (0 or 1)
- `I_neighbor` = neighborhood weight (0-1, decays with distance)
- `I_tension` = epistemic tension (0-1, controversy indicator)
- `I_metadata` = metadata importance (0-1, optional)
- `w_*` = weight parameters (tunable)

### Default Weights

```typescript
const SALIENCE_WEIGHTS = {
  focus: 1.0,      // Selected node always max salience
  path: 0.9,       // Path nodes nearly as important
  neighbor: 0.5,   // Neighbors less important
  tension: 0.6,    // NEW: Contested nodes highlighted (Gemini addition)
  metadata: 0.2,   // Future: node importance field
};
```

**Rationale for w_tension = 0.6:**
- High enough to make controversial nodes visually prominent
- Lower than path (contested nodes shouldn't dominate navigation)
- Adjustable based on user preference (some want controversy highlighted, others minimized)

---

## Indicator Functions

### Focus Indicator

```typescript
function I_focus(node: Node, selectedNodeId: string | null): number {
  return node.id === selectedNodeId ? 1.0 : 0.0;
}
```

Simple binary: selected node gets 1.0, all others get 0.0.

### Path Indicator

```typescript
function I_path(node: Node, focusPath: string[] | null): number {
  return focusPath && focusPath.includes(node.id) ? 1.0 : 0.0;
}
```

Binary: on path = 1.0, not on path = 0.0.

### Neighborhood Indicator

```typescript
function I_neighbor(node: Node, neighbors: Map<string, number>): number {
  const hopDistance = neighbors.get(node.id);

  if (hopDistance === undefined) return 0.0;  // Not in neighborhood

  // Decay function: linear decay with hop distance
  // 1-hop: 1.0, 2-hop: 0.6, 3-hop: 0.3, 4-hop+: 0.0
  const decay = Math.max(0, 1.0 - 0.4 * hopDistance);

  return decay;
}
```

**Alternative decay functions:**

Exponential: `decay = Math.exp(-0.5 * hopDistance)`
Inverse: `decay = 1.0 / (1.0 + hopDistance)`

Linear chosen for predictability and tunability.

### Tension Indicator (Gemini 3 Pro Addition)

**Purpose:** Highlight nodes at the "active frontiers" of knowledge - heavily supported AND heavily attacked.

**Gemini's Insight:** Without tension visualization, a refuted theory (Phlogiston) with many connections looks identical to a foundational theory (ZFC) with many connections. Tension distinguishes "Dead Ends" from "Load-Bearing Structures."

```typescript
function I_tension(node: Node, edges: Edge[]): number {
  // Find incoming support and attack edges
  const incomingSupports = edges.filter(
    e => e.to === node.id && (e.relation === 'supports' || e.relation === 'proves' || e.relation === 'entails')
  );
  const incomingAttacks = edges.filter(
    e => e.to === node.id && (e.relation === 'attacks' || e.relation === 'refutes')
  );

  // Sum weighted strengths
  const supportStrength = incomingSupports.reduce((sum, e) => sum + (e.weight || 0.7), 0);
  const attackStrength = incomingAttacks.reduce((sum, e) => sum + (e.weight || 0.7), 0);

  // Tension is high when BOTH support and attack are present
  // Use geometric mean to ensure both are needed
  const rawTension = Math.sqrt(supportStrength * attackStrength);

  // Normalize to [0, 1] range
  // Assuming max reasonable values: supportStrength ≈ 5, attackStrength ≈ 5 → max ≈ 5
  return Math.min(rawTension / 5.0, 1.0);
}
```

**Interpretation:**
- **tension = 0:** No conflict (only supports, only attacks, or neither)
- **tension = 0.3-0.5:** Mild controversy
- **tension = 0.6-0.8:** Active debate (e.g., Axiom of Choice)
- **tension = 0.9-1.0:** Intense controversy (e.g., Gettier Cases vs. JTB)

**Visual Mapping:**
- tension > 0.7: Node glows orange/yellow (hot)
- tension > 0.5: Pulsing animation
- tension < 0.3: No special effect

**Examples:**
- **ZFC Axioms:** High support, few attacks → tension ≈ 0.2 (settled foundation)
- **Axiom of Choice:** High support, moderate attacks → tension ≈ 0.6 (contested but accepted)
- **Gettier Cases:** Moderate support, high attacks on JTB → tension ≈ 0.8 (active frontier)
- **Phlogiston:** Low support, high attacks → tension ≈ 0.3 (dead end, not controversial)

---

### Metadata Indicator (Future)

```typescript
function I_metadata(node: Node): number {
  // Future: read from node.metadata.importance
  const importance = node.metadata?.importance;

  if (typeof importance === 'number') {
    return Math.max(0, Math.min(importance / 10, 1.0));  // Normalize 0-10 to 0-1
  }

  return 0.5;  // Default: medium importance
}
```

For MVP: return 0 (ignore) or 0.5 (neutral).

---

## Visual Mappings

### Size

```typescript
function computeSize(baseSizeconst, salience: number): number {
  // Scale from 50% to 200% of base size
  return baseSize * (0.5 + 1.5 * salience);
}
```

**Examples:**
- salience = 0.0 → size = 0.5× base (very small)
- salience = 0.5 → size = 1.25× base
- salience = 1.0 → size = 2.0× base (very large)

### Opacity

```typescript
function computeOpacity(salience: number): number {
  // Range from 20% to 100% opacity
  return 0.2 + 0.8 * salience;
}
```

**Examples:**
- salience = 0.0 → opacity = 0.2 (dim background)
- salience = 0.5 → opacity = 0.6
- salience = 1.0 → opacity = 1.0 (fully opaque)

### Label Visibility

```typescript
function shouldShowLabel(salience: number, minThreshold: number = 0.4): boolean {
  return salience > minThreshold;
}
```

Only show labels for nodes with salience > 0.4 to avoid clutter.

**Adjustable:** In crowded views, raise threshold to 0.6 or 0.7.

### Glow Intensity (Optional Effect)

```typescript
function computeGlow(salience: number, maxGlow: number = 0.5): number {
  return salience * maxGlow;
}
```

Glow renders as additive overlay or emissive material in 3D.

---

## Implementation

### React Hook

```typescript
// hooks/useSalience.ts

export function useSalience(
  nodes: Node[],
  selectedNodeId: string | null,
  focusPath: string[] | null,
  neighbors: Map<string, number>
): Map<string, number> {
  return useMemo(() => {
    const salience = new Map<string, number>();

    for (const node of nodes) {
      let score = 0;

      if (node.id === selectedNodeId) {
        score += SALIENCE_WEIGHTS.focus;
      }

      if (focusPath?.includes(node.id)) {
        score += SALIENCE_WEIGHTS.path;
      }

      const hopDist = neighbors.get(node.id);
      if (hopDist !== undefined) {
        const decay = Math.max(0, 1.0 - 0.4 * hopDist);
        score += SALIENCE_WEIGHTS.neighbor * decay;
      }

      salience.set(node.id, Math.min(score, 1.0));
    }

    return salience;
  }, [nodes, selectedNodeId, focusPath, neighbors]);
}
```

**Memoization:** Recomputes only when dependencies change, not on every frame.

---

## Edge Salience

Edges also have salience (for thickness, opacity):

```typescript
function computeEdgeSalience(
  edge: Edge,
  nodeSalience: Map<string, number>,
  focusPath: string[] | null
): number {
  // If edge is on focus path: high salience
  if (focusPath && isEdgeOnPath(edge, focusPath)) {
    return 1.0;
  }

  // Otherwise: average of endpoint saliences
  const fromSalience = nodeSalience.get(edge.from) || 0;
  const toSalience = nodeSalience.get(edge.to) || 0;

  return (fromSalience + toSalience) / 2;
}

function isEdgeOnPath(edge: Edge, path: string[]): boolean {
  for (let i = 0; i < path.length - 1; i++) {
    if (edge.from === path[i] && edge.to === path[i + 1]) {
      return true;
    }
  }
  return false;
}
```

**Edge visual mapping:**
- Width: `baseWidth * (0.3 + 1.7 * edgeSalience)`
- Opacity: `0.1 + 0.9 * edgeSalience`

---

## Tuning Parameters

All weights and thresholds exposed for tuning:

```typescript
export const SALIENCE_CONFIG = {
  weights: {
    focus: 1.0,
    path: 0.9,
    neighbor: 0.5,
    metadata: 0.2,
  },
  decay: {
    rate: 0.4,           // Linear decay rate per hop
    minValue: 0.0,       // Floor value
  },
  visual: {
    sizeMin: 0.5,        // Minimum size multiplier
    sizeMax: 2.0,        // Maximum size multiplier
    opacityMin: 0.2,
    opacityMax: 1.0,
    labelThreshold: 0.4, // Show labels above this salience
  },
  edge: {
    widthMin: 0.3,
    widthMax: 2.0,
    opacityMin: 0.1,
    opacityMax: 1.0,
  },
};
```

Can be loaded from configuration or exposed in UI as "advanced settings."

---

## Test Cases

```typescript
describe('Salience Computation', () => {
  test('selected node has salience 1.0', () => {
    const salience = computeSalience(nodes, 'abc123', null, new Map());
    expect(salience.get('abc123')).toBe(1.0);
  });

  test('1-hop neighbor has salience 0.5', () => {
    const neighbors = new Map([['neighbor1', 1]]);
    const salience = computeSalience(nodes, 'abc123', null, neighbors);
    // 0.5 (w_neighbor) * 1.0 (decay at hop 1) = 0.5
    expect(salience.get('neighbor1')).toBe(0.5);
  });

  test('2-hop neighbor has lower salience', () => {
    const neighbors = new Map([['neighbor2', 2]]);
    const salience = computeSalience(nodes, 'abc123', null, neighbors);
    // 0.5 * 0.6 (decay at hop 2) = 0.3
    expect(salience.get('neighbor2')).toBe(0.3);
  });

  test('path node has high salience even if not neighbor', () => {
    const path = ['abc123', 'mid', 'def456'];
    const salience = computeSalience(nodes, null, path, new Map());
    expect(salience.get('mid')).toBe(0.9);  // w_path
  });

  test('node with multiple factors sums correctly', () => {
    const neighbors = new Map([['abc123', 1]]);
    const path = ['abc123', 'def456'];
    const salience = computeSalience(nodes, 'abc123', path, neighbors);
    // w_focus (1.0) + w_path (0.9) + w_neighbor (0.5) = 2.4, clamped to 1.0
    expect(salience.get('abc123')).toBe(1.0);
  });

  test('background node has minimal salience', () => {
    const salience = computeSalience(nodes, 'abc123', null, new Map());
    expect(salience.get('faraway')).toBe(0.0);
  });
});

describe('Visual Application', () => {
  test('applies size based on salience', () => {
    const renderNode = applyVisuals(node, 1.0);
    expect(renderNode.size).toBe(baseSize * 2.0);
  });

  test('applies opacity based on salience', () => {
    const renderNode = applyVisuals(node, 0.5);
    expect(renderNode.opacity).toBeCloseTo(0.6);
  });

  test('shows label when salience > threshold', () => {
    expect(shouldShowLabel(0.5)).toBe(true);
    expect(shouldShowLabel(0.3)).toBe(false);
  });
});
```

---

## Load-Bearing Analysis (Gemini 3 Pro Addition)

**Purpose:** Identify structurally critical nodes whose removal would orphan many descendants.

**Gemini's Metaphor:** "If you attack this node, 50 other nodes collapse." Load-bearing nodes are the pillars of the knowledge graph.

### Load-Bearing Metric

```rust
// engine/src/analysis/load_bearing.rs

pub fn compute_load_bearing(node_id: u32, graph: &Graph) -> f32 {
    // Find all descendants (nodes reachable via epistemic edges)
    let descendants = find_all_descendants(node_id, graph);

    // For each descendant, check if it would lose ALL foundation paths if node_id removed
    let orphaned_count = descendants
        .iter()
        .filter(|&descendant_id| would_lose_all_foundations(*descendant_id, node_id, graph))
        .count();

    // Normalize: orphaned_count / total_graph_size
    orphaned_count as f32 / graph.node_count() as f32
}

fn would_lose_all_foundations(descendant: u32, removed_node: u32, graph: &Graph) -> bool {
    // Find all paths from foundations (depth 0) to descendant
    let foundation_paths = find_foundation_paths(descendant, graph);

    // Check if ALL paths go through removed_node
    foundation_paths.iter().all(|path| path.contains(&removed_node))
}
```

**Interpretation:**
- **load = 0:** Leaf node or isolated (no descendants)
- **load = 0.01-0.05:** Minor importance (1-5% of graph depends)
- **load = 0.05-0.2:** Significant (5-20% depends)
- **load = 0.2-0.5:** Critical (20-50% depends)
- **load > 0.5:** Foundational (>50% depends - likely a depth-0 axiom)

**Visual Mapping:**
- **Geometry:** load > 0.3 → Pillar shape (taller, thicker)
- **Thickness:** Node size × (1 + load)
- **Color saturation:** Increase saturation for high-load nodes
- **Glow:** Structural glow (blue/white) for load > 0.4

**Examples:**
- **Modus Ponens (logic):** load ≈ 0.6 (most math/philosophy depends on it)
- **ZFC Axioms:** load ≈ 0.4 (all ZFC-based math depends)
- **Pythagorean Theorem:** load ≈ 0.05 (some geometry depends, but not foundational)
- **Gettier Case 1:** load ≈ 0.01 (specific counterexample, few descendants)

### Implementation Considerations

**Performance:**
- Load-bearing is expensive to compute (requires graph traversal)
- **Optimization:** Compute during build phase, cache in GPU buffers
- **Update strategy:** Recompute only when graph structure changes (not during navigation)

**Caching:**
```rust
pub struct GpuNode {
    position: [f32; 3],
    size: f32,
    color: [f32; 4],
    domain_id: u32,
    type_id: u32,
    flags: u32,
    salience: f32,           // Runtime-computed
    tension: f32,             // Build-time computed
    load_bearing: f32,        // Build-time computed
    _padding: [f32; 2],
}
```

### Combining Tension and Load-Bearing

**Visual Priority:**
1. **High tension + High load:** CRITICAL CONTROVERSY (e.g., Axiom of Choice if heavily attacked)
   - Orange glow (tension) + Pillar (load) + Large size
2. **Low tension + High load:** SETTLED FOUNDATION (e.g., Modus Ponens)
   - Blue/white glow (structural) + Pillar + Large size
3. **High tension + Low load:** ACTIVE DEBATE (e.g., Gettier Cases)
   - Orange glow + Normal geometry + Medium size
4. **Low tension + Low load:** BACKGROUND NODE
   - No special effects + Small size

**User Value:**
- "Show me critical controversies" → filter(tension > 0.6 && load > 0.2)
- "Show me foundations" → filter(load > 0.3)
- "Show me active research" → filter(tension > 0.5)

---

## Future Enhancements

1. **Temporal Salience:**
   - Fade in newly added nodes over 500ms
   - Recently viewed nodes have slight boost for 5 seconds

2. **User Attention:**
   - Track which nodes user has clicked/viewed
   - Slight penalty for "already seen" nodes
   - Helps surface unexplored areas

3. **Semantic Similarity:**
   - If metadata includes embedding vectors
   - Boost salience of semantically similar nodes to selection

4. **Collaborative Salience:**
   - In multi-user mode: boost nodes others are viewing
   - Create shared attention field

5. **Dynamic Tension:**
   - Track how tension changes over time (version control)
   - Visualize "settled debates" (formerly high tension, now low)

All require additional metadata; not in MVP.

---

## Summary: Salience = Focus + Controversy + Structure

**Three dimensions of importance:**
1. **Navigational (Focus/Path/Neighbor):** What's relevant to current exploration
2. **Epistemic (Tension):** What's controversial or at the knowledge frontier
3. **Structural (Load-Bearing):** What's architecturally critical to the graph

This model transforms the graph from uniform to **dynamically focused**, creating a natural spotlight effect that guides exploration while highlighting both active debates and foundational pillars!
