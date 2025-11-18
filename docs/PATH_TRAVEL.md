# Path Travel Specification

Detailed specification for navigating through argument and proof paths in Truth Mines.

## Concept

**Path travel** transforms passive graph viewing into active knowledge exploration. Users can "walk through" a chain of reasoning step-by-step, experiencing each claim and its justification sequentially with full content display.

Think of it as a **guided tour through an argument** where the camera leads you from premise to conclusion, pausing at each node to present its content.

---

## User Journey

### 1. Path Selection

**User Goal:** "I want to understand how we get from foundational axioms to this theorem."

**Actions:**
1. User right-clicks start node (e.g., "Axiom of Choice")
2. Context menu: "Set as path start" ✓
3. User right-clicks end node (e.g., "Cantor's Theorem")
4. Context menu: "Find paths to this node"
5. System queries: `engine.find_paths(start, end, maxDepth=10)`
6. **PathChooser modal** appears with results

### 2. Path Chooser UI

```
┌─────────────────────────────────────────────────────────────┐
│  Found 2 paths from "Axiom of Choice" to "Cantor's Theorem" │
│                                                               │
│  Path 1: 3 hops, avg weight 0.92                            │
│  ● Axiom of Choice                                          │
│    → proves (0.95)                                           │
│  ● Existence of well-ordering                               │
│    → entails (0.90)                                          │
│  ● Power set cardinality                                    │
│    → proves (0.91)                                           │
│  ● Cantor's Theorem                                         │
│                                          [Select Path 1]     │
│                                                               │
│  Path 2: 4 hops, avg weight 0.78                            │
│  ● Axiom of Choice                                          │
│    → supports (0.80) → ... → (0.75) → ...                   │
│                                          [Select Path 2]     │
│                                                               │
│                                    [Cancel]                  │
└─────────────────────────────────────────────────────────────┘
```

**Interaction:**
- Hovering path: highlights it
- Clicking "Select": sets `focusPath` and enters PATH-FOCUSED state

### 3. Path Stepper UI

Once path selected, **Path Stepper** appears at bottom:

```
┌──────────────────────────────────────────────────────────────────┐
│  Path: Axiom of Choice → Cantor's Theorem                       │
│                                                                   │
│  [1]           →          [2]          →         [3]          →  [4]  │
│   ●         proves         ○         entails      ○        proves  ○   │
│  Axiom       0.95      Well-order    0.90     Power set    0.91  Cantor│
│  of Choice             ing                   cardinality        Theorem│
│                                                                   │
│  ◄ Prev                                          Next ►   [Exit]│
└──────────────────────────────────────────────────────────────────┘
```

**Features:**
- Current step: filled circle (●)
- Future steps: hollow circles (○)
- Relation labels and weights shown on arrows
- Clicking step: jump directly to that node
- Prev/Next buttons (also keyboard: ←/→)

---

## Camera Animation Specifications

### 2D Path Travel

**Step Animation (per edge):**

```typescript
async function travelToNextNode2D(
  camera: Camera2D,
  fromNode: Node,
  toNode: Node,
  edge: Edge
): Promise<void> {
  // Phase 1: Edge pulse (100ms)
  await pulseEdge(edge, 100);

  // Phase 2: Camera pan from fromNode to toNode (400ms)
  await animatePan(
    camera,
    fromNode.position,
    toNode.position,
    400
  );

  // Phase 3: Dwell at toNode (1500ms)
  // During dwell: update NodeDetail panel
  updateNodePanel(toNode);
  await delay(1500);
}
```

**Total per step:** ~2 seconds (100ms + 400ms + 1500ms)

### 3D Path Travel

**Spline-Based Animation:**

```typescript
function computePathSpline(pathNodes: Node[]): CubicHermiteSpline {
  const points = pathNodes.map(n => n.position);
  const tangents = [];

  for (let i = 0; i < points.length; i++) {
    if (i === 0) {
      // Start tangent: direction to next
      tangents[i] = normalize(sub(points[i+1], points[i]));
    } else if (i === points.length - 1) {
      // End tangent: direction from previous
      tangents[i] = normalize(sub(points[i], points[i-1]));
    } else {
      // Middle tangent: average of in and out
      const incoming = normalize(sub(points[i], points[i-1]));
      const outgoing = normalize(sub(points[i+1], points[i]));
      tangents[i] = normalize(add(incoming, outgoing));
    }
  }

  return new CubicHermiteSpline(points, tangents);
}
```

