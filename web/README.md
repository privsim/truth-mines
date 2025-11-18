# Truth Mines Web Application

React + TypeScript + Vite frontend for Truth Mines knowledge graph visualization.

## Setup

```bash
# Install dependencies
npm install

# Copy graph data from project root (required for dev server)
bash scripts/copy-graph-data.sh

# OR manually from project root:
# cp -r dist web/public/
# cp -r nodes web/public/

# Run development server
npm run dev
# Opens at http://localhost:3000

# Build for production
npm run build

# Preview production build
npm run preview
```

**Important:** The dev server needs graph data in `web/public/`. Run the copy script after:
- Building new graph artifacts (`python scripts/build_index.py`, etc.)
- Adding/modifying nodes in the main `nodes/` directory
- Any changes to the knowledge graph

## Testing

```bash
# Run unit tests (Vitest)
npm test

# Run E2E tests (Playwright)
npm run test:e2e

# Type check
npm run type-check

# Lint
npm run lint
```

## Architecture

- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite 5
- **Testing:** Vitest (unit) + Playwright (E2E)
- **Linting:** ESLint + Prettier
- **2D Visualization:** cosmos.gl (to be integrated)
- **3D Visualization:** WebGPU (to be integrated)

## Structure

```
src/
├── components/        # React components
│   ├── Graph2D/       # 2D overview
│   ├── Graph3D/       # 3D truth mine
│   ├── NodeDetail/    # Node details panel
│   ├── Filters/       # Domain/type filters
│   └── Search/        # Search component
├── hooks/             # Custom React hooks
│   ├── useGraphData.ts
│   └── useGraphEngine.ts
├── types/             # TypeScript definitions
│   └── graph.ts
├── utils/             # Utility functions
├── App.tsx            # Main app component
└── main.tsx           # Entry point
```

## Development

### Code Style

- **Formatting:** Prettier (2 spaces, single quotes, trailing commas)
- **Linting:** ESLint with TypeScript strict rules
- **Type Safety:** Strict mode, no `any` types

### Testing Requirements

- **Coverage Target:** 80%+ for components
- **Test Files:** Colocated (Component.test.tsx)
- **E2E:** Playwright for critical user flows

### TDD Workflow

1. Write failing test
2. Implement minimal code to pass
3. Refactor while keeping tests green
4. Maintain 80%+ coverage

See [ADR 001](../docs/ADRs/001-strict-tdd-workflow.md) for details.

## Integration with Rust Engine

The web app loads the WASM engine from `../engine/pkg/`:

```typescript
import init, { GraphEngine } from '../engine/pkg';

await init();
const engine = new GraphEngine(styleConfig);
engine.load_nodes_json(nodesJson);
engine.load_edges_toon(edgesToon);
engine.compute_layout_truth_mine();

const buffers = engine.get_gpu_buffers();
// buffers.nodes: Uint8Array
// buffers.edges: Uint8Array
```

## Components (To Be Implemented)

- [ ] Graph2D - 2D force-directed graph with cosmos.gl
- [ ] Graph3D - 3D truth mine with WebGPU
- [ ] NodeDetail - Panel showing node details
- [ ] JustificationTree - Support paths visualization
- [ ] AttacksView - Counterarguments panel
- [ ] CrossDomainLinks - Bridge connections
- [ ] Filters - Domain and type filters
- [ ] Search - Node search by title/id/tags

## Performance Targets

- Initial load: < 2s
- 60fps rendering: 1000+ visible nodes
- Smooth interactions: < 16ms response
- Bundle size: < 500KB (gzipped)
