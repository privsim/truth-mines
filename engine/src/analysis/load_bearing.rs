//! Load-Bearing Analysis (Gemini 3 Pro addition)
//!
//! Computes how structurally critical each node is to the graph.
//! Load-bearing = fraction of descendants that would lose ALL foundation paths if node removed.
//!
//! High load-bearing nodes are "pillars" - remove them and large parts of the graph collapse.

use crate::graph::GraphStore;
use std::collections::{HashSet, VecDeque};

/// Compute load-bearing score for a node
///
/// Returns a value in [0, 1] representing the fraction of the graph that would
/// become orphaned (lose all paths to foundational nodes) if this node were removed.
///
/// - 0.0: Leaf node or no impact (no descendants depend on it)
/// - 0.01-0.05: Minor importance (1-5% of graph depends)
/// - 0.05-0.2: Significant (5-20% depends)
/// - 0.2-0.5: Critical (20-50% depends)
/// - >0.5: Foundational (>50% depends - likely a depth-0 axiom)
///
/// # Example
/// ```
/// use truth_mines_engine::graph::GraphStore;
/// use truth_mines_engine::analysis::compute_load_bearing;
///
/// let mut graph = GraphStore::new();
/// // ... add nodes and edges ...
/// let load = compute_load_bearing(&graph, "modus_ponens");
/// // Load should be high for foundational logic nodes
/// ```
#[must_use]
pub fn compute_load_bearing(graph: &GraphStore, node_id: &str) -> f32 {
    let total_nodes = graph.node_count();
    if total_nodes <= 1 {
        return 0.0;
    }

    // Get node index
    let Some(&node_idx) = graph.id_to_idx.get(node_id) else {
        return 0.0; // Node doesn't exist
    };

    // Find all descendants (nodes reachable via outgoing edges)
    let descendants = find_descendants(graph, node_idx);

    if descendants.is_empty() {
        return 0.0; // Leaf node, no descendants
    }

    // Count how many descendants would lose ALL foundation paths
    let orphaned_count = descendants
        .iter()
        .filter(|&&desc_idx| would_lose_all_foundations(graph, desc_idx, node_idx))
        .count();

    // Normalize by total graph size
    orphaned_count as f32 / total_nodes as f32
}

/// Find all descendants of a node (DFS traversal)
fn find_descendants(graph: &GraphStore, start_idx: usize) -> HashSet<usize> {
    let mut visited = HashSet::new();
    let mut stack = vec![start_idx];

    while let Some(idx) = stack.pop() {
        if !visited.insert(idx) {
            continue; // Already visited
        }

        // Add all outgoing neighbors
        if let Some(neighbors) = graph.out_edges.get(idx) {
            for &neighbor_idx in neighbors {
                if !visited.contains(&neighbor_idx) {
                    stack.push(neighbor_idx);
                }
            }
        }
    }

    // Remove the start node itself
    visited.remove(&start_idx);
    visited
}

/// Check if a descendant would lose ALL foundation paths if removed_node is removed
///
/// A "foundation path" is a path from a depth-0 node to the descendant.
/// If ALL such paths go through removed_node, then the descendant would be orphaned.
fn would_lose_all_foundations(
    graph: &GraphStore,
    descendant_idx: usize,
    removed_node_idx: usize,
) -> bool {
    // Find foundation nodes (depth 0 - no incoming epistemic edges)
    let foundation_indices = find_foundation_nodes(graph);

    if foundation_indices.is_empty() {
        return false; // No foundations = can't lose what doesn't exist
    }

    // For each foundation, check if there's a path to descendant that DOESN'T go through removed_node
    for &foundation_idx in &foundation_indices {
        if has_path_avoiding_node(graph, foundation_idx, descendant_idx, removed_node_idx) {
            return false; // Found at least one path that doesn't use removed_node
        }
    }

    // All foundation paths (if any exist) go through removed_node
    // But we need to verify at least one path exists from foundations to descendant
    // Otherwise it was already orphaned

    // Check if there's ANY path from foundations to descendant (with removed_node present)
    for &foundation_idx in &foundation_indices {
        if has_path(graph, foundation_idx, descendant_idx) {
            return true; // Had a path, would lose it
        }
    }

    false // Was already orphaned, removing node doesn't change that
}

/// Find foundation nodes (depth 0: no incoming epistemic edges)
///
/// Epistemic edges: supports, proves, entails, predicts
fn find_foundation_nodes(graph: &GraphStore) -> Vec<usize> {
    let epistemic_relations = HashSet::from(["supports", "proves", "entails", "predicts"]);

    (0..graph.node_count())
        .filter(|&idx| {
            // Count incoming epistemic edges
            let incoming_epistemic = graph
                .edges
                .iter()
                .filter(|e| {
                    graph.id_to_idx.get(&e.to) == Some(&idx) && epistemic_relations.contains(e.relation.as_str())
                })
                .count();

            incoming_epistemic == 0
        })
        .collect()
}

