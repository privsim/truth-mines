import { useMemo } from 'react';
import type { GraphSummary, Edge } from '../types/graph';

export interface SalienceWeights {
  focus: number;
  path: number;
  neighbor: number;
  tension: number; // Gemini 3 Pro addition
  metadata: number;
}

const DEFAULT_WEIGHTS: SalienceWeights = {
  focus: 1.0,
  path: 0.9,
  neighbor: 0.5,
  tension: 0.6, // Gemini 3 Pro: highlight controversial nodes
  metadata: 0.2,
};

/**
 * Computes visual salience for all nodes
 *
 * Salience (0-1) determines visual weight: size, opacity, label visibility
 *
 * Formula (updated with Gemini 3 Pro tension component):
 * salience = clamp(
 *   w_focus×I_focus + w_path×I_path + w_neighbor×I_neighbor + w_tension×tension,
 *   0, 1
 * )
 */
export function useSalience(
  nodes: GraphSummary,
  selectedNodeId: string | null,
  focusPath: string[] | null,
  neighbors: Map<string, number>, // nodeId → hop distance
  edges: Edge[] = [], // Gemini addition: needed for tension calculation
  weights: SalienceWeights = DEFAULT_WEIGHTS
): Map<string, number> {
  return useMemo(() => {
    const salience = new Map<string, number>();

    for (const node of nodes) {
      let score = 0;

      // Focus component: 1.0 if selected
      if (node.id === selectedNodeId) {
        score += weights.focus;
      }

      // Path component: 0.9 if on active path
      if (focusPath && focusPath.includes(node.id)) {
        score += weights.path;
      }

      // Neighbor component: decays with hop distance
      const hopDistance = neighbors.get(node.id);
      if (hopDistance !== undefined) {
        const decay = Math.max(0, 1.0 - 0.4 * hopDistance);
        score += weights.neighbor * decay;
      }

      // Tension component (Gemini 3 Pro addition): controversial nodes
      if (edges.length > 0) {
        const tension = computeTension(node.id, edges);
        score += weights.tension * tension;
      }

      // Clamp to [0, 1]
      salience.set(node.id, Math.min(score, 1.0));
    }

    // Nodes not in any category get 0 salience (background)
    for (const node of nodes) {
      if (!salience.has(node.id)) {
        salience.set(node.id, 0.0);
      }
    }

    return salience;
  }, [nodes, selectedNodeId, focusPath, neighbors, edges, weights]);
}

/**
 * Apply salience to visual properties
 */
export function applySalienceToSize(baseSize: number, salience: number): number {
  return baseSize * (0.5 + 1.5 * salience);
}

export function applySalienceToOpacity(salience: number): number {
  return 0.2 + 0.8 * salience;
}

export function shouldShowLabel(salience: number, threshold: number = 0.4): boolean {
  return salience > threshold;
}

/**
 * Compute epistemic tension for a node (Gemini 3 Pro addition)
 *
 * Tension is high when a node is BOTH heavily supported AND heavily attacked.
 * Highlights "active frontiers" vs. "settled foundations" vs. "dead ends."
 *
 * Formula: tension = sqrt(supportStrength × attackStrength) / 5.0
 *
 * - 0.0: No conflict (only supports, only attacks, or neither)
 * - 0.3-0.5: Mild controversy
 * - 0.6-0.8: Active debate (e.g., Axiom of Choice)
 * - 0.9-1.0: Intense controversy (e.g., Gettier vs. JTB)
 *
 * @param nodeId - The node to compute tension for
 * @param edges - All edges in the graph
 * @returns Tension value [0, 1]
 */
export function computeTension(nodeId: string, edges: Edge[]): number {
  // Support relations: supports, proves, entails
  const supportRelations = new Set(['supports', 'proves', 'entails']);
  // Attack relations: attacks, refutes
  const attackRelations = new Set(['attacks', 'refutes']);

  // Find incoming support and attack edges
  const incomingSupports = edges.filter(
    (e) => e.t === nodeId && supportRelations.has(e.relation)
  );
  const incomingAttacks = edges.filter(
    (e) => e.t === nodeId && attackRelations.has(e.relation)
  );

  // Sum weighted strengths (default weight 0.7 if not specified)
  const supportStrength = incomingSupports.reduce((sum, e) => sum + (e.w ?? 0.7), 0);
  const attackStrength = incomingAttacks.reduce((sum, e) => sum + (e.w ?? 0.7), 0);

  // Tension requires BOTH support and attack
  if (supportStrength === 0 || attackStrength === 0) {
    return 0;
  }

  // Geometric mean ensures both factors are needed
  const rawTension = Math.sqrt(supportStrength * attackStrength);

  // Normalize to [0, 1] range
  // Assuming max reasonable values: supportStrength ≈ 5, attackStrength ≈ 5
  // Max rawTension = sqrt(5 × 5) = 5
  return Math.min(rawTension / 5.0, 1.0);
}
