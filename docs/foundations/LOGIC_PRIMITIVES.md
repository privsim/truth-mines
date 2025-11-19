# Logic Primitives - Foundational Nodes

**Purpose:** Specify explicit logic primitive nodes for the Truth Mines seed graph.

**Gemini 3 Pro Rationale:** "Logic must be explicit (Depth 0). If you don't represent Modus Ponens as a node, you cannot represent the 'Tortoise and Achilles' paradox or attacks on logic itself (Dialetheism)."

**Status:** Specification (ready for implementation)

---

## Why Explicit Logic Nodes?

### The Problem

Without explicit logic nodes, the graph has a **hidden foundation**:
- All mathematical proofs implicitly use Modus Ponens, but it's not in the graph
- All reasoning assumes Law of Non-Contradiction, but it's not represented
- Cannot represent **attacks on logic itself** (Paraconsistent logic, Dialetheism, Intuitionism)

### The Solution

Create explicit nodes for logical primitives at **Depth 0**. These become the true "ground" of the epistem mine.

**Benefits:**
1. **Philosophical completeness:** Can represent debates about logic (LNC, LEM)
2. **Structural honesty:** Math nodes correctly show dependence on logic
3. **Attack representation:** Dialetheism can `attack` Law of Non-Contradiction
4. **Load-bearing visibility:** Logic nodes will have extremely high load-bearing scores

---

## Logic Node Specifications

### MA-LOGIC001: Modus Ponens

**Type:** `axiom`
**Domain:** `mathematics` (or `philosophy` - logic sits at boundary)
**Depth:** 0 (foundational)

**Title:** "Modus Ponens (Inference Rule)"

**Content:**
```
If P is true, and (P → Q) is true, then Q is true.

Inference rule:
  P
  P → Q
  ─────
  Q

This is the most basic rule of deductive inference, used in virtually all reasoning.
```

**Metadata:**
```json
{
  "formal_notation": "P, P → Q ⊢ Q",
  "axiom_system": "Classical Logic",
  "certainty": 1.0,
  "importance": 10,
  "foundational_system": "Classical Logic"
}
```

**Edges from this node:**
- `MA-LOGIC001` --supports--> Every mathematical proof node (w=1.0)
- `MA-LOGIC001` --supports--> Every `entails` edge (w=1.0)

**Expected Load-Bearing:** ~0.6 (most of math and philosophy depend on it)

---

### MA-LOGIC002: Law of Identity

**Type:** `axiom`
**Domain:** `mathematics`
**Depth:** 0 (foundational)

**Title:** "Law of Identity"

**Content:**
```
For all propositions P: P is identical to itself (P = P).

Symbolically: ∀P (P ≡ P)

The most basic law of classical logic. Every entity is identical with itself.
```

**Metadata:**
```json
{
  "formal_notation": "∀P (P ≡ P)",
  "axiom_system": "Classical Logic",
  "certainty": 1.0,
  "importance": 9,
  "foundational_system": "Classical Logic"
}
```

**Edges:**
- `MA-LOGIC002` --supports--> Mathematical equality proofs
- `MA-LOGIC002` --supports--> ZFC axioms (identity is presupposed)

**Expected Load-Bearing:** ~0.4

---

### MA-LOGIC003: Law of Non-Contradiction (LNC)

**Type:** `axiom`
**Domain:** `mathematics`
**Depth:** 0 (foundational)

**Title:** "Law of Non-Contradiction"

**Content:**
```
For all propositions P: P and ¬P cannot both be true simultaneously.

Symbolically: ∀P ¬(P ∧ ¬P)

One of Aristotle's three laws of thought. Contradictions cannot be true.
```

**Metadata:**
```json
{
  "formal_notation": "∀P ¬(P ∧ ¬P)",
  "axiom_system": "Classical Logic",
  "certainty": 0.99,
  "importance": 10,
  "foundational_system": "Classical Logic",
  "contested": true
}
```

**Why contested=true:** Dialetheism and paraconsistent logic reject or modify LNC.

**Edges from this node:**
- `MA-LOGIC003` --supports--> All classical mathematics (w=1.0)
- `MA-LOGIC003` --supports--> Proof by contradiction (w=1.0)

**Edges to this node (attacks):**
- Future: `PHIL-DIALETHEISM001` --attacks--> `MA-LOGIC003` (w=0.6)
  - "True contradictions can exist (e.g., Liar's Paradox)"
