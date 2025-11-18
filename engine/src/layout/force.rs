//! Force-directed 2D layout algorithm

use crate::graph::GraphStore;
use std::collections::HashMap;

/// Computes 2D force-directed layout
///
/// # Arguments
///
/// * `graph` - Graph store
/// * `iterations` - Number of iterations (default: 100)
///
/// # Returns
///
/// `HashMap` of node ID → [x, y] positions
#[must_use]
pub fn compute_layout_2d(graph: &GraphStore, iterations: usize) -> HashMap<String, [f32; 2]> {
    let mut positions = HashMap::new();

    // Initialize random positions
    #[allow(clippy::cast_precision_loss)]
    for (i, node) in graph.nodes.iter().enumerate() {
        let angle = (i as f32) * 2.0 * std::f32::consts::PI / (graph.nodes.len() as f32);
        positions.insert(node.id.clone(), [angle.cos() * 10.0, angle.sin() * 10.0]);
    }

    // Simple force-directed layout (can be enhanced later)
    for _ in 0..iterations {
        // Placeholder: positions are already initialized
        // Full implementation would apply spring and repulsion forces
    }

    positions
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::graph::{Edge, GraphStore, Node};

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

    #[test]
    fn test_force_layout_returns_positions() {
        let mut store = GraphStore::new();
        store.add_node(create_test_node("a"));
        store.add_node(create_test_node("b"));

        let layout = compute_layout_2d(&store, 10);

        assert_eq!(layout.len(), 2);
        assert!(layout.contains_key("a"));
        assert!(layout.contains_key("b"));
    }

    #[test]
    fn test_force_layout_positions_not_identical() {
        let mut store = GraphStore::new();
        store.add_node(create_test_node("a"));
        store.add_node(create_test_node("b"));

        let layout = compute_layout_2d(&store, 10);

        let pos_a = layout.get("a").unwrap();
        let pos_b = layout.get("b").unwrap();

        // Nodes should not be at same position
        assert!(pos_a != pos_b);
    }
}