/// Check if there's a path from start to end (BFS)
fn has_path(graph: &GraphStore, start_idx: usize, end_idx: usize) -> bool {
    if start_idx == end_idx {
        return true;
    }

    let mut visited = HashSet::new();
    let mut queue = VecDeque::new();
    queue.push_back(start_idx);
    visited.insert(start_idx);

    while let Some(idx) = queue.pop_front() {
        if let Some(neighbors) = graph.out_edges.get(idx) {
            for &neighbor_idx in neighbors {
                if neighbor_idx == end_idx {
                    return true;
                }

                if visited.insert(neighbor_idx) {
                    queue.push_back(neighbor_idx);
                }
            }
        }
    }

    false
}

/// Check if there's a path from start to end that avoids a specific node (BFS)
fn has_path_avoiding_node(
    graph: &GraphStore,
    start_idx: usize,
    end_idx: usize,
    avoid_idx: usize,
) -> bool {
    if start_idx == end_idx {
        return true;
    }

    if start_idx == avoid_idx || end_idx == avoid_idx {
        return false; // Can't reach if start/end is the avoided node
    }

    let mut visited = HashSet::new();
    let mut queue = VecDeque::new();
    queue.push_back(start_idx);
    visited.insert(start_idx);

    while let Some(idx) = queue.pop_front() {
        if let Some(neighbors) = graph.out_edges.get(idx) {
            for &neighbor_idx in neighbors {
                if neighbor_idx == avoid_idx {
                    continue; // Skip the avoided node
                }

                if neighbor_idx == end_idx {
                    return true;
                }

                if visited.insert(neighbor_idx) {
                    queue.push_back(neighbor_idx);
                }
            }
        }
    }

    false
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::graph::{Edge, Node};

    fn create_test_node(id: &str, node_type: &str) -> Node {
        Node {
            id: id.to_string(),
            r#type: node_type.to_string(),
            domain: "mathematics".to_string(),
            title: format!("Test {}", id),
            content: None,
            formal: None,
            tags: vec![],
            metadata: serde_json::Value::Null,
            sources: vec![],
            created: None,
            updated: None,
        }
    }

    fn create_test_edge(from: &str, to: &str, relation: &str) -> Edge {
        Edge {
            from: from.to_string(),
            to: to.to_string(),
            relation: relation.to_string(),
            domain: "mathematics".to_string(),
            weight: Some(1.0),
            metadata: None,
        }
    }

    #[test]
    fn test_load_bearing_isolated_node() {
        let mut graph = GraphStore::new();
        graph.add_node(create_test_node("isolated", "axiom"));
        graph.build_adjacency();

        let load = compute_load_bearing(&graph, "isolated");
        assert_eq!(load, 0.0, "Isolated node should have 0 load-bearing");
    }

    #[test]
    fn test_load_bearing_leaf_node() {
        let mut graph = GraphStore::new();
        graph.add_node(create_test_node("root", "axiom"));
        graph.add_node(create_test_node("leaf", "theorem"));
        graph.add_edge(create_test_edge("root", "leaf", "supports"));
        graph.build_adjacency();

        let load = compute_load_bearing(&graph, "leaf");
        assert_eq!(load, 0.0, "Leaf node has no descendants, should be 0");
    }

    #[test]
    fn test_load_bearing_simple_foundation() {
        // Foundation -> Theorem (1 descendant out of 2 nodes)
        let mut graph = GraphStore::new();
        graph.add_node(create_test_node("foundation", "axiom"));
        graph.add_node(create_test_node("theorem", "theorem"));
        graph.add_edge(create_test_edge("foundation", "theorem", "supports"));
        graph.build_adjacency();

        let load = compute_load_bearing(&graph, "foundation");
        // Theorem depends entirely on foundation
        // 1 descendant / 2 total nodes = 0.5
        assert!((load - 0.5).abs() < 0.01);
    }

    #[test]
    fn test_load_bearing_linear_chain() {
        // A -> B -> C (A supports B, B supports C)
        // If A is removed, both B and C lose foundation
        let mut graph = GraphStore::new();
        graph.add_node(create_test_node("a", "axiom"));
        graph.add_node(create_test_node("b", "theorem"));
        graph.add_node(create_test_node("c", "theorem"));
        graph.add_edge(create_test_edge("a", "b", "supports"));
        graph.add_edge(create_test_edge("b", "c", "supports"));
        graph.build_adjacency();

        let load_a = compute_load_bearing(&graph, "a");
        // A has 2 descendants (B, C), both would be orphaned
        // 2 / 3 = 0.667
        assert!((load_a - 0.667).abs() < 0.01);

        let load_b = compute_load_bearing(&graph, "b");
        // B has 1 descendant (C), C would be orphaned
        // 1 / 3 = 0.333
        assert!((load_b - 0.333).abs() < 0.01);
    }

    #[test]
    fn test_load_bearing_diamond_structure() {
        // Foundation -> Middle1 -> Conclusion
        // Foundation -> Middle2 -> Conclusion
        // Removing foundation orphans all 3
        let mut graph = GraphStore::new();
        graph.add_node(create_test_node("foundation", "axiom"));
        graph.add_node(create_test_node("middle1", "theorem"));
        graph.add_node(create_test_node("middle2", "theorem"));
        graph.add_node(create_test_node("conclusion", "theorem"));

        graph.add_edge(create_test_edge("foundation", "middle1", "supports"));
        graph.add_edge(create_test_edge("foundation", "middle2", "supports"));
        graph.add_edge(create_test_edge("middle1", "conclusion", "supports"));
        graph.add_edge(create_test_edge("middle2", "conclusion", "supports"));
        graph.build_adjacency();

        let load = compute_load_bearing(&graph, "foundation");
        // 3 descendants / 4 total = 0.75
        assert!((load - 0.75).abs() < 0.01);
    }

    #[test]
    fn test_load_bearing_alternate_path() {
        // Foundation1 -> Middle -> Conclusion
        // Foundation2 -> Conclusion (alternate path)
        // Removing Foundation1 orphans Middle but NOT Conclusion
        let mut graph = GraphStore::new();
        graph.add_node(create_test_node("f1", "axiom"));
        graph.add_node(create_test_node("f2", "axiom"));
        graph.add_node(create_test_node("middle", "theorem"));
        graph.add_node(create_test_node("conclusion", "theorem"));

        graph.add_edge(create_test_edge("f1", "middle", "supports"));
        graph.add_edge(create_test_edge("middle", "conclusion", "supports"));
        graph.add_edge(create_test_edge("f2", "conclusion", "supports"));
        graph.build_adjacency();

        let load_f1 = compute_load_bearing(&graph, "f1");
        // F1 has 2 descendants (middle, conclusion)
        // Middle would be orphaned, but conclusion has alternate path via F2
        // Only middle is orphaned: 1 / 4 = 0.25
        assert!((load_f1 - 0.25).abs() < 0.01);
    }

    #[test]
    fn test_load_bearing_multiple_foundations() {
        // F1 and F2 both support theorem independently
        // Removing either doesn't orphan theorem
        let mut graph = GraphStore::new();
        graph.add_node(create_test_node("f1", "axiom"));
        graph.add_node(create_test_node("f2", "axiom"));
        graph.add_node(create_test_node("theorem", "theorem"));

        graph.add_edge(create_test_edge("f1", "theorem", "supports"));
        graph.add_edge(create_test_edge("f2", "theorem", "supports"));
        graph.build_adjacency();

        let load_f1 = compute_load_bearing(&graph, "f1");
        // Theorem has alternate path via F2, so not orphaned
        assert_eq!(load_f1, 0.0);

        let load_f2 = compute_load_bearing(&graph, "f2");
        assert_eq!(load_f2, 0.0);
    }

    #[test]
    fn test_load_bearing_ignores_non_epistemic_edges() {
        // A --defines--> B (non-epistemic)
        // A --supports--> C (epistemic)
        // Removing A should only affect C
        let mut graph = GraphStore::new();
        graph.add_node(create_test_node("a", "axiom"));
        graph.add_node(create_test_node("b", "definition"));
        graph.add_node(create_test_node("c", "theorem"));

        graph.add_edge(create_test_edge("a", "b", "defines")); // Non-epistemic
        graph.add_edge(create_test_edge("a", "c", "supports")); // Epistemic
        graph.build_adjacency();

        let load = compute_load_bearing(&graph, "a");
        // Only C is a descendant that matters epistemically
        // 1 / 3 = 0.333
        assert!((load - 0.333).abs() < 0.01);
    }

    #[test]
    fn test_find_foundation_nodes() {
        let mut graph = GraphStore::new();
        graph.add_node(create_test_node("foundation", "axiom"));
        graph.add_node(create_test_node("derived", "theorem"));
        graph.add_edge(create_test_edge("foundation", "derived", "supports"));
        graph.build_adjacency();

        let foundations = find_foundation_nodes(&graph);
        assert_eq!(foundations.len(), 1);
        assert_eq!(graph.nodes[foundations[0]].id, "foundation");
    }

    #[test]
    fn test_has_path() {
        let mut graph = GraphStore::new();
        graph.add_node(create_test_node("a", "axiom"));
        graph.add_node(create_test_node("b", "theorem"));
        graph.add_node(create_test_node("c", "theorem"));
        graph.add_edge(create_test_edge("a", "b", "supports"));
        graph.add_edge(create_test_edge("b", "c", "supports"));
        graph.build_adjacency();

        assert!(has_path(&graph, 0, 1)); // a -> b
        assert!(has_path(&graph, 0, 2)); // a -> b -> c
        assert!(!has_path(&graph, 1, 0)); // No path backward
    }

    #[test]
    fn test_has_path_avoiding_node() {
        let mut graph = GraphStore::new();
        graph.add_node(create_test_node("start", "axiom"));
        graph.add_node(create_test_node("middle", "theorem"));
        graph.add_node(create_test_node("end", "theorem"));
        graph.add_edge(create_test_edge("start", "middle", "supports"));
        graph.add_edge(create_test_edge("middle", "end", "supports"));
        graph.build_adjacency();

        // With middle: start -> middle -> end
        assert!(has_path(&graph, 0, 2));

        // Avoiding middle: no path
        assert!(!has_path_avoiding_node(&graph, 0, 2, 1));
    }
}
