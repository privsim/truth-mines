import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  useSalience,
  applySalienceToSize,
  applySalienceToOpacity,
  shouldShowLabel,
  computeTension,
} from './useSalience';
import type { GraphSummary, Edge } from '../types/graph';

const mockNodes: GraphSummary = [
  { id: 'selected', type: 'proposition', domain: 'philosophy', title: 'Selected Node' },
  { id: 'neighbor1', type: 'proposition', domain: 'philosophy', title: 'Neighbor 1-hop' },
  { id: 'neighbor2', type: 'proposition', domain: 'mathematics', title: 'Neighbor 2-hop' },
  { id: 'background', type: 'theorem', domain: 'physics', title: 'Background Node' },
  { id: 'path1', type: 'proposition', domain: 'philosophy', title: 'Path Node 1' },
  { id: 'path2', type: 'proposition', domain: 'philosophy', title: 'Path Node 2' },
];

describe('useSalience', () => {
  const emptyEdges: Edge[] = [];

  it('computes salience 1.0 for selected node', () => {
    const neighbors = new Map<string, number>();
    const { result } = renderHook(() =>
      useSalience(mockNodes, 'selected', null, neighbors, emptyEdges)
    );

    expect(result.current.get('selected')).toBe(1.0);
  });

  it('computes salience for 1-hop neighbor', () => {
    const neighbors = new Map([['neighbor1', 1]]);
    const { result } = renderHook(() =>
      useSalience(mockNodes, 'selected', null, neighbors, emptyEdges)
    );

    const salience = result.current.get('neighbor1');
    // w_neighbor (0.5) × decay(1 hop) (1.0 - 0.4×1 = 0.6) = 0.3
    expect(salience).toBeCloseTo(0.3);
  });

  it('computes lower salience for 2-hop neighbor', () => {
    const neighbors = new Map([['neighbor2', 2]]);
    const { result } = renderHook(() =>
      useSalience(mockNodes, 'selected', null, neighbors, emptyEdges)
    );

    const salience = result.current.get('neighbor2');
    // w_neighbor (0.5) × decay(2 hop) (1.0 - 0.4×2 = 0.2) = 0.1
    expect(salience).toBeCloseTo(0.1);
  });

  it('gives background nodes zero salience', () => {
    const neighbors = new Map<string, number>();
    const { result } = renderHook(() =>
      useSalience(mockNodes, 'selected', null, neighbors, emptyEdges)
    );

    expect(result.current.get('background')).toBe(0.0);
  });

  it('computes high salience for path nodes', () => {
    const neighbors = new Map<string, number>();
    const path = ['path1', 'path2'];
    const { result } = renderHook(() => useSalience(mockNodes, null, path, neighbors, emptyEdges));

    expect(result.current.get('path1')).toBe(0.9); // w_path
    expect(result.current.get('path2')).toBe(0.9);
  });

  it('combines focus and path salience correctly', () => {
    const neighbors = new Map<string, number>();
    const path = ['selected', 'path1'];
    const { result } = renderHook(() =>
      useSalience(mockNodes, 'selected', path, neighbors, emptyEdges)
    );

    // w_focus (1.0) + w_path (0.9) = 1.9, clamped to 1.0
    expect(result.current.get('selected')).toBe(1.0);
  });

  it('combines all factors and clamps to 1.0', () => {
    const neighbors = new Map([['selected', 0]]); // 0-hop (self)
    const path = ['selected'];
    const { result } = renderHook(() =>
      useSalience(mockNodes, 'selected', path, neighbors, emptyEdges)
    );

    // Multiple factors should clamp to 1.0
    expect(result.current.get('selected')).toBe(1.0);
  });

  it('recomputes when selectedNodeId changes', () => {
    const neighbors = new Map<string, number>();
    const { result, rerender } = renderHook(
      ({ selected }) => useSalience(mockNodes, selected, null, neighbors, emptyEdges),
      { initialProps: { selected: 'selected' } }
    );

    expect(result.current.get('selected')).toBe(1.0);
    expect(result.current.get('neighbor1')).toBe(0.0);

    // Change selection
    rerender({ selected: 'neighbor1' });

    expect(result.current.get('selected')).toBe(0.0);
    expect(result.current.get('neighbor1')).toBe(1.0);
  });

  it('includes tension component when edges provided', () => {
    const neighbors = new Map<string, number>();
    const edges: Edge[] = [
      { f: 'a', t: 'selected', relation: 'supports', domain: 'phil', w: 1.0 },
      { f: 'b', t: 'selected', relation: 'attacks', domain: 'phil', w: 0.8 },
    ];
    const { result } = renderHook(() =>
      useSalience(mockNodes, 'selected', null, neighbors, edges)
    );

    // tension = sqrt(1.0 × 0.8) / 5.0 ≈ 0.179
    // salience = w_focus (1.0) + w_tension (0.6) × 0.179 ≈ 1.107, clamped to 1.0
    const salience = result.current.get('selected');
    expect(salience).toBe(1.0);
  });
});

