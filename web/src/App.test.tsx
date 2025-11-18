import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockManifest = {
  version: '1.0.0',
  generated: '2025-01-01T00:00:00Z',
  nodes: {
    abc123: { file: 'nodes/abc123.json', domain: 'philosophy', type: 'proposition' },
    def456: { file: 'nodes/def456.json', domain: 'mathematics', type: 'theorem' },
  },
  stats: {
    total_nodes: 2,
    by_domain: { philosophy: 1, mathematics: 1 },
    by_type: { proposition: 1, theorem: 1 },
  },
};

const mockGraph = [
  { id: 'abc123', type: 'proposition', domain: 'philosophy', title: 'Test Philosophy' },
  { id: 'def456', type: 'theorem', domain: 'mathematics', title: 'Test Math' },
];

describe('App', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('manifest.json')) {
        return Promise.resolve({ ok: true, json: async () => mockManifest });
      }
      if (url.includes('graph.json')) {
        return Promise.resolve({ ok: true, json: async () => mockGraph });
      }
      return Promise.resolve({ ok: false, status: 404 });
    });
  });

  it('renders header with title', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Truth Mines')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    render(<App />);
    expect(screen.getByText(/loading graph data/i)).toBeInTheDocument();
  });

  it('loads and displays graph data', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/showing 2 of 2 nodes/i)).toBeInTheDocument();
    });
  });

  it('renders all UI components after load', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Truth Mines')).toBeInTheDocument();
    });

    // Header controls
    expect(screen.getByText('2D View')).toBeInTheDocument();
    expect(screen.getByText('3D View')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search nodes/i)).toBeInTheDocument();

    // Sidebar filters
    expect(screen.getByLabelText(/philosophy/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mathematics/i)).toBeInTheDocument();

    // Graph canvas
    expect(screen.getByRole('img', { name: /2d graph/i })).toBeInTheDocument();

    // Stats
    expect(screen.getByText(/showing 2 of 2 nodes/i)).toBeInTheDocument();
  });

  it('filters nodes by domain', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/showing 2 of 2 nodes/i)).toBeInTheDocument();
    });

    const philCheckbox = screen.getByLabelText(/philosophy/i);
    await user.click(philCheckbox);

    await waitFor(() => {
      expect(screen.getByText(/showing 1 of 2 nodes/i)).toBeInTheDocument();
    });
  });

  it('toggles between 2D and 3D views', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('img', { name: /2d graph/i })).toBeInTheDocument();
    });

    const button3D = screen.getByText('3D View');
    await user.click(button3D);

    expect(screen.getByText(/3D Truth Mine View/i)).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: /2d graph/i })).not.toBeInTheDocument();
  });

  it('handles fetch errors gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/error loading graph/i)).toBeInTheDocument();
    });
  });
});
