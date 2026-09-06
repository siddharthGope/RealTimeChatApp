<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })

const { $supabase } = useNuxtApp()
const authStore = useAuthStore()
const displayName = ref('')
const avatarUrl = ref<string | null>(null)
const message = ref('')
const saving = ref(false)
const uploading = ref(false)
const userId = computed(() => authStore.user?.id)
const initials = computed(() => (displayName.value || authStore.user?.email || 'Member').slice(0, 2).toUpperCase())

// Loads the signed-in user's existing name and avatar when the page opens.
const loadProfile = async () => {
  if (!userId.value) return
  const { data, error } = await $supabase.from('profiles').select('display_name, avatar_url').eq('id', userId.value).maybeSingle()
  if (error) message.value = error.message
  if (data) {
    displayName.value = data.display_name || ''
    avatarUrl.value = data.avatar_url
  }
}

// Uploads a selected image to the user's own folder in Supabase Storage.
const uploadAvatar = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file || !userId.value) return
  if (!file.type.startsWith('image/')) {
    message.value = 'Please choose an image file.'
    return
  }
  if (file.size > 2 * 1024 * 1024) {
    message.value = 'Choose an image smaller than 2 MB.'
    return
  }

  uploading.value = true
  message.value = ''
  const extension = file.name.split('.').pop() || 'jpg'
  const path = `${userId.value}/${Date.now()}.${extension}`
  const { error } = await $supabase.storage.from('avatars').upload(path, file, { contentType: file.type })
  if (error) message.value = error.message
  else avatarUrl.value = $supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl
  uploading.value = false
}

// Creates or updates the signed-in user's profile record.
const saveProfile = async () => {
  if (!userId.value) return
  saving.value = true
  message.value = ''
  const { error } = await $supabase.from('profiles').upsert({
    id: userId.value,
    display_name: displayName.value.trim() || authStore.user?.email?.split('@')[0] || 'Member',
    avatar_url: avatarUrl.value,
    updated_at: new Date().toISOString(),
  })
  message.value = error ? error.message : 'Profile saved. New messages will use these details.'
  saving.value = false
}

onMounted(loadProfile)
</script>

<template>
  <main class="grid min-h-screen place-items-center bg-slate-950 p-6 text-slate-100">
    <section class="w-full max-w-lg rounded-2xl bg-slate-900 p-7 shadow-2xl">
      <NuxtLink to="/chat" class="text-sm text-emerald-400 hover:text-emerald-300">← Back to chat</NuxtLink>
      <h1 class="mt-5 text-2xl font-bold">Your profile</h1>
      <p class="mt-2 text-sm text-slate-400">Your name and avatar appear on new messages you send.</p>
      <p v-if="message" class="mt-5 rounded-lg bg-slate-800 p-3 text-sm">{{ message }}</p>
      <form class="mt-6 space-y-5" @submit.prevent="saveProfile">
        <div class="flex items-center gap-5">
          <img v-if="avatarUrl" :src="avatarUrl" alt="Your avatar" class="h-20 w-20 rounded-full object-cover">
          <div v-else class="grid h-20 w-20 place-items-center rounded-full bg-emerald-400 text-xl font-bold text-slate-950">{{ initials }}</div>
          <label class="cursor-pointer rounded-lg border border-slate-600 px-4 py-2 text-sm hover:border-emerald-400"><input class="sr-only" type="file" accept="image/*" :disabled="uploading" @change="uploadAvatar">{{ uploading ? 'Uploading…' : 'Upload avatar' }}</label>
        </div>
        <label class="block text-sm font-medium">Display name<input v-model="displayName" class="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-slate-100 outline-none ring-emerald-400 focus:ring-2" maxlength="80" placeholder="How should people see your name?"></label>
        <button class="w-full rounded-lg bg-emerald-400 p-3 font-semibold text-slate-950 disabled:opacity-50" :disabled="saving || uploading">{{ saving ? 'Saving…' : 'Save profile' }}</button>
      </form>
    </section>
  </main>
</template>