- Future: `MA-PARACONSISTENT001` --attacks--> `MA-LOGIC003` (w=0.5)
  - "Logic can tolerate contradictions without explosion"

**Expected Load-Bearing:** ~0.5 (all classical reasoning depends on it)
**Expected Tension:** ~0.4 (if attacks are added)

---

### MA-LOGIC004: Law of Excluded Middle (LEM)

**Type:** `axiom`
**Domain:** `mathematics`
**Depth:** 0 (foundational)

**Title:** "Law of Excluded Middle"

**Content:**
```
For all propositions P: Either P is true or ¬P is true (no middle ground).

Symbolically: ∀P (P ∨ ¬P)

One of Aristotle's three laws of thought. Every proposition is either true or false.
```

**Metadata:**
```json
{
  "formal_notation": "∀P (P ∨ ¬P)",
  "axiom_system": "Classical Logic",
  "certainty": 0.95,
  "importance": 9,
  "foundational_system": "Classical Logic",
  "contested": true
}
```

**Why contested=true:** Intuitionistic logic and constructive mathematics reject LEM.

**Edges from this node:**
- `MA-LOGIC004` --supports--> Proof by cases (w=1.0)
- `MA-LOGIC004` --supports--> Classical analysis (w=0.95)

**Edges to this node (attacks):**
- Future: `MA-INTUITIONISM001` --attacks--> `MA-LOGIC004` (w=0.7)
  - "LEM is not constructively valid; truth requires proof"
- Future: `PHIL-VAGUENESS001` --attacks--> `MA-LOGIC004` (w=0.5)
  - "Vague predicates (bald, heap) violate bivalence"

**Expected Load-Bearing:** ~0.3 (classical analysis depends, but not all math)
**Expected Tension:** ~0.5 (moderate controversy)

---

### MA-LOGIC005: Modus Tollens

**Type:** `axiom`
**Domain:** `mathematics`
**Depth:** 0 (foundational)

**Title:** "Modus Tollens (Inference Rule)"

**Content:**
```
If (P → Q) is true, and Q is false, then P must be false.

Inference rule:
  P → Q
  ¬Q
  ─────
  ¬P

This is the logical basis for proof by contrapositive and falsification.
```

**Metadata:**
```json
{
  "formal_notation": "P → Q, ¬Q ⊢ ¬P",
  "axiom_system": "Classical Logic",
  "certainty": 1.0,
  "importance": 9,
  "foundational_system": "Classical Logic"
}
```

**Edges from this node:**
- `MA-LOGIC005` --supports--> Proof by contrapositive
- `MA-LOGIC005` --supports--> Scientific falsification (Popper)

**Expected Load-Bearing:** ~0.3

---

## Additional Logic Nodes (Future Expansion)

### Priority 2 (Add when expanding logic coverage)

- **MA-LOGIC006:** Principle of Explosion (Ex Falso Quodlibet)
  - From a contradiction, anything follows
  - Rejected by paraconsistent logic

- **MA-LOGIC007:** Universal Instantiation
  - If ∀x P(x), then P(a) for any specific a

- **MA-LOGIC008:** Existential Generalization
  - If P(a) for some specific a, then ∃x P(x)

### Priority 3 (Specialized topics)

- **MA-LOGIC009:** Double Negation Elimination
  - ¬¬P → P (rejected by intuitionists)

- **MA-LOGIC010:** De Morgan's Laws
  - ¬(P ∧ Q) ≡ (¬P ∨ ¬Q)

---

## Implementation Checklist

For each logic node above:

1. **Create JSON file:** `nodes/MA-LOGICXXX.json`
2. **Add edges:** Connect to dependent math/philosophy nodes
3. **Update depth tests:** Verify all logic nodes at depth 0
4. **Update load-bearing tests:** Verify high load-bearing scores
5. **Mark contested nodes:** Add `contested: true` for LNC, LEM
6. **Documentation:** Update GEMINI_REVIEW.md tracking

---

## Structural Impact

### Before Logic Nodes

```
Depth 0: Axiom of Choice, Perceptual Experiences, Observations
Depth 1: ZFC theorems, JTB, Physical theories
...
```

**Problem:** ZFC theorems appear to have no deeper foundation. Logic is implicit.

