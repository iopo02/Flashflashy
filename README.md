# Flashflashy - Full Stack Flashcard Application

A full-stack flashcard application built with Express, Vue.js, and Node.js.

## Project Structure

```
Flashflashy/
├── backend/          # Node.js + Express backend
│   ├── models/       # Database models
│   ├── routes/       # API routes
│   ├── server.js     # Express server
│   └── package.json
├── frontend/         # Vue.js frontend
│   ├── public/       # Static files
│   ├── src/          # Vue source files
│   │   ├── views/    # Vue components (pages)
│   │   ├── router/   # Vue Router configuration
│   │   ├── App.vue   # Root component
│   │   └── main.js   # Entry point
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js (v14 or higher)
- Database (configured via environment variables)
- npm or yarn

## Setup Instructions

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=your_database_connection_string
NODE_ENV=development
```

### Database Setup (MongoDB Atlas)

This application uses MongoDB. You can use MongoDB Atlas (cloud) or a local MongoDB instance.

#### Option 1: MongoDB Atlas (Recommended for Deployment)

1. **Create a MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for a free account

2. **Create a Cluster**
   - Click "Build a Database"
   - Choose the FREE tier (M0)
   - Select a cloud provider and region (choose one close to you)
   - Click "Create" (this may take a few minutes)

3. **Configure Database Access**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create a username and password (save these securely!)
   - Set user privileges to "Atlas admin" or "Read and write to any database"
   - Click "Add User"

4. **Configure Network Access**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add your server's IP address only for better security
   - Click "Confirm"

5. **Get Your Connection String**
   - Go to "Database" in the left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Select "Node.js" as the driver
   - Copy the connection string (it looks like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)
   - Replace `<username>` and `<password>` with your database user credentials
   - Add your database name at the end: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/flashflashy?retryWrites=true&w=majority`

6. **Update Your .env File**
   ```env
   DATABASE_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/flashflashy?retryWrites=true&w=majority
   ```

#### Option 2: Local MongoDB

If you prefer to run MongoDB locally:

```env
DATABASE_URI=mongodb://localhost:27017/flashflashy
```

### Database Setup (MongoDB Atlas)

This application uses MongoDB. You can use MongoDB Atlas (cloud) or a local MongoDB instance.

#### Option 1: MongoDB Atlas (Recommended for Deployment)

1. **Create a MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for a free account

2. **Create a Cluster**
   - Click "Build a Database"
   - Choose the FREE tier (M0)
   - Select a cloud provider and region
   - Click "Create"

3. **Configure Database Access**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create a username and password (save these!)
   - Set user privileges to "Atlas admin" or "Read and write to any database"
   - Click "Add User"

4. **Configure Network Access**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add your server's IP address only
   - Click "Confirm"

5. **Get Your Connection String**
   - Go to "Database" in the left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (it looks like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)
   - Replace `<username>` and `<password>` with your database user credentials
   - Add your database name at the end: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/flashflashy?retryWrites=true&w=majority`

6. **Update Your .env File**
   ```env
   DATABASE_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/flashflashy?retryWrites=true&w=majority
   ```

#### Option 2: Local MongoDB

If you prefer to run MongoDB locally:

```env
DATABASE_URI=mongodb://localhost:27017/flashflashy
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

### 3. Running the Application

**Start the Backend Server:**
```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:5000`

**Start the Frontend Development Server:**
```bash
cd frontend
npm run serve
```

The frontend will run on `http://localhost:8080`

## Available Scripts

### Backend
- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon

### Frontend
- `npm run serve` - Start the development server
- `npm run build` - Build for production
- `npm run lint` - Lint and fix files

## API Endpoints

- `GET /` - Welcome message
- `GET /api/test` - Test API endpoint

## Technologies Used

- **Express** - Web framework for Node.js
- **Vue.js 3** - Progressive JavaScript framework
- **Node.js** - JavaScript runtime
- **Axios** - HTTP client for API requests
- **Vue Router** - Official router for Vue.js

## Development

The frontend is configured to proxy API requests to the backend during development. All requests to `/api/*` will be forwarded to `http://localhost:5000/api/*`.

## Production Build

To build the frontend for production:

```bash
cd frontend
npm run build
```

The built files will be in the `frontend/dist` directory.

## Deployment

### Backend Deployment

1. **Set Environment Variables** on your hosting platform:
   - `MONGODB_URI` - Your MongoDB Atlas connection string (or use `DATABASE_URI` as alias)
   - `PORT` - Port number (usually set automatically by hosting platform)
   - `NODE_ENV` - Set to `production`
   - `ADMIN_USER_ID` - Your admin user ID (optional, can also use config/admin.js)

2. **Popular Backend Hosting Options:**
   - **Railway**: Connect your GitHub repo, add `DATABASE_URI` environment variable
   - **Render**: Connect GitHub, set environment variables in dashboard
   - **Heroku**: Use Heroku CLI or dashboard to set config vars
   - **DigitalOcean App Platform**: Set environment variables in app settings

3. **MongoDB Atlas Network Access for Production:**
   - Go to MongoDB Atlas → Network Access
   - Add your hosting platform's IP ranges or specific server IPs
   - Remove "Allow Access from Anywhere" (0.0.0.0/0) for better security

### Frontend Deployment

1. **Build the frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Update API Configuration:**
   - If your backend is on a different domain, create a `.env.production` file:
   ```env
   VUE_APP_API_URL=https://your-backend-url.com/api
   ```
   - Or update `frontend/src/main.js` to use your production API URL

3. **Deploy Options:**
   - **Vercel**: Connect GitHub repo, it auto-deploys on push
   - **Netlify**: Drag and drop the `dist` folder or connect GitHub
   - **GitHub Pages**: Push the `dist` folder to `gh-pages` branch
   - **Firebase Hosting**: Use Firebase CLI to deploy

### Security Best Practices

- ✅ **Never commit** `.env` files or `config/admin.js` to version control
- ✅ Use environment variables for all sensitive data
- ✅ Restrict MongoDB Atlas network access to only your server IPs in production
- ✅ Use strong database user passwords
- ✅ Enable MongoDB Atlas monitoring and alerts
- ✅ Regularly update dependencies for security patches

## License

ISC 
