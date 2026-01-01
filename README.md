# Flashflashy - MEVN Stack Application

A full-stack application built with MongoDB, Express, Vue.js, and Node.js.

## Project Structure

```
Flashflashy/
├── backend/          # Node.js + Express backend
│   ├── models/       # MongoDB models
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
- MongoDB (installed and running locally, or MongoDB Atlas account)
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
MONGODB_URI=mongodb://localhost:27017/flashflashy
NODE_ENV=development
```

If using MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string.

### 2. Frontend Setup

```bash
cd frontend
npm install
```

### 3. Running the Application

**Start MongoDB** (if running locally):
```bash
# On Windows (if MongoDB is installed as a service, it should start automatically)
# On macOS/Linux:
mongod
```

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

- **MongoDB** - NoSQL database
- **Express** - Web framework for Node.js
- **Vue.js 3** - Progressive JavaScript framework
- **Node.js** - JavaScript runtime
- **Axios** - HTTP client for API requests
- **Vue Router** - Official router for Vue.js
- **Mongoose** - MongoDB object modeling

## Development

The frontend is configured to proxy API requests to the backend during development. All requests to `/api/*` will be forwarded to `http://localhost:5000/api/*`.

## Production Build

To build the frontend for production:

```bash
cd frontend
npm run build
```

The built files will be in the `frontend/dist` directory.

## License

ISC

"# Flashflashy" 
