//! Graph query operations

use super::{GraphStore, Node};
use std::collections::{HashSet, VecDeque};

impl GraphStore {
    /// Returns k-hop neighbors of a node
    ///
    /// Uses BFS to find all nodes reachable within k hops.
    ///
    /// # Arguments
    ///
    /// * `node_id` - ID of the starting node
    /// * `depth` - Maximum number of hops (k)
    ///
    /// # Returns
    ///
    /// Vector of nodes within k hops (not including the starting node itself)
    #[must_use]
    pub fn neighbors(&self, node_id: &str, depth: u32) -> Vec<&Node> {
        let Some(&start_idx) = self.id_to_idx.get(node_id) else {
            return Vec::new();
        };

        if depth == 0 {
            return Vec::new();
        }

        let mut visited = HashSet::new();
        let mut queue = VecDeque::new();
        let mut result = Vec::new();

        visited.insert(start_idx);
        queue.push_back((start_idx, 0_u32));

        while let Some((current_idx, current_depth)) = queue.pop_front() {
            if current_depth >= depth {
                continue;
            }

            // Explore outgoing edges
            for &neighbor_idx in &self.out_edges[current_idx] {
                if visited.insert(neighbor_idx) {
                    // insert returns true if value was not present
                    result.push(&self.nodes[neighbor_idx]);
                    queue.push_back((neighbor_idx, current_depth + 1));
                }
            }
        }

        result
    }

    /// Finds all simple paths from one node to another
    ///
    /// Uses DFS to enumerate all simple paths (no repeated nodes).
    ///
    /// # Arguments
    ///
    /// * `from` - Starting node ID
    /// * `to` - Ending node ID
    /// * `max_depth` - Maximum path length to search
    ///
    /// # Returns
    ///
    /// Vector of paths, where each path is a vector of nodes from start to end.
    /// Returns empty vector if no path exists or `max_depth` is exceeded.
    #[must_use]
    pub fn find_paths(&self, from: &str, to: &str, max_depth: u32) -> Vec<Vec<&Node>> {
        let Some(&start_idx) = self.id_to_idx.get(from) else {
            return Vec::new();
        };
        let Some(&end_idx) = self.id_to_idx.get(to) else {
            return Vec::new();
        };

        let mut all_paths = Vec::new();
        let mut current_path = Vec::new();
        let mut visited = HashSet::new();

        self.dfs_find_paths(
            start_idx,
            end_idx,
            &mut current_path,
            &mut visited,
            &mut all_paths,
            max_depth,
        );

        all_paths
    }

    /// DFS helper for path finding
    fn dfs_find_paths<'a>(
        &'a self,
        current: usize,
        target: usize,
        path: &mut Vec<&'a Node>,
        visited: &mut HashSet<usize>,
        all_paths: &mut Vec<Vec<&'a Node>>,
        max_depth: u32,
    ) {
        // Add current node to path
        path.push(&self.nodes[current]);
        visited.insert(current);

        // Check if we've reached the target
        if current == target {
            all_paths.push(path.clone());
        } else if path.len() < max_depth as usize {
            // Continue DFS if we haven't exceeded max depth
            for &neighbor in &self.out_edges[current] {
                if !visited.contains(&neighbor) {
                    self.dfs_find_paths(neighbor, target, path, visited, all_paths, max_depth);
                }
            }
        }

        // Backtrack
        path.pop();
        visited.remove(&current);
    }
}

