# HACKFLOW AI - MASTER DOCUMENTATION

## PART A — SYSTEM OVERVIEW

**Hackflow AI** is a comprehensive full-stack platform designed to manage the entire lifecycle of hackathons, from creation and team formation to submission, judging, and leaderboard generation. It streamlines the complex workflows of organizers, participants, and judges into a unified, reliable system.

### Core Purpose
To provide a structured, simplified, and automated environment for conducting hackathons with high integrity and efficiency.

### User Roles
1.  **Organizer**: Creator and administrator of the hackathon. Has full control over rounds, judges, and results.
2.  **Participant**: A user who registers, joins a team, and submits projects.
3.  **Judge**: A user invited to evaluate submissions based on defined criteria.

### Lifecycle of a Hackathon
1.  **Creation**: Organizer defines details, dates, and rounds.
2.  **Registration**: Participants register and form teams.
3.  **Submission**: Teams submit work for active rounds.
4.  **Evaluation**: Judges and AI score the submissions.
5.  **Publishing**: Organizer publishes round results to the leaderboard.
6.  **Completion**: Final winners are declared.

### Key Differentiators
-   **AI Scoring**: Preliminary automated evaluation of submissions to assist judges.
-   **Round Status Engine**: Sophisticated state machine (Draft -> Open -> Closed -> Judging -> Published).
-   **Time-Based Round Control**: Automatic opening and closing of rounds based on scheduled windows.
-   **Dynamic Submission Schema**: Organizers can define custom fields (files, URLs, text) for each round.
-   **Publish-Controlled Leaderboard**: Results are hidden until explicitly published by the organizer.

---

## PART B — TECHNICAL ARCHITECTURE

### Architecture Overview
The system follows a standard **MERN Stack** (MongoDB, Express.js, React, Node.js) architecture with a RESTful API service layer and a client-side Single Page Application (SPA).

### Frontend Stack
-   **Framework**: React (Vite)
-   **Routing**: React Router DOM v6
-   **Styling**: Tailwind CSS + Pure CSS Variables (Theme System)
-   **State Management**: React Context API (`AuthContext`)
-   **HTTP Client**: Axios
-   **Icons**: Lucide React
-   **Motion**: Framer Motion

### Backend Stack
-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Database**: MongoDB (Mongoose ODMS)
-   **Authentication**: JSON Web Tokens (JWT) + bcryptjs
-   **File Uploads**: Multer (Local Storage)
-   **AI Integration**: Placeholder/Mock AI Service (Extensible)

### Database Models
-   `User`
-   `Hackathon`
-   `Team`
-   `HackathonParticipantProfile`
-   `Submission`
-   `Evaluation`
-   `LeaderboardSnapshot`

### Middleware Layer
-   `authMiddleware`: Validates JWT and attaches user to request.
-   `organizerOwnershipGuard`: Ensures only the creator can modify a hackathon.
-   `judgeHackathonGuard`: Ensures only assigned judges can evaluate.
-   `uploadMiddleware`: Handles file uploads via Multer.

### Core Engines
-   **Round Status Engine**: Manages transitions between round states and enforces submission locks.
-   **Time Window Engine**: Calculates effective round status based on `startTime` and `endTime`.
-   **Scoring Engine**: Aggregates AI and Judge scores into a weighted final score.
-   **Leaderboard Engine**: Generates snapshots of scores for ranking.

**Directory Structure:**

**Frontend (`client/src`)**
-   `components/`: Reusable UI components (Buttons, Cards, Inputs).
-   `context/`: Global state providers.
-   `pages/`: Route components.
    -   `dashboards/`: Role-specific dashboard views.
-   `utils/`: Helper functions.

**Backend (`server/src`)**
-   `controllers/`: Request handling logic.
-   `middleware/`: Request processing and guards.
-   `models/`: Database schemas.
-   `routes/`: API endpoint definitions.
-   `utils/`: Helper logic (scoring, status resolution).

