import './NodeCard.css';

interface NodeCardProps {
  node: {
    id: string;
    type: string;
    domain: string;
    title: string;
    status?: string;
  };
  depth?: number;
  onClick: (nodeId: string) => void;
}

// Icon mapping for node types (Gemini spec)
const NODE_ICONS: Record<string, string> = {
  axiom: '🏛️',
  theorem: '📊',
  theory: '🔬',
  proposition: '📝',
  observation: '🧪',
  experiment: '🧪',
  definition: '📖',
  concept: '💭',
  lemma: '📐',
  corollary: '📌',
  principle: '⚖️',
  law: '⚖️',
};

/**
 * NodeCard - Reusable node display component
 *
 * Shows node info with icon, title, metadata, and click handler.
 * Used in JustificationTab, AttacksTab, CrossDomainTab.
 *
 * Styling (Gemini-approved):
 * - Border color based on domain
 * - Desaturated if status='refuted'
 * - Clickable with hover effect
 */
export function NodeCard({ node, depth, onClick }: NodeCardProps) {
  const icon = NODE_ICONS[node.type] || '📄';

  const handleClick = () => {
    onClick(node.id);
  };

  const cardClasses = [
    'node-card',
    `domain-${node.domain}`,
    node.status ? `status-${node.status}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={cardClasses}
      onClick={handleClick}
      aria-label={`Navigate to ${node.title}`}
    >
      <div className="node-card-header">
        <span className="node-icon">{icon}</span>
        <h4 className="node-title">{node.title}</h4>
      </div>

      <div className="node-card-meta">
        <span className="node-type">{node.type}</span>
        <span className="node-domain">{node.domain}</span>
        {depth !== undefined && <span className="node-depth">Depth {depth}</span>}
      </div>
    </button>
  );
}
