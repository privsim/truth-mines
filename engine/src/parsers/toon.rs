//! TOON format edge parser

use crate::graph::Edge;

/// Parses edges from TOON format string
///
/// TOON format example:
/// ```text
/// supports[2]{f,t,w,domain}:
/// abc123,def456,0.9,philosophy
/// ghi789,jkl012,0.85,philosophy
/// ```
///
/// # Arguments
///
/// * `toon_content` - TOON formatted string
///
/// # Returns
///
/// Result containing vector of edges or error message
///
/// # Errors
///
/// Returns error if TOON format is malformed or has invalid data
pub fn parse_toon(toon_content: &str) -> Result<Vec<Edge>, String> {
    let mut edges = Vec::new();
    let mut current_relation = None;
    let mut current_fields = Vec::new();

    for line in toon_content.lines() {
        let line = line.trim();

        if line.is_empty() {
            continue;
        }

        // Check if this is a header line (ends with :)
        if line.ends_with(':') {
            // Parse header: relation[count]{fields}:
            let parts: Vec<&str> = line.split('{').collect();
            if parts.len() != 2 {
                return Err(format!("Invalid TOON header format: {line}"));
            }

            // Extract relation name (before '[')
            let relation_part = parts[0];
            let relation = relation_part.split('[').next().unwrap_or("");
            if relation.is_empty() {
                return Err(format!("Invalid TOON header: missing relation name in {line}"));
            }
            current_relation = Some(relation.to_string());

            // Extract fields (between { and })
            let fields_part = parts[1]
                .trim_end_matches(':')
                .trim_end_matches('}')
                .trim();
            current_fields = fields_part.split(',').map(str::trim).collect();

        } else if let Some(relation) = &current_relation {
            // Parse data row
            let values: Vec<&str> = line.split(',').map(str::trim).collect();

            if values.len() != current_fields.len() {
                return Err(format!(
                    "Field count mismatch: expected {} fields, got {} in line: {line}",
                    current_fields.len(),
                    values.len()
                ));
            }

            // Map fields to edge
            let mut from = "";
            let mut to = "";
            let mut domain = "";
            let mut weight: Option<f32> = None;

            for (i, &field) in current_fields.iter().enumerate() {
                match field {
                    "f" => from = values[i],
                    "t" => to = values[i],
                    "domain" => domain = values[i],
                    "w" => {
                        if !values[i].is_empty() {
                            weight = values[i].parse::<f32>().ok();
                        }
                    }
                    _ => {} // Ignore unknown fields
                }
            }

            edges.push(Edge {
                from: from.to_string(),
                to: to.to_string(),
                relation: relation.clone(),
                domain: domain.to_string(),
                weight,
            metadata: None,
            });
        }
    }

    Ok(edges)
}