---

## PART C — DATA MODELS

### 1. User
Represents any platform user.
-   **Fields**: `name`, `email` (unique), `password` (hashed), `role` (enum: organizer, judge, participant), profile fields (college, skills, etc.).
-   **Purpose**: Authentication and profile management.

### 2. Hackathon
The core entity managed by organizers.
-   **Fields**: `title`, `description`, `dates`, `rounds` (Array), `judges` (Array of IDs), `students` (Array of IDs), `createdBy` (User Ref).
-   **Round Structure**: `name`, `order`, `status` (enum), `criteria` (Array), `submissionSchema` (Array), `startTime`, `endTime`, `autoTimeControlEnabled`.
-   **Purpose**: Stores configuration and state of the event.

### 3. Team
A group of participants.
-   **Fields**: `name`, `teamCode` (unique 6-char), `hackathon` (Ref), `leader` (User Ref), `members` (Array of User Refs).
-   **Constraint**: A user can strictly belong to only one team per hackathon.
-   **Purpose**: Grouping users for submissions.

### 4. HackathonParticipantProfile
Hackathon-specific profile data.
-   **Fields**: `user`, `hackathon`, `collegeName`, `yearOfStudy`, `resumeUrl`.
-   **Constraint**: Unique per user per hackathon.
-   **Purpose**: Capturing specific data required for a specific event (e.g., Resume).

### 5. Submission
A team's entry for a specific round.
-   **Fields**: `hackathon`, `team`, `roundIndex`, `submittedBy`, `submissionData` (Dynamic Mixed), `isLocked`, `status`.
-   **Purpose**: Storing project files and links.

### 6. Evaluation
A score card given by a judge.
-   **Fields**: `submission`, `judge`, `hackathon`, `scores` (Array of criteria scores), `judgeTotal`, `finalTotal`.
-   **Constraint**: One evaluation per judge per submission.
-   **Purpose**: Scoring logic.

### 7. LeaderboardSnapshot
A frozen state of the leaderboard.
-   **Fields**: `hackathon`, `generatedAt`, `rows` (Array of team ranks and scores).
-   **Purpose**: Storing published results.

---

## PART D — API DOCUMENTATION

### Auth
-   `POST /api/auth/register`: Create new user.
-   `POST /api/auth/login`: Authenticate and get token.
-   `GET /api/auth/me`: Get current user details.
-   `PUT /api/auth/profile`: Update user profile.

### Hackathon
-   `GET /api/hackathons`: List all active hackathons.
-   `POST /api/hackathons`: Create new (Organizer only).
-   `GET /api/hackathons/:id`: Get full details.
-   `PUT /api/hackathons/:id`: Update details (Organizer Owner only).
-   `DELETE /api/hackathons/:id`: Delete (Organizer Owner only).
-   `PUT /api/hackathons/:id/round/:roundIndex/status`: Change round status (Organizer Owner only).
-   `POST /api/hackathons/:id/round/:roundIndex/publish-leaderboard`: Publish results.

### Team
-   `POST /api/teams/create`: Create a team.
-   `POST /api/teams/join`: Join via code.
-   `POST /api/teams/leave`: Leave current team.
-   `GET /api/teams/my`: Get all my teams.
-   `GET /api/teams/my/by-hackathon/:hackathonId`: Get my team for specific event.

### Submission
-   `POST /api/submissions/submit`: Upload/Create submission.
-   `GET /api/submissions/my`: Get my team's submissions.
-   `GET /api/submissions/hackathon/:id/round/:idx`: Get all submissions for a round (Organizer/Judge only).

### Evaluation
-   `POST /api/evaluations/submit`: Submit score (Judge only).
-   `GET /api/evaluations/submission/:id`: Get my evaluation for a submission (Judge only).

