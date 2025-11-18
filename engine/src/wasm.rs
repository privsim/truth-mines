//! WebAssembly bindings for JavaScript

use crate::graph::{GraphStore, Node};
use crate::gpu::buffers::{generate_edge_buffer, generate_node_buffer};
use crate::layout::{depth::compute_depths, truth_mine::compute_truth_mine_layout};
use crate::parsers::{json::load_node_from_json, toon::parse_toon};
use crate::style::StyleConfig;
use std::collections::HashMap;
use wasm_bindgen::prelude::*;

/// Graph processing engine for WebAssembly
#[wasm_bindgen]
pub struct GraphEngine {
    graph: GraphStore,
    style: StyleConfig,
    layout_3d: HashMap<String, [f32; 3]>,
    depths: HashMap<String, u32>,
}

#[wasm_bindgen]
impl GraphEngine {
    /// Creates a new `GraphEngine`
    ///
    /// # Arguments
    ///
    /// * `style_toml` - TOML style configuration string
    ///
    /// # Errors
    ///
    /// Returns error if style TOML is malformed
    #[wasm_bindgen(constructor)]
    pub fn new(style_toml: &str) -> Result<GraphEngine, JsValue> {
        let style = StyleConfig::from_toml(style_toml)
            .map_err(|e| JsValue::from_str(&format!("Style config error: {e}")))?;

        Ok(GraphEngine {
            graph: GraphStore::new(),
            style,
            layout_3d: HashMap::new(),
            depths: HashMap::new(),
        })
    }

    /// Loads nodes from JSON string
    ///
    /// # Arguments
    ///
    /// * `nodes_json` - JSON array of nodes or single node
    ///
    /// # Errors
    ///
    /// Returns error if JSON is malformed
    pub fn load_nodes_json(&mut self, nodes_json: &str) -> Result<(), JsValue> {
        // Parse as array or single node
        if let Ok(nodes) = serde_json::from_str::<Vec<Node>>(nodes_json) {
            for node in nodes {
                self.graph.add_node(node);
            }
        } else {
            let node = load_node_from_json(nodes_json)
                .map_err(|e| JsValue::from_str(&e))?;
            self.graph.add_node(node);
        }

        Ok(())
    }

    /// Loads edges from TOON format
    ///
    /// # Arguments
    ///
    /// * `edges_toon` - TOON formatted edge data
    ///
    /// # Errors
    ///
    /// Returns error if TOON is malformed
    pub fn load_edges_toon(&mut self, edges_toon: &str) -> Result<(), JsValue> {
        let edges = parse_toon(edges_toon)
            .map_err(|e| JsValue::from_str(&format!("TOON parse error: {e}")))?;

        for edge in edges {
            self.graph.add_edge(edge);
        }

        Ok(())
    }

    /// Computes the truth mine 3D layout
    pub fn compute_layout_truth_mine(&mut self) {
        self.graph.build_adjacency();
        self.depths = compute_depths(&self.graph);
        self.layout_3d = compute_truth_mine_layout(
            &self.graph,
            &self.depths,
            self.style.depth_spacing(),
        );
    }

    /// Gets GPU buffers as JavaScript objects
    ///
    /// # Returns
    ///
    /// Object with `nodes` and `edges` properties (both `Uint8Array`)
    #[wasm_bindgen(js_name = getGpuBuffers)]
    pub fn get_gpu_buffers(&self) -> js_sys::Object {
        let node_buffer = generate_node_buffer(&self.graph, &self.layout_3d, &self.depths, &self.style);
        let edge_buffer = generate_edge_buffer(&self.graph, &self.style);

        let result = js_sys::Object::new();

        let node_array = js_sys::Uint8Array::from(&node_buffer[..]);
        let edge_array = js_sys::Uint8Array::from(&edge_buffer[..]);

        js_sys::Reflect::set(&result, &"nodes".into(), &node_array).ok();
        js_sys::Reflect::set(&result, &"edges".into(), &edge_array).ok();

        result
    }

    /// Returns node count
    #[wasm_bindgen(js_name = nodeCount)]
    pub const fn node_count(&self) -> usize {
        self.graph.node_count()
    }

    /// Returns edge count
    #[wasm_bindgen(js_name = edgeCount)]
    pub const fn edge_count(&self) -> usize {
        self.graph.edge_count()
    }
}

// WASM-specific tests
#[cfg(all(test, target_arch = "wasm32"))]
mod wasm_tests {
    use super::*;
    use wasm_bindgen_test::*;

    #[wasm_bindgen_test]
    fn test_graph_engine_new() {
        let engine = GraphEngine::new("").unwrap();
        assert_eq!(engine.node_count(), 0);
    }

    #[wasm_bindgen_test]
    fn test_graph_engine_load_nodes() {
        let mut engine = GraphEngine::new("").unwrap();
        let json = r#"[{"id":"abc123","type":"proposition","domain":"philosophy","title":"Test"}]"#;

        engine.load_nodes_json(json).unwrap();

        assert_eq!(engine.node_count(), 1);
    }
}
