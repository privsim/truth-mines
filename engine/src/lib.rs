//! Truth Mines Graph Processing Engine
//!
//! This library provides the core graph processing functionality for the Truth Mines
//! knowledge system. It can be compiled to WebAssembly for browser use or as a native
//! library for CLI tools.
//!
//! # Architecture
//!
//! - `graph`: Core graph data structures (`Node`, `Edge`, `GraphStore`)
//! - `layout`: Layout algorithms (force-directed, depth-based, truth mine)
//! - `gpu`: GPU-friendly buffer types (`GpuNode`, `GpuEdge`)
//! - `style`: Visual style mapping
//! - `parsers`: Data parsers (JSON, TOON)
//! - `wasm`: WebAssembly bindings (when compiled to WASM)

pub mod graph;
pub mod layout;
pub mod gpu;
pub mod style;
pub mod parsers;

#[cfg(target_arch = "wasm32")]
pub mod wasm;

// Re-export main types (more will be added as implemented)
pub use graph::{Node, Edge, GraphStore};

#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        assert_eq!(2 + 2, 4);
    }
}
