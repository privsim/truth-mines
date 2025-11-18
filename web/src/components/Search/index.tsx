import { useState, useCallback, useEffect } from 'react';
import type { GraphSummary } from '../../types/graph';
import './Search.css';

interface SearchProps {
  nodes: GraphSummary;
  onResults: (matchingIds: string[]) => void;
}

export function Search({ nodes, onResults }: SearchProps) {
  const [query, setQuery] = useState('');

  const performSearch = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) {
        onResults([]);
        return;
      }

      const lowerQuery = searchQuery.toLowerCase();
      const matches = nodes
        .filter(
          (node) =>
            node.title.toLowerCase().includes(lowerQuery) ||
            node.id.toLowerCase().includes(lowerQuery) ||
            node.domain.toLowerCase().includes(lowerQuery) ||
            node.type.toLowerCase().includes(lowerQuery)
        )
        .map((node) => node.id);

      onResults(matches);
    },
    [nodes, onResults]
  );

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, performSearch]);

  const handleClear = () => {
    setQuery('');
    onResults([]);
  };

  return (
    <div className="search">
      <input
        type="text"
        placeholder="Search nodes..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="search-input"
        aria-label="Search nodes"
      />
      {query && (
        <button onClick={handleClear} className="search-clear" aria-label="Clear search">
          ×
        </button>
      )}
    </div>
  );
}
