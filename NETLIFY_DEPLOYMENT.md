# Netlify Deployment & Custom Domain Guide
**Al Sahab Al Rashid Trad. Con. LLC (wwwasar.com)**  
*Lead Electrical Engineer & Developer: Eng Abdullah Al Osman Shakil (abdullahalshakil7@gmail.com)*

---

## ⚡ 1. Fastest Deploy Method: Netlify Drop (30 Seconds, No Git Needed)

### Option A: 1-Click Netlify Zip (Recommended — All 29 Photos Included)
1. Open the portal in AI Studio and click **"Deploy to Netlify / Host"** in the top navigation bar.
2. Under the **"1. Publish to Netlify"** tab, click **"Download Netlify Zip"**.
3. Unzip the downloaded file on your computer. It contains:
   - `index.html` (Complete portal with SVG fallbacks)
   - `_redirects` (Netlify SPA 200 routing)
   - `netlify.toml` (Netlify build configuration)
   - `assets/aistudio/` (All 29 authentic Oman project site photographs)
4. Open **[https://app.netlify.com/drop](https://app.netlify.com/drop)** in your browser.
5. Drag and drop the unzipped folder into the upload box.
6. **Done!** Every project photo and service image loads immediately with zero broken icons.

### Option B: Terminal Build
1. In your terminal, run:
   ```bash
   npm run build
   ```
2. Open **[https://app.netlify.com/drop](https://app.netlify.com/drop)** in your browser.
3. Drag your compiled **`dist`** folder directly into the Netlify Drop box.
4. Netlify will deploy immediately with working photos and free SSL.

---

## 🔄 2. Continuous Deployment via GitHub (Recommended for Automated Updates)

1. Push this codebase to your GitHub repository.
2. Log into **[https://app.netlify.com](https://app.netlify.com)**.
3. Click **"Add new site"** → **"Import an existing project"** → select **GitHub**.
4. Choose your repository.
5. Netlify will auto-detect settings from the included `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: `20`
6. Click **Deploy Site**. Every time you push changes to GitHub, Netlify rebuilds and publishes automatically.

---

## 🌐 3. Connecting Your Custom Host & Domain Through Netlify

### Step A: Add Your Domain in Netlify
1. In your Netlify site dashboard, click **"Site configuration"** (or **"Domain management"**).
2. Click **"Domains"** → **"Add a domain"**.
3. Type your domain name (e.g. `wwwasar.com`) and click **Verify** → **Add domain**.

### Step B: Configure DNS (Choose Method 1 or Method 2)

#### 🔹 Method 1: Use Netlify DNS (Recommended & Easiest)
Netlify DNS provides automatic SSL, apex redirects, and global CDN caching:
1. In Netlify Domain Management, click **"Set up Netlify DNS"** next to your domain.
2. Netlify will give you 4 custom nameservers, for example:
   - `dns1.p01.nsone.net`
   - `dns2.p01.nsone.net`
   - `dns3.p01.nsone.net`
   - `dns4.p01.nsone.net`
3. Log into where you bought your domain (GoDaddy, Namecheap, Bluehost Domains, etc.):
   - Go to **Domain Management / DNS Settings**.
   - Change the **Nameservers** from Default to **Custom Nameservers**.
   - Paste the 4 Netlify nameservers and save.
4. Netlify will take over DNS, manage records, and configure SSL automatically!

#### 🔹 Method 2: Keep Existing DNS (Manual A & CNAME Records)
If you prefer not to change nameservers, configure two DNS records at your current registrar:
1. **A Record (for Apex domain `wwwasar.com` / `@`)**:
   - **Type**: `A`
   - **Host / Name**: `@` (or leave blank depending on registrar)
   - **Value / Points to**: `75.2.60.5` *(Netlify's load balancer IP)*
   - **TTL**: `3600` (or 1 Hour)
2. **CNAME Record (for Subdomain `www.wwwasar.com` / `www`)**:
   - **Type**: `CNAME`
   - **Host / Name**: `www`
   - **Value / Points to**: `<your-site-name>.netlify.app` *(Your Netlify site URL)*
   - **TTL**: `3600` (or 1 Hour)

---

## 🔒 4. Free Automatic HTTPS / SSL Certificate
1. Once your DNS has propagated (usually 5 to 30 minutes):
2. In Netlify, scroll down to **"HTTPS / SSL/TLS certificate"**.
3. Netlify automatically requests and installs a free **Let's Encrypt SSL certificate** covering both `wwwasar.com` and `www.wwwasar.com`.
4. Click **"Verify DNS configuration"** if it is not immediately active.
5. "Force HTTPS" will be enabled automatically so all visitors browse securely.

---

## 🧩 5. Why This Project is Pre-Configured for Netlify:
- **`public/_redirects` & `netlify.toml`**: Configures `/* /index.html 200` to prevent 404 errors on deep routes or page refreshes.
- **Supabase Cloud Database**: Client-side connection to `utblsxterubtziionaja` means zero backend server setup needed on Netlify.
- **Official Google Maps link**: Points to Oman headquarters `https://maps.app.goo.gl/bA6J8idhXRwydofNA?g_st=ac`.
- **Developer Credit**: Eng Abdullah Al Osman Shakil (Electrical Engineer) displayed across the interface.

---

## 📸 6. Custom Domain (wwwasar.com) & Google Search Photo Resolution

If you opened `wwwasar.com` or searched for the domain on Google and photos were not visible:

1. **Google Search & Social Media Previews**:
   - `index.html` now includes high-resolution OpenGraph cards (`og:image`), Twitter cards, official `favicon.svg`, and Schema.org `GeneralContractor` structured data.
   - When Google re-crawls or when links are shared on WhatsApp/LinkedIn, your official emblem and project photos will display prominently.

2. **Browser Cache on wwwasar.com**:
   - Browsers maintain isolated local storage per domain. If you visited `wwwasar.com` prior to uploading the authentic Oman site photos, your browser held older placeholders.
   - The app has upgraded to storage version `v6` with automatic photo sanitization.
   - You can also click **"🔄 Clear Stale Cache & Sync All 29 Photos"** in the Deployment Center or press `Ctrl + F5` (`Cmd + Shift + R` on Mac) on `wwwasar.com` to refresh immediately.

3. **Deploying the Latest Build to Netlify**:
   - Drag the updated **`dist`** folder or click **"Download Netlify Zip"** in the app and upload it to **[app.netlify.com/drop](https://app.netlify.com/drop)** to update your live custom domain instantly.
