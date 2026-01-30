import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

// Types for authentication
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface SignupCredentials {
    name: string;
    email: string;
    password: string;
    phone?: string;
}

export interface AuthResponse {
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: 'admin' | 'user';
    };
    message?: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
}

// Storage keys
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// Fixed admin credentials (for checking locally)
const ADMIN_EMAIL = 'admin@buyway.com';
const ADMIN_PASSWORD = 'admin123';

class AuthService {
    // Login function
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            const response = await api.post<AuthResponse>('/auth/login', credentials);

            if (response.data.token) {
                await this.storeAuthData(response.data.token, response.data.user);
            }

            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    // Signup function
    async signup(credentials: SignupCredentials): Promise<AuthResponse> {
        try {
            const response = await api.post<AuthResponse>('/auth/signup', credentials);

            if (response.data.token) {
                await this.storeAuthData(response.data.token, response.data.user);
            }

            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    // Logout function
    async logout(): Promise<void> {
        try {
            await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
        } catch (error) {
            console.error('Error during logout:', error);
        }
    }

    // Check if user is authenticated
    async isAuthenticated(): Promise<boolean> {
        try {
            const token = await AsyncStorage.getItem(TOKEN_KEY);
            return !!token;
        } catch (error) {
            return false;
        }
    }

    // Get stored token
    async getToken(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem(TOKEN_KEY);
        } catch (error) {
            return null;
        }
    }

    // Get stored user
    async getUser(): Promise<User | null> {
        try {
            const userStr = await AsyncStorage.getItem(USER_KEY);
            return userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            return null;
        }
    }

    // Store auth data
    private async storeAuthData(token: string, user: User): Promise<void> {
        try {
            await AsyncStorage.setItem(TOKEN_KEY, token);
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
        } catch (error) {
            console.error('Error storing auth data:', error);
        }
    }

    // Check if credentials match admin
    isAdminCredentials(email: string, password: string): boolean {
        return email.toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD;
    }

    // Handle API errors
    private handleError(error: any): Error {
        if (error.response) {
            // Server responded with error
            const message = error.response.data?.message || 'Authentication failed';
            return new Error(message);
        } else if (error.request) {
            // No response received
            return new Error('Unable to connect to server. Please check your internet connection.');
        } else {
            // Something else went wrong
            return new Error(error.message || 'An unexpected error occurred');
        }
    }
}

export const authService = new AuthService();
export default authService;
