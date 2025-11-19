import { useMemo } from 'react';
import { computeTension } from '../../hooks/useSalience';
import type { Edge } from '../../types/graph';
import { NodeCard } from './NodeCard';
import './AttacksTab.css';

interface AttacksTabProps {
  nodeId: string;
  edges: Edge[];
  onNavigate: (nodeId: string) => void;
}

/**
 * AttacksTab - Display incoming attacks and epistemic challenges
 *
 * Shows all nodes that attack/refute the selected node.
 * Displays tension score (Gemini: in Overview, not here, but useful context).
 * Sorts by weight (strongest attacks first - Gemini approved).
 */
export function AttacksTab({ nodeId, edges, onNavigate }: AttacksTabProps) {
  // Find incoming attack edges
  const attacks = useMemo(() => {
    return edges
      .filter(e => e.t === nodeId && (e.relation === 'attacks' || e.relation === 'refutes'))
      .sort((a, b) => (b.w || 0.7) - (a.w || 0.7)); // Sort by weight descending
  }, [nodeId, edges]);

  // Compute tension
  const tension = useMemo(() => {
    return computeTension(nodeId, edges);
  }, [nodeId, edges]);

  // Empty state
  if (attacks.length === 0) {
    return (
      <div className="attacks-tab empty-state">
        <div className="empty-icon">✅</div>
        <h3>No Attacks Found</h3>
        <p>This node is not currently challenged by any counterarguments in the graph.</p>
        <div className="tension-display">
          <span>Tension Score: {tension.toFixed(2)} (no controversy)</span>
        </div>
      </div>
    );
  }

  return (
    <div className="attacks-tab">
      <div className="attacks-list">
        <h3>🔴 Attacks ({attacks.length})</h3>

        {attacks.map(attack => {
          const weight = attack.w || 0.7;
          const severity = weight > 0.95 ? 'strong' : weight > 0.7 ? 'moderate' : 'weak';

          return (
            <div key={attack.f} className={`attack-item severity-${severity}`}>
              <NodeCard
                node={{
                  id: attack.f,
                  type: 'proposition', // TODO: Load actual node data
                  domain: attack.domain.replace('bridge:', ''),
                  title: attack.f,
                }}
                onClick={onNavigate}
              />

              <div className="attack-info">
                <span className="attack-relation">{attack.relation}</span>
                <span className="attack-weight">(weight: {weight.toFixed(2)})</span>
                {weight > 0.95 && <span className="severity-badge">Effectively Refutes</span>}
                {weight > 0.7 && weight <= 0.95 && <span className="severity-badge">Moderate</span>}
                {weight <= 0.7 && <span className="severity-badge">Weak Challenge</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
