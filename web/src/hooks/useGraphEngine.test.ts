import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGraphEngine } from './useGraphEngine';

describe('useGraphEngine', () => {
  it('initializes with null buffers', () => {
    const { result } = renderHook(() => useGraphEngine());

    expect(result.current.buffers).toBe(null);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('provides loadGraph function', () => {
    const { result } = renderHook(() => useGraphEngine());

    expect(typeof result.current.loadGraph).toBe('function');
  });

  it('provides computeLayout function', () => {
    const { result } = renderHook(() => useGraphEngine());

    expect(typeof result.current.computeLayout).toBe('function');
  });
});