### Participant Profile
-   `POST /api/profiles/:hackathonId`: Create/Update profile for event.
-   `GET /api/profiles/:hackathonId/status`: Check if profile is complete.

### Leaderboard
-   `GET /api/leaderboard/:hackathonId`: Get public leaderboard.
-   `POST /api/leaderboard/:hackathonId/refresh`: Force refresh (Organizer only).

---

## PART E — FULL END-TO-END FLOW (TECHNICAL)

1.  **Creation**: Organizer calls `POST /hackathons`. `Hackathon` doc created with `rounds` in `draft` status.
2.  **Activation**: Round status updated to `open` (or auto-opens via time).
3.  **Participation**:
    -   User `POST /register`.
    -   User `POST /teams/create` or `/join`. Backend checks 1-team-per-hackathon rule.
    -   User `POST /profiles/:id` to complete registration.
4.  **Submission**:
    -   Team calls `POST /submissions/submit`.
    -   Backend validates:
        -   Round is `open`.
        -   User is team leader (optional/strict).
        -   Required schema fields are present.
    -   `Submission` doc created/updated.
5.  **Scoring**:
    -   **AI**: System generates `aiScore` (mock/process).
    -   **Judge**: `POST /evaluations/submit`.
    -   Backend calculates `weightedScore` = `(judgeAvg * weight) + (aiScore * weight)`.
6.  **Results**:
    -   Organizer sets round to `published`.
    -   `LeaderboardSnapshot` is generated and saved.
    -   Participants calling `GET /leaderboard` now see the data.

---

## PART F — PAGE & ROUTE MAP (FRONTEND)

### Public
-   `/`: **Landing Page**. Marketing and features.
-   `/hackathons`: **Hackathon List**. Browse events.
-   `/hackathon/:id`: **Details Page**. Description, schedule, rounds information.
-   `/login`, `/register`: Auth pages.

### Protected (Generic)
-   `/dashboard`: **Main Dashboard**. Redirects based on role.
-   `/profile`: User profile settings.

### Organizer
-   `/dashboard/create-hackathon`: Form to create new event.
-   `/dashboard/organizer/rounds/:id`: **Round Manager**. Control start/end/status.
-   `/dashboard/organizer/judges/:id`: **Judge Manager**. Add/Remove judges.
-   `/dashboard/organizer/submissions/:id`: **Review Panel**. See all submissions.
-   `/dashboard/organizer/teams/:id`: **Team Manager**. View registered teams.

### Participant
-   `/dashboard/submission`: **Submission Panel**. Submit project.
-   `/dashboard/team`: **Team Panel**. Manage team.
-   `/hackathon/:id/participation`: **Status Hub**. Track progress.

### Judge
-   `/dashboard`: Shows assigned hackathons.
-   `/dashboard/judge/evaluate/:subId`: **Evaluation Form**. Score a project.

---

## PART G — BUTTON-LEVEL BEHAVIOR (NON-TECH)

### Landing Page
-   **"Explore Hackathons"**: Takes you to the list of all active events.
-   **"Get Started"**: Takes you to Register or Login.

### Dashboard
-   **"Create Hackathon"**: Opens the form to set up a new event.
-   **"Manage" (on a Hackathon)**: Opens the organizer tools (Rounds, Teams, Judges).

### Submission Panel
-   **"Submit Project"**: Validates your inputs and uploads files. Only works if round is Open.
-   **"Update Submission"**: Overwrites previous files (versions are tracked).

### Round Manager
-   **"Move to Open"**: Instantly opens the round for submissions.
-   **"Move to Judging"**: Closes submissions strictly. Allows judges to enter scores.
-   **"Publish Results"**: Calculates final scores and makes the leaderboard visible to everyone.

### Judge Evaluation
-   **"Submit Score"**: Saves your marks. Calculates user's total. Can be updated until round is published.

---

## PART H — ROLE-WISE USER GUIDES

