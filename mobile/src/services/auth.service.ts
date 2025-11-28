import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { apiService, LoginCredentials, RegisterData, User } from '../services/api.service';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

// Use localStorage for web, SecureStore for native
const storage = {
  async setItem(key: string, value: string) {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  },
  async removeItem(key: string) {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  }
};

class AuthService {
  async login(credentials: LoginCredentials): Promise<User> {
    const response = await apiService.login(credentials);
    
    // Store token and user data
    await storage.setItem(TOKEN_KEY, response.token);
    await storage.setItem(USER_KEY, JSON.stringify(response.user));
    
    // Set token in API service
    apiService.setToken(response.token);
    
    return response.user;
  }

  async register(data: RegisterData): Promise<User> {
    const response = await apiService.register(data);
    
    // Store token and user data
    await storage.setItem(TOKEN_KEY, response.token);
    await storage.setItem(USER_KEY, JSON.stringify(response.user));
    
    // Set token in API service
    apiService.setToken(response.token);
    
    return response.user;
  }

  async logout(): Promise<void> {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local storage regardless of API call success
      await storage.removeItem(TOKEN_KEY);
      await storage.removeItem(USER_KEY);
      apiService.setToken(null);
    }
  }

  async getStoredToken(): Promise<string | null> {
    return await storage.getItem(TOKEN_KEY);
  }

  async getStoredUser(): Promise<User | null> {
    const userData = await storage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  async initializeAuth(): Promise<User | null> {
    const token = await this.getStoredToken();
    
    if (!token) {
      return null;
    }

    apiService.setToken(token);

    try {
      // Verify token is still valid by fetching current user
      const user = await apiService.getCurrentUser();
      await storage.setItem(USER_KEY, JSON.stringify(user));
      return user;
    } catch (error) {
      // Token is invalid, clear storage
      await this.logout();
      return null;
    }
  }
}

export const authService = new AuthService();
