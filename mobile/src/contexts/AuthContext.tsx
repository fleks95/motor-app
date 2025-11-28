import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/auth.service';
import { User, LoginCredentials, RegisterData } from '../services/api.service';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize auth on app start
    console.log('AuthContext: Initializing auth...');
    authService.initializeAuth().then((user) => {
      console.log('AuthContext: Init complete, user:', user);
      setUser(user);
      setIsLoading(false);
    });
  }, []);

  const login = async (credentials: LoginCredentials) => {
    console.log('AuthContext: Login called');
    const user = await authService.login(credentials);
    console.log('AuthContext: Login successful, setting user:', user);
    setUser(user);
  };

  const register = async (data: RegisterData) => {
    console.log('AuthContext: Register called');
    const user = await authService.register(data);
    console.log('AuthContext: Register successful, setting user:', user);
    setUser(user);
  };

  const logout = async () => {
    console.log('AuthContext: Logout called');
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
