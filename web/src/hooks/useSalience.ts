import { useMemo } from 'react';
import type { GraphSummary } from '../types/graph';

export interface SalienceWeights {
  focus: number;
  path: number;
  neighbor: number;
  metadata: number;
}

const DEFAULT_WEIGHTS: SalienceWeights = {
  focus: 1.0,
  path: 0.9,
  neighbor: 0.5,
  metadata: 0.2,
};

/**
 * Computes visual salience for all nodes
 *
 * Salience (0-1) determines visual weight: size, opacity, label visibility
 *
 * Formula: salience = clamp(w_focus×I_focus + w_path×I_path + w_neighbor×I_neighbor, 0, 1)
 */
export function useSalience(
  nodes: GraphSummary,
  selectedNodeId: string | null,
  focusPath: string[] | null,
  neighbors: Map<string, number>, // nodeId → hop distance
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
  }, [nodes, selectedNodeId, focusPath, neighbors, weights]);
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
