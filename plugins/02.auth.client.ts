export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore();
  const { $supabase } = useNuxtApp();

  await authStore.initializeAuth();

  $supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
      authStore.setSession(session);
    } else {
      authStore.clearSession();
    }
  });
});
