# Student Performance Analysis System

A full-stack web application for managing student marks, tracking performance, and generating analytics. Built with React, Node.js, Express, and PostgreSQL (Neon).

## Features

### Admin
- Manage students (add, edit, delete)
- Manage teachers
- Assign subjects to teachers
- View reports and analytics

### Teacher
- View assigned subjects
- Enter and manage student marks
- View subject-wise analytics and performance stats

### Student
- View personal profile
- View marks and performance reports

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, React Router, Chart.js
- **Backend**: Node.js, Express, JWT Authentication
- **Database**: PostgreSQL (Neon Serverless)
- **Security**: bcrypt password hashing, rate limiting

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (Neon)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/rakeshsahu99/student-performance-analysis.git
cd student-performance-analysis
```

2. Install dependencies:
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

3. Configure environment variables:

Create `backend/.env`:
```env
DATABASE_URL=your_neon_database_url
JWT_SECRET=your_jwt_secret
PORT=5000
FRONTEND_URL=http://localhost:5173
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Set up the database:
```bash
cd backend
psql -d your_database -f db/schema.sql
```

5. Run the application:

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

6. Open http://localhost:5173 in your browser

## Project Structure

```
├── backend/
│   ├── config/         # Database configuration
│   ├── controllers/    # Route handlers
│   ├── middleware/    # Auth, validation, error handling
│   ├── routes/        # API route definitions
│   ├── services/      # Business logic
│   └── utils/         # Helper functions
├── frontend/
│   ├── src/
│   │   ├── api/       # Axios configuration
│   │   ├── components/# Reusable components
│   │   ├── context/   # React context (Auth)
│   │   ├── pages/    # Page components
│   │   ├── routes/   # Route protection
│   │   └── utils/    # Utility functions
│   └── ...
└── ...
```

## API Endpoints

- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register student
- `GET /api/students` - Get all students
- `GET /api/students/me` - Get current student
- `GET /api/teachers` - Get all teachers
- `POST /api/teachers` - Create teacher (admin)
- `GET /api/subjects` - Get subjects
- `GET /api/marks` - Get marks
- `POST /api/marks` - Add marks
- `GET /api/analytics/student/:id` - Student analytics
- `GET /api/analytics/teacher/:id` - Teacher analytics

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on auth routes (20 requests/15min)
- CORS configuration
- Protected routes with role-based access

## License

MIT