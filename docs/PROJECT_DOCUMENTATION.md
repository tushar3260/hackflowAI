# HACKFLOW.AI - Project Documentation

## 1. Project Overview

**Hackflow.AI** is a next-generation, full-stack hackathon management platform designed to streamline the entire event lifecycle. It integrates AI-powered evaluation, real-time live leaderboards, and immersive 3D/cinematic UI to create a premium experience for organizers, judges, and participants.

### Core Modules
1.  **Hackathon Management**: Organizers can create, update, and manage hackathons with custom rounds and scoring criteria.
2.  **Team Formation**: Users can form teams, generate unique team codes, and join existing teams.
3.  **Submission Engine**: Teams can submit project details, URLs, and files (PPT, Repo, Video).
4.  **AI Evaluation Layer**: An intelligent layer that pre-analyzes submissions to provide feedback and preliminary scoring suggestions.
5.  **Scoring & Evaluation**: Judges provide granular scores based on weighted criteria, combined with AI insights.
6.  **Live Leaderboard**: Real-time ranking engine that handles weighted round scores and dynamic updates.
7.  **Demo Mode**: A built-in simulation engine with seed data for product demonstrations.

### Architecture Summary
The application follows a standard **MERN Stack** (MongoDB, Express.js, React, Node.js) architecture with a decoupled frontend and backend.
-   **Frontend**: React (Vite) with Tailwind CSS for styling and GSAP/Three.js for high-fidelity animations.
-   **Backend**: Node.js/Express REST API with MongoDB (Mongoose) for data persistence.
-   **AI Service**: (Mocked/Integrated) Python service bridge for text analysis.

### Tech Stack
-   **Frontend**: React 19, Vite, Tailwind CSS v4, GSAP (ScrollTrigger), Three.js (@react-three/fiber), Framer Motion, Lucide React, Axios.
-   **Backend**: Node.js, Express, MongoDB (Mongoose), JWT, Bcrypt, Multer.
-   **Tools**: Faker (Seed data), Nodemon, PostCSS.

---

## 2. Full Folder Structure

### Backend (`/server`)
```
server/
├── src/
│   ├── config/             # Database connection logic (db.js)
│   ├── controllers/        # Request handlers (business logic)
│   ├── middleware/         # Auth, Upload, and Validation middleware
│   ├── models/             # Mongoose Schemas (User, Team, Hackathon, etc.)
│   ├── routes/             # API Route definitions
│   └── services/           # Reusable business logic (AI, Scoring, Leaderboard)
├── uploads/                # Static storage for uploaded files
├── .env                    # Environment variables
├── realistic_seed.js       # Standalone seeding script
└── server.js               # Application entry point
```

### Frontend (`/client`)
```
client/
├── src/
│   ├── components/
│   │   ├── 3d/             # Three.js scenes (ParticleField, FloatingPanel)
│   │   ├── auth/           # Auth guards (ProtectedRoute)
│   │   ├── demo/           # Demo mode specific components (Overlay, ControlPanel)
│   │   ├── layout/         # Navbar, Footer (Layout wrappers)
│   │   └── ui/             # Reusable UI kits (AnimatedCard, NeonButton)
│   ├── context/            # React Context (AuthContext, DemoContext)
│   ├── pages/
│   │   └── dashboards/     # Role-specific dashboards (Organizer, Judge, Leaderboard)
│   ├── utils/              # Helper functions (scrollAnimations.js)
│   ├── App.jsx             # Main Router and Provider setup
│   └── index.css           # Global Tailwind and Custom styles
└── index.html              # Entry HTML
```

---

## 3. Backend Documentation

### Models

| Model | Purpose | Key Fields | Relations |
| :--- | :--- | :--- | :--- |
| **User** | Store user access and profiles | `name`, `email`, `password` (hashed), `role` ('organizer', 'judge', 'participant'), `avatar` | - |
| **Hackathon** | Event configurations | `title`, `dates`, `rounds` (Array), `criteria`, `status` | `createdBy` (User), `judges` (User[]), `students` (User[]) |
| **Team** | Team groups for generic participation | `name`, `teamCode`, `leader` | `members` (User[]), `hackathon` (Hackathon) |
| **Submission** | Inputs provided by teams | `content` (URLs), `roundIndex`, `aiScore`, `judgeScore` | `team` (Team), `submittedBy` (User) |
| **Evaluation** | Scores given by judges | `scores` (Array of criteria), `judgeTotal`, `finalTotal`, `weightedScore` | `judge` (User), `submission` (Submission) |
| **LeaderboardSnapshot** | Cached ranking state | `rows` (Array of Team Ranks), `generatedAt` | `hackathon` (Hackathon) |

