import { apiService } from '../services/api.service';

// Mock fetch
global.fetch = jest.fn();

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should make a POST request to /auth/login', async () => {
      const mockResponse = {
        data: {
          user: { id: '1', email: 'test@example.com', full_name: 'Test User' },
          token: 'mock-token',
          expiresIn: 3600,
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const credentials = { email: 'test@example.com', password: 'password123' };
      const result = await apiService.login(credentials);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(credentials),
        })
      );

      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error on failed login', async () => {
      const mockError = {
        error: { message: 'Invalid credentials' },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => mockError,
      });

      await expect(
        apiService.login({ email: 'test@example.com', password: 'wrong' })
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('setToken', () => {
    it('should set authorization header when token is provided', async () => {
      const mockResponse = {
        data: { id: '1', email: 'test@example.com', full_name: 'Test User' },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      apiService.setToken('test-token');
      await apiService.getCurrentUser();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });
  });
});
