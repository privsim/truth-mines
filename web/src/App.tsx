import { useState, useMemo } from 'react';
import { useGraphData } from './hooks/useGraphData';
import { useEdges } from './hooks/useEdges';
import { useFocusPath } from './hooks/useFocusPath';
import { Graph2D } from './components/Graph2D';
import { NodeDetail } from './components/NodeDetail';
import { Filters, type FilterState } from './components/Filters';
import { Search } from './components/Search';
import './App.css';

type ViewMode = '2d' | '3d';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('2d');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    domains: new Set(['philosophy', 'mathematics', 'physics']),
    types: new Set(['proposition', 'theorem', 'theory', 'axiom']),
  });
  const [searchResults, setSearchResults] = useState<string[]>([]);

  const { graphSummary, loading, error } = useGraphData();
  const { edges } = useEdges();

  // Compute focus path for selected node (Gemini: strongest path algorithm)
  const focusPathResult = useFocusPath(selectedNodeId, edges);

  // Filter nodes based on domain/type filters and search results
  const filteredNodes = useMemo(() => {
    if (!graphSummary) return [];

    let filtered = graphSummary.filter(
      (node) => filters.domains.has(node.domain) && filters.types.has(node.type)
    );

    // Apply search filter if active
    if (searchResults.length > 0) {
      const searchSet = new Set(searchResults);
      filtered = filtered.filter((node) => searchSet.has(node.id));
    }

    return filtered;
  }, [graphSummary, filters, searchResults]);

  if (loading) {
    return (
      <div className="app-loading">
        <p>Loading graph data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-error">
        <p>Error loading graph: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Truth Mines</h1>

        <div className="header-controls">
          <Search nodes={graphSummary || []} onResults={setSearchResults} />

          <div className="view-toggle">
            <button
              onClick={() => setViewMode('2d')}
              className={viewMode === '2d' ? 'active' : ''}
            >
              2D View
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={viewMode === '3d' ? 'active' : ''}
            >
              3D View
            </button>
          </div>
        </div>
      </header>

      <div className="app-body">
        <aside className="app-sidebar">
          <Filters onChange={setFilters} />
          <div className="stats">
            <p>
              Showing {filteredNodes.length} of {graphSummary?.length || 0} nodes
            </p>
          </div>
        </aside>

        <main className="app-main">
          {viewMode === '2d' ? (
            <Graph2D
              nodes={filteredNodes}
              selectedNodeId={selectedNodeId}
              focusPath={focusPathResult?.path || null}
              onNodeSelect={setSelectedNodeId}
            />
          ) : (
            <div className="graph-3d-placeholder">
              <p>3D Truth Mine View</p>
              <p className="placeholder-text">(WebGPU integration - Epic 4)</p>
            </div>
          )}
        </main>

        {selectedNodeId && (
          <NodeDetail
            nodeId={selectedNodeId}
            focusPathResult={focusPathResult}
            edges={edges}
            onClose={() => setSelectedNodeId(null)}
            onNavigate={setSelectedNodeId}
          />
        )}
      </div>
    </div>
  );
}

export default App;
