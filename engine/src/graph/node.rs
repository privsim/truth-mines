//! Node type definition

use serde::{Deserialize, Serialize};

/// A knowledge graph node
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[allow(clippy::derive_partial_eq_without_eq)] // metadata is serde_json::Value which doesn't implement Eq
pub struct Node {
    /// Unique 6-character alphanumeric identifier
    pub id: String,
    /// Node type (proposition, theorem, theory, etc.)
    #[serde(rename = "type")]
    pub r#type: String,
    /// Primary domain (philosophy, mathematics, physics)
    pub domain: String,
    /// Short, human-readable title
    pub title: String,
    /// Natural language explanation or statement
    #[serde(skip_serializing_if = "Option::is_none")]
    pub content: Option<String>,
    /// Formal representation (logic, math notation, etc.)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub formal: Option<String>,
    /// Tags for categorization and search
    #[serde(default)]
    pub tags: Vec<String>,
    /// Domain-specific or custom metadata
    #[serde(default)]
    pub metadata: serde_json::Value,
    /// Citations, references, or source identifiers
    #[serde(default)]
    pub sources: Vec<String>,
    /// ISO 8601 timestamp of node creation
    #[serde(skip_serializing_if = "Option::is_none")]
    pub created: Option<String>,
    /// ISO 8601 timestamp of last update
    #[serde(skip_serializing_if = "Option::is_none")]
    pub updated: Option<String>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_node_deserialize_minimal() {
        let json = r#"{"id":"abc123","type":"proposition","domain":"philosophy","title":"Test"}"#;
        let node: Node = serde_json::from_str(json).unwrap();
        assert_eq!(node.id, "abc123");
        assert_eq!(node.r#type, "proposition");
        assert_eq!(node.domain, "philosophy");
        assert_eq!(node.title, "Test");
    }

    #[test]
    fn test_node_deserialize_full() {
        let json = r#"{
            "id":"abc123",
            "type":"proposition",
            "domain":"philosophy",
            "title":"Knowledge requires safety",
            "content":"For S to know that p...",
            "formal":"∀S,p: K(S,p) → Safe(S,p)",
            "tags":["epistemology","knowledge"],
            "metadata":{"certainty":0.75},
            "sources":["ref1"],
            "created":"2025-01-15T10:00:00Z",
            "updated":"2025-01-15T12:00:00Z"
        }"#;
        let node: Node = serde_json::from_str(json).unwrap();

        assert_eq!(node.id, "abc123");
        assert_eq!(node.content, Some("For S to know that p...".to_string()));
        assert_eq!(node.formal, Some("∀S,p: K(S,p) → Safe(S,p)".to_string()));
        assert_eq!(node.tags, vec!["epistemology", "knowledge"]);
        assert_eq!(node.sources, vec!["ref1"]);
        assert!(node.created.is_some());
    }

    #[test]
    fn test_node_serialize_roundtrip() {
        let node = Node {
            id: "test01".to_string(),
            r#type: "theorem".to_string(),
            domain: "mathematics".to_string(),
            title: "Test Theorem".to_string(),
            content: Some("Content".to_string()),
            formal: None,
            tags: vec!["tag1".to_string()],
            metadata: serde_json::json!({"key": "value"}),
            sources: vec![],
            created: None,
            updated: None,
        };

        let json = serde_json::to_string(&node).unwrap();
        let deserialized: Node = serde_json::from_str(&json).unwrap();

        assert_eq!(node, deserialized);
    }

    #[test]
    fn test_node_optional_fields_default() {
        let json = r#"{"id":"abc123","type":"proposition","domain":"philosophy","title":"Test"}"#;
        let node: Node = serde_json::from_str(json).unwrap();

        assert_eq!(node.content, None);
        assert_eq!(node.formal, None);
        assert!(node.tags.is_empty());
        assert_eq!(node.metadata, serde_json::Value::Null);
        assert!(node.sources.is_empty());
        assert_eq!(node.created, None);
        assert_eq!(node.updated, None);
    }

    #[test]
    fn test_node_metadata_complex_json() {
        let json = r#"{
            "id":"abc123",
            "type":"theorem",
            "domain":"mathematics",
            "title":"Test",
            "metadata":{
                "difficulty":7.5,
                "importance":9.0,
                "nested":{"key":"value"}
            }
        }"#;
        let node: Node = serde_json::from_str(json).unwrap();

        assert!(node.metadata.is_object());
        assert_eq!(node.metadata["difficulty"], 7.5);
        assert_eq!(node.metadata["importance"], 9.0);
        assert_eq!(node.metadata["nested"]["key"], "value");
    }

    #[test]
    fn test_node_type_field_rename() {
        // Ensure "type" in JSON maps to r#type in Rust
        let json = r#"{"id":"abc123","type":"proposition","domain":"philosophy","title":"Test"}"#;
        let node: Node = serde_json::from_str(json).unwrap();

        assert_eq!(node.r#type, "proposition");

        // And serializes back to "type"
        let serialized = serde_json::to_value(&node).unwrap();
        assert_eq!(serialized["type"], "proposition");
    }

    #[test]
    fn test_node_from_real_example() {
        // Use actual sample node from project
        let json = r#"{
          "id": "k7x9m2",
          "type": "proposition",
          "domain": "philosophy",
          "title": "Knowledge requires safety",
          "content": "For S to know that p, S's belief in p must be safe: in nearby possible worlds where S believes p, p is true.",
          "formal": "∀S,p: K(S,p) → Safe(S,p)",
          "tags": ["epistemology", "knowledge", "safety", "modal_epistemology"],
          "metadata": {
            "modality": "necessary",
            "certainty": 0.75,
            "importance": 8.5
          },
          "sources": ["pritchard2005"],
          "created": "2025-01-15T10:00:00Z",
          "updated": "2025-01-15T10:00:00Z"
        }"#;

        let node: Node = serde_json::from_str(json).unwrap();

        assert_eq!(node.id, "k7x9m2");
        assert_eq!(node.r#type, "proposition");
        assert_eq!(node.domain, "philosophy");
        assert_eq!(node.tags.len(), 4);
        assert_eq!(node.metadata["certainty"], 0.75);
    }
}
