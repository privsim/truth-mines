This is a fascinating and highly rigorous project. The "Truth Mines" concept—treating knowledge exploration as navigating a directed graph with epistemic depth—is compelling. The architecture (Git-native, Rust/WASM, TOON format) is robust and well-suited for a high-performance local-first tool.

Below is the **Systematic Multi-Agent Review** following your template, incorporating feedback on the schemas, foundation documents, and your specific request regarding visual salience.

---

# Review: Truth Mines Foundations

**Reviewer Role:** Integrated Systems & Logic Specialist (Gemini 3 Pro)
**Focus:** Structural Coherence, Logical Rigor, Visual/Interaction Systems

## 1. Executive Summary

The foundational specifications for Truth Mines are **exceptionally strong**. The decision to use "Modest Foundationalism" is the correct engineering choice for a directed graph visualization, as it provides a natural "ground" ($y=0$) for depth computation. The separation of `ONTOLOGICAL_FOUNDATION` (theory) from `RELATION_SEMANTICS` (rules) is clean.

However, a few critical risks exist. The "Depth 0" status of observations in physics is philosophically naive (theory-ladenness) and may cause structural issues where theories end up "deeper" than the observations that supposedly ground them. Additionally, the distinction between `proves` (syntactic) and `entails` (semantic) needs strict policing to prevent graph pollution.

Overall, the system is ready for the seed graph, provided specific "Bridge" definitions are tightened.

---

## 2. ✅ Strengths

*   **Git-Native Architecture:** Decoupling nodes into individual JSON files prevents merge conflicts and allows granular history—crucial for a "personal knowledge base" that evolves.
*   **TOON Format:** The token-optimized format is a brilliant addition for LLM integration, significantly reducing context window costs while maintaining human readability.
*   **Effective Field Theory (EFT) Hierarchy:** Using EFT for physics avoids the trap of searching for a "Theory of Everything" before the graph is useful. It allows Newtonian mechanics to be "true" within its domain.
*   **Relation Semantics:** The distinction between `supports` (epistemic/inductive) and `entails` (logical/deductive) is the single most important definition in the project, and it is handled well.

---

## 3. ⚠️ Critical Issues (Prioritized)

1.  **The Theory-Laden Observation Problem (Physics Depth):**
    *   *Issue:* `PH002` (Lensing) is marked Depth 0. However, interpreting a smudge on a plate as "Lensing" *requires* optics and photon theory. If those theories are Depth > 0, you have a dependency cycle or a floating foundation.
    *   *Risk:* The graph visualization will place high-level experiments at the bottom, disconnecting them from the theories required to build the instruments.

2.  **Visual Salience vs. Epistemic Status:**
    *   *Issue:* The PRD describes salience based on focus/path/neighbors. It misses **Epistemic Tension**.
    *   *Risk:* A "refuted" theory (like Phlogiston) might look identical to a "foundational" theory if it has many connections. The user cannot instantly distinguish *Dead Ends* from *Load-Bearing Structures*.

3.  **ZFC Hard-Lock:**
    *   *Issue:* Hard-coding ZFC as the primary foundation may alienate Category Theoretic or Type Theoretic formulations, which are arguably better suited for *graph* representations of math.
    *   *Risk:* Future refactoring if you want to represent Homotopy Type Theory (HoTT).

---

## 4. Section-by-Section Concerns & Suggestions

### Epistemology
*   **Foundationalism:** Modest foundationalism is structurally necessary for the "Mine" visualization (you need a floor).
    *   *Suggestion:* Introduce a `cluster` node type for Coherentist webs. If a set of beliefs mutually support each other with no clear foundation, they act as a single "Super Node" at an assigned depth.
*   **Gettier:** The node selection is good.
    *   *Missing:* **Virtue Epistemology (Sosa/Zagzebski)**. It bridges the gap between internalism and externalism and is a major post-Gettier school.

### Mathematics
*   **ZFC:** Stick with it for the MVP, but add a metadata field `foundational_system: "ZFC"`.
*   **Logic:** Logic *must* be explicit (Depth 0).
    *   *Why:* If you don't represent `Modus Ponens` as a node, you cannot represent the "Tortoise and Achilles" paradox or attacks on logic itself (Dialetheism).
