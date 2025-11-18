//! Integration tests for Truth Mines engine

use std::path::Path;
use truth_mines_engine::{
    graph::GraphStore,
    layout::{depth::compute_depths, truth_mine::compute_truth_mine_layout},
    parsers::{json::load_nodes_from_dir, toon::parse_toon},
    style::StyleConfig,
};

#[test]
fn test_full_pipeline_with_sample_graph() {
    // Load sample nodes
    let project_root = Path::new(env!("CARGO_MANIFEST_DIR")).parent().unwrap();
    let nodes_dir = project_root.join("docs/examples/sample-nodes");

    if !nodes_dir.exists() {
        return; // Skip if examples not available
    }

    let nodes = load_nodes_from_dir(&nodes_dir).expect("Failed to load nodes");
    assert!(nodes.len() >= 10, "Should have at least 10 sample nodes");

    // Create graph
    let mut graph = GraphStore::new();
    for node in nodes {
        graph.add_node(node);
    }

    // Load edges
    let edges_dir = project_root.join("docs/examples/sample-edges");
    if edges_dir.exists() {
        for edge_file in std::fs::read_dir(edges_dir).unwrap() {
            let path = edge_file.unwrap().path();
            if path.extension().and_then(|s| s.to_str()) == Some("jsonl") {
                let content = std::fs::read_to_string(path).unwrap();
                if let Ok(edges) = truth_mines_engine::parsers::toon::parse_jsonl(&content) {
                    for edge in edges {
                        graph.add_edge(edge);
                    }
                }
            }
        }
    }

    graph.build_adjacency();
    assert!(graph.node_count() >= 10);
    assert!(graph.edge_count() > 0);

    // Compute depths
    let depths = compute_depths(&graph);
    assert!(!depths.is_empty());
    assert!(depths.values().any(|&d| d == 0)); // At least one foundation

    // Compute layout
    let layout = compute_truth_mine_layout(&graph, &depths, 5.0);
    assert_eq!(layout.len(), graph.node_count());

    // Verify layout positions are valid
    for (_id, pos) in &layout {
        assert!(pos[0].is_finite());
        assert!(pos[1].is_finite());
        assert!(pos[2].is_finite());
    }

    // Generate GPU buffers
    let style = StyleConfig::default();
    let node_buffer = truth_mines_engine::gpu::buffers::generate_node_buffer(
        &graph, &layout, &depths, &style
    );
    let edge_buffer = truth_mines_engine::gpu::buffers::generate_edge_buffer(&graph, &style);

    assert!(!node_buffer.is_empty());
    assert!(!edge_buffer.is_empty());

    // Verify buffer sizes are correct multiples
    let node_size = std::mem::size_of::<truth_mines_engine::gpu::GpuNode>();
    let edge_size = std::mem::size_of::<truth_mines_engine::gpu::GpuEdge>();

    assert_eq!(node_buffer.len() % node_size, 0);
    assert_eq!(edge_buffer.len() % edge_size, 0);
}

#[test]
fn test_query_operations_on_loaded_graph() {
    let project_root = Path::new(env!("CARGO_MANIFEST_DIR")).parent().unwrap();
    let nodes_dir = project_root.join("docs/examples/sample-nodes");

    if !nodes_dir.exists() {
        return;
    }

    let nodes = load_nodes_from_dir(&nodes_dir).unwrap();
    let mut graph = GraphStore::new();
    for node in nodes {
        graph.add_node(node);
    }

    // Load one edge file to test queries
    let supports_file = project_root.join("docs/examples/sample-edges/supports.jsonl");
    if supports_file.exists() {
        let content = std::fs::read_to_string(supports_file).unwrap();
        if let Ok(edges) = truth_mines_engine::parsers::toon::parse_jsonl(&content) {
            for edge in edges {
                graph.add_edge(edge);
            }
        }
    }

    graph.build_adjacency();

    // Test k-hop neighbors
    if graph.node_count() > 0 {
        let first_node_id = &graph.nodes()[0].id;
        let neighbors = graph.neighbors(first_node_id, 2);

        // Should be able to query without panicking
        assert!(neighbors.len() <= graph.node_count());
    }

    // Test path finding
    if graph.node_count() >= 2 {
        let node_a = &graph.nodes()[0].id;
        let node_b = &graph.nodes()[1].id;

        let paths = graph.find_paths(node_a, node_b, 10);

        // May or may not have path, but shouldn't panic
        assert!(paths.len() <= 100); // Sanity check
    }
}
