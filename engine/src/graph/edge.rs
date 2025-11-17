//! Edge type definition

use serde::{Deserialize, Serialize};

/// A knowledge graph edge
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Edge {
    #[serde(rename = "f")]
    pub from: String,
    #[serde(rename = "t")]
    pub to: String,
    pub relation: String,
    pub domain: String,
    #[serde(rename = "w", skip_serializing_if = "Option::is_none")]
    pub weight: Option<f32>,
}
