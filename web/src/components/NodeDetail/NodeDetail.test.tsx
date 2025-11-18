import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NodeDetail } from './index';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('NodeDetail', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('renders nothing when nodeId is null', () => {
    const { container } = render(<NodeDetail nodeId={null} onClose={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('loads and displays node data', async () => {
    const mockNode = {
      id: 'test01',
      type: 'proposition',
      domain: 'philosophy',
      title: 'Test Node',
      content: 'Test content',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockNode,
    });

    render(<NodeDetail nodeId="test01" onClose={vi.fn()} />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Test Node')).toBeInTheDocument();
    });

    expect(screen.getByText('proposition')).toBeInTheDocument();
    expect(screen.getByText('philosophy')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('handles load errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    render(<NodeDetail nodeId="missing" onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/not found/i)).toBeInTheDocument();
    });
  });

  it('calls onClose when close button clicked', async () => {
    const onClose = vi.fn();
    const mockNode = {
      id: 'test01',
      type: 'proposition',
      domain: 'philosophy',
      title: 'Test',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockNode,
    });

    render(<NodeDetail nodeId="test01" onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: /×/ });
    await userEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledOnce();
  });
});
