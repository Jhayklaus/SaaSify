export const getCurrentUser = () => {
  if (typeof window !== 'undefined') {
    const auth = localStorage.getItem('auth');
    if (auth) {
      const parsed = JSON.parse(auth);
      return parsed.user;
    }
  }
  return null;
};
