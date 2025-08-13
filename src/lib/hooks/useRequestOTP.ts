import axios from 'axios';

export const useRequestOTP = () => {
  const requestOTP = async (email: string) => {
    const { data } = await axios.post('/api/auth/request-otp', { email });
    return data;
  };

  return { requestOTP };
};
