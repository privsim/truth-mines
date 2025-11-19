import './EdgeLabel.css';

interface EdgeLabelProps {
  relation: string;
  weight?: number;
  metadata?: Record<string, any>;
}

// Relation type classification (Gemini: deductive vs inductive)
const DEDUCTIVE_RELATIONS = new Set(['proves', 'entails']);

/**
 * EdgeLabel - Display edge information with visual indicators
 *
 * Shows relation type, weight, and optional metadata.
 * Visual distinction for deductive vs inductive (Gemini-approved).
 */
export function EdgeLabel({ relation, weight, metadata }: EdgeLabelProps) {
  const displayWeight = weight ?? 0.7;
  const isDeductive = DEDUCTIVE_RELATIONS.has(relation);

  const labelClasses = [
    'edge-label',
    `relation-${relation}`,
    isDeductive ? 'edge-deductive' : 'edge-inductive',
  ].join(' ');

  return (
    <div className={labelClasses}>
      <div className="edge-indicator">
        {isDeductive ? '━━━' : '┅┅┅'}
      </div>

      <div className="edge-info">
        <span className="edge-relation">{relation}</span>
        <span className="edge-weight">({displayWeight.toFixed(2)})</span>
      </div>

      {metadata && Object.keys(metadata).length > 0 && (
        <div className="edge-metadata">
          {Object.entries(metadata).map(([key, value]) => (
            <span key={key} className="metadata-item">
              {key}: {String(value)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