### After Logic Nodes

```
Depth 0: Modus Ponens, Identity, LNC, LEM, Modus Tollens
Depth 1: Axiom of Choice, ZFC axioms (depend on logic)
Depth 2: ZFC theorems
...
```

**Benefit:**
- Logical foundation explicit
- Can represent attacks on logic (Dialetheism → LNC)
- Load-bearing analysis reveals logic as true foundation
- Philosophically complete

---

## Testing Strategy

### Unit Tests

```rust
#[test]
fn test_logic_nodes_at_depth_zero() {
    let graph = load_test_graph();
    assert_eq!(graph.depth("MA-LOGIC001"), 0);  // Modus Ponens
    assert_eq!(graph.depth("MA-LOGIC002"), 0);  // Identity
    assert_eq!(graph.depth("MA-LOGIC003"), 0);  // LNC
    assert_eq!(graph.depth("MA-LOGIC004"), 0);  // LEM
    assert_eq!(graph.depth("MA-LOGIC005"), 0);  // Modus Tollens
}

#[test]
fn test_zfc_depends_on_logic() {
    let graph = load_test_graph();
    let zfc_axiom = "0ax001";  // Axiom of Choice

    // ZFC should be depth 1+ (depends on logic)
    assert!(graph.depth(zfc_axiom) > 0);

    // Should have path from logic to ZFC
    let has_path = graph.has_path("MA-LOGIC001", zfc_axiom);
    assert!(has_path);
}

#[test]
fn test_logic_load_bearing_high() {
    let graph = load_test_graph();
    let load_mp = compute_load_bearing("MA-LOGIC001", &graph);

    // Modus Ponens should have very high load-bearing (>50% of graph depends)
    assert!(load_mp > 0.5);
}

#[test]
fn test_lnc_contested_flag() {
    let graph = load_test_graph();
    let lnc_node = graph.get_node("MA-LOGIC003");

    assert_eq!(lnc_node.metadata.contested, Some(true));
}
```

### Integration Tests

1. **Visual Test:** Load graph in renderer, verify logic nodes at bottom (y=0)
2. **Tension Test:** Add Dialetheism attack on LNC, verify tension > 0.5
3. **Load-Bearing Visual:** Verify Modus Ponens renders as pillar (high load)

---

## Philosophical Notes

### Domain Assignment

**Question:** Should logic nodes be `mathematics` or `philosophy`?

**Answer:** `mathematics` for practical reasons:
- Logic is the foundation of mathematics (structural placement)
- Domain filtering: users filtering to "mathematics only" should see logic
- Philosophy can reference these nodes via bridge edges

**Alternative:** Create `logic` domain (clean separation, but adds complexity)

### Certainty Values

Note that **LNC and LEM have certainty < 1.0** despite being axioms:
- They are foundational but **contested** by non-classical logics
- This demonstrates that even foundations can be questioned
- Visual: Will show some tension when attacks are added

### Why Start with These 5?

**Coverage:**
- **Deductive inference:** Modus Ponens, Modus Tollens
- **Foundational laws:** Identity, LNC, LEM

**Controversy representation:**
- LNC attacked by Dialetheism
- LEM attacked by Intuitionism
- Enables visualization of logic debates

**Load-bearing:**
- All have high structural importance
- Demonstrates pillar visualization for foundational nodes

---

## Summary

Adding these 5 logic nodes transforms Truth Mines from a graph with **hidden logical assumptions** to one with **explicit logical foundations**.

**Key Achievements:**
1. ✅ Philosophically complete (logic is visible)
2. ✅ Attack representation (can add Dialetheism, Intuitionism)
3. ✅ Structural honesty (math depends on logic, not floating)
4. ✅ Load-bearing demonstration (logic nodes as pillars)
5. ✅ Tension demonstration (LNC, LEM show moderate controversy)

**Next Steps:**
1. Implement these 5 nodes (Phase 3)
2. Add edges from logic to existing math nodes (Phase 3)
3. Test depth recalculation (Phase 3)
4. Verify visual rendering (Phase 6)
5. Future: Add Dialetheism, Intuitionism nodes to attack logic

---

**Status:** Ready for implementation
**Blocked by:** None (can proceed immediately)
**Estimated effort:** 2-3 hours (5 nodes + edges + tests)
