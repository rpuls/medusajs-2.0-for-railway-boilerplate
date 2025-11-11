# Backend UI (Admin Dashboard)

This is the Medusa Admin Dashboard extracted as a standalone application.

## Quick Start

### 1. Install Dependencies

```bash
yarn install
# or
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update with your Railway URLs:

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_MEDUSA_BACKEND_URL=https://your-backend.up.railway.app
VITE_MEDUSA_STOREFRONT_URL=https://your-storefront.up.railway.app
```

### 3. Run Development Server

```bash
yarn dev
# or
npm run dev
```

Access at `http://localhost:5173`

### 4. Build for Production

```bash
yarn build:preview
# or
npm run build:preview
```

Output will be in the `dist/` folder.

## Deploying to Railway

### Option 1: Railway Auto-Detection

Railway should auto-detect this as a Vite app. Configure:

1. **Root Directory**: `backend-ui`
2. **Build Command**: `yarn build:preview` or `npm run build:preview`
3. **Start Command**: `yarn preview` or `npm run preview`
4. **Output Directory**: `dist`

### Option 2: Manual Configuration

In Railway dashboard:
- **Root Directory**: `backend-ui`
- **Build Command**: `yarn install && yarn build:preview`
- **Start Command**: `yarn preview`
- **Port**: Railway will auto-detect (usually 4173 for preview)

### Environment Variables in Railway

Add these in Railway:
- `VITE_MEDUSA_BACKEND_URL` = Your backend Railway URL
- `VITE_MEDUSA_STOREFRONT_URL` = Your storefront Railway URL

## Important: Disable Admin in Backend

Before deploying this, make sure your backend has admin disabled:

**In Railway Backend Environment Variables:**
```
MEDUSA_DISABLE_ADMIN=true
```

**Or update `backend/medusa-config.js`:**
```js
admin: {
  backendUrl: BACKEND_URL,
  disable: true,
}
```

## CORS Configuration

Make sure your backend allows requests from your admin dashboard:

**In Railway Backend Environment Variables:**
```
ADMIN_CORS=https://your-admin-dashboard.up.railway.app,http://localhost:5173
```

## Customizing Branding

After setup, you can customize branding by:

1. **Search for Medusa references:**
   ```bash
   grep -r "Medusa" --include="*.tsx" --include="*.ts" --include="*.json" .
   ```

2. **Common locations:**
   - `src/components/layout/` - Sidebar, header components
   - `public/` - Favicon, static assets
   - `index.html` - Page title, meta tags
   - `src/components/common/` - Logo components

3. **Replace:**
   - "Medusa" text → Your brand name
   - Logo files → Your logo
   - Favicon → Your favicon

## Scripts

- `yarn dev` - Start development server
- `yarn build:preview` - Build for production
- `yarn preview` - Preview production build locally
- `yarn build` - Build library (for npm package)

## Notes

- This dashboard connects to your backend via API calls
- It's a separate frontend application (like your storefront)
- You can deploy it anywhere (Railway, Vercel, Netlify, etc.)
- Make sure CORS is configured correctly in your backend
