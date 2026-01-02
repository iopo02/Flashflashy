# Flashflashy

A full-stack flashcard application for creating and studying decks of cards with spaced repetition.

https://flashflashyvercel.vercel.app/


## Tech Stack

- Backend: Node.js, Express
- Frontend: Vue.js 3
- Database: MongoDB (via Mongoose)

## Quick Start

### Backend

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGODB_URI=your_database_connection_string
NODE_ENV=development
```

### Frontend

```bash
cd frontend
npm install
```

### Run

Backend: `cd backend && npm run dev` (runs on http://localhost:5000)  
Frontend: `cd frontend && npm run serve` (runs on http://localhost:8080)

## Database Setup

### MongoDB Atlas

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (M0 tier)
3. Create database user with password authentication
4. Configure network access (allow 0.0.0.0/0 for development)
5. Get connection string and add to `.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/flashflashy?retryWrites=true&w=majority
   ```

### Local MongoDB

```env
MONGODB_URI=mongodb://localhost:27017/flashflashy
```

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## License

ISC
