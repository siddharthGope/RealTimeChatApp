<script setup>
const email = ref("");
const password = ref("");

const { $supabase } = useNuxtApp();

const authStore = useAuthStore();

const router = useRouter();

const login = async () => {
  const {
    data,

    error,
  } = await $supabase.auth.signInWithPassword({
    email: email.value,

    password: password.value,
  });

  if (error) {
    alert(error.message);

    return;
  }

  authStore.setSession(data.session);

  router.push("/chat");
};
</script>

<template>
  <div class="flex justify-center items-center h-screen">
    <form @submit.prevent="login" class="bg-white shadow p-8 rounded w-96">
      <h1 class="text-2xl font-bold mb-5">Login</h1>

      <input
        v-model="email"
        placeholder="Email"
        class="border p-3 w-full mb-3"
      />

      <input
        v-model="password"
        type="password"
        placeholder="Password"
        class="border p-3 w-full mb-3"
      />

      <button class="bg-black text-white p-3 w-full rounded">Login</button>
    </form>
  </div>
</template>