**Step Animation:**

```typescript
async function travelToNextNode3D(
  camera: Camera3D,
  spline: CubicHermiteSpline,
  currentStep: number,
  nextStep: number,
  duration: number = 2000
): Promise<void> {
  const startT = currentStep / (spline.points.length - 1);
  const endT = nextStep / (spline.points.length - 1);

  const startTime = performance.now();

  return new Promise((resolve) => {
    function frame(time: number) {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1.0);
      const eased = easeInOutCubic(progress);

      // Interpolate along spline
      const t = lerp(startT, endT, eased);
      const position = spline.evaluate(t);
      const tangent = spline.evaluateTangent(t);

      camera.position = position;
      camera.lookAt(add(position, tangent));  // Look ahead

      // Fade content card
      if (progress < 0.3) {
        // Fade out current node
        setCardOpacity(1.0 - progress / 0.3);
      } else if (progress > 0.7) {
        // Fade in next node
        setCardOpacity((progress - 0.7) / 0.3);
        setCardNode(nextNode);
      }

      if (progress < 1.0) {
        requestAnimationFrame(frame);
      } else {
        resolve();
      }
    }

    requestAnimationFrame(frame);
  });
}
```

**Timing breakdown:**
- Edge animation: 2000ms total
  - 0-600ms: leave current node, fade out card
  - 600-1400ms: travel along edge
  - 1400-2000ms: approach next node, fade in card
- Dwell: 1500ms at node (card fully visible)

**Total per step:** ~3.5 seconds (2s animation + 1.5s dwell)

---

## Keyboard Navigation

### Event Handler

```typescript
function handlePathKeyboard(e: KeyboardEvent): void {
  if (interactionMode !== 'path-focused') return;

  switch(e.key) {
    case 'ArrowRight':
    case 'k':
      e.preventDefault();
      if (currentPathStep < focusPath.length - 1) {
        advanceStep();
      }
      break;

    case 'ArrowLeft':
    case 'j':
      e.preventDefault();
      if (currentPathStep > 0) {
        previousStep();
      }
      break;

    case 'Escape':
      e.preventDefault();
      exitPathMode();
      break;

    case ' ':
      e.preventDefault();
      toggleAutoPlay();
      break;
  }
}
```

### Auto-Play

```typescript
function startAutoPlay(
  intervalMs: number = 3500  // 3.5s per step
): void {
  if (autoPlayTimer) return;  // Already playing

  autoPlayTimer = setInterval(() => {
    if (currentPathStep < focusPath.length - 1) {
      advanceStep();
    } else {
      stopAutoPlay();  // Reached end
    }
  }, intervalMs);
}
```

**Controls:**
- ▶ button: start auto-play
- ⏸ button: pause
- Speed dropdown: 0.5×, 1×, 2× (adjusts intervalMs)

---

## Path Visualization

### Node Rendering in PATH-FOCUSED

```typescript
function renderNodeInPathMode(
  node: Node,
  focusPath: string[],
  currentStep: number
): RenderProps {
  const onPath = focusPath.includes(node.id);
  const isCurrent = focusPath[currentStep] === node.id;

  if (!onPath) {
    // Background node: very dim
    return {
      size: baseSize * 0.4,
      opacity: 0.15,
      showLabel: false,
      color: desaturate(node.color, 0.7),
    };
  }

  // On path
  const stepIndex = focusPath.indexOf(node.id) + 1;

  return {
    size: isCurrent ? baseSize * 2.0 : baseSize * 1.5,
    opacity: isCurrent ? 1.0 : 0.8,
    showLabel: true,
    color: node.color,
    badge: stepIndex.toString(),  // Show "1", "2", "3", ...
    glow: isCurrent ? 0.5 : 0.2,
  };
}
```

### Edge Rendering in PATH-FOCUSED

