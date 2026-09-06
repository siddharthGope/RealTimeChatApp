<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })

type Message = {
  id: string
  content: string
  created_at: string
  user_id: string | null
  sender_name: string
  is_ai: boolean
}

const { $supabase } = useNuxtApp()
const authStore = useAuthStore()
const messages = ref<Message[]>([])
const draft = ref('')
const askAi = ref(false)
const loading = ref(true)
const aiThinking = ref(false)
const errorMessage = ref('')
let channel: ReturnType<typeof $supabase.channel> | undefined

// Reads the signed-in user's ID to identify their own messages.
const currentUserId = computed(() => authStore.user?.id)
// Creates a display name from the signed-in user's email address.
const currentName = computed(() => authStore.user?.email?.split('@')[0] || 'Member')
// Changes an ISO timestamp into a short, local time such as "10:22 AM".
const formattedTime = (value: string) => new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(value))

// Scrolls the conversation area to the most recently displayed message.
const scrollToLatest = async () => {
  await nextTick()
  document.querySelector('#latest-message')?.scrollIntoView({ behavior: 'smooth', block: 'end' })
}

// Fetches the latest 100 saved messages when the chat page opens.
const loadMessages = async () => {
  const { data, error } = await $supabase.from('messages').select('*').order('created_at', { ascending: true }).limit(100)
  if (error) errorMessage.value = error.message
  else messages.value = (data || []) as Message[]
  loading.value = false
  scrollToLatest()
}

// Adds a realtime message only if it is not already in the local list.
const addMessageIfNew = (message: Message) => {
  if (!messages.value.some((item) => item.id === message.id)) {
    messages.value.push(message)
    scrollToLatest()
  }
}

// Saves the user's message and, when enabled, asks the local AI for a reply.
const sendMessage = async () => {
  const content = draft.value.trim()
  if (!content || !currentUserId.value || aiThinking.value) return
  errorMessage.value = ''
  draft.value = ''

  const { error } = await $supabase.from('messages').insert({
    content,
    user_id: currentUserId.value,
    sender_name: currentName.value,
    is_ai: false,
  })
  if (error) {
    errorMessage.value = error.message
    draft.value = content
    return
  }

  if (!askAi.value) return
  aiThinking.value = true
  try {
    const reply = await $fetch<{ reply: string }>('/api/ai/reply', {
      method: 'POST',
      body: {
        messages: [...messages.value.slice(-10).map((message) => ({ role: message.is_ai ? 'assistant' : 'user', content: message.content })), { role: 'user', content }],
      },
    })
    const { error: aiError } = await $supabase.from('messages').insert({
      content: reply.reply,
      user_id: null,
      sender_name: 'SimpleChat AI',
      is_ai: true,
    })
    if (aiError) errorMessage.value = aiError.message
  } catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || 'AI is unavailable. Start Ollama and download the selected model.'
  } finally {
    aiThinking.value = false
  }
}

// Ends the Supabase session and returns the user to the login page.
const signOut = async () => {
  await $supabase.auth.signOut()
  await navigateTo('/login')
}

// Loads old messages and listens for new messages from other connected users.
onMounted(async () => {
  await loadMessages()
  channel = $supabase.channel('simplechat-messages')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => addMessageIfNew(payload.new as Message))
    .subscribe()
})

// Stops the realtime listener when the user leaves this page.
onBeforeUnmount(() => { if (channel) $supabase.removeChannel(channel) })
</script>

<template>
  <main class="flex min-h-screen flex-col bg-slate-950 text-slate-100">
    <header class="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-5 py-4">
      <div><h1 class="font-bold">SimpleChat</h1><p class="text-xs text-emerald-400">● live room</p></div>
      <button class="text-sm text-slate-400 hover:text-white" @click="signOut">Sign out</button>
    </header>
    <section class="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6">
      <p v-if="errorMessage" class="mb-4 rounded-lg bg-red-950/60 p-3 text-sm text-red-200">{{ errorMessage }}</p>
      <div v-if="loading" class="grid flex-1 place-items-center text-slate-400">Loading messages…</div>
      <div v-else class="flex flex-1 flex-col gap-3 overflow-y-auto pb-5">
        <div v-if="!messages.length" class="my-auto text-center text-slate-500">No messages yet. Start the conversation.</div>
        <article v-for="message in messages" :id="message === messages[messages.length - 1] ? 'latest-message' : undefined" :key="message.id" class="max-w-[85%] rounded-2xl px-4 py-3" :class="message.is_ai ? 'bg-violet-950/80 border border-violet-800 self-start' : message.user_id === currentUserId ? 'bg-emerald-600 text-slate-950 self-end' : 'bg-slate-800 self-start'">
          <div class="mb-1 flex gap-2 text-xs opacity-75"><span class="font-semibold">{{ message.sender_name }}</span><time>{{ formattedTime(message.created_at) }}</time></div>
          <p class="whitespace-pre-wrap break-words">{{ message.content }}</p>
        </article>
        <p v-if="aiThinking" id="latest-message" class="w-fit rounded-2xl bg-violet-950/80 px-4 py-3 text-sm text-violet-200">SimpleChat AI is thinking…</p>
      </div>
      <form class="sticky bottom-0 rounded-2xl border border-slate-700 bg-slate-900 p-3 shadow-xl" @submit.prevent="sendMessage">
        <label class="mb-3 flex cursor-pointer items-center gap-2 text-sm text-slate-300"><input v-model="askAi" type="checkbox" class="accent-emerald-400"> Ask AI to reply (local Ollama)</label>
        <div class="flex gap-2"><textarea v-model="draft" class="min-h-11 flex-1 resize-none rounded-xl bg-slate-800 px-3 py-2 outline-none ring-emerald-400 focus:ring-2" rows="1" maxlength="2000" placeholder="Write a message…" @keydown.enter.exact.prevent="sendMessage" /><button class="rounded-xl bg-emerald-400 px-5 font-semibold text-slate-950 disabled:opacity-50" :disabled="!draft.trim() || aiThinking">Send</button></div>
      </form>
    </section>
  </main>
</template>
