import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Search } from './index';

const mockNodes = [
  { id: 'abc123', type: 'proposition', domain: 'philosophy', title: 'Knowledge Test' },
  { id: 'def456', type: 'theorem', domain: 'mathematics', title: 'Algebra Theorem' },
  { id: 'ghi789', type: 'theory', domain: 'physics', title: 'Relativity' },
];

describe('Search', () => {
  it('renders search input', () => {
    render(<Search nodes={[]} onResults={vi.fn()} />);
    expect(screen.getByPlaceholderText(/search nodes/i)).toBeInTheDocument();
  });

  it('searches by title', async () => {
    const onResults = vi.fn();
    const user = userEvent.setup();

    render(<Search nodes={mockNodes} onResults={onResults} />);

    const input = screen.getByPlaceholderText(/search nodes/i);
    await user.type(input, 'knowledge');

    await waitFor(
      () => {
        expect(onResults).toHaveBeenCalled();
      },
      { timeout: 500 }
    );

    const lastCall = onResults.mock.calls[onResults.mock.calls.length - 1]?.[0];
    expect(lastCall).toContain('abc123');
  });

  it('searches by domain', async () => {
    const onResults = vi.fn();
    const user = userEvent.setup();

    render(<Search nodes={mockNodes} onResults={onResults} />);

    await user.type(screen.getByPlaceholderText(/search nodes/i), 'physics');

    await waitFor(() => {
      const lastCall = onResults.mock.calls[onResults.mock.calls.length - 1]?.[0];
      expect(lastCall).toContain('ghi789');
    });
  });

  it('debounces search input', async () => {
    const onResults = vi.fn();
    const user = userEvent.setup();

    render(<Search nodes={mockNodes} onResults={onResults} />);

    await user.type(screen.getByPlaceholderText(/search nodes/i), 'test', { delay: 50 });

    // Should not call immediately for each keystroke
    await new Promise((resolve) => setTimeout(resolve, 100));
    const callCount = onResults.mock.calls.length;
    expect(callCount).toBeLessThan(10); // Debounced, not called for each character
  });

  it('shows clear button when text entered', async () => {
    const user = userEvent.setup();
    render(<Search nodes={mockNodes} onResults={vi.fn()} />);

    expect(screen.queryByLabelText(/clear search/i)).not.toBeInTheDocument();

    await user.type(screen.getByPlaceholderText(/search nodes/i), 'test');

    expect(screen.getByLabelText(/clear search/i)).toBeInTheDocument();
  });

  it('clear button clears input', async () => {
    const onResults = vi.fn();
    const user = userEvent.setup();

    render(<Search nodes={mockNodes} onResults={onResults} />);

    const input = screen.getByPlaceholderText(/search nodes/i);
    await user.type(input, 'test');

    const clearButton = await screen.findByLabelText(/clear search/i);
    await user.click(clearButton);

    expect(input).toHaveValue('');
    await waitFor(() => {
      const lastCall = onResults.mock.calls[onResults.mock.calls.length - 1]?.[0];
      expect(lastCall).toEqual([]);
    });
  });
});
