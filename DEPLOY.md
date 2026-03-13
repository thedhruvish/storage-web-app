# StoreOne – Self-Hosting Guide

This guide explains how to deploy and self-host **StoreOne**. You can deploy it using one of the following methods:

1. **Serverless (AWS Lambda + API Gateway)** – scalable and recommended
2. **Virtual Machine (VPS / EC2 / Dedicated Server)**
3. **Docker (Coming Soon)**

---

# Table of Contents

- [Environment Variables Setup](#environment-variables-setup)
- [Prerequisites](#prerequisites)
- [Deployment Methods](#deployment-methods)
  - [Frontend Deployment](#frontend-deployment)
  - [Backend Deployment](#backend-deployment)

- [Docker Deployment (Coming Soon)](#docker-deployment)
- [Need Help](#need-help)

---

# Environment Variables Setup

Before deploying the project, you must configure environment variables for both **frontend** and **backend**.

Copy the example files:

```bash
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env
```

Then update the values according to your infrastructure.

---

# Prerequisites

Before deploying StoreOne, you need the following services configured.

## AWS Account

You must have an AWS account.

At minimum you will need:

- **1 S3 bucket** for user file storage
- **1 S3 bucket** (optional) for frontend hosting

Create an **IAM User** with S3 access to obtain:

```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
```

If deploying using **AWS Lambda with IAM roles**, these keys are **not required**.

---

## Alternative Storage (Cloudflare R2)

Instead of AWS S3, you can use **S3-compatible storage providers** like:

- Cloudflare R2
- DigitalOcean Spaces
- MinIO

When using **R2**, CloudFront variables are **not required**.

---

## CloudFront Setup (Optional but Recommended)

CloudFront provides:

- Faster global CDN
- Secure signed URLs
- Lower latency media delivery

### Generate CloudFront Keys

```bash
openssl genrsa -out private_key.pem 2048
openssl rsa -pubout -in private_key.pem -out public_key.pem
```

Then:

1. Upload **public_key.pem** to a **CloudFront Key Group**
2. Attach the Key Group to your **CloudFront Distribution**
3. Convert **private_key.pem** to **Base64**

Example:

```bash
base64 private_key.pem
```

Store it in your `.env` as:

```
privateKey=<base64 key>
```

You may also store it in **AWS Secrets Manager** and reference it using:

```
SECRET_CF_KEY
```

---

## MongoDB

You can use:

- Local MongoDB
- Docker MongoDB
- **MongoDB Atlas (recommended)**

Example connection:

```
mongodb://admin:admin@localhost:27017/storage-web?authSource=admin
```

---

## Redis

Used for caching and session storage.

Recommended providers:

- **Upstash**
- Redis Cloud
- Self-hosted Redis

Example:

```
rediss://default:<password>@<server>:<port>
```

---

## Google OAuth

Create credentials from:

Google Cloud Console

Navigate to:

```
APIs & Services → Credentials → Create OAuth Client ID
```

---

## GitHub OAuth

Create an OAuth application:

[https://github.com/settings/developers](https://github.com/settings/developers)

---

## Cloudflare Turnstile

Used for bot protection.

Create a site key in:

Cloudflare Dashboard → Turnstile

---

## Stripe

Get API keys and configure webhooks from:

Stripe Developer Dashboard

---

## Razorpay

Create API keys and configure webhooks from:

Razorpay Dashboard → Account & Settings

---

## SMTP Email Provider

You can use:

- Amazon SES
- SendGrid
- Resend
- Gmail App Password

---

# Backend Environment Variables

File:

```
backend/.env
```

```env
# Base URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:4000
DOMAIN_NAME=localhost

# Server
PORT=4000
NODE_ENV=development

# Database
MONGO_URL=mongodb://admin:admin@localhost:27017/storage-web?authSource=admin
REDIS_URL=rediss://default:<password>@<server>:<port>

# Security
COOKIESECRETKEY=string

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:4000/import-data/google/callback

# GitHub OAuth
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_REDIRECT_URI=http://localhost:4000/auth/github/callback

# Email
IS_VERFIY_OTP=false
SMTP_HOST=
SMTP_SECURE=false
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_EMAIL=
# Cloudflare Turnstile
TURNSTILE_SECRET_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLIC_KEY=
STRIPE_PAYMENT_SUCCESS_URL=http://localhost:3000/payment-success?session_id={CHECKOUT_SESSION_ID}
STRIPE_PORTAL_RETURN_URL=http://localhost:3000/setting/billing
STRIPE_WEBHOOK_SECRET=

# S3 Storage
AWS_ENDPOINT_URL=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-south-1
AWS_BUCKET_NAME=cloudfly
PRESIGNED_URL_EXPIRATION=9000

# CloudFront
cloudfrontDistributionDomain=
keyPairId=

privateKey=
or
SECRET_CF_KEY=

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
```

---

# Frontend Environment Variables

File:

```
frontend/.env
```

```env
VITE_BASE_URL=http://localhost:3000
VITE_BACKEND_URL=http://localhost:4000

VITE_GOOGLE_CLIENT_ID=

VITE_CLOUDFLARE_TURNSTILE_SITE_KEY=

VITE_RAZORPAY_KEY_ID=
```

---

# Deployment Methods

Repository:

```
https://github.com/thedhruvish/storeone.git
```

---

# Frontend Deployment

The frontend is a **Vite static build**, so it can be deployed to any static hosting provider.

---

## Cloudflare Pages

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/thedhruvish/storeone/tree/main/frontend)

1. Open **Cloudflare Dashboard**
2. Go to **Workers & Pages**
3. Click **Create Application**
4. Connect your GitHub repository

Configuration:

```
Framework preset: Vite
Root directory: frontend
Build command: npm run build
Output directory: dist
```

Add environment variables and deploy.

---

## Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/thedhruvish/storeone/tree/main/frontend)

1. Go to Vercel
2. Import the repository
3. Configure:

```
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
```

Add environment variables and deploy.

---

## Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/integration/start/deploy?repository=https://github.com/thedhruvish/storeone/tree/main/frontend)

1. Import repository
2. Configure:

```
Base directory: frontend
Build command: npm run build
Publish directory: dist
```

Add environment variables and deploy.

---

## AWS S3 + CloudFront

Manual deployment.

Clone and build:

```bash
git clone https://github.com/thedhruvish/storeone.git
cd storeone/frontend
npm install
npm run build
```

Upload the **dist** folder to S3.

Enable:

- Static Website Hosting
- Public Read Access

Create a **CloudFront distribution** pointing to the S3 bucket.

Set:

```
Default root object: index.html
```

Add a custom error page:

```
404 → /index.html → 200
```

OR

Create a Function and connect with Distributions

```js
function handler(event) {
  var request = event.request;
  var uri = request.uri;

  // If request is for a file (has extension), allow it
  if (uri.match(/\.[a-zA-Z0-9]+$/)) {
    return request;
  }

  // If request ends with "/", serve index.html
  if (uri.endsWith("/")) {
    request.uri += "index.html";
    return request;
  }

  // Otherwise rewrite to index.html (SPA routing)
  request.uri = "/index.html";
  return request;
}
```

This allows **client-side routing**.

---

# Backend Deployment

---

# AWS Lambda (Serverless)

Recommended for scalable deployments.

Install Serverless Framework:

```bash
npm install -g serverless
```

Configure AWS credentials:

```bash
aws configure
```

Deploy:

```bash
cd backend
npm install
npx serverless deploy
```

After deployment you will get an **API Gateway URL**.

Use this as:

```
VITE_BACKEND_URL
```

---

# VPS Deployment

Example providers:

- AWS EC2
- DigitalOcean
- Hetzner
- Linode

Steps:

1. SSH into server
2. Install Node.js
3. Install Redis
4. Install MongoDB (optional)
5. Clone repository

```bash
git clone https://github.com/thedhruvish/storeone.git
cd storeone/backend
```

Create `.env`

Install dependencies:

```bash
npm install
```

Install PM2:

```bash
npm install -g pm2
```

Run backend:

```bash
pm2 start index.js --name storage-backend
```

Optional:

Setup **Nginx or Caddy** reverse proxy and enable **HTTPS (SSL)**.
You should add a **Reverse Proxy + HTTPS section** for **Nginx + Certbot** in your guide. Below is a **clean production-ready section** you can add to your README.

---

# Nginx Reverse Proxy + HTTPS Setup

When deploying StoreOne on a **VPS (EC2, DigitalOcean, Hetzner, etc.)**, it is recommended to use **Nginx as a reverse proxy** and secure your application with **HTTPS using Let's Encrypt (Certbot)**.

Nginx will:

- Route external traffic to your backend server
- Handle SSL certificates
- Improve performance and security

---

# Install Nginx

Update your server packages:

```bash
sudo apt update
sudo apt install nginx -y
```

Start and enable Nginx:

```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

Check status:

```bash
sudo systemctl status nginx
```

---

# Allow Firewall Access (Optional)

If using **UFW firewall**:

```bash
sudo ufw allow 'Nginx Full'
```

---

# Create Nginx Configuration

Create a new configuration file:

```bash
sudo nano /etc/nginx/sites-available/storeone
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name api.storeone.cloud;

    location / {
        proxy_pass http://localhost:4000;

        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

---

# Enable the Site

Create a symbolic link:

```bash
sudo ln -s /etc/nginx/sites-available/storeone /etc/nginx/sites-enabled/
```

Test the configuration:

```bash
sudo nginx -t
```

Reload Nginx:

```bash
sudo systemctl reload nginx
```

Now your backend running on:

```
http://localhost:4000
```

will be accessible via:

```
http://api.storeone.cloud # not https
```

---

# Install Certbot (HTTPS)

Install Certbot and the Nginx plugin:

```bash
sudo apt install certbot python3-certbot-nginx -y
```

---

# Generate SSL Certificate

Run:

```bash
sudo certbot --nginx
```

Follow the prompts:

1. Enter your email
2. Accept terms
3. Select your domain
4. Choose **Redirect HTTP → HTTPS**

Certbot will automatically modify your Nginx config.

---

# Verify HTTPS

After completion your site will be available at:

```
https://api.storeone.cloud
```

---

# Automatic SSL Renewal

Let's Encrypt certificates expire every **90 days**.

Certbot automatically installs a renewal cron job.

Test renewal:

```bash
sudo certbot renew --dry-run
```

---

# Final Nginx Configuration Example

After enabling HTTPS, your configuration may look like this:

```nginx
server {
    server_name api.storeone.cloud;

    location / {
        proxy_pass http://localhost:4000;

        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;

        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/api.storeone.cloud/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.storeone.cloud/privkey.pem;
}

server {
    listen 80;
    server_name api.storeone.cloud;
    return 301 https://$host$request_uri;
}
```

---

# Docker Deployment

Docker support is currently **under development**.

Future versions will include:

- docker-compose
- MongoDB container
- Redis container
- Backend container
- Frontend container

Stay tuned for updates.

---

# Need Help?

If you encounter any issues during deployment, feel free to contact:

**X (Twitter)**
[https://x.com/dhruvishlathiya](https://x.com/dhruvishlathiya)

**Website**
[https://dhruvish.in](https://dhruvish.in)

**Email**
[info@dhruvish.in](mailto:info@dhruvish.in)

**GitHub Issues**
[https://github.com/thedhruvish/storeone/issues](https://github.com/thedhruvish/storeone/issues)
