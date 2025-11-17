//! `GraphStore` implementation

use super::{Edge, Node};
use std::collections::HashMap;

/// Main graph storage structure
#[derive(Default)]
pub struct GraphStore {
    nodes: Vec<Node>,
    edges: Vec<Edge>,
    id_to_idx: HashMap<String, usize>,
    out_edges: Vec<Vec<usize>>,
    in_edges: Vec<Vec<usize>>,
}

impl GraphStore {
    /// Creates a new empty `GraphStore`
    #[must_use]
    pub fn new() -> Self {
        Self {
            nodes: Vec::new(),
            edges: Vec::new(),
            id_to_idx: HashMap::new(),
            out_edges: Vec::new(),
            in_edges: Vec::new(),
        }
    }

    /// Adds a node to the graph
    ///
    /// If a node with the same ID already exists, it will be replaced.
    pub fn add_node(&mut self, node: Node) {
        let node_id = node.id.clone();

        if let Some(&idx) = self.id_to_idx.get(&node_id) {
            // Update existing node
            self.nodes[idx] = node;
        } else {
            // Add new node
            let idx = self.nodes.len();
            self.nodes.push(node);
            self.id_to_idx.insert(node_id, idx);

            // Initialize adjacency lists for this node
            self.out_edges.push(Vec::new());
            self.in_edges.push(Vec::new());
        }
    }

    /// Gets a node by ID
    #[must_use]
    pub fn get_node(&self, id: &str) -> Option<&Node> {
        self.id_to_idx.get(id).map(|&idx| &self.nodes[idx])
    }

    /// Adds an edge to the graph
    pub fn add_edge(&mut self, edge: Edge) {
        self.edges.push(edge);
    }

    /// Builds adjacency lists from edges
    ///
    /// This clears existing adjacency lists and rebuilds them from all edges.
    /// Edges referencing non-existent nodes are silently skipped.
    pub fn build_adjacency(&mut self) {
        // Clear existing adjacency lists
        for list in &mut self.out_edges {
            list.clear();
        }
        for list in &mut self.in_edges {
            list.clear();
        }

        // Build adjacency from edges
        for edge in &self.edges {
            if let (Some(&from_idx), Some(&to_idx)) = (
                self.id_to_idx.get(&edge.from),
                self.id_to_idx.get(&edge.to),
            ) {
                self.out_edges[from_idx].push(to_idx);
                self.in_edges[to_idx].push(from_idx);
            }
            // Silently skip edges with invalid node references
        }
    }

    /// Returns the number of nodes
    #[must_use]
    pub const fn node_count(&self) -> usize {
        self.nodes.len()
    }

    /// Returns the number of edges
    #[must_use]
    pub const fn edge_count(&self) -> usize {
        self.edges.len()
    }
}

#[cfg(test)]
mod tests {
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

    fn create_test_edge(from: &str, to: &str) -> Edge {
        Edge {
            from: from.to_string(),
            to: to.to_string(),
            relation: "supports".to_string(),
            domain: "philosophy".to_string(),
            weight: Some(0.9),
        }
    }

    #[test]
    fn test_graph_store_new_is_empty() {
        let store = GraphStore::new();
        assert_eq!(store.node_count(), 0);
        assert_eq!(store.edge_count(), 0);
    }

    #[test]
    fn test_graph_store_add_node_success() {
        let mut store = GraphStore::new();
        let node = create_test_node("abc123");

        store.add_node(node.clone());

        assert_eq!(store.node_count(), 1);
        assert_eq!(store.get_node("abc123"), Some(&node));
    }

    #[test]
    fn test_graph_store_add_multiple_nodes() {
        let mut store = GraphStore::new();

        for i in 0..10 {
            let id = format!("node{i:02}");
            store.add_node(create_test_node(&id));
        }

        assert_eq!(store.node_count(), 10);

        // Verify all retrievable
        for i in 0..10 {
            let id = format!("node{i:02}");
            assert!(store.get_node(&id).is_some());
        }
    }

    #[test]
    fn test_graph_store_get_nonexistent_node_returns_none() {
        let store = GraphStore::new();
        assert_eq!(store.get_node("nonexistent"), None);
    }

    #[test]
    fn test_graph_store_add_edge() {
        let mut store = GraphStore::new();
        let edge = create_test_edge("node1", "node2");

        store.add_edge(edge);

        assert_eq!(store.edge_count(), 1);
    }

