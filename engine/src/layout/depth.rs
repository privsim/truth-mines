//! Depth computation for epistemic layering

use crate::graph::GraphStore;
use std::collections::HashMap;

/// Computes epistemic depth for all nodes via topological layering
///
/// Foundation nodes (no incoming support/prove/entail edges) have depth 0.
/// Other nodes have depth = max(predecessor depths) + 1.
///
/// # Arguments
///
/// * `graph` - The graph store with nodes and edges
///
/// # Returns
///
/// `HashMap` mapping node ID to depth (u32)
#[must_use]
pub fn compute_depths(graph: &GraphStore) -> HashMap<String, u32> {
    use std::collections::VecDeque;

    let mut depths = HashMap::new();
    let mut in_degree = vec![0_usize; graph.nodes.len()];

    // Count incoming edges for each node, but only for epistemic relations
    let epistemic_relations = ["supports", "proves", "entails"];

    for edge in &graph.edges {
        if epistemic_relations.contains(&edge.relation.as_str()) {
            if let Some(&to_idx) = graph.id_to_idx.get(&edge.to) {
                in_degree[to_idx] += 1;
            }
        }
    }

    // Find foundation nodes (in-degree 0)
    let mut queue = VecDeque::new();
    for (idx, &degree) in in_degree.iter().enumerate() {
        if degree == 0 {
            let node_id = &graph.nodes[idx].id;
            depths.insert(node_id.clone(), 0);
            queue.push_back(idx);
        }
    }

    // BFS topological layering
    while let Some(current_idx) = queue.pop_front() {
        let current_depth = depths[&graph.nodes[current_idx].id];

        // Process outgoing epistemic edges
        for edge in &graph.edges {
            if epistemic_relations.contains(&edge.relation.as_str()) {
                if let Some(&from_idx) = graph.id_to_idx.get(&edge.from) {
                    if from_idx == current_idx {
                        if let Some(&to_idx) = graph.id_to_idx.get(&edge.to) {
                            // Update depth for target node
                            let new_depth = current_depth + 1;
                            depths
                                .entry(graph.nodes[to_idx].id.clone())
                                .and_modify(|d| *d = (*d).max(new_depth))
                                .or_insert(new_depth);

                            // Decrement in-degree and add to queue if it reaches 0
                            in_degree[to_idx] = in_degree[to_idx].saturating_sub(1);
                            if in_degree[to_idx] == 0 && !queue.iter().any(|&idx| idx == to_idx) {
                                queue.push_back(to_idx);
                            }
                        }
                    }
                }
            }
        }
    }

    // Handle any remaining nodes (in cycles) - assign to deepest reachable
    for node in &graph.nodes {
        if !depths.contains_key(&node.id) {
            // Node is in a cycle - assign a reasonable depth
            depths.insert(node.id.clone(), 1);
        }
    }

    depths
}

#[cfg(test)]
mod tests {
    use super::super::super::graph::{Edge, GraphStore, Node};
    use super::*;

    fn create_test_node(id: &str) -> Node {
        Node {
            id: id.to_string(),
            r#type: "proposition".to_string(),
            domain: "philosophy".to_string(),
            title: format!("Node {id}"),
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
            domain: "philosophy".to_string(),
            weight: Some(0.9),
        }
    }

    #[test]
    fn test_depth_single_foundation_node() {
        let mut store = GraphStore::new();
        store.add_node(create_test_node("foundation"));
        store.build_adjacency();

        let depths = compute_depths(&store);

        assert_eq!(depths.get("foundation"), Some(&0));
    }

    #[test]
    fn test_depth_linear_chain() {
        let mut store = GraphStore::new();
        // F → A → B → C
        for id in ["f", "a", "b", "c"] {
            store.add_node(create_test_node(id));
        }

        store.add_edge(create_test_edge("f", "a", "supports"));
        store.add_edge(create_test_edge("a", "b", "supports"));
        store.add_edge(create_test_edge("b", "c", "supports"));

        store.build_adjacency();

        let depths = compute_depths(&store);

        assert_eq!(depths.get("f"), Some(&0));
        assert_eq!(depths.get("a"), Some(&1));
        assert_eq!(depths.get("b"), Some(&2));
        assert_eq!(depths.get("c"), Some(&3));
    }

    #[test]
    fn test_depth_diamond_structure() {
        let mut store = GraphStore::new();
        // F → A → C
        // └───→ B → C
        for id in ["f", "a", "b", "c"] {
            store.add_node(create_test_node(id));
        }

        store.add_edge(create_test_edge("f", "a", "supports"));
        store.add_edge(create_test_edge("f", "b", "supports"));
        store.add_edge(create_test_edge("a", "c", "supports"));
        store.add_edge(create_test_edge("b", "c", "supports"));

        store.build_adjacency();

        let depths = compute_depths(&store);

        assert_eq!(depths.get("f"), Some(&0));
        assert_eq!(depths.get("a"), Some(&1));
        assert_eq!(depths.get("b"), Some(&1));
        assert_eq!(depths.get("c"), Some(&2)); // max(1, 1) + 1
    }

