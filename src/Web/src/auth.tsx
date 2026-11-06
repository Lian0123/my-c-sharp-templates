import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { refresh, sessionEvents } from './api/client';
import type { Login, User } from './api/models';
const Context = createContext<{ user: User | null; loading: boolean }>({ user: null, loading: true });
export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const queries = useQueryClient();
  useEffect(() => {
    const changed = (event: Event) => { const login = (event as CustomEvent<Login | null>).detail; setUser(login?.user ?? null); if (!login) queries.clear(); };
    sessionEvents.addEventListener('change', changed);
    void refresh().catch(() => undefined).finally(() => setLoading(false));
    const timer = window.setInterval(() => { void refresh().catch(() => undefined); }, 240_000);
    return () => { sessionEvents.removeEventListener('change', changed); window.clearInterval(timer); };
  }, [queries]);
  return <Context.Provider value={{ user, loading }}>{children}</Context.Provider>;
}
export function useAuth() { return useContext(Context); }
