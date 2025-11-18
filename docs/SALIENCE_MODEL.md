# Salience Model Specification

Mathematical specification for computing dynamic visual weight in Truth Mines.

## Overview

**Salience** is a scalar value (0-1) assigned to each node that determines its visual prominence. High salience = larger, brighter, labeled. Low salience = smaller, dimmer, no label.

This creates a **dynamic focus** where the graph reorganizes visually around what matters in the current interaction context.

---

## Mathematical Definition

### Core Formula

```
salience(node) = clamp(
    w_focus × I_focus(node)
  + w_path × I_path(node)
  + w_neighbor × I_neighbor(node)
  + w_meta × I_metadata(node)
  , 0, 1
)
```

Where:
- `I_focus` = focus indicator (0 or 1)
- `I_path` = path indicator (0 or 1)
- `I_neighbor` = neighborhood weight (0-1, decays with distance)
- `I_metadata` = metadata importance (0-1, optional)
- `w_*` = weight parameters (tunable)

### Default Weights

```typescript
const SALIENCE_WEIGHTS = {
  focus: 1.0,      // Selected node always max salience
  path: 0.9,       // Path nodes nearly as important
  neighbor: 0.5,   // Neighbors less important
  metadata: 0.2,   // Future: node importance field
};
```

For MVP: `w_metadata = 0` (ignore metadata component)

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

All require additional metadata; not in MVP.

---

This model transforms the graph from uniform to **dynamically focused**, creating a natural spotlight effect that guides exploration!
