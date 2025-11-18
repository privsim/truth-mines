# Interaction Specification

Detailed behavioral specification for Truth Mines visualization interactions.

## State Machine

### Global App State

```typescript
interface AppInteractionState {
  mode: 'overview' | 'node-focused' | 'path-focused' | 'tree-view';
  selectedNodeId: string | null;
  focusPath: string[] | null;  // Array of node IDs
  currentPathStep: number;      // Index into focusPath
  k: number;                     // K-hop neighborhood depth (default: 2)
}
```

### State Transitions

```
                    ┌─────────────┐
                    │   OVERVIEW  │
                    └──────┬──────┘
                           │
                    click node │
                           ↓
                 ┌─────────────────┐
         ┌───────│  NODE-FOCUSED   │◄──────┐
         │       └─────────┬────────┘       │
         │                 │                │
    click bg │     select path │    click different
         │                 ↓           node │
         │       ┌──────────────────┐       │
         │       │  PATH-FOCUSED    │───────┘
         │       └─────────┬────────┘
         │                 │
         │             ESC │
         │                 ↓
         └───────────► (previous state)

                 press T │ (if node selected)
                         ↓
                 ┌─────────────┐
                 │  TREE-VIEW  │
                 └──────┬──────┘
                        │
                 press G │ or "Back to graph"
                        ↓
               NODE-FOCUSED or OVERVIEW
```

### Transition Rules

**To NODE-FOCUSED:**
- FROM: overview
- TRIGGER: click node, search selection
- ACTIONS:
  1. Set selectedNodeId
  2. Query k-hop neighborhood
  3. Center camera on node
  4. Open NodeDetail panel
  5. Compute salience (focus + neighbors)

**To PATH-FOCUSED:**
- FROM: node-focused
- TRIGGER: path selected via PathChooser
- ACTIONS:
  1. Set focusPath array
  2. Set currentPathStep = 0
  3. Dim non-path nodes
  4. Highlight path nodes and edges
  5. Show PathStepper UI
  6. Enable keyboard navigation

**To TREE-VIEW:**
- FROM: node-focused
- TRIGGER: press T or click "Justification" tab
- ACTIONS:
  1. Compute tree layout
  2. Re-render graph as tree
  3. Highlight foundation nodes
  4. Show "Back to graph" button

**To OVERVIEW:**
- FROM: any
- TRIGGER: click background, clear button, ESC
- ACTIONS:
  1. Clear selectedNodeId
  2. Clear focusPath
  3. Reset salience to filters only
  4. Close NodeDetail panel
  5. Restore full graph view

---

## Interaction Behaviors

### 1. Hover (All States)

**Trigger:** Mouse enters node hit area

**Actions:**
1. Start 150ms debounce timer
2. If mouse still over node after 150ms:
   - Fetch node data (if not already loaded)
   - Create tooltip at cursor + offset
   - Display: title, type • domain, content (120 chars)
3. If mouse leaves:
   - Start 300ms hide timer
   - Remove tooltip after delay

**Edge Cases:**
- Hovering new node: immediately hide old tooltip, show new
- Tooltip near screen edge: flip position
- Tooltip over UI element: adjust z-index

---

### 2. Node Click

**2D Click Detection:**
```typescript
function detectNodeClick(mouseX: number, mouseY: number, nodes: VisibleNode[]): string | null {
  for (const node of nodes) {
    const dx = mouseX - node.screenX;
    const dy = mouseY - node.screenY;
    const dist = Math.sqrt(dx*dx + dy*dy);

    if (dist <= node.radius + clickTolerance) {
      return node.id;
    }
  }
  return null; // Background click
}
```

**3D Click Detection:**
```typescript
function rayCastClick(
  mouseX: number,
  mouseY: number,
  camera: Camera,
  nodes: Node[]
): string | null {
  const ray = camera.screenToWorldRay(mouseX, mouseY);

  let closest = null;
  let closestDist = Infinity;

  for (const node of nodes) {
    const intersect = raySphereIntersect(ray, node.position, node.radius);
    if (intersect && intersect.distance < closestDist) {
      closestDist = intersect.distance;
      closest = node.id;
    }
  }

  return closest;
}
```

**Actions After Click:**
See "To NODE-FOCUSED" transition above.

---

### 3. Camera Centering

**2D Pan Animation:**
```typescript
function animatePan2D(
  currentCenter: [number, number],
  targetCenter: [number, number],
  duration: number = 300
): void {
  const startTime = performance.now();

  function frame(time: number) {
    const elapsed = time - startTime;
    const t = Math.min(elapsed / duration, 1.0);
    const eased = easeInOutCubic(t);

    const x = lerp(currentCenter[0], targetCenter[0], eased);
    const y = lerp(currentCenter[1], targetCenter[1], eased);

    camera.setCenter(x, y);

    if (t < 1.0) {
      requestAnimationFrame(frame);
    }
  }

  requestAnimationFrame(frame);
}
```