describe('applySalienceToSize', () => {
  it('scales size from 0.5× to 2.0× based on salience', () => {
    const baseSize = 10;

    expect(applySalienceToSize(baseSize, 0.0)).toBe(5); // 10 × 0.5
    expect(applySalienceToSize(baseSize, 0.5)).toBe(12.5); // 10 × 1.25
    expect(applySalienceToSize(baseSize, 1.0)).toBe(20); // 10 × 2.0
  });
});

describe('applySalienceToOpacity', () => {
  it('scales opacity from 0.2 to 1.0', () => {
    expect(applySalienceToOpacity(0.0)).toBeCloseTo(0.2);
    expect(applySalienceToOpacity(0.5)).toBeCloseTo(0.6);
    expect(applySalienceToOpacity(1.0)).toBeCloseTo(1.0);
  });
});

describe('shouldShowLabel', () => {
  it('shows label when salience above threshold', () => {
    expect(shouldShowLabel(0.5, 0.4)).toBe(true);
    expect(shouldShowLabel(0.3, 0.4)).toBe(false);
  });

  it('uses default threshold of 0.4', () => {
    expect(shouldShowLabel(0.5)).toBe(true);
    expect(shouldShowLabel(0.3)).toBe(false);
  });
});

describe('computeTension (Gemini 3 Pro addition)', () => {
  const mockEdges: Edge[] = [
    { f: 'node1', t: 'target', relation: 'supports', domain: 'philosophy', w: 0.9 },
    { f: 'node2', t: 'target', relation: 'supports', domain: 'philosophy', w: 0.8 },
    { f: 'node3', t: 'target', relation: 'attacks', domain: 'philosophy', w: 0.7 },
    { f: 'node4', t: 'target', relation: 'attacks', domain: 'philosophy', w: 0.6 },
    { f: 'target', t: 'other', relation: 'supports', domain: 'philosophy', w: 0.5 }, // outgoing, should be ignored
  ];

  it('returns 0 tension for node with no incoming edges', () => {
    const tension = computeTension('isolated', mockEdges);
    expect(tension).toBe(0);
  });

  it('returns 0 tension for node with only supports', () => {
    const edges: Edge[] = [
      { f: 'a', t: 'node', relation: 'supports', domain: 'math', w: 0.9 },
      { f: 'b', t: 'node', relation: 'proves', domain: 'math', w: 1.0 },
    ];
    const tension = computeTension('node', edges);
    expect(tension).toBe(0);
  });

  it('returns 0 tension for node with only attacks', () => {
    const edges: Edge[] = [
      { f: 'a', t: 'node', relation: 'attacks', domain: 'phil', w: 0.8 },
      { f: 'b', t: 'node', relation: 'refutes', domain: 'phil', w: 0.9 },
    ];
    const tension = computeTension('node', edges);
    expect(tension).toBe(0);
  });

  it('computes tension when both supports and attacks present', () => {
    // supports: 0.9 + 0.8 = 1.7
    // attacks: 0.7 + 0.6 = 1.3
    // tension = sqrt(1.7 × 1.3) / 5.0 = sqrt(2.21) / 5.0 ≈ 0.297
    const tension = computeTension('target', mockEdges);
    expect(tension).toBeCloseTo(0.297, 2);
  });

  it('uses default weight 0.7 for edges without weight', () => {
    const edges: Edge[] = [
      { f: 'a', t: 'node', relation: 'supports', domain: 'phil' }, // no weight
      { f: 'b', t: 'node', relation: 'attacks', domain: 'phil' }, // no weight
    ];
    // supports: 0.7, attacks: 0.7
    // tension = sqrt(0.7 × 0.7) / 5.0 = 0.7 / 5.0 = 0.14
    const tension = computeTension('node', edges);
    expect(tension).toBeCloseTo(0.14, 2);
  });

  it('clamps tension to max 1.0', () => {
    const edges: Edge[] = [
      { f: 'a', t: 'node', relation: 'supports', domain: 'phil', w: 1.0 },
      { f: 'b', t: 'node', relation: 'supports', domain: 'phil', w: 1.0 },
      { f: 'c', t: 'node', relation: 'supports', domain: 'phil', w: 1.0 },
      { f: 'd', t: 'node', relation: 'supports', domain: 'phil', w: 1.0 },
      { f: 'e', t: 'node', relation: 'supports', domain: 'phil', w: 1.0 },
      { f: 'f', t: 'node', relation: 'attacks', domain: 'phil', w: 1.0 },
      { f: 'g', t: 'node', relation: 'attacks', domain: 'phil', w: 1.0 },
      { f: 'h', t: 'node', relation: 'attacks', domain: 'phil', w: 1.0 },
      { f: 'i', t: 'node', relation: 'attacks', domain: 'phil', w: 1.0 },
      { f: 'j', t: 'node', relation: 'attacks', domain: 'phil', w: 1.0 },
    ];
    // supports: 5.0, attacks: 5.0
    // tension = sqrt(5 × 5) / 5.0 = 5 / 5 = 1.0
    const tension = computeTension('node', edges);
    expect(tension).toBe(1.0);
  });

  it('considers proves and entails as support relations', () => {
    const edges: Edge[] = [
      { f: 'a', t: 'node', relation: 'proves', domain: 'math', w: 1.0 },
      { f: 'b', t: 'node', relation: 'entails', domain: 'phil', w: 0.9 },
      { f: 'c', t: 'node', relation: 'attacks', domain: 'phil', w: 0.8 },
    ];
    // supports: 1.0 + 0.9 = 1.9
    // attacks: 0.8
    // tension = sqrt(1.9 × 0.8) / 5.0 ≈ 0.246
    const tension = computeTension('node', edges);
    expect(tension).toBeCloseTo(0.246, 2);
  });

  it('considers refutes as attack relation', () => {
    const edges: Edge[] = [
      { f: 'a', t: 'node', relation: 'supports', domain: 'phil', w: 1.0 },
      { f: 'b', t: 'node', relation: 'refutes', domain: 'phil', w: 0.95 },
    ];
    // supports: 1.0
    // attacks: 0.95
    // tension = sqrt(1.0 × 0.95) / 5.0 ≈ 0.195
    const tension = computeTension('node', edges);
    expect(tension).toBeCloseTo(0.195, 2);
  });

  it('returns high tension for heavily contested node (Axiom of Choice)', () => {
    const edges: Edge[] = [
      // Heavy support
      { f: 'zfc1', t: 'ax_choice', relation: 'supports', domain: 'math', w: 0.95 },
      { f: 'zfc2', t: 'ax_choice', relation: 'supports', domain: 'math', w: 0.9 },
      { f: 'zfc3', t: 'ax_choice', relation: 'supports', domain: 'math', w: 0.85 },
      // Moderate attacks
      { f: 'constructivist1', t: 'ax_choice', relation: 'attacks', domain: 'math', w: 0.7 },
      { f: 'constructivist2', t: 'ax_choice', relation: 'attacks', domain: 'math', w: 0.6 },
    ];
    // supports: 0.95 + 0.9 + 0.85 = 2.7
    // attacks: 0.7 + 0.6 = 1.3
    // tension = sqrt(2.7 × 1.3) / 5.0 ≈ 0.375
    const tension = computeTension('ax_choice', edges);
    expect(tension).toBeGreaterThan(0.3); // Should be in "moderate controversy" range
    expect(tension).toBeCloseTo(0.375, 2);
  });
});
