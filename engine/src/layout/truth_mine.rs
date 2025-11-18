//! Truth mine 3D layout algorithm

use crate::graph::GraphStore;
use std::collections::HashMap;

/// Computes 3D truth mine layout with depth on Y-axis
///
/// # Arguments
///
/// * `graph` - Graph store
/// * `depths` - Node depths from `compute_depths`
/// * `depth_spacing` - Y-axis spacing between layers (default: 5.0)
///
/// # Returns
///
/// `HashMap` of node ID → [x, y, z] positions
#[must_use]
#[allow(clippy::implicit_hasher)]
pub fn compute_truth_mine_layout(
    graph: &GraphStore,
    depths: &HashMap<String, u32>,
    depth_spacing: f32,
) -> HashMap<String, [f32; 3]> {
    use super::force::compute_layout_2d;

    // Get 2D layout for X/Z coordinates
    let layout_2d = compute_layout_2d(graph, 50);

    // Convert to 3D with Y = depth
    let mut layout_3d = HashMap::new();

    #[allow(clippy::cast_precision_loss)]
    for node in &graph.nodes {
        let depth = depths.get(&node.id).copied().unwrap_or(0);
        let y = (depth as f32) * depth_spacing;

        let (x, z) = if let Some([x2d, z2d]) = layout_2d.get(&node.id) {
            (*x2d, *z2d)
        } else {
            (0.0, 0.0)
        };

        layout_3d.insert(node.id.clone(), [x, y, z]);
    }

    layout_3d
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::graph::{Edge, GraphStore, Node};
    use crate::layout::depth::compute_depths;

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
    fn test_truth_mine_layout_assigns_y_by_depth() {
        let mut store = GraphStore::new();
        // F → A → B
        store.add_node(create_test_node("f"));
        store.add_node(create_test_node("a"));
        store.add_node(create_test_node("b"));
        store.add_edge(create_test_edge("f", "a"));
        store.add_edge(create_test_edge("a", "b"));
        store.build_adjacency();

        let depths = compute_depths(&store);
        let layout = compute_truth_mine_layout(&store, &depths, 5.0);

        assert_eq!(layout.len(), 3);

        // F at depth 0 → y = 0
        assert_eq!(layout.get("f").unwrap()[1], 0.0);

        // A at depth 1 → y = 5.0
        assert_eq!(layout.get("a").unwrap()[1], 5.0);

        // B at depth 2 → y = 10.0
        assert_eq!(layout.get("b").unwrap()[1], 10.0);
    }

    #[test]
    fn test_truth_mine_layout_spreads_xy() {
        let mut store = GraphStore::new();
        for id in ["a", "b", "c"] {
            store.add_node(create_test_node(id));
        }
        store.build_adjacency();

        let depths = compute_depths(&store);
        let layout = compute_truth_mine_layout(&store, &depths, 5.0);

        // All at same depth (0), should have spread X/Z
        let pos_a = layout.get("a").unwrap();
        let pos_b = layout.get("b").unwrap();
        let pos_c = layout.get("c").unwrap();

        // All should have same Y
        assert_eq!(pos_a[1], pos_b[1]);
        assert_eq!(pos_b[1], pos_c[1]);

        // But different X or Z
        assert!(pos_a != pos_b || pos_b != pos_c);
    }
}
