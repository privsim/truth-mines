//! GPU-friendly buffer types

use bytemuck::{Pod, Zeroable};

/// GPU-friendly node representation
///
/// Memory layout is C-compatible (#[repr(C)]) for direct GPU upload.
/// All fields are aligned for optimal GPU access.
///
/// **Updated with Gemini 3 Pro additions:**
/// - `tension`: Epistemic tension metric (0-1)
/// - `load_bearing`: Structural criticality (0-1)
/// - `status`: Lifecycle/controversy flags
///
/// **Size:** 64 bytes (was 48, added 16 bytes for Gemini metrics)
#[repr(C)]
#[derive(Clone, Copy, Debug, Pod, Zeroable)]
pub struct GpuNode {
    /// 3D position [x, y, z]
    pub position: [f32; 3],
    /// Node size (base scale)
    pub size: f32,
    /// RGBA color [r, g, b, a] (0-1 range)
    pub color: [f32; 4],
    /// Domain ID (encoded as u32)
    pub domain_id: u32,
    /// Type ID (encoded as u32)
    pub type_id: u32,
    /// Flags for rendering (bitfield)
    pub flags: u32,
    /// Scalar value (for importance, certainty, etc.)
    pub scalar: f32,
    /// Epistemic tension: sqrt(support × attack) / 5.0, range [0, 1] (Gemini addition)
    pub tension: f32,
    /// Load-bearing: fraction of graph that would be orphaned if removed (Gemini addition)
    pub load_bearing: f32,
    /// Status flags: bit 0=contested, bit 1=refuted, bit 2=draft, bit 3=archived (Gemini addition)
    pub status: u32,
    /// Padding for alignment (64-byte total)
    pub _padding: u32,
}

/// GPU-friendly edge representation
///
/// Memory layout is C-compatible (#[repr(C)]) for direct GPU upload.
#[repr(C)]
#[derive(Clone, Copy, Debug, Pod, Zeroable)]
pub struct GpuEdge {
    /// Index of source node
    pub from: u32,
    /// Index of target node
    pub to: u32,
    /// RGBA color [r, g, b, a] (0-1 range)
    pub color: [f32; 4],
    /// Edge weight (0-1 range)
    pub weight: f32,
    /// Relation ID (encoded as u32)
    pub relation_id: u32,
    /// Flags for rendering (bitfield)
    pub flags: u32,
    /// Padding for alignment (explicit for layout control)
    pub padding: u32,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_gpu_node_is_pod() {
        // Verify GpuNode can be safely cast to bytes
        let node = GpuNode {
            position: [1.0, 2.0, 3.0],
            size: 1.5,
            color: [1.0, 0.0, 0.0, 1.0],
            domain_id: 1,
            type_id: 2,
            flags: 0,
            scalar: 0.75,
            tension: 0.0,
            load_bearing: 0.0,
            status: 0,
            _padding: 0,
        };

        // Should not panic
        let _bytes = bytemuck::bytes_of(&node);
    }

    #[test]
    fn test_gpu_node_size() {
        // Verify expected size (updated with Gemini 3 Pro additions)
        let size = std::mem::size_of::<GpuNode>();

        // Original: 3f32 (pos) + f32 (size) + 4f32 (color) + 3u32 + f32 (scalar) = 48 bytes
        // Added: f32 (tension) + f32 (load_bearing) + u32 (status) + u32 (_padding) = +16 bytes
        // Total: 64 bytes (aligned to 4-byte boundary)
        assert_eq!(size, 64);
    }

    #[test]
    fn test_gpu_node_alignment() {
        let align = std::mem::align_of::<GpuNode>();
        // Should be aligned to 4 bytes (f32/u32 alignment)
        assert!(align >= 4);
    }

    #[test]
    fn test_gpu_node_array_cast() {
        // Verify array of GpuNode can be cast to bytes
        let nodes = vec![
            GpuNode {
                position: [0.0, 0.0, 0.0],
                size: 1.0,
                color: [1.0, 1.0, 1.0, 1.0],
                domain_id: 0,
                type_id: 0,
                flags: 0,
                scalar: 1.0,
                tension: 0.0,
                load_bearing: 0.0,
                status: 0,
                _padding: 0,
            },
            GpuNode {
                position: [1.0, 1.0, 1.0],
                size: 1.5,
                color: [0.0, 1.0, 0.0, 1.0],
                domain_id: 1,
                type_id: 1,
                flags: 0,
                scalar: 0.5,
                tension: 0.0,
                load_bearing: 0.0,
                status: 0,
                _padding: 0,
            },
        ];

        let bytes = bytemuck::cast_slice::<GpuNode, u8>(&nodes);
        assert_eq!(bytes.len(), 2 * std::mem::size_of::<GpuNode>());
    }

    #[test]
    fn test_gpu_node_zeroable() {
        // Verify GpuNode can be zero-initialized
        let node: GpuNode = Zeroable::zeroed();
        assert_eq!(node.position, [0.0, 0.0, 0.0]);
        assert_eq!(node.size, 0.0);
        assert_eq!(node.domain_id, 0);
    }

    #[test]
    fn test_gpu_edge_is_pod() {
        let edge = GpuEdge {
            from: 0,
            to: 1,
            color: [1.0, 0.0, 0.0, 1.0],
            weight: 0.9,
            relation_id: 1,
            flags: 0,
            padding: 0,
        };

        let _bytes = bytemuck::bytes_of(&edge);
    }

    #[test]
    fn test_gpu_edge_size() {
        let size = std::mem::size_of::<GpuEdge>();

        // 2 u32 + 4 floats (color) + 1 float (weight) + 3 u32 = 5*4 + 5*4 = 40 bytes
        assert_eq!(size, 40);
    }

    #[test]
    fn test_gpu_edge_alignment() {
        let align = std::mem::align_of::<GpuEdge>();
        assert!(align >= 4);
    }

    #[test]
    fn test_gpu_edge_array_cast() {
        let edges = vec![
            GpuEdge {
                from: 0,
                to: 1,
                color: [1.0, 0.0, 0.0, 1.0],
                weight: 0.9,
                relation_id: 1,
                flags: 0,
                padding: 0,
            },
            GpuEdge {
                from: 1,
                to: 2,
                color: [0.0, 1.0, 0.0, 1.0],
                weight: 0.75,
                relation_id: 2,
                flags: 0,
                padding: 0,
            },
        ];

        let bytes = bytemuck::cast_slice::<GpuEdge, u8>(&edges);
        assert_eq!(bytes.len(), 2 * std::mem::size_of::<GpuEdge>());
    }

    #[test]
    fn test_gpu_edge_zeroable() {
        let edge: GpuEdge = Zeroable::zeroed();
        assert_eq!(edge.from, 0);
        assert_eq!(edge.to, 0);
        assert_eq!(edge.weight, 0.0);
    }

    #[test]
    fn test_gpu_types_are_copy() {
        // Verify both types implement Copy
        let node = GpuNode::zeroed();
        let _node_copy = node; // Should compile (Copy trait)

        let edge = GpuEdge::zeroed();
        let _edge_copy = edge; // Should compile (Copy trait)
    }
}
