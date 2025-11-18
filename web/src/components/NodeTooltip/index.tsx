import { useEffect, useState } from 'react';
import type { Node } from '../../types/graph';
import './NodeTooltip.css';

interface NodeTooltipProps {
  node: Node | null;
  position: { x: number; y: number } | null;
  onHide?: () => void;
}

/**
 * Floating tooltip for node hover preview
 *
 * Shows: title, type•domain, 120-char content snippet
 * Positioning: above-right by default, flips near screen edges
 */
export function NodeTooltip({ node, position, onHide }: NodeTooltipProps) {
  const [visible, setVisible] = useState(false);
  const [adjustedPosition, setAdjustedPosition] = useState<{ x: number; y: number } | null>(null);

  // Debounced appearance (150ms)
  useEffect(() => {
    if (node && position) {
      const timer = setTimeout(() => {
        setVisible(true);
        setAdjustedPosition(computePosition(position));
      }, 150);

      return () => clearTimeout(timer);
    } else {
      // Delayed hide (300ms)
      const timer = setTimeout(() => {
        setVisible(false);
        onHide?.();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [node, position, onHide]);

  if (!visible || !node || !adjustedPosition) {
    return null;
  }

  const contentPreview = truncateContent(node.content, 120);

  return (
    <div
      className="node-tooltip"
      style={{
        left: `${adjustedPosition.x}px`,
        top: `${adjustedPosition.y}px`,
      }}
      role="tooltip"
      aria-label={`Preview of ${node.title}`}
    >
      <div className="tooltip-title">{node.title}</div>
      <div className="tooltip-meta">
        {node.type} • {node.domain}
      </div>
      {contentPreview && <div className="tooltip-content">{contentPreview}</div>}
    </div>
  );
}

/**
 * Compute tooltip position with edge detection
 *
 * Default: 10px above, 10px right
 * Flips: to left if near right edge, below if near top edge
 */
function computePosition(basePosition: { x: number; y: number }): { x: number; y: number } {
  const offset = { x: 10, y: -10 }; // Right and up
  const tooltipWidth = 300; // Approximate
  const tooltipHeight = 100; // Approximate

  let x = basePosition.x + offset.x;
  let y = basePosition.y + offset.y;

  // Flip horizontal if near right edge
  if (x + tooltipWidth > window.innerWidth - 20) {
    x = basePosition.x - tooltipWidth - offset.x;
  }

  // Flip vertical if near top edge
  if (y < 20) {
    y = basePosition.y + Math.abs(offset.y) + 20;
  }

  return { x, y };
}

/**
 * Truncate content to maxLength with ellipsis
 */
function truncateContent(content: string | undefined, maxLength: number): string {
  if (!content) return '';

  if (content.length <= maxLength) {
    return content;
  }

  return content.substring(0, maxLength) + '…';
}