### Organizer Guide
1.  **Create**: Go to Dashboard > Create Hackathon. Fill details & define Rounds.
2.  **Configure**: Use Round Manager to set start/end times or keep them as Draft.
3.  **Invite**: Go to Judges tab. Add judges by email.
4.  **Run**: When ready, switch Round 1 to "Open" (or let auto-timer do it).
5.  **Close**: Switch Round 1 to "Judging".
6.  **Publish**: When judging is done, click "Publish Leaderboard".

### Participant Guide
1.  **Register**: Sign up and complete your profile.
2.  **Join**: Find a hackathon. Create a team or join one using a Team Code.
3.  **Prepare**: Check the Rounds tab to see requirements.
4.  **Submit**: Go to Submission Panel inside the open round. Upload files.
5.  **Wait**: Wait for results. Check Leaderboard when published.

### Judge Guide
1.  **Access**: Login. You will see hackathons you are assigned to.
2.  **Review**: Click "Start Judging". You will see a list of submissions.
3.  **Evaluate**: Click "Evaluate" on a team. Read their files/links. Check the criteria.
4.  **Score**: Enter marks and comments. Click Submit.

---

## PART I — ROUND SYSTEM EXPLANATION

The **Round Status Engine** controls the flow:
-   **Draft**: Invisible/Inactive. Config stage.
-   **Scheduled**: Visible start/end times, but not yet open.
-   **Open**: Accepting submissions.
-   **Submission Closed**: Submissions blocked. Judges can view but typically wait for Judging status.
-   **Judging**: Submissions blocked. Judges can score.
-   **Published**: Scores are finalized. Leaderboard is public.

**Time Control**:
If "Auto-Schedule" is enabled, the system automatically calculates `Open` or `Closed` based on current time vs `startTime/endTime`. However, setting status to `Judging` or `Published` manually **overrides** the time settings.

---

## PART J — SCORING & LEADERBOARD LOGIC

1.  **Criteria Score**: Sum of marks given by one judge for all criteria.
2.  **Judge Average**: Average of total scores from all judges who evaluated.
3.  **AI Score**: Automated score (0-100) generated validation.
4.  **Round Score**: `(JudgeAvg * 70%) + (AIScore * 30%)` (Default weights).
5.  **Total Score**: Sum of Round Scores across all rounds.
6.  **Leaderboard**: Ranks teams by Total Score. Only shows rounds that are explicitly **Published**.

---

## PART K — SECURITY & PERMISSIONS

-   **Organizer Guard**: Only the specific user who created the hackathon can edit it. Even other organizers cannot edit your event.
-   **Judge Guard**: You can only access evaluation routes if your User ID is in the `judges` list of that hackathon.
-   **Team Guard**: You cannot submit unless you are in a team. You cannot be in 2 teams for 1 event.
-   **Auth**: All API actions (except login/register/public list) require a valid JWT token.

---

## PART L — EDGE CASE RULES

-   **Late Submission**: If a user tries to submit after `endTime` or `status != open`, the backend rejects with `403 Forbidden`.
-   **Unpublished Leaderboard**: If a participant tries to view rankings before the organizer clicks "Publish", the API returns an empty or restricted list (Snapshot not found).
-   **Orphaned Judges**: If a judge is removed, their existing scores remain but they lose access to add new ones.

---

## PART M — SETUP & RUN GUIDE

### Requirements
-   Node.js v14+
-   MongoDB Instance
-   NPM

### Setup
1.  **Clone Repo**: `git clone ...`
2.  **Backend**:
    -   `cd server`
    -   `npm install`
    -   Create `.env`: `MONGO_URI`, `JWT_SECRET`, `PORT`.
    -   `npm run dev`
3.  **Frontend**:
    -   `cd client`
    -   `npm install`
    -   `npm run dev`
4.  **Access**: Open `http://localhost:5173`

### Demo Mode
*Note: Demo mode was recently removed. The system now runs purely on real data models.*