*   **Proves vs. Entails:**
    *   *Refinement:* `proves` implies a finite sequence of steps exists *within the graph or referenced text*. `entails` asserts the logical connection exists regardless of derivation.

### Physics
*   **Observations:**
    *   *Suggestion:* Split "Observations" into **Raw Data** (Depth 0 - "Pointer moved") and **Interpreted Result** (Depth 1+ - "Current detected").
    *   *Relation:* `Interpreted Result` --requires--> `Theory of Instrument`.
*   **Relations:**
    *   *Missing:* `explains`. A theory `predicts` an outcome, but it `explains` a phenomenon. `predicts` is forward-looking; `explains` is backward-looking unification.

### Relation Semantics & Schema
*   **Ambiguities:** `formalizes` (Phil->Math) vs `models` (Math->Phys).
    *   *Critique:* These are effectively the same structural relation (mapping domain A to domain B).
    *   *Suggestion:* Keep them distinct for domain filtering, but treat them identically in depth algorithms.
*   **Symmetry:** `equivalent` should be bidirectional in the UI, but stored as two edges or a specific "undirected" flag in the Rust engine to optimize storage.

### Seed Graph (Specific Node Critiques)
*   **EP001 (Perceptual Experience):** "Perceptual experiences exist" is safe. "I see red" is safer.
*   **MA009 (Axiom of Choice):** Flag this immediately as `contested: true` in metadata to demonstrate visual handling of controversy.
*   **PH007 (GR):** The link `Newton` -> `approximates` -> `GR` is good.
    *   *Add:* `Newton` -- `limiting_case_of` --> `GR`. (Stronger than approximates).

---

## 5. 💡 Suggestions for Optimization & Visual Salience

You asked specifically about optimizing visual salience. Here are suggestions to enhance the 3D/2D engine specs:

### A. The "Tension" Heatmap (Visual Optimization)
Currently, salience relies on focus/path. You should add **Epistemic Tension**.
*   **Metric:** `Tension(Node) = normalized_weight(Sum(Incoming Attacks) * Sum(Incoming Supports))`
*   **Visual:** Nodes with high tension (heavily supported AND heavily attacked) should "glow" or pulse (e.g., hot orange).
*   **Value:** This instantly highlights the *active frontiers* of the knowledge graph (e.g., the Gettier nodes) versus settled foundations.

