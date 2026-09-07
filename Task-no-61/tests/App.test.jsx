import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App, { TaskStatus } from '../src/App.jsx';

describe('TaskStatus', () => {
  it('renders the incomplete state and notifies when toggled', () => {
    const onToggle = vi.fn();

    render(<TaskStatus onToggle={onToggle} />);

    const button = screen.getByRole('button', { name: /mark complete/i });
    expect(button).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(button);
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it('renders the completed state', () => {
    render(<TaskStatus completed onToggle={() => {}} />);

    expect(screen.getByRole('button', { name: /complete/i })).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('App', () => {
  it('toggles the task and reports a healthy API response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'ok' })
    }));

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /mark complete/i }));
    expect(screen.getByRole('button', { name: 'Complete' })).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByRole('button', { name: /run api check/i }));
    await waitFor(() => expect(screen.getByText(/API returned a healthy response/i)).toBeInTheDocument());
    expect(fetch).toHaveBeenCalledWith('/api/health');
    vi.unstubAllGlobals();
  });
});
