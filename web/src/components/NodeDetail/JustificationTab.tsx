import { useMemo } from 'react';
import type { FocusPathResult } from '../../hooks/useFocusPath';
import type { Edge } from '../../types/graph';
import { NodeCard } from './NodeCard';
import { EdgeLabel } from './EdgeLabel';
import './JustificationTab.css';

interface JustificationTabProps {
  pathResult: FocusPathResult | null;
  edges: Edge[];
  onNavigate: (nodeId: string) => void;
}

/**
 * JustificationTab - Display epistemic support chain
 *
 * Shows the strongest path from foundation to selected node (Gemini-approved algorithm).
 * Visually distinguishes deductive vs inductive links.
 * Flags coherentist clusters when detected.
 */
export function JustificationTab({ pathResult, edges, onNavigate }: JustificationTabProps) {
  // Find edges between path nodes for display
  const pathEdges = useMemo(() => {
    if (!pathResult) return [];

    const edgeList: Array<{ from: string; to: string; edge: Edge }> = [];
    const { path } = pathResult;

    for (let i = 0; i < path.length - 1; i++) {
      const from = path[i];
      const to = path[i + 1];

      const edge = edges.find(e => e.f === from && e.t === to);
      if (edge) {
        edgeList.push({ from, to, edge });
      }
    }

    return edgeList;
  }, [pathResult, edges]);

  // Empty state
  if (!pathResult) {
    return (
      <div className="justification-tab empty-state">
        <div className="empty-icon">🚫</div>
        <h3>No Foundational Path</h3>
        <p>This node is either:</p>
        <ul>
          <li>A foundational node itself (depth 0)</li>
          <li>Part of a disconnected component</li>
          <li>In a coherentist cluster (mutual support without foundation)</li>
        </ul>
      </div>
    );
  }

  const { path, pathWeight, pathType, isCoherentist, entryPoint } = pathResult;

  // Determine node roles
  const isFoundation = (nodeId: string) => nodeId === path[0];
  const isCurrent = (nodeId: string) => nodeId === path[path.length - 1];

  return (
    <div className="justification-tab">
      {/* Path statistics */}
      <div className="path-stats">
        <div className="stat">
          <span className="stat-label">Path Strength:</span>
          <span className="stat-value">{pathWeight.toFixed(2)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Path Type:</span>
          <span className={`stat-value path-type-${pathType}`}>{pathType}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Path Length:</span>
          <span className="stat-value">{path.length - 1} hops</span>
        </div>
      </div>

      {/* Coherentist warning */}
      {isCoherentist && (
        <div className="coherentist-warning">
          <span className="warning-icon">⚠️</span>
          <div>
            <strong>Coherentist Cluster Detected</strong>
            <p>This node is part of a circular support structure.</p>
            {entryPoint && <p>Entry Point: {entryPoint}</p>}
          </div>
        </div>
      )}

      {/* Path display */}
      <div className="path-chain">
        {path.map((nodeId, index) => (
          <div key={nodeId} className="path-step">
            {/* Foundation marker */}
            {isFoundation(nodeId) && (
              <div className="step-label foundation-label">🏛️ FOUNDATION</div>
            )}

            {/* Current node marker */}
            {isCurrent(nodeId) && (
              <div className="step-label current-label">🎯 YOU ARE HERE</div>
            )}

            {/* Node card */}
            <NodeCard
              node={{
                id: nodeId,
                type: 'theorem', // TODO: Load actual node data
                domain: 'mathematics',
                title: nodeId, // TODO: Load actual title
              }}
              onClick={onNavigate}
            />

            {/* Edge to next node (if not last) */}
            {index < path.length - 1 && pathEdges[index] && (
              <div className="edge-connector">
                <div className="arrow-down">↓</div>
                <EdgeLabel
                  relation={pathEdges[index].edge.relation}
                  weight={pathEdges[index].edge.w}
                  metadata={pathEdges[index].edge.metadata as Record<string, any>}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="path-legend">
        <div className="legend-item">
          <span className="legend-symbol">━━━</span>
          <span>Deductive (proves, entails)</span>
        </div>
        <div className="legend-item">
          <span className="legend-symbol">┅┅┅</span>
          <span>Inductive (supports, predicts)</span>
        </div>
      </div>
    </div>
  );
}
