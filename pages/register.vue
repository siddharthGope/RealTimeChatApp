<script setup>
const email = ref("");
const password = ref("");

const { $supabase } = useNuxtApp();

const register = async () => {
  const { data, error } = await $supabase.auth.signUp({
    email: email.value,

    password: password.value,
  });

  if (error) {
    alert(error.message);

    return;
  }

  alert("Registration successful. Check email.");
};
</script>

<template>
  <div class="flex justify-center items-center h-screen">
    <form @submit.prevent="register" class="bg-white p-8 shadow rounded w-96">
      <h1 class="text-2xl font-bold mb-5">Create Account</h1>

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

      <button class="bg-black text-white w-full p-3 rounded">Register</button>
    </form>
  </div>
</template>