```typescript
function renderEdgeInPathMode(
  edge: Edge,
  focusPath: string[]
): RenderProps {
  const onPath = isEdgeOnPath(edge, focusPath);

  if (!onPath) {
    return {
      width: baseWidth * 0.2,
      opacity: 0.1,
      color: gray,
    };
  }

  // On path: thick glowing line
  return {
    width: baseWidth * 2.5,
    opacity: 1.0,
    color: relationColor(edge.relation),  // Green/blue/etc.
    glow: 0.4,
    arrowhead: true,
  };
}
```

---

## Content Display Synchronization

### NodeDetail Panel Updates

```typescript
function syncNodePanelWithPath(
  focusPath: string[],
  currentStep: number
): void {
  const currentNodeId = focusPath[currentStep];

  // Update panel content
  setSelectedNodeId(currentNodeId);

  // Highlight current step in content
  // e.g., show "Step 2 of 4" badge

  // Optionally show relation from previous step
  if (currentStep > 0) {
    const prevNodeId = focusPath[currentStep - 1];
    const connectingEdge = findEdge(prevNodeId, currentNodeId);

    showRelationBadge(connectingEdge.relation, connectingEdge.weight);
    // e.g., "Supported by previous (weight: 0.9)"
  }
}
```

---

## Edge Cases & Error Handling

### No Path Found

```typescript
if (paths.length === 0) {
  showNotification({
    type: 'info',
    message: `No path found from "${startNode.title}" to "${endNode.title}" within depth ${maxDepth}`,
    action: 'Try increasing max depth or selecting closer nodes',
  });
}
```

### Path Too Long

```typescript
if (paths[0].length > 20) {
  showWarning({
    message: 'Path is very long (20+ steps). This may be overwhelming.',
    options: ['Continue anyway', 'Shorten depth', 'Cancel'],
  });
}
```

### Circular Dependencies

Engine already handles cycles (find_paths returns simple paths), but in UI:

```typescript
// Check if path contains loops
function hasLoop(path: string[]): boolean {
  const seen = new Set<string>();
  for (const nodeId of path) {
    if (seen.has(nodeId)) return true;
    seen.add(nodeId);
  }
  return false;
}

// Should never happen if engine correct, but defensive check
if (hasLoop(selectedPath)) {
  console.error('Path contains loop - engine bug');
  // Fall back to simple A→B display
}
```

---

## Performance Optimization

### Path Caching

```typescript
const pathCache = useMemo(() => {
  const cache = new Map<string, string[][]>();  // key: "start:end"

  return {
    get(start: string, end: string): string[][] | null {
      return cache.get(`${start}:${end}`) || null;
    },
    set(start: string, end: string, paths: string[][]): void {
      cache.set(`${start}:${end}`, paths);
    },
  };
}, []);
```

Avoids re-querying engine for same start/end pair.

### Lazy Animation

Don't animate if path not visible:

```typescript
if (document.hidden) {
  // Page not visible: skip animation, jump instantly
  setCurrentStep(nextStep);
  return;
}
```

---

## Accessibility

### Keyboard-Only Navigation

```typescript
<div
  role="region"
  aria-label="Path navigation"
  aria-live="polite"  // Announces step changes
  aria-atomic="true"
>
  <span className="sr-only">
    Step {currentStep + 1} of {focusPath.length}: {currentNode.title}
  </span>

  <PathStepper ... />
</div>
```

### Reduced Motion

```typescript
const animationDuration = useReducedMotion()
  ? 0                    // Instant
  : 2000;                // 2 seconds

function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(query.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    query.addEventListener('change', handler);
    return () => query.removeEventListener('change', handler);
  }, []);

  return prefersReduced;
}
```

---

## Integration with Engine

### WASM Methods Needed

```rust
// In wasm.rs

#[wasm_bindgen]
impl GraphEngine {
    /// Find all paths between two nodes
    ///
    /// Returns array of paths as JsValue
    #[wasm_bindgen(js_name = findPaths)]
    pub fn find_paths_wasm(
        &self,
        from_id: &str,
        to_id: &str,
        max_depth: u32
    ) -> JsValue {
        let paths = self.graph.find_paths(from_id, to_id, max_depth);

        // Convert Vec<Vec<&Node>> to JsValue array
        let js_paths = js_sys::Array::new();

        for path in paths {
            let js_path = js_sys::Array::new();
            for node in path {
                // Serialize node to JsValue
                let node_obj = /* serialize node */;
                js_path.push(&node_obj);
            }
            js_paths.push(&js_path);
        }

        js_paths.into()
    }

    /// Compute spline control points for smooth camera path
    #[wasm_bindgen(js_name = computeCameraSpline)]
    pub fn compute_camera_spline(&self, path_ids: Vec<String>) -> js_sys::Float32Array {
        // Implementation: Catmull-Rom or Hermite spline
        // Returns flattened array of 3D points for camera positions
        unimplemented!("To be implemented in Epic 9")
    }
}
```

