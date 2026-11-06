import { act, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './auth';
import { refresh, sessionEvents } from './api/client';
import type { Login } from './api/models';
vi.mock('./api/client', async original => ({ ...await original<typeof import('./api/client')>(), refresh: vi.fn() }));
function Consumer() { const auth = useAuth(); return <div>{auth.loading ? 'loading' : auth.user?.displayName ?? 'anonymous'}</div>; }
it('restores a session, observes logout events and clears query data', async () => {
  vi.mocked(refresh).mockResolvedValue({} as Login); const queries = new QueryClient(); queries.setQueryData(['private'], 'secret');
  const page = render(<QueryClientProvider client={queries}><AuthProvider><Consumer/></AuthProvider></QueryClientProvider>);
  await screen.findByText('anonymous');
  act(() => sessionEvents.dispatchEvent(new CustomEvent('change', { detail: { user: { displayName: '會員' } } }))); expect(screen.getByText('會員')).toBeInTheDocument();
  act(() => sessionEvents.dispatchEvent(new CustomEvent('change', { detail: null }))); expect(screen.getByText('anonymous')).toBeInTheDocument(); expect(queries.getQueryData(['private'])).toBeUndefined();
  page.unmount(); act(() => sessionEvents.dispatchEvent(new CustomEvent('change', { detail: null })));
});
it('handles restoration and scheduled-refresh failures', async () => {
  vi.useFakeTimers(); vi.mocked(refresh).mockRejectedValue(new Error('expired')); const queries = new QueryClient();
  const view = render(<QueryClientProvider client={queries}><AuthProvider><Consumer/></AuthProvider></QueryClientProvider>);
  await act(async () => { await Promise.resolve(); }); expect(screen.getByText('anonymous')).toBeInTheDocument();
  await act(async () => { vi.advanceTimersByTime(240_000); await Promise.resolve(); }); expect(refresh).toHaveBeenCalled(); view.unmount(); vi.useRealTimers();
});
it('provides safe initial state outside a provider', () => { render(<Consumer/>); expect(screen.getByText('loading')).toBeInTheDocument(); });
