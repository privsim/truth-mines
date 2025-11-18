Yes, I completely get what you’re aiming at from the screenshot: right now it’s a pretty ring of points; you want it to feel like you’re actually moving through structured knowledge, with content and arguments popping into view in a way that matches the logic.

Let’s treat this as an extension to the PRD: a Visualization & Interaction Spec that you can bolt on as a new section (e.g. “13. Visualization & Interaction”). I’ll focus on 2D first (what you already have) and then specify how that extends to 3D, with concrete behaviors for hover, focus, paths, and “travel”.

⸻

13. Visualization & Interaction Spec

13.1 Salience model: how things get visual weight

We define visual salience as a function of:
	•	Focus state
	•	selected node (clicked / searched)
	•	nodes on a focus_path
	•	nodes in a local_neighborhood (k‑hop from selected)
	•	Filters
	•	domain filter (philosophy / math / physics)
	•	type filter (proposition / theorem / theory / axiom / …)
	•	Graph structure
	•	distance in hops from selected
	•	edge weight
	•	Node metadata
	•	importance (optional numeric field later)
	•	certainty / difficulty / etc. for styling

The frontend should compute a simple salience score per visible node (0–1) and edge:

salience(node) = clamp(
  w_focus * isSelected(node)
  + w_path * isOnFocusPath(node)
  + w_near * isInNeighborhood(node)
  + w_meta * node.importanceOrDefault,
  0, 1
)

and derive:
	•	size: larger for higher salience
	•	opacity: lower for background nodes
	•	label visibility: labels only shown above a salience threshold

Implementation detail: importance can be omitted for MVP; use just focus and neighborhood.

⸻

13.2 2D View – interaction states

We formalize a small state machine for the 2D view:

STATE: Overview
  - No selected node
  - Just filter + basic hover

STATE: NodeFocused
  - One selected node (via click or search)
  - Neighborhood highlighted
  - Details panel open

STATE: PathFocused
  - A path between two nodes is selected
  - Path nodes + edges highlighted
  - Path viewer UI active

13.2.1 Node hover
Behavior
	•	When user hovers a node in 2D view:
	•	Show a small tooltip anchored to the node with:
	•	title
	•	type + domain
	•	first ~120 chars of content (truncated with ellipsis)
	•	Tooltip disappears when:
	•	mouse leaves node and tooltip for >200ms, or
	•	another node is hovered.

Visual spec
	•	Tooltip: dark background, subtle border, drop shadow.
	•	Position: offset slightly above/right the node; flip if near screen edge.

Testable requirements
	•	Hover → tooltip appears within 150 ms.
	•	Tooltip content matches node data.
	•	Leaving node → tooltip removed within 300 ms.

13.2.2 Node selection (click)
Behavior
	•	Clicking a node in Overview or NodeFocused:
	•	Sets selectedNodeId.
	•	Transition to NodeFocused state.
	•	Centers the camera on that node (smooth pan/zoom).
	•	Expands k‑hop neighborhood (configurable, default 2).
	•	Opens / updates the Node Details Panel on the right.
	•	Clicking the selected node again:
	•	No change (idempotent).
	•	Clicking background (empty space):
	•	Clears selection.
	•	Returns to Overview state.

Node Details Panel contents
	•	Title, domain, type (prominent).
	•	Tags.
	•	Small badges:
	•	domain color.
	•	type icon.
	•	Content:
	•	content snippet (first ~400–600 chars) with “View full” link.
	•	formal rendering in monospace block if present.
	•	Links:
	•	“View support tree” (opens justification tree).
	•	“View objections/attacks”.
	•	“Open in 3D mine” (switch to 3D view centered on node).

Visual spec
	•	In NodeFocused:
	•	Selected node: largest size, brightest color.
	•	1‑hop neighbors: medium size, medium brightness.
	•	1‑hop: small, low opacity.

Testable requirements
	•	Clicking node focuses it and opens panel.
	•	Graph re-centers so the selected node is within the central 40% of viewport.
	•	Neighborhood highlighting respects k‑hop depth.

13.2.3 Search → selection
Behavior
	•	Typing in search box filters a list (typeahead dropdown):
	•	by title, id, tags.
	•	Selecting result:
	•	behaves exactly like clicking that node (NodeFocused).

Testable requirements
	•	Searching by partial title returns correct nodes.
	•	Selecting search result focuses that node and opens panel.

⸻

13.3 Justification tree (2D path content view)

When user clicks “View support tree” for a node:

13.3.1 Mode
	•	Sidebar tab switches to Justification.
	•	Central graph switches into a tree mode anchored at the selected node.

13.3.2 Layout
	•	Selected node at top center.
	•	Nodes that directly support it (incoming supports/entails/proves/predicts) arranged beneath, left–to–right.
	•	Tree expands downward for further supports.

Example:

               [Knowledge requires safety]
                      (selected)
                           │
         ┌─────────────────┴─────────────────┐
         │                                   │
 [Safety blocks luck]              [Gettier = luck]
        │                                   │
  [Modal metaphysics]           [JTB insufficient]

13.3.3 Interaction
	•	Clicking a node in the tree:
	•	makes it the new root for justification (re-layout tree).
	•	Hovering an edge:
	•	shows a small popover: relation, weight, optional note from edge metadata.
	•	Nodes and edges in the tree are still linked to the main graph:
	•	clicking “Show in graph” in the details panel jumps back to 2D overview with that node focused.

Testable requirements
	•	Only supports/entails/proves/predicts edges used in tree.
	•	Tree shows all such paths up to a capped depth (configurable).
	•	Switching back to “Graph” tab restores the previous 2D layout state.

