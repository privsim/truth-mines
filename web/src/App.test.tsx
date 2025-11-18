import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App', () => {
  it('renders header with title', () => {
    render(<App />);
    expect(screen.getByText('Truth Mines')).toBeInTheDocument();
  });

  it('renders view toggle buttons', () => {
    render(<App />);
    expect(screen.getByText('2D View')).toBeInTheDocument();
    expect(screen.getByText('3D View')).toBeInTheDocument();
  });

  it('starts with 2D view active', () => {
    render(<App />);
    const button2D = screen.getByText('2D View');
    expect(button2D).toHaveClass('active');
  });

  it('toggles to 3D view when clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    const button3D = screen.getByText('3D View');
    await user.click(button3D);

    expect(button3D).toHaveClass('active');
    expect(screen.getByText('3D Truth Mine View (To be implemented)')).toBeInTheDocument();
  });

  it('toggles back to 2D view', async () => {
    const user = userEvent.setup();
    render(<App />);

    const button3D = screen.getByText('3D View');
    const button2D = screen.getByText('2D View');

    await user.click(button3D);
    await user.click(button2D);

    expect(button2D).toHaveClass('active');
    expect(screen.getByText('2D Graph View (To be implemented)')).toBeInTheDocument();
  });
});
