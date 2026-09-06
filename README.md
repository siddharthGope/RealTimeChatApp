# SimpleChat

A small shared realtime chat room built with Nuxt, Supabase Auth/Realtime, and optional local AI through Ollama. The AI model runs on your computer, so it does not need a paid API key.

## One-time setup

1. Create a free Supabase project and enable Email authentication.
2. In Supabase Dashboard, open **SQL Editor** and run [`supabase/schema.sql`](./supabase/schema.sql), then [`supabase/profile-migration.sql`](./supabase/profile-migration.sql).
3. Copy `.env.example` to `.env`, then set `SUPABASE_URL` and `SUPABASE_KEY` from Supabase's API settings. Do not commit `.env`.
4. Install [Ollama](https://ollama.com), then run:

   ```powershell
   ollama pull llama3.2:3b
   ollama serve
   ```

5. Start the app:

   ```powershell
   npm run dev
   ```

Open `http://localhost:3000`, create an account, and open the chat. Check **Ask AI to reply** before sending when you want a local AI response.

Open **Profile** from the chat header to choose a display name and upload an avatar image. Those details are saved in Supabase and appear on messages sent after the profile is saved.

## Why messages stay but a second tab changes the signed-in user

These are two different kinds of persistence:

- **Messages** are rows in the Supabase `messages` database table. When the chat page loads, it requests those rows again, so messages remain after a page refresh and are visible to every authenticated user in the shared room.
- **Authentication session** is stored by the Supabase browser client in `localStorage` by default. All regular tabs that use the same browser profile and the same origin (`http://localhost:3000`) share that storage. Signing in as a second email address in another tab replaces the saved session, so the first tab also becomes the second user after its auth listener updates.

To test two users at the same time, sign in with one account in a normal browser window and the other account in an **Incognito/InPrivate** window, a different browser, or a separate browser profile. Those contexts have separate storage and therefore separate Supabase sessions.

## Notes

- Supabase free tier handles authentication, database storage, and live message delivery.
- Ollama is optional: regular realtime chat works even if it is not running.
- The provided RLS rules are intentionally simple for a shared-room prototype. Before deploying publicly, move AI message insertion to a server route using a Supabase service role and add rate limits.
