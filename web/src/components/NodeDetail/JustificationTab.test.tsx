import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { JustificationTab } from './JustificationTab';
import type { FocusPathResult } from '../../hooks/useFocusPath';

describe('JustificationTab', () => {
  const mockEdges = [
    { f: 'foundation', t: 'middle', relation: 'proves', domain: 'math', w: 1.0 },
    { f: 'middle', t: 'target', relation: 'supports', domain: 'phil', w: 0.8 },
  ];

  const mockPathResult: FocusPathResult = {
    path: ['foundation', 'middle', 'target'],
    pathWeight: 0.8,
    pathType: 'mixed',
    isCoherentist: false,
    entryPoint: null,
  };

  it('renders empty state when no path', () => {
    render(<JustificationTab pathResult={null} edges={[]} onNavigate={() => {}} />);

    expect(screen.getByText(/no foundational path/i)).toBeInTheDocument();
  });

  it('renders path nodes with NodeCard components', () => {
    render(<JustificationTab pathResult={mockPathResult} edges={mockEdges} onNavigate={() => {}} />);

    // Should render 3 nodes (foundation, middle, target)
    const cards = screen.getAllByRole('button');
    expect(cards.length).toBeGreaterThanOrEqual(3);
  });

  it('renders edge labels between nodes', () => {
    render(<JustificationTab pathResult={mockPathResult} edges={mockEdges} onNavigate={() => {}} />);

    // Should show edge between foundation → middle
    expect(screen.getByText(/proves/i)).toBeInTheDocument();
    expect(screen.getByText(/supports/i)).toBeInTheDocument();
  });

  it('displays path statistics (weight, type, length)', () => {
    render(<JustificationTab pathResult={mockPathResult} edges={mockEdges} onNavigate={() => {}} />);

    expect(screen.getByText(/path.*strength.*0.8/i)).toBeInTheDocument();
    expect(screen.getByText(/mixed/i)).toBeInTheDocument();
  });

  it('calls onNavigate when node card clicked', () => {
    const handleNavigate = vi.fn();
    render(<JustificationTab pathResult={mockPathResult} edges={mockEdges} onNavigate={handleNavigate} />);

    const cards = screen.getAllByRole('button');
    fireEvent.click(cards[0]); // Click first node

    expect(handleNavigate).toHaveBeenCalled();
  });

  it('shows coherentist warning when isCoherentist true', () => {
    const coherentistPath: FocusPathResult = {
      ...mockPathResult,
      isCoherentist: true,
      entryPoint: 'middle',
    };

    render(<JustificationTab pathResult={coherentistPath} edges={mockEdges} onNavigate={() => {}} />);

    expect(screen.getByText(/coherentist.*cluster/i)).toBeInTheDocument();
    expect(screen.getByText(/entry.*point/i)).toBeInTheDocument();
  });

  it('distinguishes foundation node visually', () => {
    render(<JustificationTab pathResult={mockPathResult} edges={mockEdges} onNavigate={() => {}} />);

    // First node should be labeled as foundation
    expect(screen.getByText(/foundation/i)).toBeInTheDocument();
  });

  it('shows "you are here" indicator for selected node', () => {
    render(<JustificationTab pathResult={mockPathResult} edges={mockEdges} onNavigate={() => {}} />);

    // Last node in path should be marked as current
    expect(screen.getByText(/you are here|current/i)).toBeInTheDocument();
  });

  it('renders deductive vs inductive edge indicators', () => {
    const { container } = render(
      <JustificationTab pathResult={mockPathResult} edges={mockEdges} onNavigate={() => {}} />
    );

    // Should have both solid (━━━) and dashed (┅┅┅) indicators
    const deductive = container.querySelector('.edge-deductive');
    const inductive = container.querySelector('.edge-inductive');

    expect(deductive).toBeInTheDocument();
    expect(inductive).toBeInTheDocument();
  });

  it('handles single-node path (foundation is selected)', () => {
    const singlePath: FocusPathResult = {
      path: ['foundation'],
      pathWeight: 1.0,
      pathType: 'deductive',
      isCoherentist: false,
      entryPoint: null,
    };

    render(<JustificationTab pathResult={singlePath} edges={[]} onNavigate={() => {}} />);

    expect(screen.getByText(/foundation/i)).toBeInTheDocument();
    expect(screen.queryByText(/━━━|┅┅┅/)).not.toBeInTheDocument(); // No edges
  });
});