    #[test]
    fn test_graph_store_build_adjacency_single_edge() {
        let mut store = GraphStore::new();
        store.add_node(create_test_node("a"));
        store.add_node(create_test_node("b"));
        store.add_edge(create_test_edge("a", "b"));

        store.build_adjacency();

        // Should have adjacency lists built
        assert_eq!(store.out_edges.len(), 2);
        assert_eq!(store.in_edges.len(), 2);

        // Node a should have outgoing edge to b
        let a_idx = store.id_to_idx["a"];
        let b_idx = store.id_to_idx["b"];

        assert!(store.out_edges[a_idx].contains(&b_idx));
        assert!(store.in_edges[b_idx].contains(&a_idx));
    }

    #[test]
    fn test_graph_store_build_adjacency_multiple_edges() {
        let mut store = GraphStore::new();
        store.add_node(create_test_node("a"));
        store.add_node(create_test_node("b"));
        store.add_node(create_test_node("c"));

        // A → B, A → C, B → C
        store.add_edge(create_test_edge("a", "b"));
        store.add_edge(create_test_edge("a", "c"));
        store.add_edge(create_test_edge("b", "c"));

        store.build_adjacency();

        let a_idx = store.id_to_idx["a"];
        let b_idx = store.id_to_idx["b"];
        let c_idx = store.id_to_idx["c"];

        // A has 2 outgoing edges
        assert_eq!(store.out_edges[a_idx].len(), 2);
        assert!(store.out_edges[a_idx].contains(&b_idx));
        assert!(store.out_edges[a_idx].contains(&c_idx));

        // B has 1 outgoing edge
        assert_eq!(store.out_edges[b_idx].len(), 1);
        assert!(store.out_edges[b_idx].contains(&c_idx));

        // C has 2 incoming edges
        assert_eq!(store.in_edges[c_idx].len(), 2);
        assert!(store.in_edges[c_idx].contains(&a_idx));
        assert!(store.in_edges[c_idx].contains(&b_idx));
    }

    #[test]
    fn test_graph_store_adjacency_handles_missing_nodes() {
        let mut store = GraphStore::new();
        store.add_node(create_test_node("a"));
        // Add edge referencing non-existent node
        store.add_edge(create_test_edge("a", "nonexistent"));

        // Should not panic, just skip invalid edge
        store.build_adjacency();

        let a_idx = store.id_to_idx["a"];
        // Should have empty outgoing edges (edge was invalid)
        assert!(store.out_edges[a_idx].is_empty());
    }

    #[test]
    fn test_graph_store_large_graph_performance() {
        let mut store = GraphStore::new();

        // Add 1000 nodes
        for i in 0..1000 {
            let id = format!("n{i:06}");
            store.add_node(create_test_node(&id));
        }

        // Add 5000 edges (random connections)
        for i in 0..5000 {
            let from_idx = i % 1000;
            let to_idx = (i * 7) % 1000; // Pseudo-random
            let from_id = format!("n{from_idx:06}");
            let to_id = format!("n{to_idx:06}");
            store.add_edge(create_test_edge(&from_id, &to_id));
        }

        // Build adjacency - should complete quickly
        use std::time::Instant;
        let start = Instant::now();
        store.build_adjacency();
        let elapsed = start.elapsed();

        // Should complete in < 100ms (generous for debug build)
        assert!(elapsed.as_millis() < 100, "build_adjacency took {elapsed:?}");

        assert_eq!(store.node_count(), 1000);
        assert_eq!(store.edge_count(), 5000);
    }

    #[test]
    fn test_graph_store_duplicate_node_id_overwrites() {
        let mut store = GraphStore::new();
        let node1 = Node {
            id: "same01".to_string(),
            title: "First".to_string(),
            ..create_test_node("same01")
        };
        let node2 = Node {
            id: "same01".to_string(),
            title: "Second".to_string(),
            ..create_test_node("same01")
        };

        store.add_node(node1);
        store.add_node(node2.clone());

        // Should have only 1 node (second overwrites first)
        assert_eq!(store.node_count(), 1);
        assert_eq!(store.get_node("same01"), Some(&node2));
    }

    #[test]
    fn test_graph_store_default_trait() {
        let store: GraphStore = Default::default();
        assert_eq!(store.node_count(), 0);
    }
}
