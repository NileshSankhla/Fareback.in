# 🎯 Affiliate Link Rotation System - Quick Reference Card

## 🚀 Get Started (5 Minutes)

```bash
# 1. Apply database migrations
bun run db:push

# 2. Verify Excel file placement
ls -la amazonlinks.xlsx
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
| Link Loader | `src/lib/affiliate-links.ts` | Load 100 URLs from Excel |
| Rotation Logic | `src/lib/affiliate-rotation.ts` | Atomic counter increment |
| API Handler | `src/app/api/redirect/route.ts` | Serve rotating links |
| Admin View | `src/components/admin/...` | Show which link used |
| Database | `affiliate_link_counter` table | Persist rotation state |

---

## 🔍 Monitor System

```bash
# Check status
bun scripts/affiliate-admin.ts status
# Shows: total links, current index, stats

# View statistics
bun scripts/affiliate-admin.ts stats
# Shows: which links are used most

# Reset counter (if needed)
bun scripts/affiliate-admin.ts reset
# Counter back to 0, next click = User1
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

# Custom script
node scripts/test-affiliate-rotation.js
```

---

## 📁 Required Files

```
Project Root/
├── amazonlinks.xlsx          ← Place your 100 affiliate links here
├── src/lib/
│   ├── affiliate-links.ts      ← Load Excel file
│   └── affiliate-rotation.ts   ← Manage rotation
├── drizzle/
│   ├── 0004_*.sql              ← DB columns
│   └── 0005_*.sql              ← Counter table
└── package.json                ← Has xlsx package
```

---

## 🎛️ Configuration

### Change number of links:
Edit `src/lib/affiliate-rotation.ts`:
```typescript
const linkIndex = (currentCount - 1) % totalLinks;
// totalLinks = number of links you have
```

### Change Excel file name:
Edit `src/lib/affiliate-links.ts`:
```typescript
const filePath = resolve(process.cwd(), "newname.xlsx");
```

### Change rotation behavior:
Modify rotation logic in `affiliate-rotation.ts`
(Advanced - see AFFILIATE_SYSTEM_GUIDE.md)

---

## 🐛 Quick Troubleshooting

| Issue | Fix |
|-------|-----|
| "No affiliate links found" | Check `amazonlinks.xlsx` exists with URLs in column A |
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
✅ **Fast** - <10ms per request, Excel cached  
✅ **Tracked** - Every link index stored with transaction  
✅ **Monitored** - Admin panel shows which link was used  
✅ **Scalable** - Works with any number of users  

---

## 📚 Documentation

- **SETUP_AFFILIATE_SYSTEM.md** - Setup guide
- **AFFILIATE_SYSTEM_GUIDE.md** - Complete technical docs
- **EXCEL_FILE_GUIDE.md** - Excel file format
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
