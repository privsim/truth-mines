import './JustificationTree.css';

interface JustificationTreeProps {
  nodeId: string;
}

/**
 * Displays justification tree showing support paths to selected node
 *
 * Shows paths from foundational nodes to the current node
 */
export function JustificationTree({ nodeId }: JustificationTreeProps) {
  // Placeholder: Would call engine.find_paths() from foundations to nodeId

  return (
    <div className="justification-tree">
      <h3>Justification</h3>
      <div className="tree-content">
        <p className="placeholder-text">
          Justification tree for node {nodeId}
        </p>
        <p className="note">(Paths from foundational nodes - Epic 5 integration pending)</p>
      </div>
    </div>
  );
}