⸻

13.4 Path mode: traveling between nodes

This is the “travel from node to node and show content on the path” behavior.

13.4.1 Invoking path mode
User can enter path mode in 2D by:
	•	Right‑clicking a node → “Set as Start”.
	•	Right‑clicking another node → “Set as End”.
	•	Or using a small path tool in UI:
	•	“Path from [Start] to [End]”.

Frontend calls engine:

engine.find_paths(startId, endId, maxDepth)

If multiple paths:
	•	Show a “Path chooser” drawer listing candidate paths:
	•	Each path summarized as: NodeA → NodeB → NodeC → ....
	•	User picks one as focusPath.

Transition to PathFocused state.

13.4.2 Path visualization (2D)
In PathFocused state:
	•	All nodes not on the chosen path:
	•	dimmed (low opacity).
	•	Nodes on the path:
	•	bright, slightly larger, numbered (1, 2, 3, …).
	•	Edges on the path:
	•	thick, glowing line (color based on relation).
	•	arrowheads to indicate direction.

Additionally, a Path Viewer UI element appears at top or bottom:
	•	A horizontal stepper:

[1] Start Node  →  [2] Premise A  →  [3] Argument X  →  [4] Conclusion

	•	Clicking a step selects that node and:
	•	scrolls / pans the 2D view to center it.
	•	updates the Node Details Panel.

13.4.3 “Travel” interaction
	•	Keyboard:
	•	J / ←: previous node on path.
	•	K / →: next node on path.
	•	Each step:
	•	triggers camera animation along the highlighted edge.
	•	updates content panel to that node.
	•	Optional “Play” button:
	•	auto‑advance along the path with a configurable dwell time (e.g. 2–4 seconds per node).

Testable requirements
	•	Path only contains valid edges returned by engine.
	•	Stepping forward/back always stays within the path.
	•	Non‑path nodes remain dim until path mode exits.
	•	Exiting path mode via ESC or “Exit path” button returns to previous NodeFocused or Overview state.

⸻

13.5 3D Truth Mine – close vs far salience

The 3D view should use distance to camera + salience to determine what information appears.

13.5.1 Zoom levels
Define 3 qualitative levels:
	1.	Far / Overview
	•	Many nodes (hundreds–thousands) visible.
	•	Nodes: small glowing points.
	•	Edges: very faint lines or not rendered to avoid clutter.
	•	Labels: off.
	2.	Mid / Local cluster
	•	Up to ~50 nodes in focus region.
	•	Nodes near focus:
	•	medium size.
	•	subtle labels (title only).
	•	Edges around focus: visible.
	3.	Near / Node inspection
	•	One node is “in front of camera” (closest or explicitly focused).
	•	Show an overlay card with:
	•	full title, domain/type.
	•	short content snippet.
	•	formal block if present.
	•	Direct neighbors:
	•	arranged in orbit around it (slightly pulled out).
	•	edges like tunnels connecting them.

Behavior
	•	When camera distance to a node < threshold_near, that node is “inspect” candidate.
	•	If also equals selectedNodeId, show its card.

13.5.2 Node hover / selection in 3D
	•	Hover (raycast) in 3D:
	•	highlight node (pulse / halo).
	•	small floating label with title.
	•	Click in 3D:
	•	set as selectedNodeId.
	•	Node card appears.
	•	2D view selection stays in sync (if user toggles back).

13.5.3 Path travel in 3D
If a focusPath from 2D exists, 3D can use it:
	•	Path edges become tunnels:
	•	glowing tubes between nodes.
	•	different colors per relation type.
	•	“Travel”:
	•	keyboard or UI stepper advances along path.
	•	camera animates along the tunnel between current node and next node (spline interpolation).
	•	at each node:
	•	camera slows, slight zoom‑in,
	•	node’s card fades in.

Testable requirements
	•	Path nodes and edges in 3D match 2D focusPath.
	•	Toggling 2D/3D retains the same selectedNodeId and focusPath (if any).
	•	Node card updates when advancing along path.

⸻

13.6 Visual encoding recap (2D & 3D)

Consistent across both views:
	•	Color by domain
	•	Philosophy: purple.
	•	Mathematics: blue.
	•	Physics: red.
	•	Shape by type (especially in 3D; in 2D you may use subtle glyphs/markers)
	•	Proposition: circle / sphere.
	•	Argument: pyramid.
	•	Theorem: complex polyhedron.
	•	Theory: nested shell.
	•	Axiom: crystalline shape.
	•	Edge color by relation
	•	Supports / proves / predicts: green / blue / orange variants.
	•	Attacks: red.
	•	Formalizes / models: gold.

Salience modulates:
	•	Node size.
	•	Edge thickness.
	•	Opacity.
	•	Label visibility.

⸻

13.7 New PRD items (summary to add)

You can drop something like this into the PRD as a new section:
	1.	Hover tooltips in 2D: title/type/domain/snippet.
	2.	Node selection mode with:
	•	camera centering,
	•	k‑hop neighborhood highlighting,
	•	details panel.
	3.	Justification tree mode for support/entailment relations.
	4.	Path‑focused mode:
	•	path selection,
	•	stepper UI,
	•	graph dimming,
	•	keyboard navigation,
	•	camera animation along path.
	5.	3D salience based on distance + focus:
	•	overview vs local vs inspection.
	•	node cards when “close enough”.
	•	tunnels for path edges and travel animation.
	6.	State sync between 2D and 3D:
	•	same selected node / path preserved when switching views.

