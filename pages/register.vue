<script setup>
const email = ref('')
const password = ref('')
const message = ref('')
const { $supabase } = useNuxtApp()

// Creates a new Supabase account and shows either an error or confirmation message.
const register = async () => {
  message.value = ''
  const { data, error } = await $supabase.auth.signUp({ email: email.value, password: password.value })
  message.value = error?.message || (data.session ? 'Account created. You can now sign in.' : 'Account created. Check your email to confirm it.')
}
</script>

<template>
  <div class="grid min-h-screen place-items-center bg-slate-950 p-6">
    <form class="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl" @submit.prevent="register">
      <h1 class="text-2xl font-bold">Create account</h1>
      <p v-if="message" class="mt-4 rounded-lg bg-slate-100 p-3 text-sm text-slate-700">{{ message }}</p>
      <input v-model="email" class="mt-6 w-full rounded-lg border p-3" type="email" placeholder="Email" required>
      <input v-model="password" class="mt-3 w-full rounded-lg border p-3" type="password" placeholder="Password" minlength="6" required>
      <button class="mt-5 w-full rounded-lg bg-emerald-500 p-3 font-semibold text-slate-950">Create account</button>
      <NuxtLink to="/login" class="mt-5 block text-center text-sm text-emerald-700">Already have an account? Sign in</NuxtLink>
    </form>
  </div>
</template>
