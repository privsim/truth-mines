//! Node type definition

use serde::{Deserialize, Serialize};

/// A knowledge graph node
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Node {
    pub id: String,
    #[serde(rename = "type")]
    pub r#type: String,
    pub domain: String,
    pub title: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub content: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub formal: Option<String>,
    #[serde(default)]
    pub tags: Vec<String>,
    #[serde(default)]
    pub metadata: serde_json::Value,
    #[serde(default)]
    pub sources: Vec<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub created: Option<String>,
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
    }
}
