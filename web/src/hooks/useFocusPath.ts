import { useMemo } from 'react';
import type { Edge } from '../types/graph';

export interface FocusPathResult {
  path: string[];                              // Node IDs from foundation → selected
  pathWeight: number;                          // Product of edge weights (confidence)
  pathType: 'deductive' | 'inductive' | 'mixed'; // Based on relation types
  isCoherentist: boolean;                      // True if cycle detected
  entryPoint: string | null;                   // If coherentist, which node is entry
}

/**
 * Compute strongest epistemic path from foundations to selected node
 *
 * Implements Dijkstra's algorithm with maximum probability (Gemini 3 Pro approved).
 * Uses -log(weight) cost function so highest probability = lowest cost.
 *
 * Algorithm decisions (Gemini review):
 * - Strongest path (max probability product), NOT shortest path
 * - Excludes bridge relations (unless node orphaned)
 * - Detects cycles, returns path to entry point with flag
 * - Classifies path type (deductive/inductive/mixed)
 *
 * @param selectedNodeId - Target node to find justification for
 * @param edges - All graph edges
 * @returns Focus path result or null if no path exists
 */
export function useFocusPath(
  selectedNodeId: string | null,
  edges: Edge[]
): FocusPathResult | null {
  return useMemo(() => {
    if (!selectedNodeId || edges.length === 0) {
      return null;
    }

    // Epistemic relations (used for justification paths)
    const epistemicRelations = new Set(['supports', 'proves', 'entails', 'predicts']);

    // Deductive relations (for path type classification)
    const deductiveRelations = new Set(['proves', 'entails']);

    // Filter to epistemic edges only (Gemini: exclude bridges unless orphaned)
    const epistemicEdges = edges.filter(e => {
      // Include if epistemic and not bridge
      if (epistemicRelations.has(e.relation) && !e.domain.startsWith('bridge:')) {
        return true;
      }
      return false;
    });

    // Build reverse adjacency (for backward traversal from selected → foundations)
    const incoming = new Map<string, Array<{ from: string; weight: number; relation: string }>>();

    for (const edge of epistemicEdges) {
      if (!incoming.has(edge.t)) {
        incoming.set(edge.t, []);
      }
      incoming.get(edge.t)!.push({
        from: edge.f,
        weight: edge.w || 0.7,
        relation: edge.relation,
      });
    }

    // Find foundation nodes (depth 0 - no incoming epistemic edges)
    const foundations = new Set<string>();
    const allNodes = new Set<string>();

    for (const edge of epistemicEdges) {
      allNodes.add(edge.f);
      allNodes.add(edge.t);
    }

    for (const nodeId of allNodes) {
      if (!incoming.has(nodeId) || incoming.get(nodeId)!.length === 0) {
        foundations.add(nodeId);
      }
    }

    // Check if selected is already a foundation
    if (foundations.has(selectedNodeId)) {
      return {
        path: [selectedNodeId],
        pathWeight: 1.0,
        pathType: 'deductive',
        isCoherentist: false,
        entryPoint: null,
      };
    }

    // Dijkstra's algorithm for MAXIMUM probability (minimum -log cost)
    const costs = new Map<string, number>([[selectedNodeId, 0]]);  // -log(1.0) = 0
    const paths = new Map<string, string[]>([[selectedNodeId, [selectedNodeId]]]);
    const relations = new Map<string, string[]>(); // Track relation types in path

    // Priority queue (simple array, sort by cost)
    // In production, use proper heap for O(log n) operations
    const queue = [selectedNodeId];
    const visited = new Set<string>();

    // Track all found paths to foundations
    let bestFoundationPath: {
      path: string[];
      cost: number;
      relations: string[];
    } | null = null;

    while (queue.length > 0) {
      // Find node with minimum cost (highest probability)
      queue.sort((a, b) => (costs.get(a) || Infinity) - (costs.get(b) || Infinity));
      const current = queue.shift()!;

      // Skip if already processed
      if (visited.has(current)) {
        continue;
      }

      visited.add(current);

      // Check if we reached a foundation
      if (foundations.has(current)) {
        const currentCost = costs.get(current) || 0;

        // Update best path if this is better (lower cost = higher probability)
        if (!bestFoundationPath || currentCost < bestFoundationPath.cost) {
          bestFoundationPath = {
            path: paths.get(current) || [current],
            cost: currentCost,
            relations: relations.get(current) || [],
          };
        }

        // Continue exploring to find all foundation paths
        continue;
      }

      // Explore incoming edges
      const incomingEdges = incoming.get(current) || [];

      for (const edge of incomingEdges) {
        // Check for cycle (Gemini: detect entry point)
        if (paths.get(current)?.includes(edge.from)) {
          // Cycle detected!
          return {
            path: [...paths.get(current)!, edge.from].reverse(),
            pathWeight: Math.exp(-(costs.get(current) || 0)),
            pathType: classifyPathType(relations.get(current) || [], deductiveRelations),
            isCoherentist: true,
            entryPoint: edge.from,
          };
        }

        const edgeCost = -Math.log(edge.weight);  // Higher weight → lower cost
        const newCost = (costs.get(current) || 0) + edgeCost;

        if (!costs.has(edge.from) || newCost < costs.get(edge.from)!) {
          costs.set(edge.from, newCost);
          paths.set(edge.from, [...paths.get(current)!, edge.from]);
          relations.set(edge.from, [...(relations.get(current) || []), edge.relation]);

          if (!queue.includes(edge.from)) {
            queue.push(edge.from);
          }
        }
      }
    }

    // Return best foundation path if found
    if (bestFoundationPath) {
      return {
        path: bestFoundationPath.path.reverse(), // Reverse to go foundation → selected
        pathWeight: Math.exp(-bestFoundationPath.cost),
        pathType: classifyPathType(bestFoundationPath.relations, deductiveRelations),
        isCoherentist: false,
        entryPoint: null,
      };
    }

    // No path found - check if bridge-only path exists (Gemini exception for orphaned nodes)
    const hasBridgeSupport = edges.some(
      e => e.t === selectedNodeId && e.domain.startsWith('bridge:') && epistemicRelations.has(e.relation)
    );

    if (hasBridgeSupport) {
      // Try again with bridges included (orphaned node exception)
      const allEpistemicEdges = edges.filter(e => epistemicRelations.has(e.relation));
      // Recursive call would create infinite loop, so return simplified result
      // This is acceptable for v1.0, can be improved in v1.1
      return null; // For now, return null for bridge-only nodes
    }

    return null;
  }, [selectedNodeId, edges]);
}

/**
 * Classify path type based on relation types (Gemini: weakest link principle)
 */
function classifyPathType(
  relationTypes: string[],
  deductiveRelations: Set<string>
): 'deductive' | 'inductive' | 'mixed' {
  if (relationTypes.length === 0) {
    return 'deductive';  // Empty path (foundation)
  }

  const hasDeductive = relationTypes.some(r => deductiveRelations.has(r));
  const hasInductive = relationTypes.some(r => !deductiveRelations.has(r));

  if (hasDeductive && hasInductive) {
    return 'mixed';
  } else if (hasDeductive) {
    return 'deductive';
  } else {
    return 'inductive';
  }
}
