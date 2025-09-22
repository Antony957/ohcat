# Talking Character App (Ohcat)

A Next.js experience site for the **Ohcat** clothing brand. The app showcases a lineup of virtual smart pets that chat, emote, and even join real-time voice calls through Volcano Engine’s RTC + AIGC stack. Users can browse characters, start text conversations, enter community scenes, and switch into a live audio experience that drives animation and speech playback.

------

## Key features

- **Multi-tab mobile layout** – Home, Market, Chat, Circle (community), Care, and Settings tabs presented in a neon “liquid glass” UI.
- **Character showroom** – Pick from six Ohcat personas, each with custom avatar, bio, and personality-driven AI prompt.
- **Conversational sandbox** – Start a text chat, store history per cat, and hand off to AI via `/api/chat`.
- **Real-time voice calls** – Join a voice session powered by `@volcengine/rtc`, stream cat speech, and render speaking animations frame-by-frame.
- **Audio queueing** – Sequential playback of AI audio responses so streams never overlap.
- **Extensible data model** – Configure actions, prompts, and voice/TTS settings for every cat.

------

## Architecture at a glance

```
Next.js (App Router, React 19)
├─ Redux Toolkit store (room/device state, RTC lifecycle)
├─ Zustand stores (cat selection, action triggers)
├─ Components & pages (MainLayout tabs + voice chat canvas)
├─ Services (ChatService hitting /api/chat -> GPT proxy)
├─ Lib
│  ├─ RtcClient (wraps @volcengine/rtc engine)
│  ├─ useCommon hooks (join/leave rooms, device permissions)
│  ├─ AudioStreamManager + AudioQueue (playback control)
│  └─ VirtualCat + catConfigs (personality & AI prompts)
└─ Public assets (animation frames, videos, cat profiles)

Koa proxy server (optional, /Server)
├─ Issues RTC tokens (POST /api/token)
└─ Signs Volcano Engine AIGC OpenAPI calls (/proxyAIGCFetch)
```

------

## System structure
![ohcat (1).png](public%2Fohcat%20%281%29.png)

------
## Project structure

```
ohcat/
├─ src/
│  ├─ app/               # Next.js app router entry
│  ├─ components/        # UI, tab pages, animation helpers
│  ├─ config/            # Volcano Engine + model presets
│  ├─ hooks/             # Custom React hooks
│  ├─ lib/               # RTC client, audio queue, cats
│  ├─ services/          # Chat API client
│  ├─ store/             # Redux slices + Zustand stores
│  ├─ types/             # Shared TypeScript interfaces
│  └─ utils/             # Helpers (TLV encode, logging, etc.)
├─ public/
│  ├─ catProfile.json    # Prompt & welcome sets per cat
│  ├─ animation/         # (expected) webp frame folders
│  └─ videos/, images/   # (expected) cat media assets
├─ Server/               # Koa proxy for RTC token + OpenAPI
├─ compress_video.sh     # Batch-compress cat demo videos
└─ restore-audio-config.sh # Restore cat TTS config from backup
```

------

## Prerequisites

| Tool                | Version / Notes                                          |
| ------------------- | -------------------------------------------------------- |
| Node.js             | 18.18+ or 20.x (Next.js 15 requirement)                  |
| npm / yarn / pnpm   | Any major package manager (lock files for all three)     |
| Volcano Engine SDK  | Access to `@volcengine/rtc` web SDK (already in package) |
| Volcano Engine App  | RTC AppId/AppKey and ASR/TTS credentials for production  |
| ffmpeg *(optional)* | Needed if you plan to run the `compress_video.sh` script |

------

## Front-end setup

1. **Install dependencies**

   ```
   # Choose your package manager
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

2. **Run the dev server**

   ```
   npm run dev
   ```

   The app will be available at http://localhost:3000.

3. **Production build**

   ```
   npm run build
   npm run start
   ```

4. **Lint (optional)**
   `npm run lint` uses Next.js’ built-in ESLint config (errors are ignored during `next build` per `next.config.ts`).

------

## Local AIGC proxy server

The front-end expects a backend that can mint RTC tokens and proxy Volcano Engine AIGC OpenAPI calls. A sample implementation lives in `/Server`.

1. Install and run:

   ```
   cd Server
   npm install
   npm run dev   # starts Koa server on http://localhost:3001
   ```

2. Configure credentials in `Server/app.js`:

   ```
   const ACCOUNT_INFO = {
     accessKeyId: '<volc-ak>',
     secretKey:   '<volc-sk>',
   };
   
   const RTC_APP_ID  = '<rtc-app-id>';
   ```

3. Endpoints exposed:

- `POST /api/token` → returns a signed RTC token for `{ roomId, userId }`.
- `POST /proxyAIGCFetch?Action=...&Version=...` → signs and forwards OpenAPI calls.

4. Align the Next.js proxy URLs with your server:
- `AIGC_PROXY_HOST` & `API_PROXY_HOST` default to `https://kong.ohcat.cc/...` in `src/config/index.ts`. Override via environment variables (see below) or edit the file for local development.

