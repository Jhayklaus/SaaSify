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

interface VerifyResponse {
  user: User;
  token: string;
}

export const useVerifyOTP = () => {
  const authLogin = useAuthStore((state) => state.login);

  const verifyOTP = async (email: string, otp: string) => {
    const { data } = await axios.post<VerifyResponse>('/api/auth/verify-otp', {
      email,
      otp,
    });

    authLogin(data.user, data.token);
    return data;
  };

  return { verifyOTP };
};
