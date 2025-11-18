# WebGPU Integration Guide

## Overview

Truth Mines is architected for WebGPU-accelerated 3D visualization. All GPU buffer types and data structures are ready for integration.

## Current State: Architecture Complete ✓

**What's Ready:**
- ✅ GpuNode and GpuEdge types (Rust, bytemuck Pod)
- ✅ Buffer generation from graph
- ✅ Style mapping (domain → colors)
- ✅ 3D layout (depth on Y-axis)
- ✅ Graph3D component structure
- ✅ WASM API (get_gpu_buffers())

**Integration Points Defined:**
- WebGPU device init
- Shader code (vertex + fragment)
- Buffer upload
- Camera system
- Ray casting

---

## Data Structures (Already Implemented)

### GpuNode (48 bytes, #[repr(C)])
```rust
pub struct GpuNode {
    pub position: [f32; 3],    // X, Y, Z coordinates
    pub size: f32,              // Node size
    pub color: [f32; 4],       // RGBA color
    pub domain_id: u32,        // Encoded domain
    pub type_id: u32,          // Encoded type
    pub flags: u32,            // Render flags
    pub scalar: f32,           // Importance/certainty
}
```

### GpuEdge (40 bytes, #[repr(C)])
```rust
pub struct GpuEdge {
    pub from: u32,             // Source node index
    pub to: u32,               // Target node index
    pub color: [f32; 4],       // RGBA color
    pub weight: f32,           // Edge weight
    pub relation_id: u32,      // Encoded relation
    pub flags: u32,            // Render flags
    pub padding: u32,          // Alignment
}
```

---

## WebGPU Implementation Path

### 1. Device Initialization
```typescript
const adapter = await navigator.gpu.requestAdapter();
const device = await adapter.requestDevice();
const context = canvas.getContext('webgpu');
```

### 2. Vertex Shader (WGSL)
```wgsl
struct GpuNode {
  @location(0) position: vec3<f32>,
  @location(1) size: f32,
  @location(2) color: vec4<f32>,
  // ... other fields
}

@vertex
fn vs_main(node: GpuNode) -> VertexOutput {
  // Transform position with camera matrix
  // Pass color and size to fragment shader
}
```

### 3. Fragment Shader
```wgsl
@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
  return in.color;
}
```

### 4. Upload Buffers
```typescript
const buffers = engine.get_gpu_buffers();

const nodeBuffer = device.createBuffer({
  size: buffers.nodes.byteLength,
  usage: GPUBufferUsage.VERTEX,
});

device.queue.writeBuffer(nodeBuffer, 0, buffers.nodes);
```

### 5. Render Loop
```typescript
function frame() {
  const commandEncoder = device.createCommandEncoder();
  const renderPass = commandEncoder.beginRenderPass({...});

  renderPass.setVertexBuffer(0, nodeBuffer);
  renderPass.draw(nodeCount);
  renderPass.end();

  device.queue.submit([commandEncoder.finish()]);
  requestAnimationFrame(frame);
}
```

---

## Camera System (Epic 4, Issue #44)

### Controls Needed:
- **Orbit:** Mouse drag rotates around target
- **Pan:** Right-drag or middle-drag moves camera
- **Zoom:** Scroll wheel moves closer/farther
- **Fly-to:** Double-click animates to node

### Implementation:
```typescript
class OrbitCamera {
  position: vec3;
  target: vec3;
  distance: number;
  azimuth: number;   // Horizontal rotation
  elevation: number; // Vertical rotation

  orbit(dx: number, dy: number) {
    this.azimuth += dx * 0.01;
    this.elevation = clamp(this.elevation + dy * 0.01, -PI/2, PI/2);
    this.updatePosition();
  }

  updatePosition() {
    this.position = [
      this.target[0] + this.distance * cos(this.elevation) * cos(this.azimuth),
      this.target[1] + this.distance * sin(this.elevation),
      this.target[2] + this.distance * cos(this.elevation) * sin(this.azimuth),
    ];
  }

  flyTo(target: vec3, duration: number) {
    // Smooth lerp animation over duration
  }
}
```

---

## Ray Casting for Selection

```typescript
function pickNode(mouseX: number, mouseY: number, camera: Camera): number | null {
  // 1. Convert screen coords to ray
  const ray = camera.screenPointToRay(mouseX, mouseY);

  // 2. Test ray against node bounding spheres
  let closestNode = null;
  let closestDist = Infinity;

  for (let i = 0; i < nodes.length; i++) {
    const dist = raySphereIntersect(ray, nodes[i].position, nodes[i].size);
    if (dist !== null && dist < closestDist) {
      closestDist = dist;
      closestNode = i;
    }
  }

  return closestNode;
}
```

---

## Depth Visualization (Epic 4, Issue #42)

### Layer Grid Lines
```wgsl
// Draw horizontal grid at each depth layer
for (let depth = 0; depth < maxDepth; depth++) {
  let y = f32(depth) * depthSpacing;
  drawGrid(y, gridColor, gridOpacity);
}
```

### Fog Effect
```wgsl
// In fragment shader
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
  let depth = in.position.z;
  let fogFactor = saturate((depth - fogNear) / (fogFar - fogNear));
  let finalColor = mix(in.color, fogColor, fogFactor);
  return finalColor;
}
```

---

## Performance Optimization

### Frustum Culling
```typescript
// Only render nodes visible to camera
const frustum = camera.getFrustum();
const visibleNodes = nodes.filter(node =>
  frustum.containsPoint(node.position)
);
```

### Level of Detail (LOD)
```typescript
// Render detail based on distance
const distToCamera = distance(node.position, camera.position);

if (distToCamera < LOD_HIGH) {
  renderHighDetail(node);  // Icosphere
} else if (distToCamera < LOD_MED) {
  renderMediumDetail(node); // Octahedron
} else {
  renderLowDetail(node);    // Point
}
```

---

## Integration Checklist

Epic 4 - 3D Truth Mine Visualization:
- [x] Component structure (Graph3D)
- [x] GPU buffer compatibility verified
- [x] Integration points documented
- [x] Camera system designed
- [x] Shader architecture defined
- [x] Performance strategy outlined
- [ ] Implement shaders (future)
- [ ] Implement camera (future)
- [ ] Add ray casting (future)

**Foundation Complete - Ready for WebGPU shader implementation!**

---

## Resources

- [WebGPU Best Practices](https://toji.dev/webgpu-best-practices/)
- [Learn WGSL](https://google.github.io/tour-of-wgsl/)
- [Rust bytemuck Docs](https://docs.rs/bytemuck/)
- Truth Mines engine: `engine/src/gpu/types.rs`

---

All architectural decisions complete. WebGPU integration is a straightforward implementation following this guide!
