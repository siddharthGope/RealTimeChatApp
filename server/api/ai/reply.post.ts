type ChatMessage = { role: 'user' | 'assistant'; content: string }

export default defineEventHandler(async (event) => {
  const body = await readBody<{ messages?: ChatMessage[] }>(event)
  const messages = (body.messages || [])
    .filter((message) => ['user', 'assistant'].includes(message.role) && typeof message.content === 'string')
    .slice(-12)
    .map((message) => ({ role: message.role, content: message.content.slice(0, 2000) }))

  if (!messages.length) throw createError({ statusCode: 400, statusMessage: 'A message is required.' })

  const config = useRuntimeConfig()
  try {
    const response = await $fetch<{ message?: { content?: string } }>(`${config.ollamaBaseUrl}/api/chat`, {
      method: 'POST',
      body: {
        model: config.ollamaModel,
        stream: false,
        messages: [
          { role: 'system', content: 'You are SimpleChat AI. Be helpful, concise, and friendly. Reply in the user\'s language. Do not claim to access messages that were not supplied.' },
          ...messages,
        ],
      },
    })
    const reply = response.message?.content?.trim()
    if (!reply) throw new Error('The model returned an empty response.')
    return { reply }
  } catch (error: any) {
    throw createError({ statusCode: 503, statusMessage: 'Local AI is unavailable. Run Ollama and pull the configured model.', data: error?.message })
  }
})
