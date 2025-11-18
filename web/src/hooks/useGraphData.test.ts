import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useGraphData } from './useGraphData';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useGraphData', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('loads manifest and graph summary successfully', async () => {
    const mockManifest = {
      version: '1.0.0',
      generated: '2025-01-01T00:00:00Z',
      nodes: { test01: { file: 'nodes/test01.json', domain: 'philosophy', type: 'proposition' } },
      stats: { total_nodes: 1, by_domain: {}, by_type: {} },
    };

    const mockGraph = [{ id: 'test01', type: 'proposition', domain: 'philosophy', title: 'Test' }];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockManifest,
    });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockGraph,
    });

    const { result } = renderHook(() => useGraphData());

    expect(result.current.loading).toBe(true);
    expect(result.current.manifest).toBe(null);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.manifest).toEqual(mockManifest);
    expect(result.current.graphSummary).toEqual(mockGraph);
    expect(result.current.error).toBe(null);
  });

  it('handles fetch errors', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useGraphData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Network error');
    expect(result.current.manifest).toBe(null);
  });

  it('handles HTTP errors', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
    });

    const { result } = renderHook(() => useGraphData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
  });
});
