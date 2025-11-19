import { useState, useEffect } from 'react';
import type { Node, Edge } from '../../types/graph';
import type { FocusPathResult } from '../../hooks/useFocusPath';
import { JustificationTab } from './JustificationTab';
import { AttacksTab } from './AttacksTab';
import { CrossDomainTab } from './CrossDomainTab';
import { computeTension } from '../../hooks/useSalience';
import './NodeDetail.css';

interface NodeDetailProps {
  nodeId: string | null;
  focusPathResult?: FocusPathResult | null;
  edges?: Edge[];
  onClose: () => void;
  onNavigate?: (nodeId: string) => void;
}

type TabType = 'overview' | 'justification' | 'attacks' | 'cross-domain';

export function NodeDetail({
  nodeId,
  focusPathResult = null,
  edges = [],
  onClose,
  onNavigate = () => {},
}: NodeDetailProps) {
  const [node, setNode] = useState<Node | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Compute tension for display in Overview (Gemini: show in Overview, not Attacks)
  const tension = nodeId && edges.length > 0 ? computeTension(nodeId, edges) : 0;

  useEffect(() => {
    if (!nodeId) {
      setNode(null);
      return;
    }

    async function loadNode() {
      try {
        setLoading(true);
        const response = await fetch(`/nodes/${nodeId}.json`);

        if (!response.ok) {
          throw new Error(`Node ${nodeId} not found`);
        }

        const data = await response.json();
        setNode(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load node'));
      } finally {
        setLoading(false);
      }
    }

    loadNode();
    setActiveTab('overview'); // Reset to overview when node changes
  }, [nodeId]);

  if (!nodeId) return null;

  return (
    <div className="node-detail">
      <div className="node-detail-header">
        <h2>Node Details</h2>
        <button onClick={onClose} className="close-button">
          ×
        </button>
      </div>

      {loading && <div className="node-detail-loading">Loading...</div>}
      {error && <div className="node-detail-error">{error.message}</div>}

      {node && (
        <>
          <div className="node-detail-tabs">
            <button
              className={activeTab === 'overview' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={activeTab === 'justification' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('justification')}
            >
              Justification
            </button>
            <button
              className={activeTab === 'attacks' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('attacks')}
            >
              Attacks
            </button>
            <button
              className={activeTab === 'cross-domain' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('cross-domain')}
            >
              Cross-Domain
            </button>
          </div>

          <div className="node-detail-tab-content">
            {activeTab === 'overview' && (
              <div className="node-detail-content">
                <div className="node-field">
                  <label>ID:</label>
                  <span>{node.id}</span>
                </div>
                <div className="node-field">
                  <label>Type:</label>
                  <span>{node.type}</span>
                </div>
                <div className="node-field">
                  <label>Domain:</label>
                  <span>{node.domain}</span>
                </div>
                <div className="node-field">
                  <label>Title:</label>
                  <span>{node.title}</span>
                </div>
                {node.content && (
                  <div className="node-field">
                    <label>Content:</label>
                    <p>{node.content}</p>
                  </div>
                )}
                {node.formal && (
                  <div className="node-field">
                    <label>Formal:</label>
                    <code>{node.formal}</code>
                  </div>
                )}
                {node.tags && node.tags.length > 0 && (
                  <div className="node-field">
                    <label>Tags:</label>
                    <div className="tags">
                      {node.tags.map((tag) => (
                        <span key={tag} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tension score (Gemini: in Overview tab) */}
                {tension > 0 && (
                  <div className="node-field">
                    <label>Tension:</label>
                    <span className={tension >= 0.7 ? 'tension-high' : tension >= 0.3 ? 'tension-medium' : ''}>
                      {tension.toFixed(2)} {tension >= 0.7 ? '(High Controversy)' : tension >= 0.3 ? '(Debated)' : '(Low)'}
                    </span>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'justification' && (
              <JustificationTab pathResult={focusPathResult} edges={edges} onNavigate={onNavigate} />
            )}
            {activeTab === 'attacks' && (
              <AttacksTab nodeId={node.id} edges={edges} onNavigate={onNavigate} />
            )}
            {activeTab === 'cross-domain' && (
              <CrossDomainTab nodeId={node.id} edges={edges} onNavigate={onNavigate} />
            )}
          </div>
        </>
      )}
    </div>
  );
}
