⸻

Product Requirements Document

Project: Truth Mines
Version: 0.1
Owner: privsim
Date: 2025‑11‑17

⸻

1. Vision & Objectives

1.1 Vision

Build a Git‑native, multi‑domain formal knowledge system that:
	•	Represents philosophy, mathematics, physics and other formal domains in a unified graph.
	•	Provides a visual “truth mine”: a navigable 3D environment where users can explore paths from foundations to derived claims.
	•	Acts as a personal cognitive augmentation tool for a single user initially, later extendable to multi‑user / public collaboration.
	•	Integrates cleanly with LLMs via a token‑efficient, structured format (TOON) without sacrificing human readability or future interoperability.

1.2 Primary Goals (MVP)
	1.	Represent formal knowledge as a universal property graph stored in a public/private Git repository.
	2.	Expose this graph through a Rust‑based WASM engine for querying, layout, and visualization.
	3.	Provide two main visual modes:
	•	2D large‑scale overview of the graph.
	•	3D “truth mine” view with semantic structure (depth, domain, type).
	4.	Support multiple domains out of the box (philosophy, mathematics, physics) through:
	•	simple domain and type tags,
	•	a flexible metadata field,
	•	and a small visual style configuration layer.
	5.	Support LLM interactions via TOON artifacts generated from the canonical JSON data.

1.3 Non‑Goals (for MVP)
	•	No mandatory RDF/OWL/JSON‑LD as core storage.
	•	No mandatory BFO/DOLCE/SUMO alignment.
	•	No mandatory external graph DB (Neo4j, Kùzu, etc.).
	•	No multi‑tenant access control or full collaboration UX in v1.

These can be added as later phases.

⸻

2. Users & Use Cases

2.1 Primary User
	•	Advanced individual researcher with strong background in philosophy, math, physics, CS.
	•	Comfortable with Git, CLI, and JSON.
	•	Wants to:
	•	Build, inspect, and revise their own explicit belief/knowledge structures.
	•	See why they believe something (argument/proof paths).
	•	Explore cross‑domain connections (e.g., phil foundations of math, math structure in physics).

2.2 Core Use Cases
	1.	Capture a new concept/claim/argument
	•	Add a node JSON file.
	•	Optionally add edges for support/attack/dependency.
	•	Commit to Git and see it appear in the visualization.
	2.	Explore justification of a proposition or theorem
	•	Click a node.
	•	See:
	•	3D position in the mine (depth, neighbors).
	•	Justification tree (paths from foundational nodes).
	•	Attacks/objections or counterexamples.
	3.	Explore a domain cluster
	•	Filter by domain philosophy, mathematics, or physics.
	•	Pan and zoom through local clusters.
	•	See cross‑domain bridges highlighted.
	4.	Inspect cross‑domain relationships
	•	Select a node and reveal:
	•	philosophy nodes that formalize or justify math nodes,
	•	math nodes that model physics theories,
	•	bridges across domains.
	5.	Use the system with LLMs
	•	Export a subgraph in TOON.
	•	Use it as context for:
	•	explanations,
	•	proof sketching,
	•	questioning “what follows from…”.
	6.	Version & audit changes
	•	Use Git to:
	•	view diffs of node/edge changes,
	•	branch for experimental reasoning paths,
	•	merge back when satisfied.

⸻

3. High‑Level Architecture

graph TD
  subgraph Storage
    Repo[Git repo]
  end

  subgraph Build
    Builder[Build scripts]
  end

  subgraph Engine
    WASM[Rust WASM engine]
  end

  subgraph Frontend
    ReactUI[React app]
    Cosmos[2D overview]
    WebGPU3D[3D truth mine]
  end

  Repo --> Builder
  Builder --> Repo
  Builder --> WASM
  Repo --> WASM
  WASM --> ReactUI
  WASM --> Cosmos
  WASM --> WebGPU3D
  ReactUI --> Cosmos
  ReactUI --> WebGPU3D

3.1 Components
	•	Storage layer
	•	Git repository with JSON/JSONL files.
	•	Build layer
	•	Python/Node scripts for:
	•	validation,
	•	manifest generation,
	•	TOON generation.
	•	Engine layer
	•	Rust library compiled to WASM:
	•	loads graph,
	•	builds adjacency,
	•	computes layouts,
	•	outputs GPU‑friendly buffers.
	•	Frontend layer
	•	React application:
	•	orchestrates data loading and UI state.
	•	integrates:
	•	cosmos.gl for 2D overview (WebGL).
	•	custom WebGPU or Three.js WebGPU for 3D truth mine.

