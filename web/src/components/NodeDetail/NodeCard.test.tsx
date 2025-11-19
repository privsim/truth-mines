import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NodeCard } from './NodeCard';

describe('NodeCard', () => {
  const mockNode = {
    id: 'abc123',
    type: 'theorem',
    domain: 'mathematics',
    title: 'Pythagorean Theorem',
  };

  it('renders node title and metadata', () => {
    render(<NodeCard node={mockNode} onClick={() => {}} />);

    expect(screen.getByText('Pythagorean Theorem')).toBeInTheDocument();
    expect(screen.getByText('theorem')).toBeInTheDocument();
    expect(screen.getByText('mathematics')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<NodeCard node={mockNode} onClick={handleClick} />);

    const card = screen.getByRole('button');
    fireEvent.click(card);

    expect(handleClick).toHaveBeenCalledWith('abc123');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows depth badge when depth provided', () => {
    render(<NodeCard node={mockNode} depth={3} onClick={() => {}} />);

    expect(screen.getByText('Depth 3')).toBeInTheDocument();
  });

  it('displays icon for axiom type', () => {
    const axiomNode = { ...mockNode, type: 'axiom' };
    const { container } = render(<NodeCard node={axiomNode} onClick={() => {}} />);

    // Icon should be present in the card
    const icon = container.querySelector('.node-icon');
    expect(icon).toBeInTheDocument();
    expect(icon?.textContent).toBe('🏛️');
  });

  it('applies domain-based border color', () => {
    const { container } = render(<NodeCard node={mockNode} onClick={() => {}} />);

    const card = container.querySelector('.node-card');
    expect(card).toHaveClass('domain-mathematics');
  });

  it('applies refuted styling when status is refuted', () => {
    const refutedNode = { ...mockNode, status: 'refuted' };
    const { container } = render(<NodeCard node={refutedNode} onClick={() => {}} />);

    const card = container.querySelector('.node-card');
    expect(card).toHaveClass('status-refuted');
  });
});
