# Deployment Guide

This guide will help you deploy Flashflashy to production using MongoDB Atlas.

## Prerequisites

- MongoDB Atlas account (free tier works)
- A hosting platform for your backend (Railway, Render, Heroku, etc.)
- A hosting platform for your frontend (Vercel, Netlify, etc.)

## Step 1: Set Up MongoDB Atlas

### 1.1 Create Account and Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Click "Build a Database"
4. Choose the **FREE** tier (M0)
5. Select a cloud provider and region (choose one close to your users)
6. Click "Create" (takes 3-5 minutes)

### 1.2 Create Database User

1. Go to **Database Access** in the left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Create a username and strong password (save these!)
5. Set privileges to **"Atlas admin"** or **"Read and write to any database"**
6. Click **"Add User"**

### 1.3 Configure Network Access

1. Go to **Network Access** in the left sidebar
2. Click **"Add IP Address"**
3. For development: Click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. For production: Add your hosting platform's IP ranges (see platform-specific guides)
5. Click **"Confirm"**

### 1.4 Get Connection String

1. Go to **Database** in the left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Select **"Node.js"** as the driver
5. Copy the connection string
6. Replace `<username>` and `<password>` with your database user credentials
7. Add your database name: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/flashflashy?retryWrites=true&w=majority`

## Step 2: Deploy Backend

### Option A: Railway (Recommended)

1. Go to [Railway](https://railway.app)
2. Sign up with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select your Flashflashy repository
5. In Railway's project settings:
   - Set **Root Directory** to `backend` (or leave blank if using nixpacks.toml)
   - Railway will use the `nixpacks.toml` or `railway.json` configuration
6. Add environment variables:
   - `MONGODB_URI` = Your MongoDB Atlas connection string
   - `NODE_ENV` = `production`
   - `PORT` = Railway will set this automatically (optional)
   - `ADMIN_USER_ID` = Your admin user ID (optional)
7. Railway will automatically deploy and give you a URL

### Option B: Render

1. Go to [Render](https://render.com)
2. Sign up with GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repository
5. Configure:
   - **Name**: flashflashy-backend
   - **Environment**: Node
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
6. Add environment variables:
   - `MONGODB_URI` = Your MongoDB Atlas connection string
   - `NODE_ENV` = `production`
   - `ADMIN_USER_ID` = Your admin user ID (optional)
7. Click **"Create Web Service"**

### Option C: Heroku

1. Install [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
2. Login: `heroku login`
3. Create app: `heroku create flashflashy-backend`
4. Set environment variables:
   ```bash
   heroku config:set MONGODB_URI="your_mongodb_atlas_connection_string"
   heroku config:set NODE_ENV="production"
   heroku config:set ADMIN_USER_ID="your_admin_user_id"  # optional
   ```
5. Deploy: `git push heroku main`

## Step 3: Deploy Frontend

### Option A: Vercel (Recommended)

1. Go to [Vercel](https://vercel.com)
2. Sign up with GitHub
3. Click **"Add New Project"**
4. Import your Flashflashy repository
5. Configure:
   - **Framework Preset**: Vue.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Add environment variable:
   - `VUE_APP_API_URL` = Your backend URL (e.g., `https://your-backend.railway.app/api`)
7. Click **"Deploy"**

### Option B: Netlify

1. Go to [Netlify](https://netlify.com)
2. Sign up with GitHub
3. Click **"Add new site"** → **"Import an existing project"**
4. Select your repository
5. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
6. Add environment variable:
   - `VUE_APP_API_URL` = Your backend URL
7. Click **"Deploy site"**

### Option C: GitHub Pages

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```
2. Install gh-pages: `npm install -g gh-pages`
3. Deploy: `gh-pages -d dist`
4. Update API URL in `frontend/src/main.js` to your backend URL

## Step 4: Update Frontend API Configuration

After deploying your backend, update the frontend to use the production API URL.

### Method 1: Environment Variable (Recommended)

Create `frontend/.env.production`:
```env
VUE_APP_API_URL=https://your-backend-url.com/api
```

### Method 2: Update main.js

Edit `frontend/src/main.js`:
```javascript
axios.defaults.baseURL = process.env.VUE_APP_API_URL || 'https://your-backend-url.com/api';
```

## Step 5: Secure MongoDB Atlas for Production

1. Go to MongoDB Atlas → **Network Access**
2. Remove **"Allow Access from Anywhere"** (0.0.0.0/0)
3. Add your hosting platform's IP addresses:
   - **Railway**: Check Railway docs for IP ranges
   - **Render**: Check Render docs for IP ranges
   - **Heroku**: Use `0.0.0.0/0` (Heroku uses dynamic IPs)
4. Save changes

## Step 6: Set Up Admin User

1. Create your first user account through the registration page
2. Note the user ID from the database or API response
3. Set `ADMIN_USER_ID` environment variable to that ID
4. Run the ensure-admin script (if needed):
   ```bash
   cd backend
   npm run ensure-admin
   ```

## Troubleshooting

### Backend won't connect to MongoDB Atlas

- Check network access settings in MongoDB Atlas
- Verify your connection string has correct username/password
- Ensure database name is included in connection string
- Check MongoDB Atlas cluster is running (not paused)

### Frontend can't reach backend

- Verify `VUE_APP_API_URL` is set correctly
- Check CORS settings in backend (should allow your frontend domain)
- Verify backend is running and accessible

### CORS Errors

If you see CORS errors, make sure your backend allows your frontend domain. The backend already has CORS enabled, but you may need to restrict it to your production domain.

## Next Steps

- Set up custom domain names
- Enable HTTPS (most platforms do this automatically)
- Set up monitoring and alerts
- Configure backups in MongoDB Atlas
- Set up CI/CD for automatic deployments

