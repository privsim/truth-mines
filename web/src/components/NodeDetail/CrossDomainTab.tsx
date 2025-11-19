import { useMemo } from 'react';
import type { Edge } from '../../types/graph';
import { NodeCard } from './NodeCard';
import { EdgeLabel } from './EdgeLabel';
import './CrossDomainTab.css';

interface CrossDomainTabProps {
  nodeId: string;
  edges: Edge[];
  onNavigate: (nodeId: string) => void;
}

/**
 * CrossDomainTab - Display bridge relations across domains
 *
 * Shows philosophical foundations, mathematical models, physical applications.
 * Grouped by bridge direction (incoming vs outgoing).
 */
export function CrossDomainTab({ nodeId, edges, onNavigate }: CrossDomainTabProps) {
  // Find bridge edges (domain starts with "bridge:")
  const bridges = useMemo(() => {
    const incoming = edges.filter(
      e => e.t === nodeId && e.domain.startsWith('bridge:')
    );
    const outgoing = edges.filter(
      e => e.f === nodeId && e.domain.startsWith('bridge:')
    );

    return { incoming, outgoing };
  }, [nodeId, edges]);

  const totalBridges = bridges.incoming.length + bridges.outgoing.length;

  // Empty state
  if (totalBridges === 0) {
    return (
      <div className="crossdomain-tab empty-state">
        <div className="empty-icon">🔗</div>
        <h3>No Cross-Domain Bridges</h3>
        <p>This node operates within a single domain.</p>
        <p>It does not bridge to other areas of knowledge.</p>
      </div>
    );
  }

  return (
    <div className="crossdomain-tab">
      {/* Incoming bridges */}
      {bridges.incoming.length > 0 && (
        <div className="bridge-section">
          <h3>📚 Grounded In ({bridges.incoming.length})</h3>
          <p className="section-description">
            Other domains that ground this node
          </p>

          {bridges.incoming.map(bridge => (
            <div key={bridge.f} className="bridge-item">
              <NodeCard
                node={{
                  id: bridge.f,
                  type: 'concept',
                  domain: bridge.domain.split('→')[0].replace('bridge:', ''),
                  title: bridge.f,
                }}
                onClick={onNavigate}
              />

              <EdgeLabel
                relation={bridge.relation}
                weight={bridge.w}
                metadata={bridge.metadata as Record<string, any>}
              />
            </div>
          ))}
        </div>
      )}

      {/* Outgoing bridges */}
      {bridges.outgoing.length > 0 && (
        <div className="bridge-section">
          <h3>🔢 Bridges To ({bridges.outgoing.length})</h3>
          <p className="section-description">
            Other domains this node connects to
          </p>

          {bridges.outgoing.map(bridge => (
            <div key={bridge.t} className="bridge-item">
              <EdgeLabel
                relation={bridge.relation}
                weight={bridge.w}
                metadata={bridge.metadata as Record<string, any>}
              />

              <NodeCard
                node={{
                  id: bridge.t,
                  type: 'concept',
                  domain: bridge.domain.split('→')[1] || 'unknown',
                  title: bridge.t,
                }}
                onClick={onNavigate}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
