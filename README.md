# Fareback

A production-ready, high-performance web foundation built with the best modern tools available.

## Tech Stack

| Tool | Purpose |
|---|---|
| **Next.js 16** (App Router) | Framework with React Server Components |
| **Node.js 24** | Runtime |
| **Bun** | Package manager & runtime |
| **TypeScript** (strict) | Type safety |
| **Tailwind CSS v4** | Styling, dark mode default |
| **Shadcn/UI** (Radix UI) | Atomic UI components |
| **Lucide Icons** | Icon library |
| **Drizzle ORM** | Edge-compatible ORM |
| **PostgreSQL** | Database |
| **Zod** | Schema validation |
| **next-themes** | Dark/Light theme switching |

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/page.tsx
│   │   └── sign-up/page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── input.tsx
│   ├── footer.tsx
│   ├── hero-section.tsx
│   ├── navbar.tsx
│   ├── providers.tsx
│   └── theme-switcher.tsx
├── hooks/
│   ├── use-local-storage.ts
│   └── use-theme.ts
└── lib/
    ├── db/
    │   ├── index.ts
    │   └── schema.ts
    ├── validations/
    │   └── auth.ts
    └── utils.ts
```

## Getting Started

### 1. Clone and install dependencies

```bash
git clone https://github.com/<your-username>/fareback.git
cd fareback
bun install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
# Edit .env.local with your values
```

#### Google-only authentication setup (required)

This project is configured for Google OAuth only (no email/password sign-in).

1. Open Google Cloud Console: <https://console.cloud.google.com>.
2. Create a project (or select an existing one).
3. Go to **APIs & Services → OAuth consent screen**.
4. Choose **External** user type (for public users) and fill app details.
5. Add scopes: `openid`, `email`, `profile`.
6. Add test users if your app is still in testing mode.
7. Go to **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
8. Application type: **Web application**.
9. Add Authorized JavaScript origins:
  - `http://localhost:3000`
  - `https://fareback.in`
10. Add Authorized redirect URIs:
  - `http://localhost:3000/api/auth/google/callback`
  - `https://fareback.in/api/auth/google/callback`
11. Click **Create** and copy **Client ID** and **Client Secret**.
12. Put them in `.env.local`:

```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

13. For Vercel production, add the same variables in **Project Settings → Environment Variables**:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `NEXT_PUBLIC_APP_URL=https://fareback.in`
14. Redeploy after saving variables.

If Google shows `redirect_uri_mismatch`, the URI in Google Console must match exactly, including protocol (`http` vs `https`), domain, and path.

### 3. Start the local database

```bash
docker compose up -d
```

### 4. Run database migrations

```bash
bun run db:push
```

### 5. Start the development server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database

This project uses [Drizzle ORM](https://orm.drizzle.team/) with PostgreSQL.

```bash
# Push schema to database
bun run db:push

# Open Drizzle Studio (visual database browser)
bun run db:studio
```

## Deployment

The project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically deploys to Vercel on push to `main`.

### Required GitHub Secrets

| Secret | Description |
|---|---|
| `VERCEL_TOKEN` | Vercel API token |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |

### Vercel + Neon Postgres Setup

This app uses **two** environment variables for the database:

| Variable | Connection type | Used by |
|---|---|---|
| `DATABASE_URL` | Pooled (PgBouncer) | Running Next.js app (all queries) |
| `DATABASE_URL_UNPOOLED` | Direct (no pooler) | Drizzle Kit migrations (`db:push`, `db:migrate`, `db:studio`) |

#### 1. Get your Neon connection strings

1. Open your [Neon dashboard](https://console.neon.tech) → select your project.
2. Go to **Connection Details**.
3. Copy **both** URLs:
   - **Pooled** (contains `-pooler` in the host):
     ```
     postgres://<user>:<password>@ep-xxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
     ```
   - **Direct / Unpooled** (no `-pooler`):
     ```
     postgres://<user>:<password>@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
     ```

> **Why two URLs?**  
> PgBouncer runs in *transaction mode* for Neon pooled connections. This can interfere with DDL statements (CREATE TABLE, ALTER TABLE, etc.) that Drizzle Kit issues during migrations. The direct connection bypasses PgBouncer so migrations always succeed.

#### 2. Set environment variables in Vercel

1. Vercel Dashboard → your project → **Settings → Environment Variables**.
2. Add (or update) these two variables for **all environments** (Production, Preview, Development):

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | Your Neon **pooled** connection string |
   | `DATABASE_URL_UNPOOLED` | Your Neon **direct** connection string |

3. Click **Save**, then **Redeploy** (or push a new commit) to pick up the changes.

> If Vercel's Neon integration already created `DATABASE_URL_UNPOOLED` and the other `DATABASE_*` variables, you may already have both — just verify the values are correct.

#### 3. Run migrations against Neon (one-time)

Before the first deployment (or after schema changes), push the schema to Neon.  
From your local machine with the Neon URLs in `.env.local`:

```bash
# .env.local
DATABASE_URL=postgres://<user>:<password>@ep-xxx-pooler...neon.tech/neondb?sslmode=require
DATABASE_URL_UNPOOLED=postgres://<user>:<password>@ep-xxx...neon.tech/neondb?sslmode=require
```

```bash
bun run db:push
```

This uses Drizzle Kit (via the direct `DATABASE_URL_UNPOOLED` connection) to create all tables in the Neon database.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE)
