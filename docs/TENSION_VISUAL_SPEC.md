# Tension Visualization Specification

**Version:** 1.0.0
**Status:** DRAFT - Awaiting Gemini 3 Pro Review
**Purpose:** Define visual encoding for epistemic tension in 2D graph

**Epic:** 2D Polish Phase (Option 1)
**Related:** Gemini 3 Pro tension metric, salience system

---

## Overview

### Current State

**Tension Metric:** ✅ Fully implemented and tested
- Formula: `tension = sqrt(support_strength × attack_strength) / 5.0`
- Range: [0, 1]
- Integrated into salience calculation (w_tension = 0.6)
- 10 comprehensive tests passing

**Visual Representation:** ⚠️ Indirect only
- High-tension nodes appear larger (via salience → size)
- No direct visual indicator (color, glow, animation)

### Goal

Add **explicit visual encodings** so users can instantly identify controversial nodes without inspecting sizes.

**Gemini's Insight:** "A 'refuted' theory (Phlogiston) might look identical to a 'foundational' theory (ZFC) if both have many connections. Tension distinguishes 'Dead Ends' from 'Load-Bearing Structures.'"

---

## Tension Thresholds

### Three Levels

**Low Tension (0.0 - 0.3):**
- **Meaning:** Settled, minimal controversy
- **Example:** Modus Ponens (high support, few/no attacks)
- **Visual:** Normal rendering (no special effect)

**Medium Tension (0.3 - 0.7):**
- **Meaning:** Active debate, moderate controversy
- **Example:** Axiom of Choice (strong support + moderate attacks)
- **Visual:** Subtle indicator (yellow tint or thin border)

**High Tension (0.7 - 1.0):**
- **Meaning:** Intense controversy, active frontier
- **Example:** Gettier Cases vs JTB (balanced support + attacks)
- **Visual:** Prominent indicator (orange glow + pulse animation)

---

## ✅ Visual Encoding Decision (Gemini 3 Pro)

**Chosen:** Hybrid of Option B (Glow) + Status-Based Color

**Gemini's Guidance:** "Use **Border + Static Glow**. Avoid icons (clutter). Avoid color replacement (loss of domain context)."

---

## Visual Encoding Options

### ✅ Selected: Border + Static Glow + Status Color

**Implementation:** SVG/Canvas stroke around node

**Low (0-0.3):**
- No border (or standard border)

**Medium (0.3-0.7):**
- Yellow border, 2px thickness
- No animation

**High (0.7-1.0):**
- Orange border, 3px thickness
- Pulse animation (scale 1.0 → 1.1 → 1.0, 2s period)

