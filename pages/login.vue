<script setup>
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const submitting = ref(false)
const { $supabase } = useNuxtApp()
const authStore = useAuthStore()
const router = useRouter()

// Signs in with Supabase and redirects successful users to the chat room.
const login = async () => {
  errorMessage.value = ''
  submitting.value = true
  const { data, error } = await $supabase.auth.signInWithPassword({ email: email.value, password: password.value })
  if (error) {
    errorMessage.value = error.message
    submitting.value = false
    return
  }
  authStore.setSession(data.session)
  await router.push('/chat')
  submitting.value = false
}
</script>

<template>
  <div class="grid min-h-screen place-items-center bg-slate-950 p-6">
    <form class="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl" @submit.prevent="login">
      <h1 class="text-2xl font-bold text-slate-900">Welcome back</h1>
      <p class="mt-2 text-sm text-slate-600">Sign in to join the room.</p>
      <p v-if="errorMessage" class="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{{ errorMessage }}</p>
      <input v-model="email" class="mt-6 w-full rounded-lg border p-3" type="email" placeholder="Email" required>
      <input v-model="password" class="mt-3 w-full rounded-lg border p-3" type="password" placeholder="Password" required>
      <button :disabled="submitting" class="mt-5 w-full rounded-lg bg-emerald-500 p-3 font-semibold text-slate-950 disabled:opacity-60">{{ submitting ? 'Signing in…' : 'Sign in' }}</button>
      <NuxtLink to="/register" class="mt-5 block text-center text-sm text-emerald-700">Need an account? Create one</NuxtLink>
    </form>
  </div>
</template>
