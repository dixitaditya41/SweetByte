# SweetByte – Sweet Shop Management System 🍬

A full-stack web application for managing a sweet shop with authentication, inventory controls, purchase workflows, admin features, and a complete automated test suite.

## 🚀 Features

### 👤 User Features
- Register & Login using JWT authentication
- Browse sweets with images, price, and stock
- Search & filter by name, category, and price
- Purchase sweets (automatically reduces stock)

### 🛠️ Admin Features
- Add new sweets
- Edit/update sweets
- Delete sweets
- Restock inventory
- Access admin-only protected routes

## 🏗️ Tech Stack

### Backend
- Node.js (Express)
- TypeScript
- MongoDB + Mongoose
- JWT Authentication
- Jest (Unit Testing)

### Frontend
- React 18 + TypeScript
- Vite
- Axios
- React Router

## 📁 Project Structure

SweetByte/
├── backend/
│   ├── src/
│   │   ├── __tests__/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── screenshots/
│   ├── admin.jpeg
│   ├── user.jpeg
│   └── test-coverage.jpeg
└── README.md

## 🧩 Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- npm or yarn

## 🔧 Backend Setup

cd backend
npm install

Create .env:

PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development

Run backend:

npm run dev

## 🎨 Frontend Setup

cd frontend
npm install
npm run dev

Frontend runs at:
http://localhost:3000

## 🔌 API Endpoints

### Auth
- POST /api/auth/register
- POST /api/auth/login

### Sweets
- GET /api/sweets
- GET /api/sweets/search
- POST /api/sweets (admin)
- PUT /api/sweets/:id (admin)
- DELETE /api/sweets/:id (admin)

### Inventory
- POST /api/sweets/:id/purchase
- POST /api/sweets/:id/restock (admin)

## 📸 Screenshots

### User Dashboard
![user](./user.jpeg)

### Admin Dashboard
![admin](./admin.jpeg)

### Test Coverage
![coverage](./test-coverage.jpeg)

## 🧪 Testing

Run tests:

npm test

Run tests with coverage:

npm test -- --coverage

## 🤖 My AI Usage

### Tools Used
- ChatGPT
- Claude
- Cursor AI Assistant

### How AI Helped
- Generated boilerplate and configs
- Helped design models and routes
- Assisted with frontend UI structure
- Helped write tests following TDD
- Provided debugging support

### Reflection
AI accelerated development but all code was reviewed, refined, and customized manually. The AI acted as a pair-programming assistant—not a replacement.