#[cfg(test)]
mod tests {
    use super::super::{Edge, Node};
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
            metadata: None,
        }
    }

    fn build_test_graph() -> GraphStore {
        let mut store = GraphStore::new();

        // Create simple test graph: A → B → C
        //                           └────────┘
        store.add_node(create_test_node("a"));
        store.add_node(create_test_node("b"));
        store.add_node(create_test_node("c"));

        store.add_edge(create_test_edge("a", "b", "supports"));
        store.add_edge(create_test_edge("b", "c", "supports"));
        store.add_edge(create_test_edge("a", "c", "entails"));

        store.build_adjacency();
        store
    }

    // ===== Neighbors Tests =====

    #[test]
    fn test_neighbors_0_hop_returns_empty() {
        let store = build_test_graph();
        let neighbors = store.neighbors("a", 0);
        assert!(neighbors.is_empty());
    }

    #[test]
    fn test_neighbors_1_hop() {
        let store = build_test_graph();
        // A → B, A → C
        let neighbors = store.neighbors("a", 1);

        assert_eq!(neighbors.len(), 2);
        let ids: Vec<&str> = neighbors.iter().map(|n| n.id.as_str()).collect();
        assert!(ids.contains(&"b"));
        assert!(ids.contains(&"c"));
    }

    #[test]
    fn test_neighbors_2_hop() {
        let mut store = GraphStore::new();
        // A → B → C, A → D
        store.add_node(create_test_node("a"));
        store.add_node(create_test_node("b"));
        store.add_node(create_test_node("c"));
        store.add_node(create_test_node("d"));

        store.add_edge(create_test_edge("a", "b", "supports"));
        store.add_edge(create_test_edge("b", "c", "supports"));
        store.add_edge(create_test_edge("a", "d", "supports"));

        store.build_adjacency();

        let neighbors = store.neighbors("a", 2);

        assert_eq!(neighbors.len(), 3); // B, C, D
        let ids: Vec<&str> = neighbors.iter().map(|n| n.id.as_str()).collect();
        assert!(ids.contains(&"b"));
        assert!(ids.contains(&"c"));
        assert!(ids.contains(&"d"));
    }

    #[test]
    fn test_neighbors_respects_depth_limit() {
        let mut store = GraphStore::new();
        // Chain: A → B → C → D → E
        for id in ["a", "b", "c", "d", "e"] {
            store.add_node(create_test_node(id));
        }

        store.add_edge(create_test_edge("a", "b", "supports"));
        store.add_edge(create_test_edge("b", "c", "supports"));
        store.add_edge(create_test_edge("c", "d", "supports"));
        store.add_edge(create_test_edge("d", "e", "supports"));

        store.build_adjacency();

        let neighbors = store.neighbors("a", 2);

        // Should only reach B and C, not D or E
        assert_eq!(neighbors.len(), 2);
        let ids: Vec<&str> = neighbors.iter().map(|n| n.id.as_str()).collect();
        assert!(ids.contains(&"b"));
        assert!(ids.contains(&"c"));
        assert!(!ids.contains(&"d"));
        assert!(!ids.contains(&"e"));
    }

    #[test]
    fn test_neighbors_nonexistent_node() {
        let store = build_test_graph();
        let neighbors = store.neighbors("nonexistent", 1);
        assert!(neighbors.is_empty());
    }

    // ===== Path Finding Tests =====

    #[test]
    fn test_find_paths_direct_edge() {
        let store = build_test_graph();
        // A → C (direct edge)
        let paths = store.find_paths("a", "c", 10);

        assert_eq!(paths.len(), 2); // Two paths: A→C direct, A→B→C

        // Check one path is the direct route
        let has_direct = paths.iter().any(|path| path.len() == 2);
        assert!(has_direct);

        // Check one path goes through B
        let has_via_b = paths.iter().any(|path| path.len() == 3);
        assert!(has_via_b);
    }

    #[test]
    fn test_find_paths_single_path() {
        let mut store = GraphStore::new();
        // Linear: A → B → C (no shortcut)
        store.add_node(create_test_node("a"));
        store.add_node(create_test_node("b"));
        store.add_node(create_test_node("c"));

        store.add_edge(create_test_edge("a", "b", "supports"));
        store.add_edge(create_test_edge("b", "c", "supports"));

        store.build_adjacency();

        let paths = store.find_paths("a", "c", 10);

        assert_eq!(paths.len(), 1);
        assert_eq!(paths[0].len(), 3); // A, B, C

        let path_ids: Vec<&str> = paths[0].iter().map(|n| n.id.as_str()).collect();
        assert_eq!(path_ids, vec!["a", "b", "c"]);
    }

    #[test]
    fn test_find_paths_multiple_paths() {
        let mut store = GraphStore::new();
        // Diamond: A → B → D
        //          └───→ C → D
        for id in ["a", "b", "c", "d"] {
            store.add_node(create_test_node(id));
        }

        store.add_edge(create_test_edge("a", "b", "supports"));
        store.add_edge(create_test_edge("a", "c", "supports"));
        store.add_edge(create_test_edge("b", "d", "supports"));
        store.add_edge(create_test_edge("c", "d", "supports"));

        store.build_adjacency();

        let paths = store.find_paths("a", "d", 10);

        assert_eq!(paths.len(), 2); // Two paths to D

        // Both paths should have length 3 (A → X → D)
        for path in &paths {
            assert_eq!(path.len(), 3);
            assert_eq!(path[0].id, "a");
            assert_eq!(path[2].id, "d");
        }
    }

    #[test]
    fn test_find_paths_no_path_returns_empty() {
        let mut store = GraphStore::new();
        // Disconnected: A → B, C → D
        for id in ["a", "b", "c", "d"] {
            store.add_node(create_test_node(id));
        }

        store.add_edge(create_test_edge("a", "b", "supports"));
        store.add_edge(create_test_edge("c", "d", "supports"));

        store.build_adjacency();

        let paths = store.find_paths("a", "d", 10);

        assert!(paths.is_empty());
    }

    #[test]
    fn test_find_paths_respects_max_depth() {
        let mut store = GraphStore::new();
        // Long chain: A → B → C → D → E
        for id in ["a", "b", "c", "d", "e"] {
            store.add_node(create_test_node(id));
        }

        store.add_edge(create_test_edge("a", "b", "supports"));
        store.add_edge(create_test_edge("b", "c", "supports"));
        store.add_edge(create_test_edge("c", "d", "supports"));
        store.add_edge(create_test_edge("d", "e", "supports"));

        store.build_adjacency();

        // Path length is 5 (A, B, C, D, E), but max_depth=3 should limit
        let paths = store.find_paths("a", "e", 3);

        assert!(paths.is_empty()); // Path too long
    }

    #[test]
    fn test_find_paths_same_node() {
        let store = build_test_graph();
        // Paths from A to A should return empty (or single-node path)
        let paths = store.find_paths("a", "a", 10);

        // Either empty or [[A]] is acceptable
        if !paths.is_empty() {
            assert_eq!(paths.len(), 1);
            assert_eq!(paths[0].len(), 1);
            assert_eq!(paths[0][0].id, "a");
        }
    }

    #[test]
    fn test_find_paths_nonexistent_nodes() {
        let store = build_test_graph();

        let paths1 = store.find_paths("nonexistent", "c", 10);
        assert!(paths1.is_empty());

        let paths2 = store.find_paths("a", "nonexistent", 10);
        assert!(paths2.is_empty());
    }

    #[test]
    fn test_find_paths_no_cycles() {
        let mut store = GraphStore::new();
        // Cycle: A → B → C → A
        for id in ["a", "b", "c"] {
            store.add_node(create_test_node(id));
        }

        store.add_edge(create_test_edge("a", "b", "supports"));
        store.add_edge(create_test_edge("b", "c", "supports"));
        store.add_edge(create_test_edge("c", "a", "supports"));

        store.build_adjacency();

        // Simple paths should not include cycles
        let paths = store.find_paths("a", "c", 10);

        assert_eq!(paths.len(), 1); // Only A → B → C, not cycling back
        assert_eq!(paths[0].len(), 3);
    }
}
