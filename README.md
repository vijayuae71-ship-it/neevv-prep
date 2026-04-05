# neevv Prep — B-School Interview Coach

AI-powered mock interview coach for MBA aspirants. Practice behavioral, guesstimate, and 'Why MBA' questions with real-time feedback and a detailed scorecard.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + DaisyUI (dark theme)
- **AI Backend**: Dify AI (chat-messages API)
- **Hosting**: Netlify (with serverless function proxy)

## Setup

### 1. Clone and install

```bash
npm install
```

### 2. Configure environment

Create a `.env` file (or set in Netlify dashboard):

```
DIFY_API_KEY=app-your-dify-api-key-here
```

### 3. Local development

```bash
npm run dev
```

For the Netlify function to work locally, use the Netlify CLI:

```bash
npx netlify dev
```

### 4. Deploy to Netlify

1. Push to GitHub
2. Connect repo to Netlify
3. Set `DIFY_API_KEY` in Netlify environment variables
4. Deploy!

Or use Netlify CLI:

```bash
npx netlify deploy --prod
```

## Features

- 🎤 Voice input with speech-to-text
- 📊 Speech analytics (filler words, WPM, B-school vocabulary)
- 🧮 Math validation for guesstimate answers
- 💡 "Need a nudge?" hints
- 🎓 Detailed scorecard with Foundation, Logic, Communication scores
- 📋 Question Bank with 100+ categorized questions
- 🔥 Daily Practice with streak tracking
- 📖 Story Bank for STAR stories
- 🛠️ 4 free AI-powered mini-tools
- 📚 Case Library with frameworks

## Architecture

- **Netlify Function** (`netlify/functions/dify.ts`): Serverless proxy that adds the Dify API key and forwards requests. Keeps the API key secure.
- **localStorage**: Used for Story Bank, Daily Practice streaks, and Preferences (replaces server-side SQL).
- **mailto: links**: Used for scorecard email, mentor flagging, and help requests (replaces server-side email sending).
