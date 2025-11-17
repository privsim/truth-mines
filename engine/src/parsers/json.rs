//! JSON node parser

use crate::graph::Node;
use std::path::Path;

/// Loads nodes from a directory containing JSON files
///
/// # Arguments
///
/// * `path` - Path to directory containing `*.json` node files
///
/// # Returns
///
/// Result containing vector of nodes or error message
///
/// # Errors
///
/// Returns error if directory doesn't exist, files can't be read, or JSON is malformed
pub fn load_nodes_from_dir(path: &Path) -> Result<Vec<Node>, String> {
    use std::fs;

    if !path.exists() {
        return Err(format!("Directory not found: {}", path.display()));
    }

    if !path.is_dir() {
        return Err(format!("Path is not a directory: {}", path.display()));
    }

    let mut nodes = Vec::new();

    // Read all .json files in directory
    let entries = fs::read_dir(path)
        .map_err(|e| format!("Failed to read directory {}: {}", path.display(), e))?;

    for entry in entries {
        let entry = entry
            .map_err(|e| format!("Failed to read directory entry: {e}"))?;
        let file_path = entry.path();

        // Only process .json files
        if let Some(ext) = file_path.extension() {
            if ext == "json" {
                let json_content = fs::read_to_string(&file_path)
                    .map_err(|e| format!("Failed to read {}: {}", file_path.display(), e))?;

                let node = load_node_from_json(&json_content)
                    .map_err(|e| format!("{}: {}", file_path.display(), e))?;

                nodes.push(node);
            }
        }
    }

    Ok(nodes)
}

/// Loads nodes from a JSON string
///
/// # Arguments
///
/// * `json` - JSON string containing node data
///
/// # Returns
///
/// Result containing node or error message
///
/// # Errors
///
/// Returns error if JSON is malformed or missing required fields
pub fn load_node_from_json(json: &str) -> Result<Node, String> {
    serde_json::from_str(json)
        .map_err(|e| format!("JSON parsing error: {e}"))
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;

    #[test]
    fn test_load_node_from_json_minimal() {
        let json = r#"{"id":"abc123","type":"proposition","domain":"philosophy","title":"Test"}"#;
        let result = load_node_from_json(json);

        assert!(result.is_ok());
        let node = result.unwrap();
        assert_eq!(node.id, "abc123");
        assert_eq!(node.r#type, "proposition");
        assert_eq!(node.domain, "philosophy");
        assert_eq!(node.title, "Test");
    }

    #[test]
    fn test_load_node_from_json_full() {
        let json = r#"{
            "id": "k7x9m2",
            "type": "proposition",
            "domain": "philosophy",
            "title": "Knowledge requires safety",
            "content": "For S to know that p...",
            "formal": "∀S,p: K(S,p) → Safe(S,p)",
            "tags": ["epistemology"],
            "metadata": {"certainty": 0.75},
            "sources": ["pritchard2005"]
        }"#;

        let result = load_node_from_json(json);

        assert!(result.is_ok());
        let node = result.unwrap();
        assert_eq!(node.id, "k7x9m2");
        assert!(node.content.is_some());
        assert!(node.formal.is_some());
        assert!(!node.tags.is_empty());
    }

    #[test]
    fn test_load_node_from_json_malformed() {
        let json = r#"{"id":"abc123","type":"proposition"}"#; // Missing required fields
        let result = load_node_from_json(json);

        assert!(result.is_err());
        let err = result.unwrap_err();
        assert!(err.contains("missing") || err.contains("required") || err.contains("field"));
    }

    #[test]
    fn test_load_node_from_json_invalid_json() {
        let json = r#"{"id":"abc123","type":"proposition",INVALID}"#;
        let result = load_node_from_json(json);

        assert!(result.is_err());
    }

    #[test]
    fn test_load_nodes_from_dir_valid_directory() {
        // Create temp directory with test nodes
        let temp_dir = std::env::temp_dir().join("truthmines_test_nodes");
        fs::create_dir_all(&temp_dir).unwrap();

        // Create 3 valid node files
        for i in 1..=3 {
            let id = format!("test{i:02}");
            let json = format!(
                r#"{{"id":"{}","type":"proposition","domain":"philosophy","title":"Node {}"}}"#,
                id, i
            );
            fs::write(temp_dir.join(format!("{id}.json")), json).unwrap();
        }

        let result = load_nodes_from_dir(&temp_dir);

        assert!(result.is_ok());
        let nodes = result.unwrap();
        assert_eq!(nodes.len(), 3);

        // Cleanup
        fs::remove_dir_all(&temp_dir).unwrap();
    }

    #[test]
    fn test_load_nodes_from_dir_empty_directory() {
        let temp_dir = std::env::temp_dir().join("truthmines_test_empty");
        fs::create_dir_all(&temp_dir).unwrap();

        let result = load_nodes_from_dir(&temp_dir);

        assert!(result.is_ok());
        let nodes = result.unwrap();
        assert!(nodes.is_empty());

        fs::remove_dir_all(&temp_dir).unwrap();
    }

    #[test]
    fn test_load_nodes_from_dir_nonexistent() {
        let nonexistent = Path::new("/nonexistent/path/that/does/not/exist");
        let result = load_nodes_from_dir(nonexistent);

        assert!(result.is_err());
        let err = result.unwrap_err();
        assert!(err.contains("not found") || err.contains("exist"));
    }

    #[test]
    fn test_load_nodes_from_dir_malformed_file() {
        let temp_dir = std::env::temp_dir().join("truthmines_test_malformed");
        fs::create_dir_all(&temp_dir).unwrap();

        // Create one valid and one malformed file
        fs::write(
            temp_dir.join("valid.json"),
            r#"{"id":"abc123","type":"proposition","domain":"philosophy","title":"Valid"}"#,
        )
        .unwrap();
        fs::write(temp_dir.join("malformed.json"), r#"{INVALID JSON}"#).unwrap();

        let result = load_nodes_from_dir(&temp_dir);

        // Should return error mentioning which file failed
        assert!(result.is_err());
        let err = result.unwrap_err();
        assert!(err.contains("malformed") || err.contains("JSON"));

        fs::remove_dir_all(&temp_dir).unwrap();
    }

    #[test]
    fn test_load_nodes_from_project_examples() {
        // Integration test: load actual project sample nodes
        let project_root = Path::new(env!("CARGO_MANIFEST_DIR")).parent().unwrap();
        let examples_dir = project_root.join("docs/examples/sample-nodes");

        if examples_dir.exists() {
            let result = load_nodes_from_dir(&examples_dir);
            assert!(result.is_ok(), "Failed to load sample nodes: {:?}", result);

            let nodes = result.unwrap();
            assert!(nodes.len() >= 10, "Expected at least 10 sample nodes");

            // Verify all have valid IDs
            for node in &nodes {
                assert_eq!(node.id.len(), 6, "Node ID should be 6 characters");
            }
        }
    }
}
