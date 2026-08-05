# 🎥 AHHHMETV

> **The Next-Generation Random Video Chat Platform**

A premium, production-ready random video chat platform built with modern web technologies. Connect with people from around the world through instant HD video chat with smart matching, AI moderation, and a beautiful dark glassmorphic UI.

---

## ✨ Features

### Core
- 🎥 **HD Video Chat** — WebRTC with echo cancellation and noise suppression
- ⚡ **Instant Matching** — Smart queue-based matching with filters
- 💬 **Live Text Chat** — Real-time messaging with typing indicators
- 👥 **Friend System** — Send requests, manage friends, track online status
- 🎨 **Premium Dark UI** — Glassmorphism, neon glows, Framer Motion animations

### Matching System
- 🎯 Interest-based matching
- 🌍 Country filter
- 👤 Gender filter
- 🗣️ Language filter
- 👶 Age range filter
- 🔀 Skip instantly / Next button
- 🔄 Reconnect to previous stranger

### Video & Audio
- 📹 Camera toggle
- 🎤 Microphone toggle
- 🖥️ Screen sharing
- 🖼️ Picture-in-picture
- ⏱️ Call timer
- 📊 Network quality indicator

### Safety & Moderation
- 🤖 AI auto-moderation (toxic language, spam, nudity detection)
- 🚫 Block & report users
- 🛡️ Shadow banning
- 🧑‍⚖️ Admin moderation queue
- 🔒 Rate limiting

### Premium (Stripe)
- 👑 Premium badge
- 🎛️ Unlimited filters
- ⭐ Priority matching
- 🎨 Custom backgrounds & themes

### Admin Dashboard
- 📊 Analytics & metrics
- 👥 User management
- 🚩 Reports queue
- 📢 Announcements
- 📋 System logs

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| Animations | Framer Motion |
| State | Zustand, TanStack Query |
| Forms | React Hook Form, Zod |
| Backend | Node.js, Express, TypeScript |
| Real-time | Socket.io |
| Video | WebRTC |
| Database | PostgreSQL, Prisma ORM |
| Cache | Redis |
| Auth | JWT, OAuth (Google/Discord/GitHub) |
| Payments | Stripe |
| Email | Nodemailer (SMTP) |
| Infra | Docker, NGINX, PM2, GitHub Actions |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 16
- Redis 7
- (Or just Docker)

### Option 1: Docker (Recommended)

```bash
# Clone and setup
cp .env.example .env
# Edit .env with your configuration

# Start all services
docker-compose up --build
```

### Option 2: Manual Setup

```bash
# 1. Install dependencies
npm install
cd apps/server && npm install
cd ../web && npm install
cd ../..

# 2. Setup environment
cp .env.example .env
# Edit .env with your database URL, JWT secrets, etc.

# 3. Setup database
cd apps/server
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
cd ../..

# 4. Start development
npm run dev
```

### Access
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000
- **Prisma Studio:** `cd apps/server && npx prisma studio`

### Default Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ahhhmetv.com | admin_change_me |
| Moderator | mod@ahhhmetv.com | mod_change_me |
| Test User | alice@test.com | testpass123 |

---

## 📁 Project Structure

```
ahhhmetv/
├── apps/
│   ├── web/                      # Next.js 15 Frontend
│   │   ├── src/
│   │   │   ├── app/              # App Router pages
│   │   │   │   ├── page.tsx      # Landing page
│   │   │   │   ├── login/        # Login page
│   │   │   │   ├── register/     # Register page
│   │   │   │   ├── chat/         # Video chat page
│   │   │   │   ├── profile/      # Profile page
│   │   │   │   ├── friends/      # Friends page
│   │   │   │   ├── premium/      # Premium page
│   │   │   │   ├── settings/     # Settings page
│   │   │   │   ├── admin/        # Admin dashboard
│   │   │   │   └── forgot-password/
│   │   │   ├── components/       # React components
│   │   │   ├── hooks/            # Custom hooks
│   │   │   ├── lib/              # API client
│   │   │   ├── stores/           # Zustand stores
│   │   │   └── types/            # TypeScript types
│   │   ├── public/               # Static assets
│   │   ├── tailwind.config.ts
│   │   └── Dockerfile
│   └── server/                   # Express Backend
│       ├── src/
│       │   ├── config/           # App config, DB, Redis
│       │   ├── middleware/       # Auth, rate limit, validation
│       │   ├── routes/           # API route controllers
│       │   ├── services/         # AI moderation
│       │   ├── socket/           # Socket.io + WebRTC signaling
│       │   ├── utils/            # Email, validators
│       │   └── index.ts          # Server entry point
│       ├── prisma/
│       │   ├── schema.prisma     # Database schema
│       │   └── seed.ts           # Seed script
│       └── Dockerfile
├── nginx/
│   └── nginx.conf
├── .github/workflows/
│   └── ci.yml
├── docker-compose.yml
├── docker-compose.prod.yml
├── ecosystem.config.cjs
├── .env.example
└── README.md
```

