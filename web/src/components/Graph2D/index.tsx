import { useRef, useMemo, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import type { GraphSummary } from '../../types/graph';
import { useEdges } from '../../hooks/useEdges';
import { useNeighbors } from '../../hooks/useNeighbors';
import { useSalience, applySalienceToSize, applySalienceToOpacity, shouldShowLabel } from '../../hooks/useSalience';
import { useHover } from '../../hooks/useHover';
import { NodeTooltip } from '../NodeTooltip';
import './Graph2D.css';

interface Graph2DProps {
  nodes: GraphSummary;
  selectedNodeId?: string | null;
  onNodeSelect?: (nodeId: string) => void;
}

// Domain colors (from styles/default.toml)
const DOMAIN_COLORS: Record<string, string> = {
  philosophy: '#9333EA',   // Purple
  mathematics: '#2563EB',  // Blue
  physics: '#DC2626',      // Red
};

/**
 * 2D force-directed graph visualization with full interactivity
 *
 * Features:
 * - Force-directed layout
 * - Hover tooltips
 * - Click selection with neighbor highlighting
 * - Salience-based sizing (including Gemini tension)
 * - Domain-based coloring
 */
export function Graph2D({ nodes, selectedNodeId = null, onNodeSelect }: Graph2DProps) {
  const graphRef = useRef<any>();
  const { edges, loading: edgesLoading } = useEdges();
  const { hover, setHoveredNode, clearHover } = useHover();

  // Compute neighbors for salience calculation
  const neighbors = useNeighbors(selectedNodeId, edges);

  // Compute salience for all nodes (includes tension!)
  const salience = useSalience(
    nodes,
    selectedNodeId,
    null, // focusPath (TODO: implement useFocusPath)
    neighbors,
    edges  // For tension calculation
  );

  // Convert to force-graph format
  const graphData = useMemo(() => {
    // Create set of visible node IDs for edge filtering
    const visibleNodeIds = new Set(nodes.map(n => n.id));

    // Filter edges to only include those between visible nodes
    const visibleEdges = edges.filter(
      edge => visibleNodeIds.has(edge.f) && visibleNodeIds.has(edge.t)
    );

    return {
      nodes: nodes.map(node => ({
        id: node.id,
        name: node.title,
        type: node.type,
        domain: node.domain,
      })),
      links: visibleEdges.map(edge => ({
        source: edge.f,
        target: edge.t,
        relation: edge.relation,
        weight: edge.w,
      })),
    };
  }, [nodes, edges]);

  // Node color based on domain
  const nodeColor = useCallback((node: any) => {
    return DOMAIN_COLORS[node.domain] || '#9CA3AF';
  }, []);

  // Node size based on salience (includes tension!)
  const nodeVal = useCallback((node: any) => {
    const nodeSalience = salience.get(node.id) || 0;
    const baseSize = 3;
    return applySalienceToSize(baseSize, nodeSalience);
  }, [salience]);

  // Node label visibility based on salience
  const nodeLabel = useCallback((node: any) => {
    const nodeSalience = salience.get(node.id) || 0;
    return shouldShowLabel(nodeSalience) ? node.name : '';
  }, [salience]);

  // Edge styling based on relation type
  const linkColor = useCallback((link: any) => {
    const relationColors: Record<string, string> = {
      supports: '#22C55E',   // Green
      attacks: '#EF4444',    // Red
      proves: '#A855F7',     // Purple
      entails: '#3B82F6',    // Blue
      predicts: '#F97316',   // Orange
      explains: '#F59E0B',   // Amber
    };
    return relationColors[link.relation] || '#9CA3AF';
  }, []);

  const linkWidth = useCallback((link: any) => {
    return (link.weight || 0.7) * 2;  // Scale by weight
  }, []);

  // Interaction handlers
  const handleNodeClick = useCallback((node: any) => {
    onNodeSelect?.(node.id);
  }, [onNodeSelect]);

  const handleNodeHover = useCallback((node: any | null) => {
    if (node) {
      setHoveredNode(node.id, { x: node.x, y: node.y });
    } else {
      clearHover();
    }
  }, [setHoveredNode, clearHover]);

  if (edgesLoading) {
    return (
      <div className="graph-2d">
        <div className="loading">Loading edges...</div>
      </div>
    );
  }

  return (
    <div className="graph-2d">
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        nodeColor={nodeColor}
        nodeVal={nodeVal}
        nodeLabel={nodeLabel}
        linkColor={linkColor}
        linkWidth={linkWidth}
        linkDirectionalArrowLength={3}
        linkDirectionalArrowRelPos={1}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        backgroundColor="#0f172a"
        warmupTicks={100}
        cooldownTime={2000}
        enableNodeDrag={true}
        enablePanAndZoom={true}
      />

      {hover.nodeId && (
        <NodeTooltip nodeId={hover.nodeId} position={hover.position || { x: 0, y: 0 }} />
      )}
    </div>
  );
}
