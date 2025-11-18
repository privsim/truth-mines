import { useEffect, useRef } from 'react';
import type { GraphSummary } from '../../types/graph';
import './Graph2D.css';

interface Graph2DProps {
  nodes: GraphSummary;
  onNodeSelect?: (nodeId: string) => void;
}

/**
 * 2D force-directed graph visualization
 *
 * Ready for cosmos.gl or similar GPU force graph integration
 */
export function Graph2D({ nodes, onNodeSelect }: Graph2DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Placeholder: cosmos.gl integration would go here
    // const graph = new Cosmos(canvasRef.current, { nodes, edges });
    // graph.on('node-click', (node) => onNodeSelect?.(node.id));

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Simple placeholder visualization
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw placeholder nodes
    ctx.fillStyle = '#3b82f6';
    nodes.forEach((node, i) => {
      const angle = (i / nodes.length) * Math.PI * 2;
      const radius = Math.min(canvas.width, canvas.height) / 3;
      const x = canvas.width / 2 + Math.cos(angle) * radius;
      const y = canvas.height / 2 + Math.sin(angle) * radius;

      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      `${nodes.length} nodes (cosmos.gl integration pending)`,
      canvas.width / 2,
      20
    );
  }, [nodes, onNodeSelect]);

  return (
    <div className="graph-2d">
      <canvas ref={canvasRef} className="graph-2d-canvas" role="img" aria-label="2D graph visualization" />
    </div>
  );
}
