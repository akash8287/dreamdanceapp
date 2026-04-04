# GrooveX — Android OTT (auditions & dances)

GrooveX is an **MX Player / Hotstar–style** Android app: **no user sign-in**, **five tabs** (Home, Auditions, Dances, My List, More), violet + neon-pink UI, and videos served from your own **GrooveX API**. The **admin** (browser or in-app **admin / admin**) configures the **backend URL** and uploads content.

## Repo layout

| Path | Purpose |
|------|--------|
| `backend/` | Node (Express) API, local disk or **optional S3** storage, `admin.html` uploader |
| `src/` | Expo / React Native Android app |

## Quick start

### 1. API server

```bash
cd backend
cp .env.example .env   # optional
npm install
npm start
```

- Health: `http://localhost:3001/api/health` (port from `backend/.env` → `PORT`)  
- Upload UI: `http://localhost:3001/admin.html` (Basic auth: **admin** / **admin** unless you set `ADMIN_USER` / `ADMIN_PASS`)

Videos are stored under `backend/uploads/` by default. For **S3** (AWS free tier / R2-style hosting), set `AWS_*` and `S3_PUBLIC_BASE_URL` in `backend/.env` — see `backend/.env.example`.

### 2. Android app

```bash
npm install
npx expo start
```

Default API URL in `app.config.js` is **`http://10.0.2.2:3001`** (emulator → your machine; matches default `PORT` in `backend/.env`). On a **physical device**, open **More → Admin setup (admin / admin)** and set e.g. `http://192.168.x.x:3001`.

`android.usesCleartextTraffic` is **enabled** so **http** dev servers work. Use **HTTPS** in production.

### Public tunnel (phone off Wi‑Fi) — 504 / “not reachable”

A **504** from tools like **Tunnelmole** means the tunnel’s servers could not open a connection to **`http://127.0.0.1:3001`** on your Mac in time. That is not fixed inside the app; check the following:

1. **API is up locally:** `curl -s http://127.0.0.1:3001/api/health` must return JSON on the same machine.
2. **Tunnel points at the right port:** e.g. `tunnelmole 3001` while `PORT=3001` in `backend/.env`.
3. **Keep both processes running:** closing the terminal stops the tunnel or the server.
4. **Try the `http://` tunnel URL** as well as `https://` (some networks block one).
5. In **`backend/.env`**, set **`PUBLIC_BASE_URL=https://YOUR-SUBDOMAIN.tunnelmole.net`** (no trailing slash), restart `npm start`, so video URLs in the API use your public host even if forwarded headers are wrong.

If Tunnelmole stays flaky, try **Cloudflare Tunnel** (`cloudflared tunnel --url http://localhost:3001`) or **ngrok** — same idea: expose `localhost:3001`, then put that **https** origin in the GrooveX app **Admin → API base URL** and in **`PUBLIC_BASE_URL`**.

### 3. EAS / new package name

The app is renamed to **GrooveX** with package **`com.groovex.app`**. After this change you need a **fresh native build** (`npx expo prebuild` / `eas build`). The embedded `projectId` may still point at your old Expo project; run `eas init` or update the project in [expo.dev](https://expo.dev) if builds fail.

## API (public, no auth)

- `GET /api/health`  
- `GET /api/videos` — optional `?category=audition|dance|all`  
- `GET /api/videos/featured`  

## API (admin, Basic auth)

- `GET /api/admin/videos` — list all (same shape as public list; requires auth)  
- `POST /api/admin/videos` — multipart: `title`, `description`, `category`, optional `featured`, `video` (file), optional `thumbnail`  
- `PATCH /api/admin/videos/:id` — JSON: `title`, `description`, `category`, `featured` (any subset)  
- `POST /api/admin/videos/:id/media` — multipart: optional new `video` and/or `thumbnail` (replaces stored files; local disk or S3)  
- `DELETE /api/admin/videos/:id`  
- `PATCH /api/admin/videos/:id/featured` — JSON `{ "featured": true|false }` (shortcut; same as `PATCH :id`)  

**Admin UI:** open `/admin.html` — login, **Upload** tab, **Library** with search/filter, **Edit** modal (metadata + optional file replace), **Delete** with confirmation.

## App behaviour

- **Home:** search, hero (first featured item), carousels for featured / auditions / dances.  
- **My list:** heart on the player saves IDs locally (`expo-secure-store`).  
- **More:** test server connection, link to in-app admin URL screen, hint for `/admin.html`.

## Design reference

UI direction follows a dark violet + magenta streaming layout. A static mock is saved as `assets/groovex-ui-reference.png` (from your reference boards).

## Privacy

No Google account. Optional **admin** password is demo-grade only — change for any real deployment.