⸻

4. Data Model & File Layout

4.1 Universal Node Model (Canonical JSON)

File: nodes/{id}.json

{
  "id": "k7x9m2",
  "type": "proposition",
  "domain": "philosophy",
  "title": "Knowledge requires safety",
  "content": "For S to know that p, S's belief in p must be safe: in nearby possible worlds where S believes p, p is true.",
  "formal": "∀S,p: K(S,p) → Safe(S,p)",
  "tags": ["epistemology", "knowledge", "safety"],
  "metadata": {
    "modality": "necessary",
    "certainty": 0.75
  },
  "sources": ["pritchard2005"],
  "created": "2025-01-15T10:00:00Z",
  "updated": "2025-01-15T10:00:00Z"
}

Examples by domain:
	•	Math theorem:

{
  "id": "t4k2p9",
  "type": "theorem",
  "domain": "mathematics",
  "title": "Fundamental Theorem of Algebra",
  "content": "Every non constant polynomial over ℂ has at least one root.",
  "formal": "∀p ∈ ℂ[x], deg(p) ≥ 1 → ∃z ∈ ℂ: p(z) = 0",
  "tags": ["complex_analysis", "polynomials"],
  "metadata": {
    "difficulty": 7.2,
    "importance": 9.5,
    "axiom_system": "ZFC",
    "proof_id": "prf001"
  },
  "sources": ["gauss1799"],
  "created": "2025-01-10T14:00:00Z"
}

	•	Physics theory:

{
  "id": "gr001",
  "type": "theory",
  "domain": "physics",
  "title": "General Relativity",
  "content": "Spacetime curvature determines gravitational effects.",
  "formal": "R_μν − ½Rg_μν = (8πG/c⁴)T_μν",
  "tags": ["gravity", "relativity"],
  "metadata": {
    "regime": "classical",
    "domain_of_validity": {
      "min_scale": 1e-18,
      "max_scale": 1e26
    }
  },
  "sources": ["einstein1915"],
  "created": "2025-01-12T09:00:00Z"
}

4.2 Universal Edge Model (Canonical JSONL)

File: edges/{relation}.jsonl

Each line is an edge:

{"f":"k7x9m2","t":"q3p8n5","relation":"supports","w":0.9,"domain":"philosophy"}
{"f":"m4k2p9","t":"q3p8n5","relation":"supports","w":0.85,"domain":"philosophy"}
{"f":"q3p8n5","t":"g8t2r1","relation":"entails","w":0.7,"domain":"philosophy"}

Cross‑domain “bridge” relations reuse the same model:

{"f":"c001","t":"t4k2p9","relation":"formalizes","domain":"bridge:phil→math"}
{"f":"t4k2p9","t":"gr001","relation":"models","domain":"bridge:math→phys"}

Fields:
	•	f: from node id.
	•	t: to node id.
	•	relation: string label.
	•	domain: domain or bridge label.
	•	w: optional weight in [0,1].
	•	metadata: optional JSON object (not required for MVP but allowed later).

4.3 File Layout

truth-mines/
├── .truth-mines/
│   └── schema.toml          # small core config
├── nodes/
│   └── {id}.json            # one file per node
├── edges/
│   ├── supports.jsonl
│   ├── attacks.jsonl
│   ├── entails.jsonl
│   ├── proves.jsonl
│   ├── predicts.jsonl
│   └── formalizes.jsonl
├── notes/
│   └── {id}.md              # optional longform notes, frontmatter has id
├── styles/
│   └── default.toml         # visual style config
├── dist/
│   ├── manifest.json        # id → file, domain, type summary
│   ├── graph.json           # light summary for quick load
│   └── edges.toon           # LLM‑facing format
└── scripts/
    ├── validate.py
    ├── build-index.py
    └── build-toon.sh

4.4 Core Schema Config (.truth-mines/schema.toml)

Example minimal schema:

version = "1.0.0"

[domains]
known = ["philosophy", "mathematics", "physics"]

[relations.universal]
values = ["supports", "attacks", "entails", "defines", "cites"]

[relations.philosophy]
values = ["presupposes"]

[relations.mathematics]
values = ["proves", "generalizes", "equivalent"]

[relations.physics]
values = ["predicts", "tests", "approximates"]

[relations.bridges]
values = ["formalizes", "models", "philosophical_foundation"]


⸻

5. TOON Artifacts (LLM Integration)