### B. "Load-Bearing" Analysis (Structural Optimization)
*   **Metric:** `Load(Node) = Count(Descendants that lose all foundation paths if Node is removed)`.
*   **Visual:** "Load-bearing" nodes (like ZFC axioms or Newton's Laws) should appear structurally thicker or have a specific geometry (e.g., pillars).
*   **Value:** Tells the user "If you attack this node, 50 other nodes collapse."

### C. Schema Optimization
In `.truth-mines/schema.toml`:
*   Add an `inverse` key to relations for UI convenience.
    ```toml
    [relations.universal]
    values = ["supports", "attacks", ...]
    inverses = { "supports": "supported_by", "attacks": "attacked_by" }
    ```
*   This allows the LLM (via TOON) to reason backwards more easily without you generating explicit inverse edges in the JSONL.

---

## 6. 🎯 Top 5 Priorities

1.  **Fix Physics Foundations:** Redefine `PH001`/`PH002` to acknowledge they are interpreted facts, or add a `PH000` layer of "Phenomenological Data" to prevent philosophical circularity.
2.  **Explicit Logic Nodes:** Ensure `Modus Ponens` and `Identity` are explicit nodes in the Seed Graph. They are the true "Root" of the graph.
3.  **Visual "Controversy" State:** Update the PRD/Renderer to visually distinguish nodes that have `attacks` edges with high weights (e.g., dashed borders, red glow).
4.  **Bridge Rigor:** Define criteria for `formalizes` weights. (e.g., 1.0 = Isomorphism, 0.5 = Analogy).
5.  **Conflict Resolution in Depth:** Decide how the engine calculates depth if a `supports` chain contains an `attacks` edge. (Suggestion: It shouldn't break the depth chain, but should flag the path as "Contested").

---

## 7. Review of Supplied Schemas

*   **`node.schema.json`**: Good. The `metadata` object is flexible.
    *   *Suggestion:* Add a `"status"` field (enum: `draft`, `stable`, `archived`) to help manage the "personal knowledge base" aspect.
*   **`edge.schema.json`**: Good.
    *   *Suggestion:* `weight` should perhaps default to 1.0 if null to save space in JSONL.
*   **`schema.toml`**:
    *   *Suggestion:* Move `cites` out of "Universal" and into a "Bibliographic" category if you want to exclude it from Epistemic Depth calculations. `cites` does not equal `supports`.

This foundation is robust. With the tweaks to the Physics depth model and visual handling of "Tension," this will be a powerful tool.

---

This is an ambitious project with a very strong foundation. The transition from a monolithic "graph" to a "federated mine" is where the real engineering challenges—and opportunities—lie.

Here are targeted suggestions for implementation, physics integration, and modular architecture.

---

### 1. System Implementation & Visual Salience

The goal is to make the graph feel like a physical structure where "structural integrity" equals "logical soundness."

#### A. The "Tension" Rendering System (Visual Salience)
As mentioned in the review, you need to visualize epistemic conflict.
*   **The Heatmap of Doubt:** Use a fragment shader in your WebGPU renderer.
    *   Nodes with `attacks` edges carrying high weights ($w > 0.8$) should emit a "heat" distortion or pulse.
    *   Paths that rely on these nodes should flicker or look unstable.
*   **Justification Thickness:** Instead of just edge thickness, use "Cable Bundling."
    *   If Node A is supported by B, C, and D, visually "braid" these supports into the connection entering A.
    *   If the bundle is thick, the node feels solid. If it hangs by a single thread (one `supports` edge), it looks precarious.

#### B. "Ghost" Nodes for Lazy Loading
In a 3D mine, you can't render 100k nodes.
*   **The Horizon:** Render full geometry for the local subgraph (k=3 hops).
*   **Ghosting:** Beyond k=3, render "Ghost Nodes"—simplified distinct silhouettes that represent entire clusters (e.g., a glowing cube representing the whole "Quantum Mechanics" module).
*   **Interaction:** Clicking a Ghost Node triggers a "warp" animation, unloading the current sector and streaming in the new sector.

#### C. Git-Native "Diff" Mode
Since this is Git-native, you have a superpower: **Time Travel.**
*   **Visual Diffing:** Allow the user to compare `HEAD` vs. `HEAD~1`.
    *   New nodes appear green.
    *   Deleted nodes appear as "rubble" or phantom outlines.
    *   *Crucial:* If an edge weight changed (e.g., confidence in a theory dropped), animate that cable snapping or thinning.

---

### 2. Integrating High-Altitude Physics (Relativity & QM)

Physics is the hardest domain because it sits between Math and Epistemology.

#### A. The "Sandwich" Architecture for QM/GR
Don't just link Math to Physics directly. QM requires an **Interpretation Layer**.
*   **Layer 1: The Mathematical Formalism (The "Hard" Core)**
    *   Nodes: `Hilbert Space`, `Schrödinger Equation`, `Unitary Evolution`.
    *   Relation: `models` -> Physics.
*   **Layer 2: The Physical Theory (The "Predictive" Core)**
    *   Nodes: `Quantum Mechanics (Standard)`, `Born Rule`.
    *   Relation: `predicts` -> Observations.
*   **Layer 3: The Interpretation (The "Philosophical" Bridge)**
    *   Nodes: `Copenhagen Interpretation`, `Many-Worlds`, `Pilot Wave`.
    *   *Key:* These interpretations **all** `support` the Physical Theory node, but they `attack` each other.
    *   *Key:* They establish the *semantics* of the math (e.g., "What is the Wavefunction?").

#### B. Handling "Limits" and Approximations
Visualizing `reduces_to` is vital for the "Effective Field Theory" view.
*   **The Limit Slider:** In the UI, when a user inspects the edge between `Special Relativity` and `Newtonian Mechanics`, allow them to see the Metadata condition (`v << c`).
*   **Graph Topology:** Theoretically, "deeper" theories (GR) should be visually *below* the approximate theories (Newton) in the mine, supporting them. Newton "rests" on Einstein.

#### C. Recommended "Vertical Slice" to Build First
Do not build broadly; build one deep vertical slice to prove the system works.
**The "Light" Slice:**
1.  **Obs:** `Double Slit Pattern` (Depth 0).
2.  **Theory:** `Maxwell's Equations` (Classical).
3.  **Crisis:** `Photoelectric Effect` (Attacks Maxwell).
4.  **Revolution:** `QED` (Quantum Electrodynamics).
5.  **Math:** `U(1) Gauge Symmetry` (Models QED).
This slice forces you to handle reduction, revolution, and heavy math simultaneously.

---

### 3. Modularization: The "Knowledge Crate" System

If this succeeds, your repo will get too big. You need a package manager for truth.

#### A. The `knowledge.toml` Manifest
Adopt a Rust/Cargo-style approach. A root repository contains a manifest:

```toml
[package]
name = "my-personal-truth"
version = "0.1.0"

[dependencies]
# The standard library of truth
std-math = { git = "https://github.com/truth-mines/std-math", tag = "v1.2" }
std-physics = { git = "https://github.com/truth-mines/std-physics", branch = "main" }

# A friend's philosophy module
greg-egan-ideas = { git = "https://github.com/gregegan/ontology", path = "diaspora" }
```

#### B. Namespaced IDs
Your 6-char IDs (`k7x9m2`) are risky in a distributed system.
*   **Proposal:** Keep 6-char IDs for internal links *within* a module.
*   **Global Resolution:** When linking *across* modules, use `@{namespace}/{id}`.
    *   Example: `std-math/t4k2p9`.
*   **Build Step:** The Python build script resolves these external references into a unified graph map during the build process, assigning temporary global integers for the GPU buffers.

#### C. "Interface" Nodes
When Module A depends on Module B, it shouldn't import every lemma in B.
*   **Public vs. Private:** Add a `visibility: public/private` field to `node.schema.json`.
*   **Export:** Only "Public" nodes (major theorems, definitions) are exposed to consumers. Private nodes (intermediate proofs) are pruned unless the user explicitly "drills down" into that dependency.

---

### 4. Workflow Optimization: The "Miner" Agent

Since you are using LLMs (Claude/Gemini) to build this, formalize their role as **"Miners."**

#### The "Prospecting" Workflow
Instead of writing JSON manually, use the TOON format for *input* as well.
1.  **User:** "Miner, I want to add the 'Twin Paradox' to the Relativity cluster. Here is the target node ID."
2.  **LLM (Miner):**
    *   Reads `dist/subgraphs/relativity.toon`.
    *   Identifies missing nodes.
    *   Generates `nodes/new_node.json` and `edges/relativity.jsonl`.
    *   *Crucial:* Checks for contradiction. "Warning: This new node contradicts established node `X` via path `Y`."

#### Automated Consistency Checks (CI/CD)
Add a "Logic Linter" to your Python scripts:
*   **Cycle Detection:** Error if `A supports B` and `B supports A` (circular reasoning, unless marked as Coherentist Cluster).
*   **Weight Integrity:** Warn if `A entails B` ($w=1.0$) but `B` has a `certainty` metadata of $0.5$. (Entailment transmits certainty; if the consequent is uncertain, the antecedent must be too).

---

### Summary of Next Steps

1.  **Architecture:** Implement the **Namespace** concept now (even if you don't use it yet) to prevent ID collisions later.
2.  **Content:** Build the **"Light" Vertical Slice** (Optics -> QED) to stress-test the Physics schema.
3.  **Visuals:** Implement **Heatmap/Tension** rendering to make the graph feel "alive."
4.  **Process:** Create a **"Miner" prompt template** that allows you to feed a TOON subgraph to an LLM and get valid JSON back.

This moves you from a "Graph Viewer" to a "Civilization-Scale Knowledge Engine."
