import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { NodeTooltip } from './index';
import type { Node } from '../../types/graph';

const mockNode: Node = {
  id: 'test01',
  type: 'proposition',
  domain: 'philosophy',
  title: 'Knowledge requires safety',
  content:
    'For S to know that p, S\'s belief in p must be safe: in nearby possible worlds where S believes p, p is true. This is a longer explanation that will be truncated.',
};

const mockPosition = { x: 100, y: 100 };

describe('NodeTooltip', () => {
  it('does not render initially when node is null', () => {
    const { container } = render(<NodeTooltip node={null} position={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('displays node title after delay', async () => {
    render(<NodeTooltip node={mockNode} position={mockPosition} />);

    await waitFor(
      () => {
        expect(screen.getByText('Knowledge requires safety')).toBeInTheDocument();
      },
      { timeout: 500 }
    );
  });

  it('displays type and domain badge', async () => {
    render(<NodeTooltip node={mockNode} position={mockPosition} />);

    await waitFor(() => {
      expect(screen.getByText(/proposition • philosophy/i)).toBeInTheDocument();
    });
  });

  it('truncates long content with ellipsis', async () => {
    render(<NodeTooltip node={mockNode} position={mockPosition} />);

    await waitFor(() => {
      const content = screen.getByText(/For S to know that p/);
      // Should be truncated
      expect(content.textContent).toMatch(/…$/);
      expect(content.textContent!.length).toBeLessThanOrEqual(121);
    });
  });

  it('handles node without content', async () => {
    const nodeWithoutContent: Node = {
      ...mockNode,
      content: undefined,
    };

    render(<NodeTooltip node={nodeWithoutContent} position={mockPosition} />);

    await waitFor(() => {
      expect(screen.getByText('Knowledge requires safety')).toBeInTheDocument();
    });
    // Should not show content section
    expect(screen.queryByText(/For S to know/)).not.toBeInTheDocument();
  });
});
