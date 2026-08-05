# AHHHMETV — Vercel-First Walkthrough

We have restructured **AHHHMETV** into a serverless, unified Next.js 15 repository optimized for deployment on Vercel. All standalone Express files and legacy Docker setup files have been removed, making Vercel the single deployment target.

---

## Technical Accomplishments

### 1. Serverless Backend (App Router API Route Handlers)
- Unified route handlers for client operations:
  - `src/app/api/auth/register/route.ts` (Credentials sign-up)
  - `src/app/api/auth/verify/route.ts` (User verification token handler)
  - `src/app/api/auth/forgot-password/route.ts` & `reset-password/route.ts` (Email recovery system)
  - `src/app/api/pusher/auth/route.ts` (Pusher authentication matching NextAuth sessions)
  - `src/app/api/match/join/route.ts` (Edge-compatible matchmaking engine and Pusher alert trigger)
  - `src/app/api/match/skip/route.ts` (Skip/end call updates)
  - `src/app/api/match/signal/route.ts` (WebRTC signaling relays)
  - `src/app/api/chat/send/route.ts` (Auto-moderated text messaging)
  - `src/app/api/users/me/route.ts` (User profile details updating)
  - `src/app/api/users/avatar/route.ts` (Avatar photo management via database saving)
  - `src/app/api/friends/route.ts` (Friend list and friendship deletion)
  - `src/app/api/friends/request/route.ts` & `accept/route.ts` (Friend invites engine)
  - `src/app/api/reports/route.ts` (User report system and blocking)
  - `src/app/api/payments/create-checkout/route.ts` & `webhook/route.ts` (Stripe subscription)

### 2. Vercel Real-time Hub (Pusher Channels & WebRTC)
- **Pusher Channel Subscriptions**: Enabled users to match, signal, and send message payloads in real-time.
- **WebRTC Client Integration**: Implemented WebRTC connection negotiation (`offer`, `answer`, `ice-candidate`) over Pusher signaling relays.
- **Zustand Chat Store**: Syncs matching events, partner info, and media tracks across pages.

### 3. Route Protection & OAuth Providers
- **Strict Route Protection Middleware**: Added `src/middleware.ts` to protect `/chat`, `/profile`, `/friends`, `/settings`, and `/admin` routes. Unauthenticated users are redirected to `/login` automatically.
- **OAuth Providers Integration**: Fully configured Google and GitHub login providers inside `src/lib/auth.ts` and in the layout views. Non-essential providers (Discord, Facebook) were completely removed to optimize performance and prevent visual clutter.
- **Flexible Environment Variables**: Storage uploads fallback dynamically to direct database storage, and email validation bypasses credentials restriction, enabling the platform to deploy immediately.

### 4. Vercel Security Hardening & Config
- **vercel.json**: Hardened with strict security headers (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy).
- **.npmrc Setup**: Configured `legacy-peer-deps=true` to ensure npm install succeeds under Vercel's build environment.

---

## Verification Guide

### Local Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Setup env variables
cp .env.example .env
# Fill in database and pusher credentials

# 3. Generate Prisma DB client
npx prisma generate

# 4. Dev execution
npm run dev
```
- Open `http://localhost:3000` to interact with AHHHMETV.
