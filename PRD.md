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
