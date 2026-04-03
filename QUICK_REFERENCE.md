# 🎯 Affiliate Link Rotation System - Quick Reference Card

## 🚀 Get Started (5 Minutes)

```bash
# 1. Apply database migrations
bun run db:push

# 2. Verify affiliate CSV placement
ls -la amazonlinks.csv
# Should show file in current directory ✓

# 3. Start server
bun run dev

# 4. Test it
# - Sign in at http://localhost:3000
# - Go to Merchants
# - Click "Go to Amazon"
# - Check /admin for "Affiliate Link: UserX"
```

---

## 📊 How It Works (One Pager)

```
User Clicks Amazon
       ↓
API gets next affiliate link atomically from DB
       ↓
Link index: 0 → User1
Link index: 1 → User2
Link index: 99 → User100
Link index: 100 → User1 (cycles)
       ↓
User redirected to that affiliate URL
       ↓
Admin panel shows which link was used
```

---

## ⚙️ System Components

| Component | File | Purpose |
|-----------|------|---------|
| Link Source | `amazonlinks.csv` | Source CSV for affiliate URLs |
| Rotation Logic | `src/lib/affiliate-rotation.ts` | Atomic counter increment |
| API Handler | `src/app/api/redirect/route.ts` | Serve rotating links |
| Seed Script | `scripts/seed-merchants.mjs` | Upsert merchants and sync links to Redis/DB |
| Admin View | `src/components/admin/...` | Show which link used |
| Database | `affiliate_link_counter` table | Persist rotation state |

---

## 🔍 Monitor System

```bash
# Seed merchants + affiliate links (Redis + DB)
bun run db:seed

# Verify database health endpoint
curl -s http://127.0.0.1:3000/api/health/db
```

---

## 🧪 Test Rotation

```bash
# Quick concurrent test
bun run load-test:quick
# Simulates 50 concurrent users for 20 seconds

# Stress test
bun run load-test:stress  
# Simulates 200 concurrent users for 60 seconds

# Run after server starts and while traffic is active
# (watch /admin for affiliate link index distribution)
```

---

## 📁 Required Files

```
Project Root/
├── amazonlinks.csv           ← Place affiliate links here
├── src/lib/
│   └── affiliate-rotation.ts   ← Manage rotation
├── drizzle/
│   ├── 0004_*.sql              ← DB columns
│   └── 0005_*.sql              ← Counter table
├── scripts/
│   └── seed-merchants.mjs      ← Sync links to Redis + DB
└── package.json                ← Run scripts and app commands
```

---

## 🎛️ Configuration

### Change number of links:
Edit `src/lib/affiliate-rotation.ts`:
```typescript
const linkIndex = (currentCount - 1) % totalLinks;
// totalLinks = number of links you have
```

### Change affiliate file name:
Update the CSV read path in `scripts/seed-merchants.mjs`.

### Change rotation behavior:
Modify rotation logic in `affiliate-rotation.ts`
(Advanced - see AFFILIATE_SYSTEM_GUIDE.md)

---

## 🐛 Quick Troubleshooting

| Issue | Fix |
|-------|-----|
| "No affiliate links found" | Check `amazonlinks.csv` exists and has non-empty URL rows |
| Counter not incrementing | Run `bun run db:push` to apply migrations |
| Same link every time | Use `bun run load-test:quick` to verify rotation |
| Affiliate info not in admin | Refresh page, or check migrations with `\d clicks` |

---

## 📊 Database Queries

```sql
-- See rotation count
SELECT link_count FROM affiliate_link_counter;

-- See all links used
SELECT affiliate_link_index, COUNT(*) 
FROM clicks 
WHERE affiliate_link_index IS NOT NULL 
GROUP BY affiliate_link_index;

-- Most used link
SELECT affiliate_link_index, COUNT(*) as count
FROM clicks
WHERE affiliate_link_index IS NOT NULL
GROUP BY affiliate_link_index
ORDER BY count DESC LIMIT 1;
```

---

## 🎯 Key Features

✅ **Concurrent Safe** - Database-level atomic operations  
✅ **Persistent** - Survives server restart  
✅ **Fast** - Redis-first path with DB fallback  
✅ **Tracked** - Every link index stored with transaction  
✅ **Monitored** - Admin panel shows which link was used  
✅ **Scalable** - Works with any number of users  

---

## 📚 Documentation

- **SETUP_AFFILIATE_SYSTEM.md** - Setup guide
- **AFFILIATE_SYSTEM_GUIDE.md** - Complete technical docs
- **amazonlinks.csv** - Affiliate link source file
- **IMPLEMENTATION_SUMMARY.md** - What was built
- **This file** - Quick reference

---

## 🎉 You're Ready!

**Run this now:**
```bash
bun run db:push && bun run dev
```

Then visit http://localhost:3000 and test! 🚀

---

**Last Updated:** March 29, 2026  
**Status:** ✅ Production Ready  
**Support**: See AFFILIATE_SYSTEM_GUIDE.md
