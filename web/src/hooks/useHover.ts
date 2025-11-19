import { useState, useCallback } from 'react';

export interface HoverState {
  nodeId: string | null;
  position: { x: number; y: number } | null;
}

/**
 * Track hovered node and mouse position for tooltip
 *
 * @returns Hover state and setter function
 */
export function useHover() {
  const [hover, setHover] = useState<HoverState>({
    nodeId: null,
    position: null,
  });

  const setHoveredNode = useCallback(
    (nodeId: string | null, position: { x: number; y: number } | null = null) => {
      setHover({ nodeId, position });
    },
    []
  );

  const clearHover = useCallback(() => {
    setHover({ nodeId: null, position: null });
  }, []);

  return { hover, setHoveredNode, clearHover };
}
