# CBSWENG Project

A Full-Stack Web Application with React Frontend and Express.js Backend

## Project Structure

```
├── backend/          # Express.js server, MongoDB models, routes, controllers
├── frontend/         # React + Vite frontend application
└── README.md
```

## Setup & Running the Project

### Prerequisites

- Node.js installed
- MongoDB running on `mongodb://127.0.0.1:27017`

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

Server runs on `http://localhost:3000`

**For production:** Use `npm start` instead

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

### Running Both (from root directory)

Open two terminal windows:

**Terminal 1 - Backend:**

```bash
cd backend && npm install && npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd frontend && npm install && npm run dev
```

## Development

- Backend routes: `backend/routes/`
- Backend models: `backend/models/`
- Frontend components: `frontend/src/components/`
- Frontend pages: `frontend/src/pages/`
