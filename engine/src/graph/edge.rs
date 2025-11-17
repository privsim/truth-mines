//! Edge type definition

use serde::{Deserialize, Serialize};

/// A knowledge graph edge
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[allow(clippy::derive_partial_eq_without_eq)] // weight is f32 which doesn't implement Eq
pub struct Edge {
    /// From node ID (source)
    #[serde(rename = "f")]
    pub from: String,
    /// To node ID (target)
    #[serde(rename = "t")]
    pub to: String,
    /// Relation type
    pub relation: String,
    /// Domain of the relation
    pub domain: String,
    /// Optional weight/strength (0-1)
    #[serde(rename = "w", skip_serializing_if = "Option::is_none")]
    pub weight: Option<f32>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_edge_deserialize_minimal() {
        let json = r#"{"f":"abc123","t":"def456","relation":"supports","domain":"philosophy"}"#;
        let edge: Edge = serde_json::from_str(json).unwrap();

        assert_eq!(edge.from, "abc123");
        assert_eq!(edge.to, "def456");
        assert_eq!(edge.relation, "supports");
        assert_eq!(edge.domain, "philosophy");
        assert_eq!(edge.weight, None);
    }

    #[test]
    fn test_edge_deserialize_with_weight() {
        let json = r#"{"f":"abc123","t":"def456","relation":"supports","w":0.9,"domain":"philosophy"}"#;
        let edge: Edge = serde_json::from_str(json).unwrap();

        assert_eq!(edge.from, "abc123");
        assert_eq!(edge.to, "def456");
        assert_eq!(edge.weight, Some(0.9));
    }

    #[test]
    fn test_edge_field_renaming() {
        // "f" in JSON → from in Rust, "t" in JSON → to in Rust, "w" in JSON → weight in Rust
        let json = r#"{"f":"id1","t":"id2","relation":"proves","w":1.0,"domain":"mathematics"}"#;
        let edge: Edge = serde_json::from_str(json).unwrap();

        assert_eq!(edge.from, "id1");
        assert_eq!(edge.to, "id2");
        assert_eq!(edge.weight, Some(1.0));
    }

    #[test]
    fn test_edge_serialize_roundtrip() {
        let edge = Edge {
            from: "node1".to_string(),
            to: "node2".to_string(),
            relation: "entails".to_string(),
            domain: "philosophy".to_string(),
            weight: Some(0.75),
        };

        let json = serde_json::to_string(&edge).unwrap();
        let deserialized: Edge = serde_json::from_str(&json).unwrap();

        assert_eq!(edge, deserialized);
    }

    #[test]
    fn test_edge_serialize_preserves_field_names() {
        let edge = Edge {
            from: "id1".to_string(),
            to: "id2".to_string(),
            relation: "supports".to_string(),
            domain: "philosophy".to_string(),
            weight: Some(0.9),
        };

        let json_value = serde_json::to_value(&edge).unwrap();

        // Should serialize with short field names
        assert_eq!(json_value["f"], "id1");
        assert_eq!(json_value["t"], "id2");
        // Check weight exists and is close to expected (f32 precision)
        assert!(json_value["w"].is_number());
        let w = json_value["w"].as_f64().unwrap();
        assert!((w - 0.9).abs() < 0.001);
    }

    #[test]
    fn test_edge_without_weight_roundtrip() {
        let edge = Edge {
            from: "id1".to_string(),
            to: "id2".to_string(),
            relation: "attacks".to_string(),
            domain: "philosophy".to_string(),
            weight: None,
        };

        let json = serde_json::to_string(&edge).unwrap();
        // Should not include "w" field when None
        assert!(!json.contains("\"w\""));

        let deserialized: Edge = serde_json::from_str(&json).unwrap();
        assert_eq!(edge, deserialized);
    }

    #[test]
    fn test_edge_from_real_example() {
        // Use actual edge from sample graph
        let json = r#"{"f":"k7x9m2","t":"q3p8n5","relation":"supports","w":0.9,"domain":"philosophy"}"#;
        let edge: Edge = serde_json::from_str(json).unwrap();

        assert_eq!(edge.from, "k7x9m2");
        assert_eq!(edge.to, "q3p8n5");
        assert_eq!(edge.relation, "supports");
        assert_eq!(edge.domain, "philosophy");
        assert_eq!(edge.weight, Some(0.9));
    }

    #[test]
    fn test_edge_bridge_domain() {
        // Test cross-domain bridge edge
        let json = r#"{"f":"00c001","t":"t4k2p9","relation":"formalizes","w":0.85,"domain":"bridge:phil→math"}"#;
        let edge: Edge = serde_json::from_str(json).unwrap();

        assert_eq!(edge.relation, "formalizes");
        assert_eq!(edge.domain, "bridge:phil→math");
    }
}
