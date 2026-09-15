import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

type User = {
  id: string;
  email: string;
  name?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  loginDemo: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name,
          });
        }
        setLoading(false);
      });

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name,
          });
        } else {
          setUser(null);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      // Demo mode — check localStorage
      const saved = localStorage.getItem('fatrack-demo-user');
      if (saved) {
        setUser(JSON.parse(saved));
      }
      setLoading(false);
    }
  }, []);

  async function login(email: string, password: string): Promise<{ error?: string }> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      return {};
    }
    // Demo mode
    const demoUser: User = { id: 'demo-user', email, name: email.split('@')[0] };
    setUser(demoUser);
    localStorage.setItem('fatrack-demo-user', JSON.stringify(demoUser));
    return {};
  }

  async function register(email: string, password: string, name: string): Promise<{ error?: string }> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) return { error: error.message };
      return {};
    }
    // Demo mode
    const demoUser: User = { id: 'demo-user', email, name };
    setUser(demoUser);
    localStorage.setItem('fatrack-demo-user', JSON.stringify(demoUser));
    return {};
  }

  async function logout(): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('fatrack-demo-user');
  }

  function loginDemo(): void {
    const demoUser: User = { id: 'demo-user', email: 'demo@fatrack.id', name: 'Pengguna Demo' };
    setUser(demoUser);
    localStorage.setItem('fatrack-demo-user', JSON.stringify(demoUser));
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, loginDemo }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
