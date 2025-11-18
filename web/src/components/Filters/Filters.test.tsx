import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Filters } from './index';

describe('Filters', () => {
  it('renders domain checkboxes', () => {
    render(<Filters onChange={vi.fn()} />);

    expect(screen.getByLabelText(/philosophy/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mathematics/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/physics/i)).toBeInTheDocument();
  });

  it('all domains checked by default', () => {
    render(<Filters onChange={vi.fn()} />);

    expect(screen.getByLabelText(/philosophy/i)).toBeChecked();
    expect(screen.getByLabelText(/mathematics/i)).toBeChecked();
    expect(screen.getByLabelText(/physics/i)).toBeChecked();
  });

  it('toggles domain checkbox', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<Filters onChange={onChange} />);

    const philCheckbox = screen.getByLabelText(/philosophy/i);
    await user.click(philCheckbox);

    expect(onChange).toHaveBeenCalled();
    const callArgs = onChange.mock.calls[0]?.[0];
    expect(callArgs?.domains.has('philosophy')).toBe(false);
    expect(callArgs?.domains.has('mathematics')).toBe(true);
  });

  it('select all button checks all domains', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<Filters onChange={onChange} />);

    // First uncheck one
    await user.click(screen.getByLabelText(/philosophy/i));

    // Then select all
    const selectAllButton = screen.getByRole('button', { name: /all/i });
    await user.click(selectAllButton);

    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1]?.[0];
    expect(lastCall?.domains.size).toBe(3);
  });

  it('deselect all button unchecks all domains', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<Filters onChange={onChange} />);

    const deselectAllButton = screen.getByRole('button', { name: /none/i });
    await user.click(deselectAllButton);

    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1]?.[0];
    expect(lastCall?.domains.size).toBe(0);
  });

  it('renders type checkboxes', () => {
    render(<Filters onChange={vi.fn()} />);

    expect(screen.getByLabelText(/proposition/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/theorem/i)).toBeInTheDocument();
  });

  it('toggles type checkbox', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<Filters onChange={onChange} />);

    const theoremCheckbox = screen.getByLabelText(/theorem/i);
    await user.click(theoremCheckbox);

    expect(onChange).toHaveBeenCalled();
    const callArgs = onChange.mock.calls[0]?.[0];
    expect(callArgs?.types.has('theorem')).toBe(false);
  });
});
