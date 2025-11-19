import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useNeighbors } from './useNeighbors';
import type { Edge } from '../types/graph';

describe('useNeighbors', () => {
  const mockEdges: Edge[] = [
    { f: 'a', t: 'b', relation: 'supports', domain: 'phil' },
    { f: 'b', t: 'c', relation: 'supports', domain: 'phil' },
    { f: 'c', t: 'd', relation: 'proves', domain: 'math' },
    { f: 'a', t: 'e', relation: 'attacks', domain: 'phil' },
    { f: 'e', t: 'f', relation: 'refutes', domain: 'phil' },
  ];

  it('returns empty map when no node selected', () => {
    const { result } = renderHook(() => useNeighbors(null, mockEdges));
    expect(result.current.size).toBe(0);
  });

  it('returns selected node at 0-hop', () => {
    const { result } = renderHook(() => useNeighbors('a', mockEdges));

    expect(result.current.get('a')).toBe(0);
  });

  it('finds 1-hop neighbors (direct connections)', () => {
    const { result } = renderHook(() => useNeighbors('a', mockEdges));

    expect(result.current.get('a')).toBe(0);
    expect(result.current.get('b')).toBe(1); // a -> b
    expect(result.current.get('e')).toBe(1); // a -> e
  });

  it('finds 2-hop neighbors', () => {
    const { result } = renderHook(() => useNeighbors('a', mockEdges));

    expect(result.current.get('c')).toBe(2); // a -> b -> c
    expect(result.current.get('f')).toBe(2); // a -> e -> f
  });

  it('finds 3-hop neighbors', () => {
    const { result } = renderHook(() => useNeighbors('a', mockEdges));

    expect(result.current.get('d')).toBe(3); // a -> b -> c -> d
  });

  it('handles bidirectional edges (undirected traversal)', () => {
    const edges: Edge[] = [
      { f: 'a', t: 'b', relation: 'equivalent', domain: 'math' },
      { f: 'b', t: 'c', relation: 'supports', domain: 'math' },
    ];

    const { result } = renderHook(() => useNeighbors('c', edges));

    // Should traverse backwards: c -> b (1-hop), b -> a (2-hop)
    expect(result.current.get('c')).toBe(0);
    expect(result.current.get('b')).toBe(1);
    expect(result.current.get('a')).toBe(2);
  });

  it('limits to maxHops (default 3)', () => {
    const edges: Edge[] = [
      { f: 'a', t: 'b', relation: 'supports', domain: 'phil' },
      { f: 'b', t: 'c', relation: 'supports', domain: 'phil' },
      { f: 'c', t: 'd', relation: 'supports', domain: 'phil' },
      { f: 'd', t: 'e', relation: 'supports', domain: 'phil' }, // 4-hop
    ];

    const { result } = renderHook(() => useNeighbors('a', edges));

    expect(result.current.get('a')).toBe(0);
    expect(result.current.get('b')).toBe(1);
    expect(result.current.get('c')).toBe(2);
    expect(result.current.get('d')).toBe(3);
    expect(result.current.has('e')).toBe(false); // Beyond maxHops
  });

  it('respects custom maxHops parameter', () => {
    const edges: Edge[] = [
      { f: 'a', t: 'b', relation: 'supports', domain: 'phil' },
      { f: 'b', t: 'c', relation: 'supports', domain: 'phil' },
    ];

    const { result } = renderHook(() => useNeighbors('a', edges, 1));

    expect(result.current.get('a')).toBe(0);
    expect(result.current.get('b')).toBe(1);
    expect(result.current.has('c')).toBe(false); // Beyond maxHops=1
  });

  it('handles disconnected nodes', () => {
    const edges: Edge[] = [
      { f: 'a', t: 'b', relation: 'supports', domain: 'phil' },
      { f: 'x', t: 'y', relation: 'supports', domain: 'phil' }, // Separate component
    ];

    const { result } = renderHook(() => useNeighbors('a', edges));

    expect(result.current.get('a')).toBe(0);
    expect(result.current.get('b')).toBe(1);
    expect(result.current.has('x')).toBe(false);
    expect(result.current.has('y')).toBe(false);
  });

  it('handles cycles correctly', () => {
    const edges: Edge[] = [
      { f: 'a', t: 'b', relation: 'supports', domain: 'phil' },
      { f: 'b', t: 'c', relation: 'supports', domain: 'phil' },
      { f: 'c', t: 'a', relation: 'supports', domain: 'phil' }, // Cycle back
    ];

    const { result } = renderHook(() => useNeighbors('a', edges));

    // Should visit each node once at shortest distance
    // With undirected traversal: a at 0, b at 1 (a→b), c at 1 (a←c backwards)
    expect(result.current.get('a')).toBe(0);
    expect(result.current.get('b')).toBe(1); // a → b (forward)
    expect(result.current.get('c')).toBe(1); // c → a (backward from a's perspective)
  });
});
