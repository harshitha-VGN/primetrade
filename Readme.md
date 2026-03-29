# PrimeTrade Backend Assignment

A scalable REST API with JWT authentication, role-based access control, and a modern React frontend with gradient UI.

🎨 **[UI/UX Upgraded]** Modern design with gradient backgrounds, glass-morphism cards, and responsive layout  
🔒 **[Security Enhanced]** JWT + bcrypt, input validation, CORS preflight handling  
📚 **[Documentation Complete]** Swagger API docs, setup guide, deliverables checklist


## Tech Stack
- **Backend**: Node.js, Express.js, MongoDB (Mongoose)
- **Frontend**: React.js (Vite) with modern gradient UI
- **Auth**: JWT + bcrypt
- **Docs**: Swagger (OpenAPI 3.0)

## Setup Instructions

### Prerequisites
- Node.js >= 18
- MongoDB running locally (or MongoDB Atlas connection string)

### Backend
```bash
cd backend
npm install
npm run dev
```

Create a `.env` file in `backend/` with:

PORT=5050
DATABASE_URL=mongodb://127.0.0.1:27017/primetrade
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=1d
CORS_ORIGIN=http://localhost:5173
ADMIN_SECRET=primetrade@admin123        

API runs at: `http://localhost:5050`  
Swagger Docs: `http://localhost:5050/api/docs`

## Admin Access
To register as admin, use the Admin Secret field on the Register page.
Admin secret is set via `ADMIN_SECRET` in your `.env` file.
After login, admins are automatically redirected to `/admin`.

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Optional frontend env (`frontend/.env`):

```env
VITE_API_BASE_URL=http://localhost:5050/api/v1
```

Frontend runs at: `http://localhost:5173`

## API Endpoints

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| POST | /api/v1/auth/register | No | - |
| POST | /api/v1/auth/login | No | - |
| GET | /api/v1/auth/me | Yes | Any |
| GET | /api/v1/tasks | Yes | Any |
| POST | /api/v1/tasks | Yes | Any |
| PUT | /api/v1/tasks/:id | Yes | Owner/Admin |
| DELETE | /api/v1/tasks/:id | Yes | Owner/Admin |
| GET | /api/v1/admin/stats | Yes | Admin |
| GET | /api/v1/admin/users | Yes | Admin |
| PATCH | /api/v1/admin/users/:id/promote | Yes | Admin |
| PATCH | /api/v1/admin/users/:id/demote | Yes | Admin |
| DELETE | /api/v1/admin/users/:id | Yes | Admin |
| GET | /api/v1/admin/tasks | Yes | Admin |
| DELETE | /api/v1/admin/tasks/:id | Yes | Admin |

## Scalability Notes

- **Modular structure**: Each domain (auth, tasks) is its own module — new modules plug in without touching existing code.
- **API versioning** (`/api/v1/`) allows backward-compatible upgrades.
- **Database scaling**: MongoDB can be scaled with replica sets and sharding as traffic grows.
- **Horizontal scaling**: The app is stateless (JWT-based), so multiple instances can run behind a load balancer (e.g., Nginx + PM2).
- **Caching**: Redis can be added for frequently-read data (user profiles, task lists).
- **Docker**: A `Dockerfile` + `docker-compose.yml` can containerize both backend and MongoDB.
- **Microservices path**: Auth and Tasks services can be split into separate deployable services when traffic demands it.

## Security Notes

- Passwords are hashed with bcrypt before storage.
- JWT is required for protected routes using Bearer token auth.
- Public registration always creates `user` role to avoid role-escalation.
- Input validation is handled using `express-validator`.
