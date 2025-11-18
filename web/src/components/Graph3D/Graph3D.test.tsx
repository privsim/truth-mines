import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Graph3D } from './index';

describe('Graph3D', () => {
  it('renders canvas', () => {
    const mockBuffers = {
      nodes: new Uint8Array(48),
      edges: new Uint8Array(40),
    };

    render(<Graph3D buffers={mockBuffers} />);
    expect(screen.getByRole('img', { name: /3d graph/i })).toBeInTheDocument();
  });

  it('handles null buffers', () => {
    render(<Graph3D buffers={null} />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('accepts onNodeSelect callback', () => {
    const mockBuffers = {
      nodes: new Uint8Array(48),
      edges: new Uint8Array(40),
    };
    const onNodeSelect = vi.fn();

    render(<Graph3D buffers={mockBuffers} onNodeSelect={onNodeSelect} />);
    expect(onNodeSelect).not.toHaveBeenCalled();
  });
});
