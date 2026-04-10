# MacroPlate

MacroPlate is a full-stack performance nutrition delivery platform that treats food as measurable data. It helps fitness enthusiasts and athletes hit precise macronutrient goals while providing educational content and tools to easily transition into optimal nutrition tracking.

## Features

- **Strict Macro & Goal Management**: Set goals (Cutting, Bulking, Maintenance) with personalized daily calorie, protein, carb, and fat targets based on your unique biometrics (TDEE).
- **Google OAuth**: Fast, secure login with strict state binding to isolated user data.
- **Restaurant & Meal Browsing**: Order prepared meals and see real-time macro impacts injected into your daily totals dynamically against your cart.
- **DIY Recipes Feature ("Cook Yourself")**: Don’t want pre-made? Browse customized step-by-step cooking recipes complete with integrated checklists, multi-stage timers (with audio), and a Wake-Locked Cooking Mode.
- **Strict Gamification & Streaks**: Backend-validated daily streak logic directly tracks goal completion (with a "Silent Break" algorithm for missed days).

## Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Framer Motion (for dynamic UI animations)
- **Icons**: Lucide React
- **Cloud Setup**: Standard Google OAuth Integration

### Backend
- **Environment**: Node.js 18+ (Express)
- **ORM**: Prisma
- **Database**: SQLite (built for easy swapping to PostgreSQL)
- **Deployment**: Google Cloud Run Ready (includes isolated Dockerfiles for both Client & API)

## Running Locally

Due to modern Windows pathing configurations (`%%` characters in working directories), to successfully run the dev servers, you should place this codebase in a clean directory path like `C:\Projects\MacroPlate`.

### 1. Start the Backend API
Navigate to the `backend` folder:
```bash
cd backend
npm install

# Initialize your database
npx prisma db push --accept-data-loss
npx ts-node prisma/seed.ts

# Start the dev server (defaults to localhost:3000)
npm run dev
```

### 2. Start the Frontend App
Open a new terminal and navigate to the project root:
```bash
npm install

# Start the frontend (defaults to localhost:5173 / 5174)
npm run dev
```

### Environment Variables
For the Google Sign-in to function correctly, replace the dummy Client ID generated locally:
Create a `.env` file in the root directory:
```
VITE_GOOGLE_CLIENT_ID=your_actual_google_client_id_here
```

## Deployment (Google Cloud Run)
The codebase includes standard multi-stage `Dockerfile` structures in both the frontend and backend to deploy directly to GCP. 
Read the documentation for `gcloud run deploy` to map the specific images to `us-central1`.
