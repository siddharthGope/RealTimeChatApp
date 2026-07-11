export const useAuth = () => {
  const authStore = useAuthStore();

  const initAuth = async () => {
    await authStore.initializeAuth();
  };

  return {
    initAuth,
  };
};
