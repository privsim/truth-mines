import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EdgeLabel } from './EdgeLabel';

describe('EdgeLabel', () => {
  it('displays relation type and weight', () => {
    render(<EdgeLabel relation="supports" weight={0.9} />);

    expect(screen.getByText(/supports/i)).toBeInTheDocument();
    expect(screen.getByText(/0.9/)).toBeInTheDocument();
  });

  it('uses default weight 0.7 when not provided', () => {
    render(<EdgeLabel relation="proves" />);

    expect(screen.getByText(/0.7/)).toBeInTheDocument();
  });

  it('shows deductive indicator for proves/entails', () => {
    const { container } = render(<EdgeLabel relation="proves" weight={1.0} />);

    // Should show solid line indicator
    const indicator = container.querySelector('.edge-deductive');
    expect(indicator).toBeInTheDocument();
  });

  it('shows inductive indicator for supports/predicts', () => {
    const { container } = render(<EdgeLabel relation="supports" weight={0.8} />);

    // Should show dashed line indicator
    const indicator = container.querySelector('.edge-inductive');
    expect(indicator).toBeInTheDocument();
  });

  it('displays metadata when provided', () => {
    const metadata = { axiom_system: 'ZFC', condition: 'v << c' };
    render(<EdgeLabel relation="proves" weight={1.0} metadata={metadata} />);

    expect(screen.getByText(/ZFC/)).toBeInTheDocument();
    expect(screen.getByText(/v << c/)).toBeInTheDocument();
  });

  it('applies color based on relation type', () => {
    const { container } = render(<EdgeLabel relation="attacks" weight={0.95} />);

    const label = container.querySelector('.edge-label');
    expect(label).toHaveClass('relation-attacks');
  });
});
