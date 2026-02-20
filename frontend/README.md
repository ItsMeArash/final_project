# Admin Dashboard Frontend

Frontend for the Admin Dashboard system built with Next.js, React, TypeScript, and Tailwind CSS.

## How to Start

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:4011](http://localhost:4011) in your browser.

**Note:** Frontend runs on port 4011. Ensure backend is running on port 4010 and `NEXT_PUBLIC_API_URL` in `.env.local` points to it.

## Features

- Multi-step authentication (Password + Captcha)
- User management with RBAC
- Data visualization with Highcharts
- Real-time chat with WebSocket
- Protected routes based on permissions

## Routes

| Route | Permission | Description |
|-------|------------|-------------|
| / | - | Redirects to dashboard or login |
| /auth/login | - | Login page |
| /dashboard | - | Dashboard (authenticated) |
| /users | USER_READ | User list |
| /users/create | USER_CREATE | Create user |
| /users/[id] | USER_READ | User detail/edit |
| /analytics | ANALYTICS_VIEW | Analytics charts |
| /chat | CHAT_SEND | Real-time chat |

## API Services

| Service | File | Purpose |
|---------|------|---------|
| auth | `src/services/auth.ts` | Login, captcha, verify |
| users | `src/services/users.ts` | User CRUD |
| roles | `src/services/roles.ts` | Roles, permissions |
| analytics | `src/services/analytics.ts` | Analytics data |
| chat | `src/services/chat.ts` | Chat history |

## Project Structure

- `app/` - Next.js App Router pages
- `src/components/` - Reusable React components
- `src/services/` - API service functions
- `src/stores/` - Zustand state management
- `src/hooks/` - Custom hooks
- `src/utils/` - Utilities

## Tech Stack

- Next.js 14 (App Router), React 18, TypeScript
- Tailwind CSS, TanStack Query, Zustand
- Highcharts, Axios
