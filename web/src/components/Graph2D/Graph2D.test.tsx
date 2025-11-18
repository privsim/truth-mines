import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Graph2D } from './index';

const mockNodes = [
  { id: 'abc123', type: 'proposition', domain: 'philosophy', title: 'Test 1' },
  { id: 'def456', type: 'theorem', domain: 'mathematics', title: 'Test 2' },
];

describe('Graph2D', () => {
  it('renders canvas element', () => {
    render(<Graph2D nodes={mockNodes} />);
    const canvas = screen.getByRole('img', { name: /2d graph/i });
    expect(canvas).toBeInTheDocument();
  });

  it('renders with empty nodes', () => {
    render(<Graph2D nodes={[]} />);
    const canvas = screen.getByRole('img');
    expect(canvas).toBeInTheDocument();
  });

  it('accepts onNodeSelect callback', () => {
    const onNodeSelect = vi.fn();
    render(<Graph2D nodes={mockNodes} onNodeSelect={onNodeSelect} />);
    // Callback registered (will be called when cosmos.gl integrated)
    expect(onNodeSelect).not.toHaveBeenCalled();
  });
});
