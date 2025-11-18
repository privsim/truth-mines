// TypeScript type definitions for Truth Mines graph data

/**
 * Knowledge graph node
 */
export interface Node {
  id: string;
  type: string;
  domain: string;
  title: string;
  content?: string;
  formal?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  sources?: string[];
  created?: string;
  updated?: string;
}

/**
 * Knowledge graph edge
 */
export interface Edge {
  f: string; // from
  t: string; // to
  relation: string;
  domain: string;
  w?: number; // weight
}

/**
 * Manifest structure (dist/manifest.json)
 */
export interface Manifest {
  version: string;
  generated: string;
  nodes: Record<
    string,
    {
      file: string;
      domain: string;
      type: string;
    }
  >;
  stats: {
    total_nodes: number;
    by_domain: Record<string, number>;
    by_type: Record<string, number>;
  };
}

/**
 * Graph summary (dist/graph.json)
 */
export type GraphSummary = Array<{
  id: string;
  type: string;
  domain: string;
  title: string;
}>;

/**
 * GPU buffers from WASM engine
 */
export interface GpuBuffers {
  nodes: Uint8Array;
  edges: Uint8Array;
}