**3D Fly-To Animation:**
```typescript
function flyToNode3D(
  camera: Camera3D,
  targetPosition: [number, number, number],
  duration: number = 800
): Promise<void> {
  return new Promise((resolve) => {
    const startPos = camera.position;
    const startTime = performance.now();

    // Compute control points for smooth curve
    const midPoint = computeMidPoint(startPos, targetPosition);

    function frame(time: number) {
      const elapsed = time - startTime;
      const t = Math.min(elapsed / duration, 1.0);
      const eased = easeInOutCubic(t);

      // Bezier curve through start, mid, target
      camera.position = bezier3(startPos, midPoint, targetPosition, eased);
      camera.lookAt(targetPosition);

      if (t < 1.0) {
        requestAnimationFrame(frame);
      } else {
        resolve();
      }
    }

    requestAnimationFrame(frame);
  });
}
```

---

## Salience Computation

**Input:**
- selectedNodeId (or null)
- focusPath (or null)
- k-hop neighbors (from engine)
- node metadata (optional importance)

**Output:**
- Map of nodeId → salience value (0-1)

**Algorithm:**
```typescript
function computeSalience(
  nodes: Node[],
  selectedNodeId: string | null,
  focusPath: string[] | null,
  neighbors: Map<string, number>  // nodeId → hop distance
): Map<string, number> {
  const salience = new Map<string, number>();

  for (const node of nodes) {
    let score = 0;

    // Focus component
    if (node.id === selectedNodeId) {
      score += 1.0;  // w_focus = 1.0
    }

    // Path component
    if (focusPath && focusPath.includes(node.id)) {
      score += 0.9;  // w_path = 0.9
    }

    // Neighborhood component
    const hopDist = neighbors.get(node.id);
    if (hopDist !== undefined) {
      // Decay: 1.0 for 1-hop, 0.6 for 2-hop, 0.3 for 3-hop
      const neighborWeight = Math.max(0, 1.0 - 0.4 * hopDist);
      score += 0.5 * neighborWeight;  // w_neighbor = 0.5
    }

    // Metadata component (optional, future)
    // const importance = node.metadata?.importance || 0.5;
    // score += 0.2 * importance;  // w_meta = 0.2

    salience.set(node.id, Math.min(score, 1.0));
  }

  return salience;
}
```

**Visual Application:**
```typescript
function applySalience(node: RenderNode, salience: number): void {
  // Size scaling
  node.size = baseSize * (0.5 + 1.5 * salience);

  // Opacity
  node.opacity = 0.2 + 0.8 * salience;

  // Label
  node.showLabel = salience > 0.4;

  // Glow (optional)
  node.glowIntensity = salience * maxGlow;
}
```

---

## Keyboard Shortcuts

### Implementation

```typescript
useEffect(() => {
  function handleKeyDown(e: KeyboardEvent) {
    // Path navigation (only in PATH-FOCUSED)
    if (interactionMode === 'path-focused') {
      if (e.key === 'ArrowRight' || e.key === 'k') {
        e.preventDefault();
        advancePathStep();
      }
      if (e.key === 'ArrowLeft' || e.key === 'j') {
        e.preventDefault();
        previousPathStep();
      }
      if (e.key === 'Escape') {
        exitPathMode();
      }
      if (e.key === ' ') {
        toggleAutoPlay();
      }
    }

    // Tree view toggle
    if (e.key === 't' && selectedNodeId) {
      toggleTreeView();
    }
    if (e.key === 'g' && interactionMode === 'tree-view') {
      returnToGraphView();
    }

    // 3D fly-to
    if (e.key === 'f' && selectedNodeId && viewMode === '3d') {
      flyToSelectedNode();
    }

    // Global: clear selection
    if (e.key === 'Escape' && interactionMode !== 'path-focused') {
      clearSelection();
    }
  }

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [interactionMode, selectedNodeId, viewMode]);
```

---

## Testing Strategy

### Unit Tests
- Component rendering (NodeTooltip, PathStepper, etc.)
- Salience calculation (pure function)
- Ray intersection (deterministic math)
- State transitions (reducer pattern)

### Integration Tests
- Click → camera animation → panel update (full flow)
- Path selection → stepper UI → keyboard nav
- View toggle → state preservation

### E2E Tests (Playwright)
```typescript
test('hover node shows tooltip with content preview')
test('click node centers camera and opens panel')
test('select path and travel through with keyboard')
test('toggle 2D/3D preserves selection and path')
```

---

## Accessibility

### Keyboard Navigation
- All interactions keyboard-accessible
- Logical tab order
- Focus indicators visible

### Screen Reader Support
```typescript
<div
  role="button"
  aria-label={`Node: ${node.title}, ${node.type} in ${node.domain}`}
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>
```

### Reduced Motion
```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const animationDuration = prefersReducedMotion ? 0 : 300;  // Skip or instant
```

---

This specification provides complete implementation guidance for all Epic 9 issues with TDD-ready test plans!
