import { useState, useEffect } from 'react';
import type { Node } from '../../types/graph';
import './NodeDetail.css';

interface NodeDetailProps {
  nodeId: string | null;
  onClose: () => void;
}

export function NodeDetail({ nodeId, onClose }: NodeDetailProps) {
  const [node, setNode] = useState<Node | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

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
        </div>
      )}
    </div>
  );
}
