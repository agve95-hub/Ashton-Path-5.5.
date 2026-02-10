<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Ashton Path 5.5

This repository contains a Vite + React web app.

## Run locally

**Prerequisites:** Node.js 20+

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the dev server:
   ```bash
   npm run dev
   ```
3. Build production files:
   ```bash
   npm run build
   ```

---

## Hostinger Git import error (important)

If Hostinger shows:

> **"Unsupported framework or invalid project structure"**

that usually means Hostinger's **Git import wizard does not support this Vite project type directly**.

✅ Use the GitHub Actions deploy workflow in this repo instead (build on GitHub, upload built `dist/` files to Hostinger via FTPS).

---

## Deploy on Hostinger from GitHub (recommended)

This repo includes a GitHub Actions workflow that:
- installs dependencies,
- builds the app,
- uploads `dist/` to Hostinger via FTPS.

### 1) Add GitHub repository secrets
In GitHub → **Settings → Secrets and variables → Actions**, add:

- `HOSTINGER_FTP_HOST` (example: `ftp.yourdomain.com`)
- `HOSTINGER_FTP_USERNAME`
- `HOSTINGER_FTP_PASSWORD`
- `HOSTINGER_TARGET_DIR` (example: `/domains/yourdomain.com/public_html/`)

### 2) Push to `main` or `master`
Every push to `main` or `master` runs `.github/workflows/hostinger-deploy.yml` and deploys the latest `dist/` build.

### 3) SPA routing support
The file `public/.htaccess` is included so client-side routes resolve to `index.html` after deployment.

---

## Manual Hostinger deploy (fallback)

If you do not want GitHub Actions:

1. Build locally:
   ```bash
   npm install
   npm run build
   ```
2. Upload the contents of `dist/` to your Hostinger `public_html` folder.
3. Make sure `.htaccess` exists in `public_html` (generated from `public/.htaccess` during build).
