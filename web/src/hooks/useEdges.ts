import { useState, useEffect } from 'react';
import { parseToon } from '../utils/toonParser';
import type { Edge } from '../types/graph';

interface UseEdgesResult {
  edges: Edge[];
  loading: boolean;
  error: string | null;
}

/**
 * Load and parse edges from TOON format
 *
 * Fetches /dist/edges.toon and parses into Edge[] array.
 * Result is cached (only loads once per mount).
 */
export function useEdges(): UseEdgesResult {
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadEdges() {
      try {
        const response = await fetch('/dist/edges.toon');

        if (!response.ok) {
          throw new Error(`Failed to load edges: ${response.status} ${response.statusText}`);
        }

        const toonContent = await response.text();
        const parsedEdges = parseToon(toonContent);

        if (!cancelled) {
          setEdges(parsedEdges);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error loading edges');
          setLoading(false);
        }
      }
    }

    loadEdges();

    return () => {
      cancelled = true;
    };
  }, []); // Empty deps - load once

  return { edges, loading, error };
}