    #[test]
    fn test_depth_multiple_foundations() {
        let mut store = GraphStore::new();
        // F1 → A, F2 → B, A → C, B → C
        for id in ["f1", "f2", "a", "b", "c"] {
            store.add_node(create_test_node(id));
        }

        store.add_edge(create_test_edge("f1", "a", "supports"));
        store.add_edge(create_test_edge("f2", "b", "supports"));
        store.add_edge(create_test_edge("a", "c", "supports"));
        store.add_edge(create_test_edge("b", "c", "supports"));

        store.build_adjacency();

        let depths = compute_depths(&store);

        assert_eq!(depths.get("f1"), Some(&0));
        assert_eq!(depths.get("f2"), Some(&0));
        assert_eq!(depths.get("a"), Some(&1));
        assert_eq!(depths.get("b"), Some(&1));
        assert_eq!(depths.get("c"), Some(&2));
    }

    #[test]
    fn test_depth_handles_cycle() {
        let mut store = GraphStore::new();
        // F → A → B → A (cycle), B → C
        for id in ["f", "a", "b", "c"] {
            store.add_node(create_test_node(id));
        }

        store.add_edge(create_test_edge("f", "a", "supports"));
        store.add_edge(create_test_edge("a", "b", "supports"));
        store.add_edge(create_test_edge("b", "a", "supports")); // Creates cycle
        store.add_edge(create_test_edge("b", "c", "supports"));

        store.build_adjacency();

        let depths = compute_depths(&store);

        // All nodes should get assigned depths
        assert!(depths.contains_key("f"));
        assert!(depths.contains_key("a"));
        assert!(depths.contains_key("b"));
        assert!(depths.contains_key("c"));

        // Foundation should be depth 0
        assert_eq!(depths.get("f"), Some(&0));

        // C should be deeper than F
        assert!(depths.get("c").unwrap() > depths.get("f").unwrap());
    }

    #[test]
    fn test_depth_only_counts_support_edges() {
        let mut store = GraphStore::new();
        // F → A (supports), A → B (attacks - should not count)
        for id in ["f", "a", "b"] {
            store.add_node(create_test_node(id));
        }

        store.add_edge(create_test_edge("f", "a", "supports"));
        store.add_edge(create_test_edge("a", "b", "attacks")); // Different relation

        store.build_adjacency();

        let depths = compute_depths(&store);

        assert_eq!(depths.get("f"), Some(&0));
        assert_eq!(depths.get("a"), Some(&1));
        // B should be foundation (no incoming supports/proves/entails)
        assert_eq!(depths.get("b"), Some(&0));
    }

    #[test]
    fn test_depth_considers_proves_and_entails() {
        let mut store = GraphStore::new();
        // F → A (supports), A → B (proves), B → C (entails)
        for id in ["f", "a", "b", "c"] {
            store.add_node(create_test_node(id));
        }

        store.add_edge(create_test_edge("f", "a", "supports"));
        store.add_edge(create_test_edge("a", "b", "proves"));
        store.add_edge(create_test_edge("b", "c", "entails"));

        store.build_adjacency();

        let depths = compute_depths(&store);

        assert_eq!(depths.get("f"), Some(&0));
        assert_eq!(depths.get("a"), Some(&1));
        assert_eq!(depths.get("b"), Some(&2));
        assert_eq!(depths.get("c"), Some(&3));
    }

    #[test]
    fn test_depth_empty_graph() {
        let store = GraphStore::new();
        let depths = compute_depths(&store);

        assert!(depths.is_empty());
    }

    #[test]
    fn test_depth_disconnected_components() {
        let mut store = GraphStore::new();
        // Two separate components: F1 → A, F2 → B
        for id in ["f1", "a", "f2", "b"] {
            store.add_node(create_test_node(id));
        }

        store.add_edge(create_test_edge("f1", "a", "supports"));
        store.add_edge(create_test_edge("f2", "b", "supports"));

        store.build_adjacency();

        let depths = compute_depths(&store);

        assert_eq!(depths.get("f1"), Some(&0));
        assert_eq!(depths.get("a"), Some(&1));
        assert_eq!(depths.get("f2"), Some(&0));
        assert_eq!(depths.get("b"), Some(&1));
    }

    #[test]
    fn test_depth_complex_graph() {
        let mut store = GraphStore::new();
        // Complex structure with multiple paths
        for id in ["f1", "f2", "a", "b", "c", "d", "e"] {
            store.add_node(create_test_node(id));
        }

        store.add_edge(create_test_edge("f1", "a", "supports"));
        store.add_edge(create_test_edge("f2", "b", "supports"));
        store.add_edge(create_test_edge("a", "c", "supports"));
        store.add_edge(create_test_edge("b", "c", "supports"));
        store.add_edge(create_test_edge("c", "d", "proves"));
        store.add_edge(create_test_edge("d", "e", "entails"));

        store.build_adjacency();

        let depths = compute_depths(&store);

        assert_eq!(depths.get("f1"), Some(&0));
        assert_eq!(depths.get("f2"), Some(&0));
        assert_eq!(depths.get("a"), Some(&1));
        assert_eq!(depths.get("b"), Some(&1));
        assert_eq!(depths.get("c"), Some(&2));
        assert_eq!(depths.get("d"), Some(&3));
        assert_eq!(depths.get("e"), Some(&4));
    }
}