/// Parses edges from JSONL format
///
/// Fallback parser for when edges are in JSONL instead of TOON.
///
/// # Arguments
///
/// * `jsonl_content` - JSONL formatted string (one JSON object per line)
///
/// # Returns
///
/// Result containing vector of edges or error message
///
/// # Errors
///
/// Returns error if JSON is malformed
pub fn parse_jsonl(jsonl_content: &str) -> Result<Vec<Edge>, String> {
    let mut edges = Vec::new();

    for (line_num, line) in jsonl_content.lines().enumerate() {
        let line = line.trim();
        if line.is_empty() {
            continue;
        }

        let edge: Edge = serde_json::from_str(line)
            .map_err(|e| format!("Line {}: JSON parsing error: {e}", line_num + 1))?;

        edges.push(edge);
    }

    Ok(edges)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_jsonl_single_edge() {
        let jsonl = r#"{"f":"abc123","t":"def456","relation":"supports","domain":"philosophy","w":0.9}"#;
        let result = parse_jsonl(jsonl);

        assert!(result.is_ok());
        let edges = result.unwrap();
        assert_eq!(edges.len(), 1);
        assert_eq!(edges[0].from, "abc123");
        assert_eq!(edges[0].to, "def456");
        assert_eq!(edges[0].relation, "supports");
    }

    #[test]
    fn test_parse_jsonl_multiple_edges() {
        let jsonl = r#"{"f":"a","t":"b","relation":"supports","domain":"philosophy"}
{"f":"c","t":"d","relation":"proves","domain":"mathematics","w":1.0}
{"f":"e","t":"f","relation":"predicts","domain":"physics"}"#;

        let result = parse_jsonl(jsonl);

        assert!(result.is_ok());
        let edges = result.unwrap();
        assert_eq!(edges.len(), 3);
        assert_eq!(edges[0].relation, "supports");
        assert_eq!(edges[1].relation, "proves");
        assert_eq!(edges[2].relation, "predicts");
    }

    #[test]
    fn test_parse_jsonl_empty_lines() {
        let jsonl = r#"{"f":"a","t":"b","relation":"supports","domain":"philosophy"}

{"f":"c","t":"d","relation":"proves","domain":"mathematics"}
"#;

        let result = parse_jsonl(jsonl);

        assert!(result.is_ok());
        let edges = result.unwrap();
        assert_eq!(edges.len(), 2); // Should skip empty lines
    }

    #[test]
    fn test_parse_jsonl_malformed() {
        let jsonl = r#"{"f":"a","t":"b",INVALID}"#;
        let result = parse_jsonl(jsonl);

        assert!(result.is_err());
    }

    #[test]
    fn test_parse_toon_single_relation() {
        let toon = r#"supports[2]{f,t,w,domain}:
abc123,def456,0.9,philosophy
ghi789,jkl012,0.85,philosophy"#;

        let result = parse_toon(toon);

        assert!(result.is_ok());
        let edges = result.unwrap();
        assert_eq!(edges.len(), 2);
        assert_eq!(edges[0].from, "abc123");
        assert_eq!(edges[0].to, "def456");
        assert_eq!(edges[0].relation, "supports");
        assert_eq!(edges[0].weight, Some(0.9));
        assert_eq!(edges[1].from, "ghi789");
    }

    #[test]
    fn test_parse_toon_multiple_relations() {
        let toon = r#"supports[1]{f,t,w,domain}:
abc123,def456,0.9,philosophy

proves[1]{f,t,w,domain}:
ghi789,jkl012,1.0,mathematics"#;

        let result = parse_toon(toon);

        assert!(result.is_ok());
        let edges = result.unwrap();
        assert_eq!(edges.len(), 2);
        assert_eq!(edges[0].relation, "supports");
        assert_eq!(edges[1].relation, "proves");
    }

    #[test]
    fn test_parse_toon_without_weight() {
        let toon = r#"supports[1]{f,t,domain}:
abc123,def456,philosophy"#;

        let result = parse_toon(toon);

        assert!(result.is_ok());
        let edges = result.unwrap();
        assert_eq!(edges.len(), 1);
        assert_eq!(edges[0].from, "abc123");
        assert_eq!(edges[0].weight, None);
    }

    #[test]
    fn test_parse_toon_malformed_header() {
        let toon = r#"INVALID HEADER FORMAT:
abc123,def456,philosophy"#;

        let result = parse_toon(toon);

        assert!(result.is_err());
        let err = result.unwrap_err();
        assert!(err.contains("header") || err.contains("format"));
    }

    #[test]
    fn test_parse_toon_wrong_field_count() {
        let toon = r#"supports[1]{f,t,w,domain}:
abc123,def456,0.9"#; // Missing domain field

        let result = parse_toon(toon);

        assert!(result.is_err());
        let err = result.unwrap_err();
        assert!(err.contains("field") || err.contains("expected"));
    }

    #[test]
    fn test_parse_toon_from_project_file() {
        // Integration test: parse actual TOON file from project
        use std::fs;
        let project_root = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).parent().unwrap();
        let toon_path = project_root.join("dist/edges.toon");

        if toon_path.exists() {
            let toon_content = fs::read_to_string(toon_path).unwrap();
            let result = parse_toon(&toon_content);

            assert!(result.is_ok(), "Failed to parse project TOON file: {:?}", result);
            let edges = result.unwrap();
            assert!(edges.len() >= 20, "Expected at least 20 edges from sample graph");

            // Verify all edges have valid data
            for edge in &edges {
                assert!(!edge.from.is_empty());
                assert!(!edge.to.is_empty());
                assert!(!edge.relation.is_empty());
                assert!(!edge.domain.is_empty());
            }
        }
    }

    #[test]
    fn test_parse_toon_empty_input() {
        let result = parse_toon("");
        assert!(result.is_ok());
        assert!(result.unwrap().is_empty());
    }
}
