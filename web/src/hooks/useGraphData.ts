import { useState, useEffect } from 'react';
import type { Manifest, GraphSummary } from '../types/graph';

interface UseGraphDataReturn {
  manifest: Manifest | null;
  graphSummary: GraphSummary | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to load graph manifest and summary data
 *
 * Fetches dist/manifest.json and dist/graph.json
 */
export function useGraphData(): UseGraphDataReturn {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [graphSummary, setGraphSummary] = useState<GraphSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        const [manifestRes, graphRes] = await Promise.all([
          fetch('/dist/manifest.json'),
          fetch('/dist/graph.json'),
        ]);

        if (!manifestRes.ok || !graphRes.ok) {
          throw new Error('Failed to load graph data');
        }

        const manifestData = await manifestRes.json();
        const graphData = await graphRes.json();

        setManifest(manifestData);
        setGraphSummary(graphData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return { manifest, graphSummary, loading, error };
}
