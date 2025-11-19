//! Domain filtering operations

use super::{GraphStore, Node};

impl GraphStore {
    /// Filters nodes by domain
    ///
    /// # Arguments
    ///
    /// * `domains` - Array of domain names to include
    ///
    /// # Returns
    ///
    /// Vector of nodes matching the specified domains
    #[must_use]
    pub fn filter_by_domain(&self, domains: &[&str]) -> Vec<&Node> {
        self.nodes
            .iter()
            .filter(|node| domains.contains(&node.domain.as_str()))
            .collect()
    }

    /// Gets k-hop neighbors filtered by domain
    #[must_use]
    pub fn neighbors_filtered(&self, node_id: &str, depth: u32, domains: &[&str]) -> Vec<&Node> {
        let all_neighbors = self.neighbors(node_id, depth);
        all_neighbors
            .into_iter()
            .filter(|node| domains.contains(&node.domain.as_str()))
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::graph::{Edge, Node};

    fn create_test_node(id: &str, domain: &str) -> Node {
        Node {
            id: id.to_string(),
            r#type: "proposition".to_string(),
            domain: domain.to_string(),
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

    fn create_edge(from: &str, to: &str) -> Edge {
        Edge {
            from: from.to_string(),
            to: to.to_string(),
            relation: "supports".to_string(),
            domain: "philosophy".to_string(),
            weight: Some(0.9),
            metadata: None,
        }
    }

    #[test]
    fn test_filter_by_domain_single() {
        let mut store = GraphStore::new();
        store.add_node(create_test_node("a", "philosophy"));
        store.add_node(create_test_node("b", "mathematics"));
        store.add_node(create_test_node("c", "physics"));

        let filtered = store.filter_by_domain(&["philosophy"]);

        assert_eq!(filtered.len(), 1);
        assert_eq!(filtered[0].id, "a");
    }

    #[test]
    fn test_filter_by_domain_multiple() {
        let mut store = GraphStore::new();
        store.add_node(create_test_node("a", "philosophy"));
        store.add_node(create_test_node("b", "mathematics"));
        store.add_node(create_test_node("c", "physics"));

        let filtered = store.filter_by_domain(&["philosophy", "mathematics"]);

        assert_eq!(filtered.len(), 2);
    }

    #[test]
    fn test_neighbors_filtered() {
        let mut store = GraphStore::new();
        store.add_node(create_test_node("a", "philosophy"));
        store.add_node(create_test_node("b", "mathematics"));
        store.add_node(create_test_node("c", "philosophy"));

        store.add_edge(create_edge("a", "b"));
        store.add_edge(create_edge("b", "c"));
        store.build_adjacency();

        let neighbors = store.neighbors_filtered("a", 2, &["philosophy"]);

        // Should include a and c (both philosophy), but not b (mathematics)
        assert_eq!(neighbors.len(), 1);
        assert_eq!(neighbors[0].id, "c");
    }
}
