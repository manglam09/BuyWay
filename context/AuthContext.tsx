import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import authService, { LoginCredentials, SignupCredentials, User } from '../services/authService';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    signup: (credentials: SignupCredentials) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check authentication status on mount
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const isAuth = await authService.isAuthenticated();
            if (isAuth) {
                const storedUser = await authService.getUser();
                setUser(storedUser);
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (credentials: LoginCredentials) => {
        try {
            setIsLoading(true);
            const response = await authService.login(credentials);
            setUser(response.user);
        } finally {
            setIsLoading(false);
        }
    };

    const signup = async (credentials: SignupCredentials) => {
        try {
            setIsLoading(true);
            const response = await authService.signup(credentials);
            setUser(response.user);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            setIsLoading(true);
            await authService.logout();
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
