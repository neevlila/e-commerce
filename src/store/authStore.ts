import { create } from 'zustand';
import { User } from '../types';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  updateProfile: (updates: Partial<User>) => void;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  updateProfile: (updates) => set((state) => {
    const updatedUser = state.user ? { ...state.user, ...updates } : null;
    if (state.user && updates) {
      api.auth.updateProfile(state.user.id, updates).catch(console.error);
    }
    return { user: updatedUser };
  }),
  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false });
  },
  initialize: async () => {
    // Force loading to false after 3 seconds max to prevent infinite load
    const timeoutId = setTimeout(() => {
        set((state) => {
            if (state.isLoading) {
                console.warn("Auth check timed out, forcing app load");
                return { isLoading: false };
            }
            return {};
        });
    }, 3000);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const profile = await api.auth.getProfile(session.user.id);
        if (profile) {
          set({ user: profile, isAuthenticated: true, isLoading: false });
        } else {
             set({ 
                user: { 
                    id: session.user.id, 
                    email: session.user.email!, 
                    name: session.user.user_metadata.full_name || 'User', 
                    role: 'USER' 
                }, 
                isAuthenticated: true, 
                isLoading: false 
            });
        }
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ user: null, isAuthenticated: false, isLoading: false });
    } finally {
        clearTimeout(timeoutId);
    }
  }
}));
