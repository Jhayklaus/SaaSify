import axios from 'axios';
import { useAuthStore } from '@/lib/store/useAuthStore';
import type { Role } from '@/lib/store/useAuthStore';

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface LoginResponse {
  user: User;
  token: string;
}

export const useLogin = () => {
  const authLogin = useAuthStore((state) => state.login);

  const login = async (email: string, password: string) => {
    const { data } = await axios.post<LoginResponse>('/api/auth/login', {
      email,
      password,
    });

    authLogin(data.user, data.token);
    return data;
  };

  return { login };
};
