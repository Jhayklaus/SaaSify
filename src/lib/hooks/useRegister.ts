import axios from 'axios';
import { useAuthStore } from '@/lib/store/useAuthStore';
import type { Role } from '@/lib/store/useAuthStore';

interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  organizationId: number;
}

interface RegisterResponse {
  user: User;
  token: string;
}

export const useRegister = () => {
  const authLogin = useAuthStore((state) => state.login);

  const register = async (
    userName: string,
    organizationName: string,
    sector: string,
    email: string,
    phone: string,
    password: string,
  ) => {
    const { data } = await axios.post<RegisterResponse>('/api/auth/register', {
      userName,
      organizationName,
      sector,
      email,
      phone,
      password,
    });

    authLogin(data.user, data.token);
    return data;
  };

  return { register };
};
