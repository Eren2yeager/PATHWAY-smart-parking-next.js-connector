# ⚡ Quick Start — Smart Parking Next.js Frontend

## Prerequisites

| Tool            | Version                                             |
| --------------- | --------------------------------------------------- |
| Node.js         | 18+                                                 |
| npm / pnpm      | any recent                                          |
| MongoDB         | local (`mongod`) or Atlas URI                       |
| Pathway backend | running on `localhost:8000` (see `../pathway-work`) |

---

## 1. Install Dependencies

```bash
cd next.js-work
npm install
# or
pnpm install
```

---

## 2. Configure Environment Variables

Create `.env.local` in `next.js-work/` (copy from `.env.example` and fill in your values):

```env
# ── MongoDB ──────────────────────────────────────────────────────────────
MONGODB_URI=mongodb://127.0.0.1:27017/smart-parking

# ── NextAuth ─────────────────────────────────────────────────────────────
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=change-this-to-a-random-string
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ── Google OAuth (https://console.cloud.google.com) ──────────────────────
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# ── Pathway / Python Backend ──────────────────────────────────────────────
NEXT_PUBLIC_PYTHON_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_PYTHON_BACKEND_WS_URL=ws://localhost:8000

# ── Webhook Auth (must match PATHWAY_WEBHOOK_SECRET in pathway-work/.env) ─
PATHWAY_WEBHOOK_SECRET=your-shared-secret
```

> **NEXTAUTH_SECRET** — generate a secure value with:
>
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

> **Google OAuth** — add `http://localhost:3000/api/auth/callback/google` as an
> Authorized Redirect URI in the Google Cloud Console.

---

## 3. Start Services

### Option A — All-in-one (recommended)

Start MongoDB, the Pathway backend, then the Next.js dev server:

```bash
# Terminal 1 – MongoDB (if running locally)
mongod

# Terminal 2 – Pathway backend
cd ../pathway-work
python main.py          # or: docker-compose up --build -d

# Terminal 3 – Next.js
cd ../next.js-work
npm run dev
```

### Option B — Next.js only (no AI / real-time)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 4. First-Time Setup

1. **Sign in** via Google OAuth at `/login`
2. Your account starts with the `user` role
3. To grant yourself `admin` access, connect to MongoDB and run:
   ```js
   db.users.updateOne(
     { email: "you@example.com" },
     { $set: { role: "admin" } },
   );
   ```
4. Re-login for the role change to take effect
5. Go to **Parking Lots → Create New** to add your first lot

---

## 5. Verify Everything Works

| Check           | How                                                                                                         |
| --------------- | ----------------------------------------------------------------------------------------------------------- |
| App loads       | `http://localhost:3000` shows the login page                                                                |
| DB connected    | `http://localhost:3000/api/health` returns `"database": "connected"`                                        |
| Pathway backend | `http://localhost:3000/api/health` returns `"pathway_backend": "connected"`                                 |
| Real-time SSE   | Open DevTools → Network, filter `EventStream`, refresh dashboard — you should see `/api/sse/dashboard` open |

---

## 6. Useful Commands

```bash
npm run dev          # Start development server (hot reload)
npm run build        # Production build
npm run start        # Serve production build
npm run lint         # ESLint
npm test             # Run all tests (Vitest)
npm run test:unit    # Unit tests only
npm run test:e2e     # Playwright E2E tests
```

---

## 7. Common Issues

### "Callback URI mismatch" (Google OAuth)

Make sure `http://localhost:3000/api/auth/callback/google` is in **Authorized redirect URIs** in Google Cloud Console.

### MongoDB connection refused

Start `mongod` or check your `MONGODB_URI`. For Atlas, whitelist your IP.

### Pathway webhook not reaching Next.js

Check `NEXT_PUBLIC_APP_URL` matches the URL Next.js is running on. The Pathway backend calls this URL to send capacity updates.

### Real-time data not updating

1. Confirm the Pathway backend is running and connected via WebSocket
2. Check `PATHWAY_WEBHOOK_SECRET` matches in both `.env.local` (Next.js) and the Pathway backend `.env`
3. Check the browser console for SSE connection errors on `/api/sse/dashboard`