---

## Runtime configuration

Most RTC/AIGC settings are centralized in `src/config/config.ts` (`ConfigFactory`):

- **`BaseConfig`** – set `AppId`, `RoomId`, `UserId`, and _never hard-code_ `Token` for production (fetch it from your server instead).
- **TTS/ASR** – update `TTSAppId`, `TTSToken`, `ASRAppId`, `ASRToken`, and cluster IDs to match your Volcano Engine services.
- **Model settings** – `Model`, `VoiceType`, `AI_MODEL_MODE`, `ARK_V3_MODEL_ID` control which large model and TTS voice are used.
- **`aigcConfig` getter** – pulls prompt, welcome lines, and TTS options from the currently selected cat (`useCatStore`).

Environment overrides:

```bash
# .env.local
REACT_APP_AIGC_URL=http://localhost:3001/proxyAIGCFetch
REACT_APP_API_URL=http://localhost:3001/api
```

Next.js will pick these up through `src/config/index.ts`.

------

## UI walkthrough

| Tab        | File                                | Highlights                                                   |
| ---------- | ----------------------------------- | ------------------------------------------------------------ |
| Home       | `src/components/pages/HomePage.tsx` | Card grid with neon glass effect; clicking a cat activates chat tab. |
| Market     | `GamePage.tsx`                      | Showcase of Ohcat-themed merchandise (static mock data).     |
| Chat       | `ChatPage.tsx`                      | Text input, message bubbles, per-cat history, “start video call” button. |
| Circle     | `CirclePage.tsx`                    | Masonry-style list of community circles/topics.              |
| Care       | `CarePage.tsx`                      | Placeholder messaging (“这是关心页面”).                      |
| Settings   | `SettingsPage.tsx`                  | Placeholder messaging (“这是设置页面”).                      |
| Video chat | `VideoChatPage.tsx`                 | Full-screen canvas animation + RTC voice call UI.            |

`MainLayout` (default entry) manages tabs, Redux provider, and toggles the video chat overlay. `MainContent` is an earlier variant retained for reference.

------

## Voice & animation pipeline

1. **Join a session** (`useJoin` hook)
    - Requests RTC token via `RtcClient.requestToken` (expects your proxy server).
    - Creates an engine, adds listeners from `lib/listenerHooks.ts`, and publishes audio if permission granted.
2. **AIGC integration**
    - `RtcClient.startAudioBot()` calls `StartVoiceChat` over the proxy with the selected cat’s prompt, TTS, and ASR configs.
    - Binary messages from the agent are parsed in `utils/handler.ts` to update subtitles and drive speaking state.
3. **Audio playback**
    - AI audio segments stream back and are fed into `AudioStreamManager`, which enqueues them in `AudioQueue`.
    - Only one stream plays at a time; completion triggers the next audio clip automatically.
4. **Speaking animations**
    - `VideoChatPage` preloads frame sequences (webp) for each cat’s idle/talk states.
    - `registerSpeakingStateCallback` toggles between “listening” and “speaking” animations and updates UI indicators.
    - A test HUD (`SpeakingAnimationTest`) is rendered in development to simulate states.

------

## Data & content authoring

- **Cat roster** (`src/lib/catConfigs.ts`)
    - Define avatar paths, available actions, default animation set, and TTS provider parameters per character.
    - Backed up copy `catConfigs.ts.backup` can be restored with `restore-audio-config.sh`.
- **Prompts & examples** (`public/catProfile.json`)
    - Stores persona prompts, welcome messages, and example dialogues for AI grounding.
    - `getCatConfigById` merges this JSON with the base configs at runtime.
- **Animations**
    - Place frame folders under `public/animation/<cat>-idle` and `<cat>-speaking>`, each containing zero-padded `.webp` frames (e.g., `0001.webp`).
- **Media assets**
    - Components reference `/images/...` and `/videos/...`; add the actual files under `public/images` and `public/videos`.

------

## Utilities & scripts

| Script / file                          | Purpose                                                      |
| -------------------------------------- | ------------------------------------------------------------ |
| `compress_video.sh`                    | Batch-compresses videos in `/opt/ohcat/public/videos`, backing originals to `/videos_backup`. Requires `sudo` + `ffmpeg`. |
| `restore-audio-config.sh`              | Copies `src/lib/catConfigs.ts.backup` back into place.       |
| `src/examples/AudioQueueExample`       | Standalone page demonstrating `AudioQueue` usage (not routed by default). |
| `src/components/SpeakingAnimationDemo` | Demo playground for the speaking animation hook.             |
| `nohup.out`                            | Example server log (not needed for development).             |


