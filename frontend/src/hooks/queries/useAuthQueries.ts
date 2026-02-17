import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/authApi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const useLogin = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (data) => {
      toast.success('Welcome back!', {
        description: `Logged in as ${data.user.email}`,
      });
      navigate('/');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error('Login Failed', {
        description: message,
      });
    },
  });
};

export const useLogout = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      toast.success('Logged out successfully');
      navigate('/login');
    },
    onError: () => {
      toast.error('Logout failed');
    },
  });
};