### TypeScript Integration

```typescript
// hooks/usePathTravel.ts

export function usePathTravel(engine: GraphEngine | null) {
  const [focusPath, setFocusPath] = useState<string[] | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const findPaths = useCallback(async (start: string, end: string) => {
    if (!engine) return [];

    const paths = engine.findPaths(start, end, 10);
    return paths;  // Array of path arrays
  }, [engine]);

  const advanceStep = useCallback(() => {
    if (!focusPath) return;
    if (currentStep < focusPath.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [focusPath, currentStep]);

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  return { focusPath, currentStep, findPaths, advanceStep, previousStep };
}
```

---

## Test Plan

### Path Selection Tests

```typescript
describe('Path Selection', () => {
  test('right-click sets path start node', async () => {
    const user = userEvent.setup();
    render(<Graph2D ... />);

    await user.pointer({ keys: '[MouseRight]', target: nodeA });
    expect(screen.getByText(/set as path start/i)).toBeVisible();
  });

  test('PathChooser displays all found paths', () => {
    const paths = [
      ['a', 'b', 'c'],
      ['a', 'd', 'e', 'c'],
    ];
    render(<PathChooser paths={paths} onSelect={vi.fn()} />);

    expect(screen.getByText(/path 1: 3 hops/i)).toBeVisible();
    expect(screen.getByText(/path 2: 4 hops/i)).toBeVisible();
  });

  test('selecting path sets focusPath state', async () => {
    const onSelect = vi.fn();
    render(<PathChooser ... />);

    await userEvent.click(screen.getByText(/select path 1/i));
    expect(onSelect).toHaveBeenCalledWith(['a', 'b', 'c']);
  });
});
```

### Path Travel Tests

```typescript
describe('Path Travel', () => {
  test('PathStepper highlights current step', () => {
    render(<PathStepper path={['a','b','c']} currentStep={1} />);

    const stepA = screen.getByText(/step 1/i).closest('.step');
    const stepB = screen.getByText(/step 2/i).closest('.step');

    expect(stepA).not.toHaveClass('current');
    expect(stepB).toHaveClass('current');
  });

  test('arrow right advances one step', async () => {
    const { user } = setupPathFocusedState();

    await user.keyboard('{ArrowRight}');

    expect(getCurrentStep()).toBe(1);  // Was 0, now 1
  });

  test('arrow left goes back', async () => {
    const { user } = setupPathFocusedState({ currentStep: 2 });

    await user.keyboard('{ArrowLeft}');

    expect(getCurrentStep()).toBe(1);
  });

  test('camera animates between steps', async () => {
    const cameraPos = camera.position;
    advanceStep();

    await waitFor(() => {
      expect(camera.position).not.toEqual(cameraPos);  // Moved
    });
  });

  test('ESC exits path mode', async () => {
    const { user } = setupPathFocusedState();

    await user.keyboard('{Escape}');

    expect(getInteractionMode()).not.toBe('path-focused');
  });
});
```

---

## Future Enhancements

### Narrated Paths

Add text-to-speech:

```typescript
function narratePath(node: Node, edge?: Edge): void {
  const text = edge
    ? `This ${edge.relation} the next claim: ${node.title}. ${node.content}`
    : `Starting with: ${node.title}. ${node.content}`;

  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  }
}
```

### Path Comparison

Show multiple paths side-by-side:

```
Path 1: A → B → C (strong: avg 0.9)
Path 2: A → D → E → C (weak: avg 0.6)

Comparison: Path 1 is more direct and better supported.
```

### Path Export

Export path as:
- Markdown (argument outline)
- TOON (for LLM analysis)
- JSON (for sharing)

---

This specification provides everything needed to implement immersive path-based knowledge exploration with TDD!
