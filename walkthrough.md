# AHHHMETV — Vercel-First Walkthrough

We have restructured **AHHHMETV** into a serverless, unified Next.js 15 repository optimized for deployment on Vercel. All standalone Express files and legacy Docker setup files have been removed, making Vercel the single deployment target.

---

## Technical Accomplishments

### 1. Serverless Backend (App Router API Route Handlers)
- Unified route handlers for client operations:
  - `src/app/api/auth/register/route.ts` (Credentials sign-up + Nodemailer verification)
  - `src/app/api/auth/verify/route.ts` (User verification token handler)
  - `src/app/api/auth/forgot-password/route.ts` & `reset-password/route.ts` (Email recovery system)
  - `src/app/api/pusher/auth/route.ts` (Pusher authentication matching NextAuth sessions)
  - `src/app/api/match/join/route.ts` (Edge-compatible matchmaking engine and Pusher alert trigger)
  - `src/app/api/match/skip/route.ts` (Skip/end call updates)
  - `src/app/api/match/signal/route.ts` (WebRTC signaling relays)
  - `src/app/api/chat/send/route.ts` (Auto-moderated text messaging)
  - `src/app/api/users/me/route.ts` (User profile details updating)
  - `src/app/api/users/avatar/route.ts` (Avatar photo management)
  - `src/app/api/friends/route.ts` (Friend list and friendship deletion)
  - `src/app/api/friends/request/route.ts` & `accept/route.ts` (Friend invites engine)
  - `src/app/api/reports/route.ts` (User report system and blocking)
  - `src/app/api/payments/create-checkout/route.ts` & `webhook/route.ts` (Stripe subscription)

### 2. Vercel Real-time Hub (Pusher Channels & WebRTC)
- **Pusher Channel Subscriptions**: Enabled users to match, signal, and send message payloads in real-time.
- **WebRTC Client Integration**: Implemented WebRTC connection negotiation (`offer`, `answer`, `ice-candidate`) over Pusher signaling relays.
- **Zustand Chat Store**: Syncs matching events, partner info, and media tracks across pages.

### 3. Vercel Security Hardening & Config
- **vercel.json**: Hardened with strict security headers (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy).
- **Auto-Moderation**: Service tracking toxic phrases, spam links, and nudity indicators.

---

## Verification Guide

### Local Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Setup env variables
cp .env.example .env
# Fill in database, pusher, stripe, and email credentials

# 3. Generate Prisma DB client
npx prisma generate

# 4. Dev execution
npm run dev
```
- Open `http://localhost:3000` to interact with AHHHMETV.
