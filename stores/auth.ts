import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as any,

    session: null as any,

    initialized: false,

    initPromise: null as Promise<void> | null,
  }),

  actions: {
    setSession(session: any) {
      this.session = session;
      this.user = session.user;
    },

    clearSession() {
      this.session = null;
      this.user = null;
    },

    setInitialized() {
      this.initialized = true;
    },

    async initializeAuth() {
      if (this.initialized) {
        return;
      }

      if (this.initPromise) {
        await this.initPromise;
        return;
      }

      const { $supabase } = useNuxtApp();

      this.initPromise = (async () => {
        try {
          const {
            data: { session },
            error,
          } = await $supabase.auth.getSession();

          if (error) {
            throw error;
          }

          if (session) {
            this.setSession(session);
          } else {
            const {
              data: { user },
              error: userError,
            } = await $supabase.auth.getUser();

            if (userError) {
              throw userError;
            }

            if (user) {
              this.user = user;
            } else {
              this.clearSession();
            }
          }
        } catch (error) {
          console.error("AUTH INIT ERROR:", error);
          this.clearSession();
        } finally {
          this.setInitialized();
        }
      })();

      await this.initPromise;
    },
  },
});
