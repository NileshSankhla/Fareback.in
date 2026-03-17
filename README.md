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

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE)