### APIs

#### Authentication (`/api/auth`)
-   `POST /register`: Create new user.
-   `POST /login`: Authenticate and receive JWT.
-   `GET /me`: Get current user profile (Protected).
-   `PUT /profile`: Update profile and avatar (Protected).

#### Hackathons (`/api/hackathons`)
-   `GET /`: List all visible hackathons.
-   `POST /`: Create new hackathon (Organizer).
-   `GET /:id`: Get details.
-   `PUT /:id`: Update details (Organizer).
-   `POST /:id/judges`: Invite judge (Organizer).
-   `GET /judge/my`: Get hackathons assigned to a judge.

#### Teams (`/api/teams`)
-   `POST /create`: Create a new team.
-   `POST /join`: Join team via code.
-   `GET /my`: Get user's teams.
-   `GET /hackathon/:hackathonId`: List teams for an event (Organizer).

#### Submissions (`/api/submissions`)
-   `POST /submit`: Upload files/links for a round.
-   `GET /my`: Get current user's team submissions.
-   `GET /hackathon/:id/round/:roundIndex`: Get submissions for review (Judge/Organizer).

#### Evaluations (`/api/evaluations`)
-   `POST /submit`: Submit scores (Judge).
-   `GET /submission/:submissionId`: Get specific evaluation.

#### Leaderboard (`/api/leaderboard`)
-   `GET /:hackathonId`: Get public leaderboard.
-   `POST /:hackathonId/refresh`: Force recalculate ranks (Protected).

#### Demo (`/api/demo`) - *Demo Mode Only*
-   `POST /seed`: Populate database with fake data.
-   `DELETE /reset`: Clear database.
-   `POST /simulate/:id`: Simulate round progression and random scoring.

### Services

#### `scoringService.js`
Handles the mathematics of scoring.
-   `calculateJudgeTotal`: Sums raw marks from criteria.
-   `calculateWeightedScore`: Normalizes score to round weightage (e.g., Raw 80/100 in a 30% weight round = 24 points).

#### `leaderboardService.js`
Aggregates scores to generate rankings.
-   Fetches all teams and their submissions.
-   Averages judge scores per submission.
-   Merges AI scores (Config: 70% Judge, 30% AI).
-   Applies round-weights.
-   Sorts and caches result in `LeaderboardSnapshot`.

#### `aiEvaluationService.js`
-   Mock bridge to AI analysis engine.
-   Logs payloads intended for NLP analysis.

#### `demoSeedService.js`
-   Uses `faker` to create:
    -   1 Organizer, 5 Judges, 50 Participants.
    -   3 Hackathons (Past, Active, Future).
    -   15 Active Teams with realistic names.
    -   Submissions with Git/Video links.
    -   Randomized initial scores.

---

## 4. Frontend Documentation

### Routes (`App.jsx`)
-   `/`: Landing Page (Public).
-   `/login`, `/register`: Auth pages.
-   **Protected Routes**:
    -   `/dashboard`: Main role-based dashboard.
    -   `/profile`: User settings.
    -   `/dashboard/create-hackathon`: Organizer builder.
    -   `/dashboard/team`: Participant team panel.
    -   `/dashboard/organizer/teams/:id`: Team management.
    -   `/dashboard/submission`: Submission interface.
    -   `/dashboard/judge/evaluate/:id`: Scoring interface.
    -   `/leaderboard/:id`: Live rankings.

### Key Components
-   **`AnimatedCard`**: The standard container component. Uses `framer-motion` for 3D tilt and `glass-panel` CSS for styling.
-   **`Navbar`**: Responsive, dynamic navigation based on User Role. Includes "Demo Mode" badge.
-   **`HackathonScene`** (3D): Interactive background using React Three Fiber with floating nodes and particles.
-   **`WalkthroughOverlay`**: Guided tour component for Demo Mode.

