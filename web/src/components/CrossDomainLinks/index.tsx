import './CrossDomainLinks.css';

interface CrossDomainLinksProps {
  nodeId: string;
}

export function CrossDomainLinks({ nodeId }: CrossDomainLinksProps) {
  return (
    <div className="cross-domain-links">
      <h3>Cross-Domain Connections</h3>
      <div className="links-content">
        <p className="placeholder-text">
          Bridge edges for: {nodeId}
        </p>
        <p className="note">(Shows formalizes, models, philosophical_foundation edges)</p>
      </div>
    </div>
  );
}
