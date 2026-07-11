import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin(() => {

  const config = useRuntimeConfig()

  const supabase = createClient(
    config.public.supabaseUrl,
    config.public.supabaseKey
  )

  console.log(
"URL:",
config.public.supabaseUrl
)

console.log(
"KEY:",
config.public.supabaseKey
)


  return {
    provide: {
      supabase
    }
  }

})
