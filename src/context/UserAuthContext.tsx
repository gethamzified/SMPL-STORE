"use client";

import React, { createContext, useContext, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface UserProfile {
    id: string;
    email: string;
    name?: string;
    phone?: string;
    address?: {
        first_name?: string;
        last_name?: string;
        address1?: string;
        city?: string;
        zip?: string;
        country?: string;
    };
}

interface UserAuthContextType {
    user: UserProfile | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    sendOTP: (email: string) => Promise<{ success: boolean; error?: string }>;
    verifyOTP: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);

// Fetcher function for React Query
const fetchUserSession = async (): Promise<UserProfile | null> => {
    const response = await fetch('/api/auth/me', {
        credentials: 'include',
    });
    if (response.ok) {
        const data = await response.json();
        return data.user;
    }
    return null;
};

export function UserAuthProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient();

    // Only fetch session if the auth cookie exists — saves a network round-trip for ~80% of anonymous visitors
    const hasAuthCookie = typeof document !== 'undefined' && document.cookie.includes('auth_token');

    // Use React Query for session management
    const {
        data: user = null,
        isLoading,
        refetch: refreshUser
    } = useQuery({
        queryKey: ['auth-session'],
        queryFn: fetchUserSession,
        enabled: hasAuthCookie, // Skip fetch entirely for anonymous users
        staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
        retry: false, // Don't retry on 401/404
        refetchOnWindowFocus: true, // Re-check when user comes back
    });

    // Send OTP to email
    const sendOTP = useCallback(async (email: string) => {
        try {
            const response = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: data.error || 'Failed to send code' };
            }

            return { success: true };
        } catch (error) {
            console.error('Send OTP Error:', error);
            return { success: false, error: 'Network error' };
        }
    }, []);

    // Verify OTP and establish session
    const verifyOTP = useCallback(async (email: string, code: string) => {
        try {
            const response = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
                credentials: 'include',
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: data.error || 'Verification failed' };
            }

            // Invalidate query to trigger refetch and update UI
            await queryClient.invalidateQueries({ queryKey: ['auth-session'] });

            // Optimistically update cache if we have fresh user data
            if (data.user) {
                queryClient.setQueryData(['auth-session'], data.user);
            }

            toast.success("Welcome!", { description: `Signed in as ${data.user.email}` });

            return { success: true };
        } catch (error) {
            console.error('Verify OTP Error:', error);
            return { success: false, error: 'Network error' };
        }
    }, [queryClient]);

    // Logout
    const logout = useCallback(async () => {
        try {
            await fetch('/api/auth/me', {
                method: 'POST', // POST to /me is logout
                credentials: 'include',
            });
        } catch (error) {
            console.error('Logout Error:', error);
        } finally {
            // Clear React Query cache
            queryClient.setQueryData(['auth-session'], null);
            toast.message("Logged out", { description: "You have been signed out." });
        }
    }, [queryClient]);

    const contextValue = useMemo(() => ({
        user,
        isLoading,
        isAuthenticated: !!user,
        sendOTP,
        verifyOTP,
        logout,
        refreshUser: async () => { await refreshUser(); },
    }), [user, isLoading, sendOTP, verifyOTP, logout, refreshUser]);

    return (
        <UserAuthContext.Provider value={contextValue}>
            {children}
        </UserAuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(UserAuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within a UserAuthProvider");
    }
    return context;
}

