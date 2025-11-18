# Epic 9: Enhanced Visualization & Interaction - Implementation Roadmap

**Status:** SPECIFIED - Ready for TDD Implementation
**Issues:** #67-78 (12 issues)
**Estimated Effort:** 6-8 weeks
**Current Progress:** 0/12 (Specifications Complete)

---

## Overview

Epic 9 transforms Truth Mines from an abstract graph visualization into an **immersive knowledge exploration environment** where content and reasoning structure become viscerally apparent through rich interactions.

### What Changes

**Before Epic 9 (Current State):**
- Static circular node layout
- Basic filters and search
- Click to view node details in panel
- Abstract visualization

**After Epic 9:**
- **Hover** any node → instant content preview (120 chars)
- **Click** node → camera centers, neighborhood highlights, context appears
- **Select path** → watch argument unfold step-by-step
- **Travel** with keyboard → experience reasoning flow
- **3D proximity** → content emerges as you approach
- **Immersive** → feel the epistemic structure

---

## Implementation Order

### Phase 1: Foundation (Issues #67-69)
**Goal:** Add hover and selection basics

1. **Issue #67: Hover Tooltips** (6 hours)
   - Component: NodeTooltip
   - 150ms debounce, 120-char content preview
   - Edge-aware positioning
   - **5 tests**

2. **Issue #68: Node Selection** (8 hours)
   - Camera centering animation (2D: 300ms, 3D: 800ms)
   - selectedNodeId state management
   - NodeDetail panel integration
   - **7 tests**

3. **Issue #69: Neighborhood Highlighting** (10 hours)
   - Engine: get_k_hop_subgraph() method (Rust)
   - Salience computation (TypeScript)
   - Visual application (size, opacity)
   - **11 tests (5 Rust + 6 TypeScript)**

**Deliverable:** Hover to preview, click to explore deeply

---

### Phase 2: Path Exploration (Issues #70-72)
**Goal:** Enable path-based navigation

4. **Issue #70: Justification Tree** (12 hours)
   - Tree layout algorithm (Reingold-Tilford)
   - Toggle tree/graph views
   - Click to re-root
   - **8 tests**

5. **Issue #71: Path Selection** (10 hours)
   - Context menu (right-click)
   - PathChooser modal
   - Path statistics display
   - **6 tests**

6. **Issue #72: Path Travel** (14 hours)
   - PathStepper component
   - Keyboard navigation (←/→, J/K)
   - Camera animation along edges
   - Auto-play mode
   - **10 tests**

**Deliverable:** Walk through arguments step-by-step

---

### Phase 3: 3D Immersion (Issues #73-78)
**Goal:** Distance-based content emergence

7. **Issue #73: LOD System** (12 hours)
   - Far: point sprites
   - Mid: low-poly shapes
   - Near: high-detail geometry
   - **5 tests**

8. **Issue #74: Inspection Cards** (10 hours)
   - Close-up content overlay
   - Full content display
   - Quick actions
   - **6 tests**

9. **Issue #75: Path Tunnels** (8 hours)
   - Cylindrical tunnel geometry
   - Emissive glow materials
   - Relation-specific colors
   - **4 tests**

10. **Issue #76: Spline Animation** (10 hours)
    - Cubic Hermite spline
    - Smooth camera travel
    - Content card sync
    - **6 tests**

11. **Issue #77: Raycast Selection** (8 hours)
    - Ray-sphere intersection
    - Hover detection
    - Click handling
    - **5 tests**

12. **Issue #78: State Sync** (6 hours)
    - 2D ↔ 3D state preservation
    - Path state persistence
    - Integration tests
    - **7 tests**

**Deliverable:** Immersive 3D exploration with content emergence

---

## Testing Strategy

### Total New Tests: ~70

**Rust Engine:** +5 tests
- get_k_hop_subgraph (3 tests)
- compute_camera_spline (2 tests)

**TypeScript/React:** +65 tests
- Components: 30 tests
- Hooks: 15 tests
- Integration: 12 tests
- E2E: 8 tests

**All following TDD:**
1. Write test first (red)
2. Implement minimal code (green)
3. Refactor while green
4. Document and commit

---

## Dependencies

**All issues depend on existing foundation:**
- ✅ Epic 2: Rust engine (GraphStore, queries)
- ✅ Epic 3: React frontend (hooks, components)
- ✅ Epic 4: 3D architecture (Graph3D, WebGPU ready)

**Can implement incrementally:**
- Phase 1 standalone (hover + selection)
- Phase 2 builds on Phase 1 (paths)
- Phase 3 enhances 3D (independent of Phase 2)

**Parallel work possible:**
- 2D team: Issues #67-72
- 3D team: Issues #73-78

---

## Acceptance Criteria

### Phase 1 Complete When:
- ✅ Hovering any node shows content preview
- ✅ Clicking centers camera and shows context
- ✅ Neighborhood visually distinct from background
- ✅ All ~23 tests passing

### Phase 2 Complete When:
- ✅ Can view justification trees
- ✅ Can select and visualize paths
- ✅ Can travel paths with keyboard
- ✅ All ~24 tests passing

### Phase 3 Complete When:
- ✅ 3D has distance-based detail levels
- ✅ Close-up shows full content
- ✅ Path travel works in 3D with tunnels
- ✅ 2D and 3D fully synchronized
- ✅ All ~23 tests passing

### Epic 9 Complete When:
- ✅ All 12 issues done
- ✅ All ~70 new tests passing
- ✅ Documentation updated
- ✅ E2E tests cover main flows
- ✅ Accessibility requirements met

---

## Integration Points

### With Existing Systems:

**Graph2D (Epic 3):**
- Add hover detection
- Add click handling
- Add camera animation

**Graph3D (Epic 4):**
- Add raycast system
- Add LOD renderer
- Add tunnel geometry

**NodeDetail (Epic 3):**
- Already has tabs (ready for tree view)
- Just needs state integration

**useGraphEngine (Epic 3):**
- Add path finding method calls
- Add neighborhood query calls

**All integration points identified in specs** ✓

---

## Current State vs Epic 9 Complete

**Current (77% roadmap):**
```
User hovers → nothing
User clicks → opens panel (no camera movement)
Graph → static layout
3D → placeholder text
```

**After Epic 9 (100% roadmap):**
```
User hovers → content preview appears
User clicks → camera smoothly centers, neighborhood highlights
User selects path → graph transforms, stepper appears
User presses → → travels through argument with content
User zooms 3D → detail emerges based on distance
User navigates → seamless between overview and immersion
```

---

## Next Steps

1. **Start Phase 1:** Implement Issue #67 (Hover Tooltips) with TDD
2. **Commit after each issue** with passing tests
3. **Maintain quality:** Zero warnings, all tests passing
4. **Document as you go:** Update API docs with new methods

---

**Epic 9: Complete specification ready for world-class TDD implementation!** 🚀