5.1 Purpose
	•	Provide compact, structured graph slices to LLMs.
	•	Reduce token usage by ~30–60 percent versus JSON.
	•	Preserve structure exactly (lossless mapping from JSON).

5.2 Edges TOON

File: dist/edges.toon (generated)

Example:

supports[3]{f,t,w,domain}:
  k7x9m2,q3p8n5,0.9,philosophy
  m4k2p9,q3p8n5,0.85,philosophy
  t4k2p9,t8k3m1,1.0,mathematics

proves[1]{f,t,w,domain}:
  t4k2p9,prf001,1.0,mathematics

predicts[2]{f,t,w,domain}:
  gr001,obs001,0.99,physics
  qm001,obs003,0.95,physics

formalizes[1]{f,t,domain}:
  c001,t4k2p9,bridge:phil→math

5.3 Subgraph TOON Packs (optional)

For LLM prompts, the system should be able to generate:
	•	dist/subgraphs/{id}.toon
containing:
	•	the focus node,
	•	its k‑hop neighborhood,
	•	relevant edges partitioned by relation.

⸻

6. Build & Validation

6.1 Validation Script (Python)

Responsibilities:
	•	Ensure each nodes/*.json conforms to Node schema:
	•	required keys: id, type, domain, title
	•	Ensure all edge refs refer to existing node ids.
	•	Optionally enforce domain and relation lists from schema.toml.

Script: scripts/validate.py (see earlier analysis, devs can implement from spec).

6.2 Index Builder

Responsibilities:
	•	Build dist/manifest.json:
	•	map id → file path, domain, type.
	•	basic stats: counts per domain/type.
	•	Build dist/graph.json:
	•	small summary: [{id, type, domain, title}], no heavy content.

6.3 TOON Builder

Responsibilities:
	•	Convert edges/*.jsonl to dist/edges.toon using a simple script or @toon-format/cli.
	•	Optionally support node TOON packs for subgraphs.

build-toon.sh should:
	1.	Collect all edges grouped by relation.
	2.	Render each group as a TOON table.

⸻

7. Engine Design (Rust + WASM)

7.1 Core Types

Rust structs:

#[derive(Debug, Clone, serde::Deserialize)]
pub struct Node {
    pub id: String,
    #[serde(rename = "type")]
    pub r#type: String,
    pub domain: String,
    pub title: String,
    pub content: Option<String>,
    pub formal: Option<String>,
    pub tags: Vec<String>,
    pub metadata: serde_json::Value,
    pub sources: Vec<String>,
    pub created: String,
    pub updated: Option<String>,
}

#[derive(Debug, Clone, serde::Deserialize)]
pub struct Edge {
    #[serde(rename = "f")]
    pub from: String,
    #[serde(rename = "t")]
    pub to: String,
    pub relation: String,
    pub weight: Option<f32>,
    pub domain: String,
}

Internal GPU structs:

#[repr(C)]
#[derive(Clone, Copy, bytemuck::Pod, bytemuck::Zeroable)]
pub struct GpuNode {
    pub position: [f32; 3],
    pub size: f32,
    pub color: [f32; 4],
    pub domain_id: u32,
    pub type_id: u32,
    pub flags: u32,
    pub scalar: f32,
}

#[repr(C)]
#[derive(Clone, Copy, bytemuck::Pod, bytemuck::Zeroable)]
pub struct GpuEdge {
    pub from: u32,
    pub to: u32,
    pub color: [f32; 4],
    pub weight: f32,
    pub relation_id: u32,
    pub flags: u32,
}

7.2 Graph Store

Requirements:
	•	Maintain:
	•	Vec<Node> and Vec<Edge>.
	•	HashMap<String, usize> for node id lookup.
	•	adjacency lists out_edges[node_idx], in_edges[node_idx].
	•	Provide:
	•	neighborhood query: k‑hop from node.
	•	path search: all simple paths from A to B up to max depth.
	•	depth assignment: epistemic / derivational depth via:
	•	topological layering from “foundational” nodes (no incoming supports / proves / predicts).
	•	or heuristics, e.g. BFS layering.

7.3 Visual Style Mapping

Read from styles/default.toml:
	•	Domain color map:
	•	philosophy → purple.
	•	mathematics → blue.
	•	physics → red.
	•	Node shape / base size per (domain, type).
	•	Edge color/style per relation.

Engine should:
	•	Precompute numeric ids for domains, types, relations.
	•	Map Node → GpuNode using style rules and depth/layout.

7.4 WASM API

Exported JS‑facing class (via wasm-bindgen):

#[wasm_bindgen]
pub struct GraphEngine {
    // internal graph, style, layout state
}

#[wasm_bindgen]
impl GraphEngine {
    #[wasm_bindgen(constructor)]
    pub fn new(style_json: &str) -> Result<GraphEngine, JsValue>;

    pub fn load_nodes_json(&mut self, nodes_json: &str) -> Result<(), JsValue>;
    pub fn load_edges_toon(&mut self, edges_toon: &str) -> Result<(), JsValue>;

    pub fn compute_layout_truth_mine(&mut self);

    pub fn neighbors(&self, node_id: &str, depth: u32) -> Vec<JsValue>;
    pub fn find_paths(&self, from_id: &str, to_id: &str, max_depth: u32) -> Vec<JsValue>;

    pub fn get_gpu_buffers(&self) -> js_sys::Object;
}

get_gpu_buffers returns an object with:
	•	nodes: Uint8Array for GpuNode array.
	•	edges: Uint8Array for GpuEdge array.

Front‑end renderer consumes those arrays as vertex buffers.

⸻

8. Frontend Design

8.1 Framework & Setup
	•	React + TypeScript + Vite.
	•	Cosmo‑style 2D view:
	•	integrate cosmos.gl or similar GPU force graph.
	•	3D truth mine view:
	•	custom renderer using WebGPU (preferred) or Three.js WebGPURenderer as stepping stone.

8.2 Main Screens
	1.	Global Overview Screen
	•	2D graph with cosmos.gl.
	•	Node colors by domain.
	•	Node hover shows title + type.
	•	Click opens node details panel.
	2.	Node Detail Screen
	•	Right panel with:
	•	title, domain, type.
	•	content/formal snippet.
	•	metadata.
	•	Tabs:
	•	Justification tree (support paths).
	•	Objections/attacks.
	•	Cross‑domain links.
	3.	Truth Mine 3D Screen
	•	3D environment:
	•	Y = depth.
	•	X/Z = layout coordinates from engine.
	•	Visual encodings:
	•	node shape = type.
	•	node color = domain.
	•	glow/brightness = scalar (e.g. credence, difficulty).
	•	Edges drawn as tubes with width = weight.
	•	Camera navigation:
	•	orbit, pan, zoom.
	•	double click node → focus + smooth fly‑in.
	4.	Filters & Search
	•	Domain filter: checkboxes.
	•	Type filter: proposition/theorem/theory/etc.
	•	Relation filter.
	•	Search by title / id / tag.

8.3 UX Requirements
	•	Fast initial load:
	•	first fetch dist/manifest.json and dist/graph.json (lightweight).
	•	lazily fetch nodes/{id}.json and full content as needed.
	•	Progressive disclosure:
	•	limit visible nodes in any view to manageable subsets.
	•	allow user to expand/contract local neighborhoods.

⸻

9. Performance & Scale Targets

9.1 MVP Scale
	•	Designed for:
	•	10k–100k nodes.
	•	up to a few hundred thousand edges.
	•	Must maintain:
	•	interactive 3D view at 60 fps on modern laptop for typical local views (few thousand visible nodes).
	•	full graph 2D overview via cosmos.gl or equivalent.

9.2 Performance Guidelines
	•	Use adjacency lists and index maps.
	•	Use GPU for layout where feasible in future, but MVP can start with CPU + incremental layout.
	•	Use LOD and frustum culling in 3D:
	•	clusters collapsed at far zoom.
	•	full detail near focus.

⸻

10. Tech Stack & Tooling

10.1 Back‑end / Engine
	•	Rust stable.
	•	WASM:
	•	wasm-bindgen
	•	wasm-pack
	•	Graph:
	•	standard Rust collections (no DB).
	•	Serialization:
	•	serde, serde_json.
	•	Visual:
	•	wgpu for WebGPU renderer (if implemented in Rust side).

10.2 Front‑end
	•	Node.js, npm or pnpm.
	•	React + TypeScript + Vite.
	•	cosmos.gl (or equivalent GPU force graph).
	•	WebGPU:
	•	native WebGPU API via browser,
	•	or Three.js WebGPURenderer.

10.3 Scripts
	•	Python 3.11+ for validation and build scripts.
	•	Optional: @toon-format/cli via npm for TOON conversion.

Example setup commands:

# Rust
rustup target add wasm32-unknown-unknown
cargo install wasm-pack

# Frontend
brew install node; sudo apt install nodejs npm
npm create vite@latest truth-mines-web -- --template react-ts

# Python
brew install python@3.12; sudo apt install python3-venv
python3 -m venv venv
source venv/bin/activate
pip install orjson


⸻

11. Milestones

Milestone 1: Data & Scripts
	•	Repo structure scaffolded.
	•	Node/edge JSON schemas finalized.
	•	Validation script implemented.
	•	manifest.json and graph.json generation implemented.
	•	edges.toon generation implemented.

Milestone 2: Rust Engine
	•	GraphStore implementation with adjacency lists.
	•	JSON node and TOON edge loading.
	•	Depth computation and simple 2D layout.
	•	WASM bindings: neighbor and path queries, GPU buffer export.

Milestone 3: 2D Overview UI
	•	React app skeleton.
	•	Load manifest and graph summary from dist/.
	•	Integrate cosmos.gl (or equivalent) for 2D overview.
	•	Node selection and basic details panel.

Milestone 4: 3D Truth Mine
	•	Low‑level WebGPU or Three.js renderer wired to engine buffers.
	•	Depth on Y axis, domain colors, type shapes.
	•	Camera controls and basic interaction.

Milestone 5: Multi‑Domain & Bridges
	•	Filters by domain and type.
	•	Visual highlighting of cross‑domain bridge edges.
	•	Justification tree / path exploration UX.

Milestone 6: LLM Integration
	•	API (local script or endpoint) to generate subgraph TOON packs for a given node.
	•	Example notebooks or scripts showing how to feed TOON into LLM prompts.

⸻

13. Visualization & Interaction Specification

This section extends the visual design with rich interaction behaviors that transform the graph from an abstract visualization into a visceral knowledge exploration environment.

13.1 Salience Model: Dynamic Visual Weight

Visual salience determines which nodes and edges receive visual emphasis. It's computed as a weighted function of:

salience(node) = clamp(
    w_focus × isFocused(node)           // 1.0 if selected, 0 otherwise
  + w_path × isOnPath(node)              // 1.0 if on active path, 0 otherwise
  + w_neighbor × neighborWeight(node)    // Decays with hop distance (1.0, 0.6, 0.3, ...)
  + w_meta × metadata.importance         // Optional: 0-1 from node metadata
  , 0, 1
)

Default weights: w_focus=1.0, w_path=0.9, w_neighbor=0.5, w_meta=0.2 (for MVP, w_meta can be 0)

Visual mappings from salience:
	•	Size: baseSize × (0.5 + 1.5 × salience)
	•	Opacity: 0.2 + 0.8 × salience
	•	Label visibility: show if salience > 0.4
	•	Glow intensity: salience × maxGlow

13.2 2D View: Interaction State Machine

The 2D graph has three distinct interaction states:

STATE: Overview
	•	No node selected.
	•	All nodes visible according to filters.
	•	Hover shows tooltips.
	•	Click transitions to NodeFocused.

STATE: NodeFocused
	•	One node selected (selectedNodeId).
	•	Camera centered on that node.
	•	K-hop neighborhood highlighted (default k=2).
	•	Node details panel open on right.
	•	Hover still works on other nodes.
	•	Clicking another node: transition to new NodeFocused.
	•	Clicking background: return to Overview.

STATE: PathFocused
	•	A path between two nodes is active (focusPath).
	•	Path nodes and edges highlighted; rest dimmed.
	•	Path stepper UI visible.
	•	Keyboard navigation active (←/→ or J/K).
	•	Camera follows path progression.
	•	Clicking "Exit path" or ESC: return to NodeFocused or Overview.

13.3 Hover Tooltips (2D and 3D)

When user hovers a node:

Tooltip content:
	•	Title (node.title)
	•	Type + Domain badge (e.g., "Proposition • Philosophy")
	•	Content preview: first 120 characters with ellipsis if truncated
	•	Example: "For S to know that p, S's belief in p must be safe: in nearby possible worlds where S believes p, p is true…"

Visual specification:
	•	Background: rgba(30, 41, 59, 0.95) with subtle border
	•	Padding: 0.75rem
	•	Border radius: 0.5rem
	•	Drop shadow: 0 4px 12px rgba(0,0,0,0.4)
	•	Position: 10px above and 10px right of node center
	•	Edge detection: flip to left/below if near screen boundary
	•	Font: 0.875rem for title (bold), 0.75rem for content

Timing:
	•	Appear: 150ms after hover begins (debounce)
	•	Disappear: 300ms after mouse leaves node and tooltip

Testable requirements:
	•	✓ Tooltip appears within 150ms of hover
	•	✓ Content truncated at 120 chars with ellipsis
	•	✓ Tooltip positioned correctly (flips near edges)
	•	✓ Tooltip disappears when leaving
	•	✓ Hovering new node replaces tooltip immediately

13.4 Node Selection & Camera Centering

When user clicks a node:

Immediate effects:
	1.	Set selectedNodeId in app state
	2.	Transition to NodeFocused state
	3.	Open/update Node Details Panel
	4.	Trigger camera centering animation
	5.	Compute and apply k-hop neighborhood highlighting

Camera centering (2D):
	•	Smooth pan animation (300ms ease-in-out)
	•	Target: selected node at center of viewport
	•	Optional zoom: scale to fit neighborhood if configured

Camera centering (3D):
	•	Smooth fly animation (800ms ease-in-out)
	•	Target position: 15 units in front of node
	•	Look at: node center
	•	Orbital offset: slight elevation for better view

K-hop neighborhood highlighting:
	•	Use engine.neighbors(selectedNodeId, k=2)
	•	Highlighted nodes: salience boosted
	•	Highlighted edges: only edges within neighborhood
	•	Background nodes: dimmed (opacity 0.2)

Testable requirements:
	•	✓ Click sets selectedNodeId
	•	✓ Camera animates to center selected node
	•	✓ Neighborhood query executes with correct k
	•	✓ Node Details panel opens with correct data
	•	✓ Background nodes dimmed appropriately

13.5 Justification Tree Mode

User can view support structure as a tree:

Trigger:
	•	Click "View Justification" tab in Node Details Panel
	•	Or keyboard shortcut: T (for Tree)

Layout transformation:
	1.	Selected node positioned at top-center
	2.	Find all incoming supports/proves/entails edges
	3.	Layout supporting nodes below in tree structure
	4.	Recursively expand downward to foundations
	5.	Use Reingold-Tilford algorithm for clean tree layout

Visual encoding:
	•	Selected node: root of tree (top)
	•	Foundation nodes: leaves (bottom, highlighted)
	•	Edges: straight lines with relation labels
	•	Edge thickness ∝ weight

Interaction:
	•	Clicking tree node: make it new tree root (re-layout)
	•	Hovering edge: show relation type and weight
	•	"Back to graph" button returns to standard 2D layout

Tree depth limit: cap at 8 levels to prevent overwhelming view

Testable requirements:
	•	✓ Only epistemic relations (supports, proves, entails, predicts) included
	•	✓ Tree shows all paths from selected to foundations
	•	✓ Maximum depth enforced
	•	✓ Clicking node in tree makes it new root
	•	✓ Returning to graph view restores previous layout

13.6 Path Travel Mode

Path mode enables "walking through" an argument or proof step-by-step.

13.6.1 Entering path mode

Method 1: Via context menu
	•	Right-click node A → "Set as path start"
	•	Right-click node B → "Set as path end"
	•	System queries: engine.find_paths(A, B, maxDepth=10)

Method 2: Via path UI widget
	•	Click "Find path" button
	•	Select start node from dropdown (or current selection)
	•	Select end node from dropdown
	•	Click "Show paths"

Path chooser (if multiple paths):
	•	Modal/drawer showing all found paths:
	•	Path 1: A → C → D → B (3 hops, avg weight 0.85)
	•	Path 2: A → E → F → G → B (4 hops, avg weight 0.72)
	•	User selects one → becomes focusPath

13.6.2 Path visualization

When focusPath is set:
	•	All nodes NOT on path: opacity 0.15 (very dim)
	•	Nodes ON path: full salience
	•	Path index labels: numbered 1, 2, 3, … overlaid on nodes
	•	Path edges: thick glowing lines (2-3× normal width)
	•	Edge colors: relation-specific (supports green, proves blue, etc.)
	•	Arrowheads: indicate direction

13.6.3 Path Stepper UI

Horizontal stepper appears at top or bottom:

┌──────────────────────────────────────────────────────────────┐
│  [1] Start Node  →  [2] Premise A  →  [3] Lemma  →  [4] End │
│        ●              ●                ○              ○       │
└──────────────────────────────────────────────────────────────┘

Features:
	•	Current step highlighted (filled circle)
	•	Clicking step: jump to that node
	•	Relation labels on arrows (→ supports, → proves, etc.)

13.6.4 Path travel (keyboard navigation)

Once in PathFocused state:

Keyboard shortcuts:
	•	→ or K: advance to next node on path
	•	← or J: go to previous node on path
	•	ESC: exit path mode

Each step:
	1.	Update current step index
	2.	Camera animates along edge to next node (500ms)
	3.	Node Details panel updates to show new node content
	4.	Edge between current and next briefly pulses

Optional "Play" mode:
	•	▶ button: auto-advance with 3-second dwell per node
	•	⏸ button: pause auto-play
	•	Speed control: 1×, 2×, 0.5×

Testable requirements:
	•	✓ Keyboard navigation only active in PathFocused state
	•	✓ → key advances one step (wraps at end or stops)
	•	✓ ← key goes back one step (stops at start)
	•	✓ Camera animates smoothly between nodes
	•	✓ Node panel updates to current step
	•	✓ ESC exits path mode and restores previous state

13.7 3D View: Distance-Based Salience

The 3D truth mine uses camera distance to modulate information density:

13.7.1 Zoom levels

Far (distance > 100 units):
	•	Render: small point sprites (2-3 pixels)
	•	Labels: none
	•	Edges: hidden or very faint lines between clusters
	•	Purpose: see overall structure, domain distribution

Mid (distance 20-100 units):
	•	Render: medium spheres/shapes (5-15 pixels)
	•	Labels: title only, for nodes with salience > 0.5
	•	Edges: visible within camera frustum
	•	Purpose: explore local clusters, see connections

Near (distance < 20 units):
	•	Render: full detail (instanced geometry for type shapes)
	•	Labels: title always visible, content on hover
	•	Edges: thick tubes or ribbons with relation colors
	•	Node Inspection Card: appears when distance < 10 units to focused node

13.7.2 Node Inspection Card (3D close-up)

When camera is very close to a node (< 10 units):

Card appears as overlay (HUD element):
	•	Title (large, prominent)
	•	Domain + Type badges
	•	Content: first 400-600 characters (scrollable if more)
	•	Formal notation block (if present)
	•	Tags
	•	Quick actions:
	•	"View justification"
	•	"View attacks"
	•	"Show in 2D"

Direct neighbors (when inspecting):
	•	Orbiting nodes: 1-hop neighbors arranged in sphere around focus
	•	Connecting edges: highlighted tunnels
	•	Neighbor labels: always visible
	•	Clicking neighbor: fly to it (new inspection focus)

Testable requirements:
	•	✓ Card appears when distance < threshold
	•	✓ Card shows correct node data
	•	✓ Card hides when camera moves away
	•	✓ Neighbors rendered in orbital layout
	•	✓ Clicking neighbor triggers fly-to animation

13.7.3 Path travel in 3D

When focusPath is set in 3D:

Path edges as tunnels:
	•	Geometry: cylindrical tubes (or ribbon quads)
	•	Color: relation-specific (supports green, proves blue, etc.)
	•	Glow: emissive material
	•	Width: 2-3× normal edge width

Camera travel animation:
	•	Spline interpolation: smooth curve through path nodes
	•	Duration: ~2 seconds per edge
	•	Camera looks ahead: always facing next node
	•	Brief pause at each node: 1-2 seconds for content display

Content display during travel:
	•	As camera approaches node: fade in Node Inspection Card
	•	At node: full card visible
	•	As camera departs: fade out card, show next

Keyboard shortcuts (same as 2D):
	•	→ / K: next node
	•	← / J: previous node
	•	ESC: exit path mode

Testable requirements:
	•	✓ Path tunnels only rendered for focusPath edges
	•	✓ Camera follows spline between nodes
	•	✓ Each step takes ~2 seconds
	•	✓ Content card syncs with current node
	•	✓ Path state preserved when toggling 2D ↔ 3D

13.8 Visual Encoding (Consistent 2D & 3D)

Domain Colors (RGB):
	•	Philosophy: [147, 51, 234] (purple)
	•	Mathematics: [37, 99, 235] (blue)
	•	Physics: [220, 38, 38] (red)

Type Shapes (3D primarily, can use subtle icons in 2D):
	•	Proposition: sphere
	•	Theorem: cube / rectangular prism
	•	Theory: octahedron
	•	Axiom: diamond / tetrahedron
	•	Definition: small sphere
	•	Observation: cylinder
	•	Experiment: irregular polyhedron
	•	Concept: icosahedron

Edge Colors by Relation:
	•	supports: [34, 197, 94] (green)
	•	attacks: [239, 68, 68] (red)
	•	entails: [59, 130, 246] (blue)
	•	proves: [168, 85, 247] (purple)
	•	predicts: [249, 115, 22] (orange)
	•	formalizes: [251, 191, 36] (gold)
	•	models: [14, 165, 233] (sky blue)
	•	default: [156, 163, 175] (gray)

Bridge edges (domain contains "bridge:"):
	•	Color: gold [251, 191, 36]
	•	Thickness: 1.5× normal
	•	Optional glow effect

13.9 Camera & Animation Specifications

2D Camera:
	•	Pan: smooth translate over 300ms
	•	Zoom: exponential scaling over 200ms
	•	Center on node: pan + zoom to fit neighborhood

3D Camera:
	•	Orbit: arcball rotation around target point
	•	Pan: translate along view plane
	•	Zoom: move along look direction
	•	Fly-to animation:
	•	Duration: 800ms for standard fly, 2000ms for path travel
	•	Easing: ease-in-out cubic
	•	Look-ahead: camera orientation leads position by ~100ms

Path travel (both 2D & 3D):
	•	Step duration: 2 seconds per node
	•	Edge animation: 500ms per edge
	•	Dwell at node: 1.5 seconds
	•	Camera interpolation: cubic Hermite spline for smoothness

13.10 UI Components for Enhanced Interaction

New components needed:

NodeTooltip:
	•	Floating div positioned near hovered node
	•	Shows: title, type/domain, 120-char content snippet
	•	Debounced appearance (150ms)
	•	Auto-hides on mouse leave (300ms)

PathChooser:
	•	Modal dialog listing all found paths
	•	Each path: node sequence, hop count, avg weight
	•	Selection sets focusPath

PathStepper:
	•	Horizontal stepper component
	•	Current step highlighted
	•	Click step to jump
	•	Shows relation labels on arrows

NodeInspectionCard (3D):
	•	Overlay HUD element when close to node
	•	Full content (scrollable)
	•	Formal notation block
	•	Tags and metadata
	•	Quick action buttons

JustificationTreeView:
	•	Tree layout with selected node as root
	•	Foundation nodes at leaves
	•	Interactive: click to re-root
	•	Toggle between tree and graph layout

13.11 Keyboard Shortcuts

Global:
	•	T: toggle to justification tree view (if node selected)
	•	G: return to graph view from tree
	•	F: focus/fly to selected node (3D)
	•	ESC: clear selection / exit mode

In PathFocused:
	•	→ or K: next node on path
	•	← or J: previous node on path
	•	Space: play/pause auto-advance
	•	ESC: exit path mode

In 3D:
	•	W/A/S/D: optional WASD camera movement
	•	Mouse drag: orbit
	•	Right drag: pan
	•	Scroll: zoom

13.12 Performance Considerations

Salience computation:
	•	Recalculate only when:
	•	selectedNodeId changes
	•	focusPath changes
	•	filters change
	•	Use memoization (useMemo) to avoid per-frame recalc

LOD (Level of Detail) in 3D:
	•	Far: render as point sprites (GPU instanced)
	•	Mid: render as low-poly shapes (octahedron ~8 faces)
	•	Near: render as high-poly shapes (icosphere ~20 faces)
	•	Switch based on screen-space size (not just distance)

Culling:
	•	Frustum culling: don't render nodes outside camera view
	•	Occlusion culling (optional): skip nodes behind others

Label rendering:
	•	Use texture atlas or SDF fonts for crisp text
	•	Only render labels for visible nodes with salience > 0.4
	•	Billboarding: labels always face camera

13.13 Accessibility Considerations

All interactions must have keyboard equivalents:
	•	Tab navigation: through visible nodes
	•	Enter: select focused node
	•	Arrow keys: navigate graph or path
	•	Screen reader: announce node title, type, domain when focused

Tooltips and cards:
	•	ARIA labels: "Node details for [title]"
	•	role="tooltip" for hover tooltips
	•	Ensure sufficient color contrast (WCAG AA)

Reduced motion:
	•	Respect prefers-reduced-motion media query
	•	Disable/shorten animations if user preference set

⸻

12. Open Questions for Later Phases
	•	How to optionally map nodes to external ontologies (BFO, DOLCE, SUMO) via metadata when desired.
	•	How to expose an API for external tools:
	•	HTTP endpoint,
	•	or CLI querying.
	•	When to introduce Kùzu or another DB for large‑scale analytics.
	•	How to design collaborative workflows:
	•	per‑user belief states and credences,
	•	multi‑user views of agreement/disagreement.

⸻

This PRD should be enough for a team to start implementing:
	•	the repo format and scripts,
	•	the Rust engine,
	•	and initial 2D/3D visualizations,

while leaving clear extension points for semantics, ontologies, and scaling up.
