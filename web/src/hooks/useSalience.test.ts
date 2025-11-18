import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  useSalience,
  applySalienceToSize,
  applySalienceToOpacity,
  shouldShowLabel,
} from './useSalience';
import type { GraphSummary } from '../types/graph';

const mockNodes: GraphSummary = [
  { id: 'selected', type: 'proposition', domain: 'philosophy', title: 'Selected Node' },
  { id: 'neighbor1', type: 'proposition', domain: 'philosophy', title: 'Neighbor 1-hop' },
  { id: 'neighbor2', type: 'proposition', domain: 'mathematics', title: 'Neighbor 2-hop' },
  { id: 'background', type: 'theorem', domain: 'physics', title: 'Background Node' },
  { id: 'path1', type: 'proposition', domain: 'philosophy', title: 'Path Node 1' },
  { id: 'path2', type: 'proposition', domain: 'philosophy', title: 'Path Node 2' },
];

describe('useSalience', () => {
  it('computes salience 1.0 for selected node', () => {
    const neighbors = new Map<string, number>();
    const { result } = renderHook(() =>
      useSalience(mockNodes, 'selected', null, neighbors)
    );

    expect(result.current.get('selected')).toBe(1.0);
  });

  it('computes salience for 1-hop neighbor', () => {
    const neighbors = new Map([['neighbor1', 1]]);
    const { result } = renderHook(() =>
      useSalience(mockNodes, 'selected', null, neighbors)
    );

    const salience = result.current.get('neighbor1');
    // w_neighbor (0.5) × decay(1 hop) (1.0 - 0.4×1 = 0.6) = 0.3
    expect(salience).toBeCloseTo(0.3);
  });

  it('computes lower salience for 2-hop neighbor', () => {
    const neighbors = new Map([['neighbor2', 2]]);
    const { result } = renderHook(() =>
      useSalience(mockNodes, 'selected', null, neighbors)
    );

    const salience = result.current.get('neighbor2');
    // w_neighbor (0.5) × decay(2 hop) (1.0 - 0.4×2 = 0.2) = 0.1
    expect(salience).toBeCloseTo(0.1);
  });

  it('gives background nodes zero salience', () => {
    const neighbors = new Map<string, number>();
    const { result } = renderHook(() =>
      useSalience(mockNodes, 'selected', null, neighbors)
    );

    expect(result.current.get('background')).toBe(0.0);
  });

  it('computes high salience for path nodes', () => {
    const neighbors = new Map<string, number>();
    const path = ['path1', 'path2'];
    const { result } = renderHook(() => useSalience(mockNodes, null, path, neighbors));

    expect(result.current.get('path1')).toBe(0.9); // w_path
    expect(result.current.get('path2')).toBe(0.9);
  });

  it('combines focus and path salience correctly', () => {
    const neighbors = new Map<string, number>();
    const path = ['selected', 'path1'];
    const { result } = renderHook(() =>
      useSalience(mockNodes, 'selected', path, neighbors)
    );

    // w_focus (1.0) + w_path (0.9) = 1.9, clamped to 1.0
    expect(result.current.get('selected')).toBe(1.0);
  });

  it('combines all factors and clamps to 1.0', () => {
    const neighbors = new Map([['selected', 0]]); // 0-hop (self)
    const path = ['selected'];
    const { result } = renderHook(() =>
      useSalience(mockNodes, 'selected', path, neighbors)
    );

    // Multiple factors should clamp to 1.0
    expect(result.current.get('selected')).toBe(1.0);
  });

  it('recomputes when selectedNodeId changes', () => {
    const neighbors = new Map<string, number>();
    const { result, rerender } = renderHook(
      ({ selected }) => useSalience(mockNodes, selected, null, neighbors),
      { initialProps: { selected: 'selected' } }
    );

    expect(result.current.get('selected')).toBe(1.0);
    expect(result.current.get('neighbor1')).toBe(0.0);

    // Change selection
    rerender({ selected: 'neighbor1' });

    expect(result.current.get('selected')).toBe(0.0);
    expect(result.current.get('neighbor1')).toBe(1.0);
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
