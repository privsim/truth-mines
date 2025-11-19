//! GPU buffer generation

use crate::graph::GraphStore;
use crate::style::StyleConfig;
use std::collections::HashMap;

/// Generates GPU node buffer
///
/// # Arguments
///
/// * `graph` - Graph store
/// * `layout` - 3D positions for each node
/// * `depths` - Depth values for each node
/// * `style` - Style configuration
///
/// # Returns
///
/// Byte vector ready for GPU upload
#[must_use]
#[allow(clippy::implicit_hasher)]
pub fn generate_node_buffer(
    graph: &GraphStore,
    layout: &HashMap<String, [f32; 3]>,
    depths: &HashMap<String, u32>,
    style: &StyleConfig,
) -> Vec<u8> {
    let mut gpu_nodes = Vec::with_capacity(graph.nodes.len());

    for node in &graph.nodes {
        let position = layout.get(&node.id).copied().unwrap_or([0.0, 0.0, 0.0]);
        let depth = depths.get(&node.id).copied().unwrap_or(0);

        let gpu_node = style.map_node_to_gpu(node, depth, position);
        gpu_nodes.push(gpu_node);
    }

    bytemuck::cast_slice(&gpu_nodes).to_vec()
}

/// Generates GPU edge buffer
///
/// # Arguments
///
/// * `graph` - Graph store
/// * `style` - Style configuration
///
/// # Returns
///
/// Byte vector ready for GPU upload
#[must_use]
#[allow(clippy::cast_possible_truncation)]
pub fn generate_edge_buffer(graph: &GraphStore, style: &StyleConfig) -> Vec<u8> {
    let mut gpu_edges = Vec::with_capacity(graph.edges.len());

    for edge in &graph.edges {
        if let (Some(&from_idx), Some(&to_idx)) = (
            graph.id_to_idx.get(&edge.from),
            graph.id_to_idx.get(&edge.to),
        ) {
            let gpu_edge = style.map_edge_to_gpu(edge, from_idx as u32, to_idx as u32);
            gpu_edges.push(gpu_edge);
        }
    }

    bytemuck::cast_slice(&gpu_edges).to_vec()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::gpu::{GpuEdge, GpuNode};
    use crate::graph::{Edge, Node};
    use crate::layout::{depth::compute_depths, truth_mine::compute_truth_mine_layout};

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
    fn test_generate_node_buffer_size() {
        let mut store = GraphStore::new();
        store.add_node(create_test_node("a"));
        store.add_node(create_test_node("b"));
        store.add_node(create_test_node("c"));

        let layout = HashMap::from([
            ("a".to_string(), [0.0, 0.0, 0.0]),
            ("b".to_string(), [1.0, 1.0, 1.0]),
            ("c".to_string(), [2.0, 2.0, 2.0]),
        ]);
        let depths = HashMap::new();
        let style = StyleConfig::default();

        let buffer = generate_node_buffer(&store, &layout, &depths, &style);

        assert_eq!(buffer.len(), 3 * std::mem::size_of::<GpuNode>());
    }

    #[test]
    fn test_generate_edge_buffer_size() {
        let mut store = GraphStore::new();
        store.add_node(create_test_node("a"));
        store.add_node(create_test_node("b"));
        store.add_edge(Edge {
            from: "a".to_string(),
            to: "b".to_string(),
            relation: "supports".to_string(),
            domain: "philosophy".to_string(),
            weight: Some(0.9),
            metadata: None,
        });

        let style = StyleConfig::default();
        let buffer = generate_edge_buffer(&store, &style);

        assert_eq!(buffer.len(), 1 * std::mem::size_of::<GpuEdge>());
    }

    #[test]
    fn test_buffers_from_real_graph() {
        // Integration: generate buffers from sample graph
        let project_root = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
            .parent()
            .unwrap();
        let nodes_dir = project_root.join("docs/examples/sample-nodes");

        if nodes_dir.exists() {
            let nodes = crate::parsers::json::load_nodes_from_dir(&nodes_dir).unwrap();
            let mut store = GraphStore::new();
            for node in nodes {
                store.add_node(node);
            }
            store.build_adjacency();

            let depths = compute_depths(&store);
            let layout = compute_truth_mine_layout(&store, &depths, 5.0);
            let style = StyleConfig::default();

            let node_buffer = generate_node_buffer(&store, &layout, &depths, &style);
            let _edge_buffer = generate_edge_buffer(&store, &style);

            assert!(!node_buffer.is_empty());
            assert!(node_buffer.len() % std::mem::size_of::<GpuNode>() == 0);
        }
    }
}
