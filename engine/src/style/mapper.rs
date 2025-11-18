//! Style mapping from semantic properties to GPU visual properties

use crate::gpu::{GpuEdge, GpuNode};
use crate::graph::{Edge, Node};
use serde::Deserialize;
use std::collections::HashMap;

/// Style configuration loaded from TOML
#[derive(Debug, Clone, Deserialize, Default)]
pub struct StyleConfig {
    #[serde(default)]
    colors: Colors,
    #[serde(default)]
    layout: LayoutConfig,
}

#[derive(Debug, Clone, Deserialize, Default)]
struct Colors {
    #[serde(default)]
    domains: HashMap<String, Vec<u8>>,
    #[serde(default)]
    relations: HashMap<String, Vec<u8>>,
}

#[derive(Debug, Clone, Deserialize)]
struct LayoutConfig {
    #[serde(default = "default_depth_spacing")]
    depth_spacing: f32,
}

const fn default_depth_spacing() -> f32 {
    5.0
}

impl Default for LayoutConfig {
    fn default() -> Self {
        Self {
            depth_spacing: default_depth_spacing(),
        }
    }
}

impl StyleConfig {
    /// Loads style config from TOML string
    ///
    /// # Errors
    ///
    /// Returns error if TOML is malformed
    pub fn from_toml(toml_str: &str) -> Result<Self, String> {
        if toml_str.trim().is_empty() {
            return Ok(Self::default());
        }

        toml::from_str(toml_str).map_err(|e| format!("TOML parsing error: {e}"))
    }

