import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api/authApi';
import { useAuthStore } from '@/stores/authStore';

interface UseGoogleOAuthReturn {
  initiateGoogleLogin: () => Promise<void>;
  handleGoogleCallback: (code: string, state: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useGoogleOAuth(): UseGoogleOAuthReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setAuthData } = useAuthStore();

  const initiateGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Call authApi.getGoogleAuthUrl()
      const response = await authApi.getGoogleAuthUrl();
      
      // Store state trong sessionStorage
      sessionStorage.setItem('google_oauth_state', response.state);
      
      // Redirect user tới authorizationUrl
      window.location.href = response.authorizationUrl;
    } catch (err) {
      // Handle errors
      const errorMessage = err instanceof Error ? err.message : 'Failed to initiate Google login';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleGoogleCallback = async (code: string, state: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Retrieve state từ sessionStorage
      const storedState = sessionStorage.getItem('google_oauth_state');
      
      // Validate state matches callback state
      if (!storedState || storedState !== state) {
        throw new Error('Invalid state parameter. Possible CSRF attack.');
      }

      // Call authApi.googleCallback(code, state)
      const authResponse = await authApi.googleCallback(code, state);
      
      // Store tokens trong authStore (already done in authApi.googleCallback)
      // Update user state (already done in authApi.googleCallback via setAuthData)
      
      // Clean up sessionStorage
      sessionStorage.removeItem('google_oauth_state');
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      // Handle errors và display messages
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete Google login';
      setError(errorMessage);
      
      // Clean up sessionStorage on error
      sessionStorage.removeItem('google_oauth_state');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    initiateGoogleLogin,
    handleGoogleCallback,
    isLoading,
    error,
  };
}
