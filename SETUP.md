# Factory Site Template - Setup Guide

This is a standalone Next.js 15 site generated from the Factory template. Each site has its own GitHub repository and Vercel deployment.

## Quick Start

### 1. Clone & Install

```bash
# Clone this repository
git clone https://github.com/YOUR_ORG/YOUR_REPO.git
cd YOUR_REPO

# Install dependencies
npm install
# or
pnpm install
```

### 2. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env.local
```

Edit `.env.local` with your values:

| Variable | Required | Description |
|----------|----------|-------------|
| `SITE_ID` | ✅ | UUID from Factory's sites table |
| `SITE_SLUG` | ✅ | URL-friendly site identifier |
| `SITE_NAME` | ✅ | Display name for the site |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key |
| `SITE_DOMAIN` | ❌ | Custom domain |
| `SITE_NICHE` | ❌ | Site category/niche |
| `SITE_PRIMARY_COLOR` | ❌ | Primary theme color (default: #3B82F6) |

### 3. Run Development Server

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see your site.

---

## Deploy to Vercel

### Option A: Claude Skills (Recommended)

Use natural language to deploy via Claude Skills:

```
# Deploy your site
"Deploy the [site-name] site to Vercel"

# Add custom domain
"Set up domain [domain.com] for [site-name]"

# Check deployment status
"What's the status of the [site-name] deployment?"
```

Claude Skills handle all the n8n workflow calls, environment variables, and domain configuration automatically.

### Option B: Automated (via Factory n8n Workflow)

If this repo was created by the Factory Site Wizard, deployment is automatic:
1. Site Wizard creates this repo from template
2. Frontend Deploy workflow creates Vercel project
3. Environment variables are configured automatically
4. Domain is added and verified

### Option C: Manual Deployment

1. **Push to GitHub** (if not already)
   ```bash
   git remote add origin https://github.com/YOUR_ORG/YOUR_REPO.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Configure environment variables (copy from `.env.local`)

3. **Add Custom Domain** (optional)
   - Vercel Dashboard → Project → Settings → Domains
   - Add your domain and configure DNS

---

## Project Structure

```
factory-site/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── layout.tsx       # Root layout with theme
│   │   ├── page.tsx         # Homepage
│   │   └── not-found.tsx    # 404 page
│   ├── lib/
│   │   ├── site-config.ts   # Environment-based site config
│   │   └── supabase.ts      # Supabase client factory
│   └── types/
│       ├── database.ts      # Database types
│       └── index.ts         # Type exports
├── .env.example             # Environment template
├── SETUP.md                 # This file
└── package.json
```

---

## Configuration Options

### Theme Configuration

You can configure the theme in two ways:

**Individual Variables:**
```env
SITE_PRIMARY_COLOR=#3B82F6
SITE_ACCENT_COLOR=#2563EB
SITE_FONT_FAMILY=Inter
SITE_LOGO_URL=https://example.com/logo.png
```

**JSON Object:**
```env
SITE_THEME_CONFIG={"primaryColor":"#3B82F6","accentColor":"#2563EB","fontFamily":"Inter","logoUrl":null}
```

### Feature Flags

Enable or disable site features:
```env
SITE_FEATURE_BLOG=true
SITE_FEATURE_OFFERS=true
SITE_FEATURE_NEWSLETTER=false
```

---

## Database

This site connects to a shared Supabase database. All queries are scoped by `site_id` using Row Level Security (RLS).

### Tables Used

| Table | Purpose |
|-------|---------|
| `sites` | Site metadata (created by Factory) |
| `categories` | Content categories |
| `posts` | Blog articles |
| `offers` | Affiliate products |

### Important

- Never query without `site_id` filter
- The `SITE_ID` env var must match the sites table record
- Content is managed via Factory Admin dashboard

---

## Customization

### Adding Pages

Create new pages in `src/app/`:
```typescript
// src/app/about/page.tsx
import { getSiteConfig } from '@/lib/site-config';

export default function AboutPage() {
  const site = getSiteConfig();
  return <div>About {site.name}</div>;
}
```

### Styling

This template uses Tailwind CSS. Theme colors are available as CSS variables:
- `--color-primary` - Primary brand color
- `--color-accent` - Accent color
- `--font-family` - Base font family

---

## Support

For Factory-related questions:
- Check the main [Factory documentation](https://github.com/Gigabyte00/Factory)
- Review the [SESSION-HANDOFF.md](https://github.com/Gigabyte00/Factory/blob/main/SESSION-HANDOFF.md) for latest updates
- Use Claude Skills: *"Help me with [issue]"* or *"Debug why [problem]"*

**Quick Help via Claude Skills:**
```
"Check health of my site"
"Why is my deployment failing?"
"Show me recent n8n errors"
```

For Next.js questions:
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
