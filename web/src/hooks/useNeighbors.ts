import { useMemo } from 'react';
import type { Edge } from '../types/graph';

/**
 * Compute neighbor hop distances from a selected node using BFS
 *
 * Performs breadth-first search to find all nodes within maxHops distance.
 * Treats graph as undirected (follows edges in both directions).
 *
 * @param selectedNodeId - The starting node (null if none selected)
 * @param edges - All graph edges
 * @param maxHops - Maximum hop distance to explore (default: 3)
 * @returns Map of nodeId → hop distance (0 = selected, 1 = direct neighbor, etc.)
 */
export function useNeighbors(
  selectedNodeId: string | null,
  edges: Edge[],
  maxHops: number = 3
): Map<string, number> {
  return useMemo(() => {
    const neighbors = new Map<string, number>();

    if (!selectedNodeId) {
      return neighbors;
    }

    // Build adjacency lists for bidirectional traversal
    const adjacency = new Map<string, string[]>();

    for (const edge of edges) {
      // Forward edge: from → to
      if (!adjacency.has(edge.f)) {
        adjacency.set(edge.f, []);
      }
      adjacency.get(edge.f)!.push(edge.t);

      // Backward edge: to → from (treat as undirected for neighbor finding)
      if (!adjacency.has(edge.t)) {
        adjacency.set(edge.t, []);
      }
      adjacency.get(edge.t)!.push(edge.f);
    }

    // BFS to find neighbors at each hop distance
    const queue: Array<{ nodeId: string; hop: number }> = [{ nodeId: selectedNodeId, hop: 0 }];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const { nodeId, hop } = queue.shift()!;

      // Skip if already visited
      if (visited.has(nodeId)) {
        continue;
      }

      visited.add(nodeId);
      neighbors.set(nodeId, hop);

      // Don't explore beyond maxHops
      if (hop >= maxHops) {
        continue;
      }

      // Add unvisited neighbors to queue
      const nodeNeighbors = adjacency.get(nodeId) || [];
      for (const neighbor of nodeNeighbors) {
        if (!visited.has(neighbor)) {
          queue.push({ nodeId: neighbor, hop: hop + 1 });
        }
      }
    }

    return neighbors;
  }, [selectedNodeId, edges, maxHops]);
}
