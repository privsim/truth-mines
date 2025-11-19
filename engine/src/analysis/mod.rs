//! Analysis functions for the knowledge graph (Gemini 3 Pro additions)
//!
//! This module contains algorithms for computing graph metrics:
//! - Load-bearing analysis: identifies structurally critical nodes
//! - Tension metrics: (computed in TypeScript, but could be moved here)

pub mod load_bearing;

pub use load_bearing::compute_load_bearing;
