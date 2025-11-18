import { useState } from 'react';
import './App.css';

type ViewMode = '2d' | '3d';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('2d');

  return (
    <div className="app">
      <header className="app-header">
        <h1>Truth Mines</h1>
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
      </header>

      <main className="app-main">
        {viewMode === '2d' ? (
          <div className="graph-2d-placeholder">
            <p>2D Graph View (To be implemented)</p>
          </div>
        ) : (
          <div className="graph-3d-placeholder">
            <p>3D Truth Mine View (To be implemented)</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
