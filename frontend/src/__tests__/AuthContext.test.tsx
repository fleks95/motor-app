import { render } from '@testing-library/react-native';
import React from 'react';
import { Text, View } from 'react-native';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

// Mock the auth service
jest.mock('../services/auth.service', () => ({
  authService: {
    initializeAuth: jest.fn().mockResolvedValue(null),
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  },
}));

describe('AuthContext', () => {
  it('should provide auth context to children', () => {
    const TestComponent = () => {
      const { user, isLoading } = useAuth();
      return (
        <View>
          <Text testID="loading">{isLoading.toString()}</Text>
          <Text testID="user">{user ? 'logged in' : 'logged out'}</Text>
        </View>
      );
    };

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(getByTestId('loading')).toBeTruthy();
    expect(getByTestId('user')).toBeTruthy();
  });

  it('should throw error when useAuth is used outside provider', () => {
    const TestComponent = () => {
      useAuth();
      return null;
    };

    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => render(<TestComponent />)).toThrow('useAuth must be used within an AuthProvider');

    consoleSpy.mockRestore();
  });
});
