export default defineNuxtConfig({

  compatibilityDate: '2025-07-15',

  devtools:{
    enabled:true
  },


  modules:[
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss'
  ],


  runtimeConfig:{


    public:{


      apiBaseUrl:'http://localhost:5000',

      socketUrl:'http://localhost:5000',

      supabaseUrl: import.meta.env.SUPABASE_URL,

      supabaseKey: import.meta.env.SUPABASE_KEY


    }


  }

})