---

## 🔑 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register with email |
| POST | `/api/auth/login` | Email/password login |
| POST | `/api/auth/guest` | Guest session |
| POST | `/api/auth/refresh` | Refresh JWT token |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |
| GET | `/api/auth/verify-email` | Verify email |
| GET | `/api/auth/me` | Get current user |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get own profile |
| PATCH | `/api/users/me` | Update profile |
| POST | `/api/users/avatar` | Upload avatar |
| GET | `/api/users/online` | Online count |
| GET | `/api/users/:id` | Get public profile |
| DELETE | `/api/users/me` | Delete account |

### Friends
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/friends/request` | Send friend request |
| POST | `/api/friends/accept/:id` | Accept request |
| POST | `/api/friends/reject/:id` | Reject request |
| GET | `/api/friends` | List friends |
| GET | `/api/friends/requests` | List pending requests |
| DELETE | `/api/friends/:id` | Remove friend |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reports` | Report user |
| POST | `/api/reports/block` | Block user |
| DELETE | `/api/reports/block/:id` | Unblock user |
| GET | `/api/reports/blocked` | List blocked users |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/create-checkout` | Start Stripe checkout |
| POST | `/api/payments/webhook` | Stripe webhook |
| GET | `/api/payments/subscription` | Get subscription |
| POST | `/api/payments/cancel` | Cancel subscription |

### Admin (ADMIN/MODERATOR only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard stats |
| GET | `/api/admin/users` | User list |
| POST | `/api/admin/ban/:id` | Ban user |
| POST | `/api/admin/unban/:id` | Unban user |
| GET | `/api/admin/reports` | Reports queue |
| PATCH | `/api/admin/reports/:id` | Resolve report |
| GET | `/api/admin/logs` | System logs |
| GET | `/api/admin/analytics` | Analytics data |

### Socket.io Events
| Event | Direction | Description |
|-------|-----------|-------------|
| `match:join` | Client → Server | Join matching queue |
| `match:found` | Server → Client | Match found |
| `match:skip` | Client → Server | Skip current match |
| `match:leave` | Client → Server | Leave queue |
| `match:reconnect` | Client → Server | Reconnect previous |
| `signal:offer` | Bidirectional | WebRTC offer |
| `signal:answer` | Bidirectional | WebRTC answer |
| `signal:ice-candidate` | Bidirectional | ICE candidate |
| `chat:message` | Bidirectional | Text message |
| `chat:typing` | Bidirectional | Typing indicator |
| `user:count` | Server → Client | Online count |

---

## 🚢 Deployment

### Production with Docker

```bash
# Build and start production
docker-compose -f docker-compose.prod.yml up --build -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### PM2 (Without Docker)

```bash
# Build
npm run build

# Start with PM2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

### Vercel (Frontend Only)

```bash
cd apps/web
npx vercel deploy
```

### Railway

1. Connect your GitHub repo
2. Set environment variables
3. Deploy automatically on push

---

## 🔒 Security

- **Helmet** — Security HTTP headers
- **Rate Limiting** — Per-endpoint limits with Redis store
- **CSRF** — Secure cookie configuration
- **XSS** — Input sanitization on all user inputs
- **SQL Injection** — Prisma parameterized queries
- **bcrypt** — Password hashing (12 rounds)
- **JWT Rotation** — Short-lived access tokens (15min) with refresh tokens (7d)
- **Secure Cookies** — httpOnly, secure, sameSite
- **CORS** — Configured for frontend origin only

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

Built with ❤️ by the AHHHMETV team
