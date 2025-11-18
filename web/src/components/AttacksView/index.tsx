import './AttacksView.css';

interface AttacksViewProps {
  nodeId: string;
}

export function AttacksView({ nodeId }: AttacksViewProps) {
  return (
    <div className="attacks-view">
      <h3>Attacks & Objections</h3>
      <div className="attacks-content">
        <p className="placeholder-text">
          Counterarguments against: {nodeId}
        </p>
        <p className="note">(Shows incoming "attack" edges - to be integrated with WASM engine)</p>
      </div>
    </div>
  );
}