**Pros:**
- Clear, not distracting
- Works with existing size/color encoding
- Accessible (doesn't rely on color alone)

**Cons:**
- Border might be hard to see on small nodes

### Option B: Glow Effect (CSS box-shadow)

**Implementation:** Radial gradient or box-shadow

**Low:** No glow

**Medium:** `box-shadow: 0 0 10px rgba(234, 179, 8, 0.5)` (yellow glow)

**High:** `box-shadow: 0 0 20px rgba(249, 115, 22, 0.8)` (orange glow) + pulse

**Pros:**
- Very visible
- Feels "hot" (controversy = heat)
- Matches Gemini's metaphor

**Cons:**
- Can be visually overwhelming
- Harder to implement in Canvas (need custom rendering)

### Option C: Icon Overlay

**Implementation:** Small warning icon on node

**Low:** No icon

**Medium:** ⚠️ Yellow triangle

**High:** 🔥 Fire icon or red badge

**Pros:**
- Unambiguous (icon explicitly means "contested")
- Accessible (not just color)

**Cons:**
- Adds visual clutter
- Might obscure node itself on small scales

### Option D: Color Replacement (NOT RECOMMENDED)

**Implementation:** Replace domain color with tension color

**Low → High:** Blue → Yellow → Orange

**Pros:**
- Very simple

**Cons:**
- Loses domain information (can't tell phil vs math vs physics)
- Conflicts with existing color encoding

**Rejected:** Domain color is more important than tension

---

## ✅ DECISION (Gemini 3 Pro): Static Border + Glow, NO Constant Pulse

**Gemini's Recommendation:** "Use **Option B (Glow/Border) + D (Color)**. **Avoid constant pulsing animations.** It fatigues the eye. Only pulse on hover."

**Rationale (Gemini):**
- Constant animation is "bad for accessibility and focus"
- Preserves user attention for intentional interactions
- Static glow is sufficient for indicating controversy

**Final Multi-Encoding Approach:**

1. **Size:** High tension → Larger (via salience) ✅ Already implemented
2. **Border + Glow:** High tension → Orange border with glow (STATIC, not animated)
3. **Hover Animation:** High tension + hover → ONE-TIME pulse effect
4. **Status Color:** Refuted vs Active distinction
5. **Tooltip:** Show numeric tension score on hover

**Visual States:**

**Dead Ends (Refuted Theory - e.g., Phlogiston):**
- Desaturated domain color (50% saturation)
- Red border (#EF4444)
- Static (no glow)

**Active Frontiers (Contested - e.g., Axiom of Choice):**
- Bright domain color (100% saturation)
- Orange glow/border (#F97316)
- Static, pulse only on hover

---

## CSS Implementation

### ⚠️ Animation Strategy (REVISED per Gemini)

**Original Plan:** Constant 2Hz pulse for high-tension nodes
**Gemini Feedback:** "Avoid constant pulsing. It is bad for accessibility and focus."

**New Approach:** Static glow + hover-triggered pulse

**Static Rendering (Always):**
```typescript
// In Canvas rendering: Draw static border/glow
if (tension >= 0.7) {
  drawStaticGlow(ctx, node, '#F97316', 3);  // Orange, 3px border
} else if (tension >= 0.3) {
  drawStaticGlow(ctx, node, '#EAB308', 2);  // Yellow, 2px border
}
```

**Hover-Triggered Animation (Interaction Only):**
```css
/* Only animate on hover, not constantly */
@keyframes hover-pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}

.node-high-tension:hover {
  animation: hover-pulse 1s ease-in-out;
}

/* Respect accessibility */
@media (prefers-reduced-motion: reduce) {
  .node-high-tension:hover {
    animation: none;
  }
}
```

**Key Change:** NO constant ambient animation, ONLY on hover/interaction

### Class Application

```typescript
// In react-force-graph-2d nodeCanvasObjectMode or custom rendering
const getTensionClass = (tension: number): string => {
  if (tension >= 0.7) return 'tension-high';
  if (tension >= 0.3) return 'tension-medium';
  return 'tension-low';
};
```

**Note:** react-force-graph-2d uses Canvas, not DOM. Need custom `nodeCanvasObject` for borders.

### Canvas Rendering (for Border)

```typescript
const nodeCanvasObjectMode = () => 'after'; // Draw after node

const nodeCanvasObject = (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
  const tension = computeTension(node.id, edges);

  if (tension >= 0.3) {
    const size = nodeVal(node);
    const borderColor = tension >= 0.7 ? '#F97316' : '#EAB308'; // Orange or Yellow
    const borderWidth = (tension >= 0.7 ? 3 : 2) / globalScale;

    // Pulse effect (via time-varying radius)
    const time = Date.now() / 1000;
    const pulse = tension >= 0.7 ? 1 + 0.05 * Math.sin(time * 2 * Math.PI) : 1;

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderWidth;
    ctx.beginPath();
    ctx.arc(node.x, node.y, size * pulse + borderWidth, 0, 2 * Math.PI);
    ctx.stroke();
  }
};
```

---

## Integration with Existing Systems

### Salience System

**Current:** Tension affects size (w_tension × I_tension)

**Addition:** Tension affects border (direct visual encoding)

**No Conflict:** Size AND border work together:
- High salience + high tension: Large node with orange border (critical controversy)
- High salience + low tension: Large node, no border (foundational/important)
- Low salience + high tension: Normal size with border (background controversy)

### Graph2D Component

**Changes:**
1. Compute tension for each node (already available via edges)
2. Add nodeCanvasObject for border rendering
3. Optionally add pulse animation via requestAnimationFrame

**Backward Compatible:** Existing graph still works if tension features disabled

---

## Visual Test Cases

### Snapshot Testing

1. **Low tension node:** Normal rendering
2. **Medium tension node:** Yellow border
3. **High tension node:** Orange border + pulse
4. **Selected high-tension node:** Both selection highlight AND tension border
5. **Hover on tension node:** Tooltip shows tension score

### Visual Regression

- Compare screenshots before/after
- Verify colors match spec (#F97316 for orange, #EAB308 for yellow)
- Confirm animation respects prefers-reduced-motion

---

## Accessibility Considerations

### Color Blindness

**Issue:** Orange/yellow distinction might not work for deuteranopia

**Solution:**
- Use both color AND thickness (2px vs 3px)
- Add icon indicator (⚠️) for high tension (optional)
- Tooltip always shows numeric tension score

### Motion Sensitivity

**Issue:** Pulse animation might trigger motion sickness

**Solution:**
```css
@media (prefers-reduced-motion: reduce) {
  /* Disable pulse, keep border */
  .tension-high { animation: none; }
}
```

### Screen Readers

**Solution:**
- Add `aria-label` with tension status
- Example: `aria-label="Axiom of Choice - High controversy (tension: 0.85)"`

---

## Performance Optimization

### Animation Performance

**Issue:** Continuous pulse animation could impact frame rate

**Solution:**
- Use CSS animations (GPU-accelerated) where possible
- For Canvas: limit to 30fps, not 60fps
- Only animate visible nodes (frustum culling)

### Tension Computation

**Issue:** Computing tension for all nodes every frame is expensive

**Solution:**
- Pre-compute tension map: `Map<string, number>`
- useMemo with `[edges]` dependency
- Only recompute when graph changes (rare)

**Code:**
```typescript
const tensionMap = useMemo(() => {
  const map = new Map<string, number>();
  for (const node of nodes) {
    map.set(node.id, computeTension(node.id, edges));
  }
  return map;
}, [nodes, edges]);
```

---

## Questions for Gemini Review

### Visual Design

1. **Encoding Choice:** Border + pulse (Option A) vs Glow (Option B) vs Icon (Option C)?
2. **Color Choice:** Orange/yellow appropriate for "controversy"? Alternative: Red for high, yellow for medium?
3. **Animation Speed:** 2-second pulse period too slow/fast?

### Philosophical Accuracy

4. **Tension Interpretation:** Does high tension = "active frontier" or "unresolved problem"?
5. **Dead Ends:** How to visually distinguish "refuted" (Phlogiston) from "contested but viable" (Axiom of Choice)?
6. **Settled vs Uncontested:** How to show "No attacks because obviously true" vs "No attacks because unexplored"?

### UX Impact

7. **Cognitive Load:** Will orange pulsing nodes be distracting or helpful?
8. **Discovery:** Will users notice tension indicators, or do we need onboarding?
9. **Priority:** Is tension more important than domain color, or secondary?

### Implementation

10. **Canvas vs DOM:** Should we stick with Canvas (harder custom rendering) or switch to SVG/DOM (easier CSS)?
11. **Animation Timing:** requestAnimationFrame (smooth) vs CSS (performant)?
12. **Mobile:** Do tension indicators work on small touch screens?

---

## Success Criteria

- [ ] High-tension nodes immediately recognizable
- [ ] Low-tension nodes don't get false signals
- [ ] Visual encoding doesn't conflict with domain colors
- [ ] Animation is smooth (60fps) and optional (accessibility)
- [ ] Performance impact <5% frame time
- [ ] User testing confirms "controversial nodes stand out"

---

**Status:** Ready for Gemini review
**Next:** Create review request, send to Gemini 3 Pro

---

*Specification created: 2025-11-18*
