# Bluehost Deployment Guide
**Al Sahab Al Rashid Trad. Con. LLC (wwwasar.com)**  
*Engineered by Eng Abdullah Al Osman Shakil — Electrical Engineer (abdullahalshakil7@gmail.com)*

---

## 🚀 Quick Deployment Summary for Bluehost

This web application has been specifically configured to run out-of-the-box on **Bluehost Apache / cPanel** hosting environments.

### What has been configured:
1. **Relative Asset Paths (`base: './'`) in `vite.config.ts`**:
   Assets load flawlessly whether installed in the root `public_html/` or in a subfolder (e.g. `public_html/asar/`).
2. **Apache `.htaccess` in `/public/.htaccess`**:
   Automatically included in production builds (`dist/.htaccess`). It enables:
   - SPA routing rewrite to `index.html` (prevents 404 errors on refresh).
   - Gzip / Deflate compression for high performance on shared hosting.
   - Long-term caching for assets and instant cache invalidation for `index.html`.
   - MIME types for modern `.webp` construction images and web fonts.
3. **Supabase Cloud Backend**:
   Directly connects to project `utblsxterubtziionaja` via client-side API; no Node.js backend server is required on Bluehost!
4. **Interactive In-App Bluehost Manager**:
   Direct download buttons inside the Admin Toolbar for both single-file HTML and the Apache `.htaccess`.

---

## 📦 Method 1: Standard cPanel File Manager Upload (Recommended)

### Step 1: Build the Production Files
Run the build command in the terminal:
```bash
npm run build
```
This produces a ready-to-deploy folder named `dist/` containing:
- `index.html`
- `.htaccess`
- `assets/` (all scripts, styles, and optimized construction photos)

### Step 2: Log into Bluehost
1. Go to [https://my.bluehost.com](https://my.bluehost.com) and log in.
2. In the left navigation, click **Advanced** (or open **cPanel**).
3. Under the **Files** section, click **File Manager**.

### Step 3: Upload to `public_html`
1. Double-click the `public_html` directory (or your domain's folder if using an addon domain).
2. *(Optional backup)* If you have old files, move them to a backup folder.
3. Click the **Upload** button at the top toolbar.
4. Upload all files from the `dist/` folder:
   - `index.html`
   - `.htaccess` *(Make sure "Show Hidden Files" is enabled in cPanel File Manager settings if you don't see dotfiles)*
   - The entire `assets` directory with all its files.
   *(Tip: You can zip the contents of `dist/`, upload `dist.zip`, and click **Extract** in cPanel File Manager for fastest upload!)*

### Step 4: Verify Your Website
Visit `https://wwwasar.com` (or your domain name).
- Test clicking through the navigation tabs (Core Services, Projects, Gallery, Portfolio, About, Contact, Developer).
- Submit a test inquiry via the contact form to confirm Supabase receives it.

---

## ⚡ Method 2: 1-Click Standalone Single-File Deployment

If you want the quickest deployment without uploading separate asset folders:
1. Open the website in your browser.
2. Turn on **Admin Edit Mode** (or click **Bluehost Deployment** in the toolbar).
3. Click **"Export Single-File HTML"**.
4. Rename the downloaded file to `index.html`.
5. In Bluehost cPanel File Manager, upload `index.html` and `.htaccess` to `public_html/`.
6. Done! Everything (CSS, JavaScript, Supabase API client, and images) runs directly from that single file.

---

## 🔒 Free SSL Certificate Setup on Bluehost
To ensure your domain runs securely over `https://`:
1. In Bluehost cPanel, navigate to **Security** -> **SSL/TLS Status**.
2. Select your domain (`wwwasar.com`).
3. Click **Run AutoSSL** to issue a free Let's Encrypt / Comodo SSL certificate.
4. Enable **Force HTTPS Redirection** in Bluehost domain management.

---

## 🛠️ Developer & Support Reference
- **Company**: Al Sahab Al Rashid Trad. Con. LLC (السحاب الرشيد للتجارة والمقاولات ش.م.م)
- **Website**: wwwasar.com
- **Google Maps**: [https://maps.app.goo.gl/bA6J8idhXRwydofNA?g_st=ac](https://maps.app.goo.gl/bA6J8idhXRwydofNA?g_st=ac)
- **Lead Electrical Engineer & Developer**: Eng Abdullah Al Osman Shakil (`abdullahalshakil7@gmail.com`)
- **Supabase Backend Project**: `utblsxterubtziionaja`
