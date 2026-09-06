import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  // Holds the current user, Supabase session, and initialization status.
  state: () => ({
    user: null as any,

    session: null as any,

    initialized: false,

    initPromise: null as Promise<void> | null,
  }),

  actions: {
    // Stores the session returned after login or a Supabase auth change.
    setSession(session: any) {
      this.session = session;
      this.user = session.user;
    },

    // Removes local user data after logout or an invalid session.
    clearSession() {
      this.session = null;
      this.user = null;
    },

    // Marks the first auth lookup as complete so it is not repeated.
    setInitialized() {
      this.initialized = true;
    },

    // Reads the saved Supabase session once and updates the store accordingly.
    async initializeAuth() {
      if (this.initialized) {
        return;
      }

      if (this.initPromise) {
        await this.initPromise;
        return;
      }

      const { $supabase } = useNuxtApp();

      // Shares one in-progress lookup if multiple pages request authentication together.
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
