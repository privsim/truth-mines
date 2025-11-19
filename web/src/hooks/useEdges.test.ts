import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useEdges } from './useEdges';

// Mock fetch
global.fetch = vi.fn();

describe('useEdges', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads and parses edges from TOON file', async () => {
    const mockToon = `supports[2]{f,t,w,domain}:
abc123,def456,0.9,philosophy
xyz789,uvw012,0.8,mathematics`;

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(mockToon),
    } as Response);

    const { result } = renderHook(() => useEdges());

    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.edges).toEqual([]);

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.edges).toHaveLength(2);
    expect(result.current.edges[0]).toEqual({
      f: 'abc123',
      t: 'def456',
      relation: 'supports',
      w: 0.9,
      domain: 'philosophy',
    });
    expect(result.current.error).toBeNull();
  });

  it('handles fetch error gracefully', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Network error')
    );

    const { result } = renderHook(() => useEdges());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.edges).toEqual([]);
    expect(result.current.error).toContain('Network error');
  });

  it('handles 404 response', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    } as Response);

    const { result } = renderHook(() => useEdges());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.edges).toEqual([]);
    expect(result.current.error).toContain('404');
  });

  it('caches parsed edges (does not re-fetch on re-render)', async () => {
    const mockToon = `supports[1]{f,t,w,domain}:
abc123,def456,0.9,philosophy`;

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(mockToon),
    } as Response);

    const { result, rerender } = renderHook(() => useEdges());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const firstEdges = result.current.edges;
    expect(firstEdges).toHaveLength(1);

    // Rerender (should use cached data)
    rerender();

    expect(result.current.edges).toBe(firstEdges); // Same reference
    expect(global.fetch).toHaveBeenCalledTimes(1); // Only called once
  });
});
