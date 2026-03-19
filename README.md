# my-modern-web

A production-ready, high-performance web foundation built with the best modern tools available.

## Tech Stack

| Tool | Purpose |
|---|---|
| **Next.js 16** (App Router) | Framework with React Server Components |
| **Node.js 24** | Runtime |
| **npm** | Package manager |
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
git clone https://github.com/NileshSankhla/my-modern-web.git
cd my-modern-web
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
# Edit .env.local with your values
```

### 3. Start the local database

```bash
docker compose up -d
```

### 4. Run database migrations

```bash
npm run db:push
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database

This project uses [Drizzle ORM](https://orm.drizzle.team/) with PostgreSQL.

```bash
# Push schema to database
npm run db:push

# Open Drizzle Studio (visual database browser)
npm run db:studio
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

This app reads **one** environment variable for the database connection: `DATABASE_URL`.

#### 1. Get your Neon connection string

1. Open your [Neon dashboard](https://console.neon.tech) → select your project.
2. Go to **Connection Details**.
3. Choose the **Pooled connection** string (it contains `-pooler` in the host, e.g. `us-east-2-pooler.neon.tech`).  
   The pooled URL is required because Vercel serverless functions open a new connection on every cold start; the pooler (PgBouncer) multiplexes those connections on Neon's side.
4. Copy the full URL, e.g.:
   ```
   postgres://<user>:<password>@ep-xxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

> **Pooled vs Unpooled**  
> - **Pooled** (`-pooler` host, PgBouncer in transaction mode) → use for the running app (`DATABASE_URL`).  
> - **Unpooled** (direct host, no pooler) → use only when you need `SET` / `LISTEN` / `NOTIFY` or session-level features (not needed here).

#### 2. Set the environment variable in Vercel

1. Vercel Dashboard → your project → **Settings → Environment Variables**.
2. Add (or update) one variable:
   - **Key**: `DATABASE_URL`
   - **Value**: your Neon **pooled** connection string from step 1
   - **Environments**: ✅ Production  ✅ Preview  ✅ Development
3. Click **Save**, then **Redeploy** (or push a new commit) to pick up the change.

> If Vercel's Neon integration auto-created variables like `DATABASE_POSTGRES_URL`, `DATABASE_POSTGRES_PRISMA_URL`, `DATABASE_URL_UNPOOLED`, etc., you can leave them as-is — the app only reads `DATABASE_URL`.

#### 3. Run migrations against Neon (one-time)

Before the first deployment (or after schema changes) you need to push the schema to Neon.  
From your local machine with the Neon URL in `.env.local`:

```bash
# .env.local
DATABASE_URL=postgres://<user>:<password>@ep-xxx-pooler...neon.tech/neondb?sslmode=require
```

```bash
npm run db:push
```

This uses Drizzle Kit to create all tables in the Neon database.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE)