    /// Maps a `Node` to `GpuNode` using style configuration
    #[must_use]
    pub fn map_node_to_gpu(&self, node: &Node, _depth: u32, position: [f32; 3]) -> GpuNode {
        // Get domain color
        let color = self.get_domain_color(&node.domain);

        // Encode domain and type as IDs
        let domain_id = Self::encode_domain(&node.domain);
        let type_id = Self::encode_type(&node.r#type);

        GpuNode {
            position,
            size: 1.0, // Default size
            color,
            domain_id,
            type_id,
            flags: 0,
            scalar: 1.0, // Default scalar
        }
    }

    /// Maps an `Edge` to `GpuEdge` using style configuration
    #[must_use]
    pub fn map_edge_to_gpu(&self, edge: &Edge, from_idx: u32, to_idx: u32) -> GpuEdge {
        let color = self.get_relation_color(&edge.relation);
        let relation_id = Self::encode_relation(&edge.relation);
        let weight = edge.weight.unwrap_or(1.0);

        GpuEdge {
            from: from_idx,
            to: to_idx,
            color,
            weight,
            relation_id,
            flags: 0,
            padding: 0,
        }
    }

    /// Gets depth spacing for truth mine layout
    #[must_use]
    pub const fn depth_spacing(&self) -> f32 {
        self.layout.depth_spacing
    }

    // Helper methods

    fn get_domain_color(&self, domain: &str) -> [f32; 4] {
        if let Some(rgb) = self.colors.domains.get(domain) {
            if rgb.len() >= 3 {
                return [
                    f32::from(rgb[0]) / 255.0,
                    f32::from(rgb[1]) / 255.0,
                    f32::from(rgb[2]) / 255.0,
                    1.0,
                ];
            }
        }

        // Default gray
        [0.5, 0.5, 0.5, 1.0]
    }

    fn get_relation_color(&self, relation: &str) -> [f32; 4] {
        if let Some(rgb) = self.colors.relations.get(relation) {
            if rgb.len() >= 3 {
                return [
                    f32::from(rgb[0]) / 255.0,
                    f32::from(rgb[1]) / 255.0,
                    f32::from(rgb[2]) / 255.0,
                    1.0,
                ];
            }
        }

        // Default gray
        [0.6, 0.6, 0.6, 1.0]
    }

    fn encode_domain(domain: &str) -> u32 {
        match domain {
            "philosophy" => 0,
            "mathematics" => 1,
            "physics" => 2,
            _ => 99,
        }
    }

    fn encode_type(node_type: &str) -> u32 {
        match node_type {
            "proposition" => 0,
            "theorem" => 1,
            "theory" => 2,
            "axiom" => 3,
            "definition" => 4,
            "observation" => 5,
            "experiment" => 6,
            "concept" => 7,
            _ => 99,
        }
    }

    fn encode_relation(relation: &str) -> u32 {
        match relation {
            "supports" => 0,
            "attacks" => 1,
            "entails" => 2,
            "proves" => 3,
            "predicts" => 4,
            "formalizes" => 5,
            "models" => 6,
            _ => 99,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_node(id: &str, domain: &str, node_type: &str) -> Node {
        Node {
            id: id.to_string(),
            r#type: node_type.to_string(),
            domain: domain.to_string(),
            title: "Test".to_string(),
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
    fn test_style_config_from_toml() {
        let toml_str = r#"
[colors.domains]
philosophy = [147, 51, 234]
mathematics = [37, 99, 235]

[layout]
depth_spacing = 5.0
"#;

        let result = StyleConfig::from_toml(toml_str);
        assert!(result.is_ok());

        let config = result.unwrap();
        assert_eq!(config.depth_spacing(), 5.0);
    }

    #[test]
    fn test_style_config_default() {
        let config = StyleConfig::from_toml("").unwrap();
        assert_eq!(config.depth_spacing(), 5.0); // Default
    }

    #[test]
    fn test_map_node_philosophy_to_purple() {
        let toml_str = r#"
[colors.domains]
philosophy = [147, 51, 234]
"#;
        let config = StyleConfig::from_toml(toml_str).unwrap();
        let node = create_test_node("abc123", "philosophy", "proposition");

        let gpu_node = config.map_node_to_gpu(&node, 0, [0.0, 0.0, 0.0]);

        // Color should be purple (converted to 0-1 range)
        let expected_r = 147.0 / 255.0;
        let expected_g = 51.0 / 255.0;
        let expected_b = 234.0 / 255.0;

        assert!((gpu_node.color[0] - expected_r).abs() < 0.01);
        assert!((gpu_node.color[1] - expected_g).abs() < 0.01);
        assert!((gpu_node.color[2] - expected_b).abs() < 0.01);
        assert_eq!(gpu_node.color[3], 1.0); // Alpha
    }

    #[test]
    fn test_map_node_math_to_blue() {
        let toml_str = r#"
[colors.domains]
mathematics = [37, 99, 235]
"#;
        let config = StyleConfig::from_toml(toml_str).unwrap();
        let node = create_test_node("abc123", "mathematics", "theorem");

        let gpu_node = config.map_node_to_gpu(&node, 0, [0.0, 0.0, 0.0]);

        let expected_r = 37.0 / 255.0;
        let expected_g = 99.0 / 255.0;
        let expected_b = 235.0 / 255.0;

        assert!((gpu_node.color[0] - expected_r).abs() < 0.01);
        assert!((gpu_node.color[1] - expected_g).abs() < 0.01);
        assert!((gpu_node.color[2] - expected_b).abs() < 0.01);
    }

    #[test]
    fn test_map_node_position() {
        let config = StyleConfig::from_toml("").unwrap();
        let node = create_test_node("abc123", "philosophy", "proposition");

        let position = [1.0, 2.0, 3.0];
        let gpu_node = config.map_node_to_gpu(&node, 0, position);

        assert_eq!(gpu_node.position, position);
    }

    #[test]
    fn test_map_node_assigns_domain_id() {
        let config = StyleConfig::from_toml("").unwrap();
        let phil_node = create_test_node("a", "philosophy", "proposition");
        let math_node = create_test_node("b", "mathematics", "theorem");
        let phys_node = create_test_node("c", "physics", "theory");

        let gpu_phil = config.map_node_to_gpu(&phil_node, 0, [0.0, 0.0, 0.0]);
        let gpu_math = config.map_node_to_gpu(&math_node, 0, [0.0, 0.0, 0.0]);
        let gpu_phys = config.map_node_to_gpu(&phys_node, 0, [0.0, 0.0, 0.0]);

        // Domain IDs should be distinct
        assert_ne!(gpu_phil.domain_id, gpu_math.domain_id);
        assert_ne!(gpu_math.domain_id, gpu_phys.domain_id);
    }

    #[test]
    fn test_map_node_assigns_type_id() {
        let config = StyleConfig::from_toml("").unwrap();
        let prop = create_test_node("a", "philosophy", "proposition");
        let theo = create_test_node("b", "mathematics", "theorem");

        let gpu_prop = config.map_node_to_gpu(&prop, 0, [0.0, 0.0, 0.0]);
        let gpu_theo = config.map_node_to_gpu(&theo, 0, [0.0, 0.0, 0.0]);

        // Type IDs should be distinct
        assert_ne!(gpu_prop.type_id, gpu_theo.type_id);
    }

    #[test]
    fn test_map_edge_assigns_indices() {
        let config = StyleConfig::from_toml("").unwrap();
        let edge = create_test_edge("a", "b", "supports");

        let gpu_edge = config.map_edge_to_gpu(&edge, 10, 20);

        assert_eq!(gpu_edge.from, 10);
        assert_eq!(gpu_edge.to, 20);
    }

    #[test]
    fn test_map_edge_assigns_weight() {
        let config = StyleConfig::from_toml("").unwrap();
        let edge = Edge {
            from: "a".to_string(),
            to: "b".to_string(),
            relation: "supports".to_string(),
            domain: "philosophy".to_string(),
            weight: Some(0.75),
        };

        let gpu_edge = config.map_edge_to_gpu(&edge, 0, 1);

        assert!((gpu_edge.weight - 0.75).abs() < 0.001);
    }

    #[test]
    fn test_map_edge_default_weight_when_none() {
        let config = StyleConfig::from_toml("").unwrap();
        let edge = Edge {
            from: "a".to_string(),
            to: "b".to_string(),
            relation: "supports".to_string(),
            domain: "philosophy".to_string(),
            weight: None,
        };

        let gpu_edge = config.map_edge_to_gpu(&edge, 0, 1);

        // Should have some default weight (e.g., 1.0)
        assert!(gpu_edge.weight > 0.0);
    }

    #[test]
    fn test_map_edge_relation_to_color() {
        let toml_str = r#"
[colors.relations]
supports = [34, 197, 94]
attacks = [239, 68, 68]
"#;
        let config = StyleConfig::from_toml(toml_str).unwrap();

        let support_edge = create_test_edge("a", "b", "supports");
        let attack_edge = create_test_edge("c", "d", "attacks");

        let gpu_support = config.map_edge_to_gpu(&support_edge, 0, 1);
        let gpu_attack = config.map_edge_to_gpu(&attack_edge, 0, 1);

        // Different relations should have different colors
        assert_ne!(gpu_support.color, gpu_attack.color);
    }

    #[test]
    fn test_load_project_style_config() {
        // Integration test: load actual project style config
        use std::fs;
        let project_root = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
            .parent()
            .unwrap();
        let style_path = project_root.join("styles/default.toml");

        if style_path.exists() {
            let toml_content = fs::read_to_string(style_path).unwrap();
            let result = StyleConfig::from_toml(&toml_content);

            assert!(result.is_ok(), "Failed to parse project style config");

            let config = result.unwrap();
            // Should have positive depth spacing
            assert!(config.depth_spacing() > 0.0);
        }
    }
}