### Animation System
-   **GSAP ScrollTrigger**: Used in `scrollAnimations.js` to animate elements as they enter the viewport.
    -   `animateStaggerGrid`: Staggered entry for lists.
    -   `animateNumberCounter`: Counting effect for stats.
-   **Three.js**: Renders the "Network" background on Landing page.

---

## 5. AI Evaluation Layer
The AI System provides a "pre-score" to assist judges.
1.  **Trigger**: On submission upload.
2.  **Analysis**: (Simulated) Text analysis of project description and code structure.
3.  **Output**: `aiScore` object saved to Submission.
4.  **Usage**: Displayed to Judges as a reference; contributes 30% (configurable) to final round score.

---

## 6. Scoring Engine
**Formula:**
1.  **Raw Round Score** = `(Average Judge Score * 0.7) + (AI Score * 0.3)`
2.  **Weighted Round Score** = `(Raw Score / Max Round Score) * Round Weight`
3.  **Total Hackathon Score** = Sum of all `Weighted Round Scores`.

*Example*:
-   Round 1 (30% Weight). Max Score 100.
-   Judge gives 80. AI gives 90.
-   Raw = (80 * 0.7) + (90 * 0.3) = 56 + 27 = 83.
-   Weighted = (83 / 100) * 30 = **24.9 points**.

---

## 7. Leaderboard Engine
-   **Live Calculation**: Leaderboard is generated on-demand or refreshed via API.
-   **Snapshotting**: Results are stored in `LeaderboardSnapshot` to prevent recalculation load on every page view.
-   **Transparency**: Breakdown of scores (AI vs Judge) is available in the data model for transparency views.

---

## 8. Demo Mode System
A dedicated mode for presentation.
-   **Activation**: Set `DEMO_MODE=true` in `.env`.
-   **Seed Engine**: `POST /api/demo/seed` creates a full fictional ecosystem instantly.
-   **Simulator**: `POST /api/demo/simulate/:id` updates scores randomly to show leaderboard movements dynamically during demos.
-   **UI**: Adds a Control Panel in Organizer Dashboard and a Walkthrough Overlay for guided explanation.

---

## 9. Dashboard Analytics
-   **Organizer**: Total Events, Active Teams, Submission Count, Completion Rates.
-   **Judge**: Pending Evaluations, Completed Evaluations.
-   **Participant**: Current Team status, Submission status.

---

## 10. Profile System
Allows users to upload avatars and update names.
-   **Endpoint**: `PUT /api/auth/profile`.
-   **Storage**: Images stored in locally served `/uploads` directory (served via static middleware).

---

## 11. Environment Variables
Create a `.env` file in the `/server` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/hackflow-ai
JWT_SECRET=your_jwt_secret_key_123
DEMO_MODE=true                # Enable/Disable Demo Features
AI_SERVICE_URL=http://localhost:8000
```

---

## 12. Setup Instructions

### Prerequisites
-   Node.js (v18+)
-   MongoDB (Running locally or Atlas)

### 1. Backend Setup
```bash
cd server
npm install
# Create .env file (see above)
npm start
# Output: Server running on port 5000
```

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
# Output: Local: http://localhost:5173/
```

### 3. Demo Data (Optional)
1.  Open `http://localhost:5173/login`
2.  Register a new Organizer account.
3.  Go to Dashboard.
4.  In "Demo Control Panel", click **"Generate Seed Data"**.

---

## 13. Deployment Notes
-   **Frontend**: Build using `npm run build`. Deploy the `dist` folder to Vercel/Netlify.
-   **Backend**: Deploy to Render/Heroku/AWS. Ensure `MONGO_URI` is set to production DB.
-   **Images**: For production, replace `src/middleware/uploadMiddleware` logic to use S3/Cloudinary instead of local disk storage.

---

## 14. Security Notes
-   **Auth**: JWT (Stateless). Tokens must be included in `Authorization: Bearer <token>` header.
-   **RBAC**: Middleware `authorize('role')` strictly enforces access.
    -   Only Organizers can create hackathons.
    -   Only Judges/Organizers can submit evaluations.
-   **Validation**: Mongoose schemas enforce data types and requirements.
