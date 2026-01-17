import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
    isAuthenticated: boolean;
    user: {
        username: string;
        email: string;
    } | null;
    login: (username: string, password: string) => boolean;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            isAuthenticated: false,
            user: null,

            login: (username: string, password: string) => {
                // Simple auth check (demo mode)
                // Accept any non-empty credentials for now
                if (username && password) {
                    set({
                        isAuthenticated: true,
                        user: {
                            username,
                            email: username.includes('@') ? username : `${username}@traffic.local`,
                        },
                    });
                    return true;
                }
                return false;
            },

            logout: () => {
                set({
                    isAuthenticated: false,
                    user: null,
                });
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);
