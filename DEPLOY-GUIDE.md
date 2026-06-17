# SendivTech — Complete Deployment Guide
## Supabase (Database) + Vercel (Hosting)

---

## WHAT CHANGED IN YOUR APP

Your old app saved data in `window.storage` (browser memory — data was lost on refresh or on other devices).

The new `app.js` saves everything to **Supabase** — a real cloud database. Think of it like MySQL but in the cloud and free. Your data persists forever, works on every device, and never gets lost.

| Feature         | Old (window.storage) | New (Supabase)        |
|----------------|----------------------|----------------------|
| Projects        | Lost on refresh      | Saved forever        |
| Reviews         | Lost on refresh      | Saved forever        |
| Logo            | Lost on refresh      | Saved forever        |
| Multi-device    | ❌ No               | ✅ Yes               |
| Free            | ✅ Yes              | ✅ Yes (free tier)   |

---

## STEP 1 — Create Supabase Account & Database

1. Go to **https://supabase.com** → Click **Start for Free**
2. Sign up with GitHub or Email
3. Click **New Project**
   - Name: `sendivtech`
   - Password: create a strong password (save it!)
   - Region: `Southeast Asia (Singapore)` ← closest to Chennai
   - Click **Create new project** (takes ~2 minutes)

---

## STEP 2 — Create Your Database Tables

1. In Supabase dashboard → click **SQL Editor** (left sidebar, looks like `</>`)
2. Click **New Query**
3. Open the file `supabase-setup.sql` (provided with this guide)
4. Copy ALL the SQL text and paste it into the editor
5. Click **Run** (green button, top right)
6. You should see: `Success. No rows returned`

Your 3 tables are now created: **projects**, **reviews**, **settings**

---

## STEP 3 — Get Your Supabase Keys

1. In Supabase → click **Settings** (gear icon, bottom left)
2. Click **API**
3. You will see two important values:

```
Project URL:   https://xxxxxxxxxx.supabase.co
Anon/Public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. Copy both — you will need them in the next step.

---

## STEP 4 — Update app.js With Your Keys

Open the new `app.js` file. Find lines 7–8 at the very top:

```javascript
const SUPABASE_URL  = 'YOUR_SUPABASE_URL';
const SUPABASE_KEY  = 'YOUR_SUPABASE_ANON_KEY';
```

Replace with your actual values:

```javascript
const SUPABASE_URL  = 'https://xxxxxxxxxx.supabase.co';
const SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

Save the file.

---

## STEP 5 — Prepare Your Project Files

Make sure your project folder has these files:

```
sendivtech/
├── index.html        ← same file (no changes needed)
├── style.css         ← same file (no changes needed)
├── app.js            ← REPLACE with new app.js from this guide
└── image/
    └── video/
        ├── logo.png
        └── logovi.mp4
```

**Important:** Your `index.html` and `style.css` files do NOT need any changes.
Only `app.js` is replaced.

---

## STEP 6 — Deploy to Vercel

### Option A: Drag & Drop (Easiest — no coding needed)

1. Go to **https://vercel.com** → Sign up (use GitHub)
2. Click **Add New → Project**
3. Click **Deploy from your computer** (or drag & drop)
4. Drag your entire `sendivtech` folder onto the Vercel page
5. Vercel will auto-detect it's a static website
6. Click **Deploy**
7. Wait ~30 seconds
8. You get a live URL like: `https://sendivtech.vercel.app`

### Option B: GitHub (Recommended for updates)

1. Create a free account at **https://github.com**
2. Click **New Repository** → name it `sendivtech` → Public → Create
3. Upload all your files to GitHub (drag & drop in browser)
4. Go to **https://vercel.com** → Add New Project → Import from GitHub
5. Select your `sendivtech` repo
6. Click **Deploy**

With Option B, whenever you change a file on GitHub, Vercel auto-deploys in 30 seconds.

---

## STEP 7 — Add Custom Domain (Optional)

If you have a domain like `sendivtech.in`:

1. In Vercel → your project → **Settings → Domains**
2. Type `sendivtech.in` → Add
3. Vercel will show you DNS records to add
4. Go to your domain registrar (GoDaddy / Namecheap etc.)
5. Add the records Vercel shows
6. Wait 5–30 minutes → your site is live on your domain!

---

## STEP 8 — Test Everything

After deployment, test these things:

- [ ] Open your Vercel URL in browser
- [ ] Click **Admin** → login with `admin` / `sendiv2025`
- [ ] Add a new project → check it appears on site
- [ ] Submit a test review → check it shows as "Pending" in admin
- [ ] Approve the review → check it shows on site
- [ ] Open the site on your **phone** — data should be the same!
- [ ] Close browser, reopen → projects still there ✅

---

## VIEWING YOUR DATA LIKE MYSQL

In Supabase → click **Table Editor** in left sidebar.

You'll see your tables just like phpMyAdmin:
- Click `projects` → see all your projects in rows
- Click `reviews` → see all reviews
- You can edit, delete, add rows directly — just like MySQL Workbench!

---

## COMMON ERRORS & FIXES

| Error | Fix |
|-------|-----|
| "Projects load error" in console | Check SUPABASE_URL and SUPABASE_KEY are correct |
| Data not saving | Check SQL ran without errors in Step 2 |
| Images not showing | Normal — images are stored as base64, they work fine |
| Site not loading | Check Vercel deployment logs for errors |
| "relation does not exist" | Run the SQL from Step 2 again |

---

## FREE TIER LIMITS (You won't hit these for years)

| Supabase Free | Limit |
|--------------|-------|
| Database size | 500 MB |
| API requests  | 2 million/month |
| Storage       | 1 GB |

| Vercel Free | Limit |
|------------|-------|
| Deployments | Unlimited |
| Bandwidth   | 100 GB/month |
| Custom domains | Yes, free |

---

## SUMMARY

```
Your Files          → Vercel    (hosting, gives you a URL)
Your Data           → Supabase  (database, stores projects/reviews)
MySQL knowledge     → Supabase uses PostgreSQL (99% same as MySQL)
Cost                → FREE for your usage level
```

Need help? WhatsApp: +91 81220 83267
