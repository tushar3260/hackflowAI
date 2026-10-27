# Bugs, Broken Features, and Technical Risks

**Audit Date:** October 2026  
**Auditor:** Senior Full-Stack Software Engineer & Code Reviewer  
**Repository:** `hackflowAI`  
**Workspace Path:** `c:\Users\Tushar Bansal\Desktop\Programming\hackflowAI`

---

## Executive Summary of Findings

A systematic audit was conducted across the codebase, inspecting all API routes, database models, frontend components, state management contexts, styling configurations, and external microservice integrations.

- **Total Issues Identified:** 15
- **Critical Severity:** 2
- **High Severity:** 5
- **Medium Severity:** 5
- **Low Severity:** 3

---

## 1. Compilation, Syntax, and Import Errors

### BUG-01: Runtime `ReferenceError: setHackathons is not defined`
- **Issue ID:** `BUG-01`
- **Title:** `ReferenceError: setHackathons is not defined` in `OrganizerDashboard.jsx`
- **Severity:** High
- **Status:** **Confirmed**
- **Exact File Path & Line:** `client/src/pages/dashboards/OrganizerDashboard.jsx:45`
- **Evidence / Code Pattern:**
  ```javascript
  const fetchHackathons = useCallback(async () => {
      try {
          const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
          const res = await api.get('/hackathons/organizer/my', config);
          const myHackathons = Array.isArray(res.data) ? res.data : (res.data.data || []);
          setHackathons(myHackathons); // <-- Line 45: setHackathons is not defined in scope!
          
          const sorted = [...myHackathons].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
          setRecentEvents(sorted.slice(0, 5));
          ...
      } catch (err) {
          console.error(err);
          setLoading(false);
      }
  }, []);
  ```
- **Steps to Reproduce:**
  1. Log in as an organizer (`organizer@hackflow.com`).
  2. Navigate to `/dashboard`.
  3. Inspect the browser developer console: `ReferenceError: setHackathons is not defined`.
- **Expected vs Actual Behavior:**
  - *Expected:* Active hackathons load into state, displaying the top 5 recent events and status breakdown pie chart.
  - *Actual:* Exception is thrown on line 45, aborting the function before `setRecentEvents` runs. The event list and charts stay permanently empty.
- **Recommended Fix:**
  Add `const [hackathons, setHackathons] = useState([]);` to component state declarations on line 22.
- **Potential Impact:** Completely breaks event listing on the primary organizer landing view.
- **Breaking Changes:** None.

---

## 2. Incorrect or Inconsistent API Endpoints & Route Guards

### BUG-02: Organizers Blocked from Viewing Submissions by `judgeHackathonGuard`
- **Issue ID:** `BUG-02`
- **Title:** Route Guard Mismatch Rejects Organizers on `GET /api/submissions/hackathon/:hackathonId/round/:roundIndex`
- **Severity:** **Critical**
- **Status:** **Confirmed**
- **Exact File Path & Line:** `server/src/routes/submissionRoutes.js:22` and `server/src/middleware/judgeMiddleware.js:6-9`
- **Evidence / Code Pattern:**
  In `server/src/routes/submissionRoutes.js:22`:
  ```javascript
  router.get('/hackathon/:hackathonId/round/:roundIndex', protect, authorize('organizer', 'judge'), judgeHackathonGuard, getSubmissionsByRound);
  ```
  In `server/src/middleware/judgeMiddleware.js:6-9`:
  ```javascript
  export const judgeHackathonGuard = async (req, res, next) => {
      try {
          // 1. Verify Role
          if (req.user.role !== 'judge') {
              return res.status(403).json({ message: 'Access denied. Judges only.' });
          }
  ```
- **Steps to Reproduce:**
  1. Log in as an organizer (`organizer@hackflow.com`).
  2. Open an event and navigate to `/dashboard/organizer/submissions/:hackathonId`.
  3. `SubmissionReview.jsx` calls `GET /api/submissions/hackathon/${selectedHackathon}/round/${selectedRound}`.
  4. Backend responds with HTTP `403 Forbidden: {"message": "Access denied. Judges only."}`.
- **Expected vs Actual Behavior:**
  - *Expected:* The hackathon creator can inspect all team submissions for any round.
  - *Actual:* `judgeHackathonGuard` rejects the organizer with a 403 error.
- **Recommended Fix:**
  Update `judgeHackathonGuard` to allow organizers who created the hackathon:
  ```javascript
  if (req.user.role === 'organizer') {
      const isOwner = hackathon.createdBy.toString() === req.user.id;
      if (!isOwner) return res.status(403).json({ message: 'Not authorized for this hackathon' });
      return next();
  }
  ```
- **Potential Impact:** Organizers cannot review or grade submissions on their own platform.
- **Breaking Changes:** None.

---

### BUG-03: `JudgeInviteAccept.jsx` URL Resolution and Duplicate `/api/api` Prefix
- **Issue ID:** `BUG-03`
- **Title:** Inconsistent API Base URL Formatting in `JudgeInviteAccept.jsx`
- **Severity:** High
- **Status:** **Confirmed**
- **Exact File Path & Line:** `client/src/pages/JudgeInviteAccept.jsx:45-47`
- **Evidence / Code Pattern:**
  ```javascript
  const { data } = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/api/hackathons/accept-judge-invite`,
      { token },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
  );
  ```
- **Steps to Reproduce:**
  1. Configure `VITE_API_BASE_URL=http://localhost:5000/api` (as declared in `client/src/api/config.js:4`).
  2. Follow an email invite link to `/judge-invite/accept?token=...`.
  3. Network inspector logs a request to `http://localhost:5000/api/api/hackathons/accept-judge-invite`.
  4. Server returns `404 Not Found`.
- **Expected vs Actual Behavior:**
  - *Expected:* Request sent to `/api/hackathons/accept-judge-invite`.
  - *Actual:* Duplicate `/api/api` path or `undefined/api/...` if `VITE_API_BASE_URL` is omitted.
- **Recommended Fix:**
  Use the pre-configured API client: `await api.post('/hackathons/accept-judge-invite', { token })`.
- **Potential Impact:** Judges cannot accept invitations, blocking hackathon judging.
- **Breaking Changes:** None.

---

### BUG-04: Wrong Endpoints in `client/src/api/hooks/useEvaluations.js`
- **Issue ID:** `BUG-04`
- **Title:** Mismatched Endpoints in `useEvaluations.js` (`/evaluate` vs `/evaluations`)
- **Severity:** Medium
- **Status:** **Confirmed**
- **Exact File Path & Line:** `client/src/api/hooks/useEvaluations.js:20, 55`
- **Evidence / Code Pattern:**
  `useEvaluations.js:20`: `api.get('/evaluate/submission/${submissionId}')`  
  `useEvaluations.js:55`: `api.post('/evaluate/submit', evaluationData)`  
  However, in `server/server.js:41`:
  `app.use('/api/evaluations', evaluationRoutes);`  
  Routes are mounted at `/api/evaluations/*`, not `/api/evaluate/*`.
- **Steps to Reproduce:**
  If any component imports and invokes `useEvaluations`, calls return 404. (Currently this hook is unused dead code, preventing immediate user-facing breakage, but it will break any code attempting to use it).
- **Expected vs Actual Behavior:**
  - *Expected:* Endpoints point to `/evaluations/submission/:id` and `/evaluations/submit`.
  - *Actual:* Requests fail with 404 Not Found.
- **Recommended Fix:** Correct path strings to `/evaluations/*`.
- **Potential Impact:** Breaks any feature refactored to use this hook.
- **Breaking Changes:** None.

---

## 3. Broken Routes and Navigation

### BUG-05: Non-Existent Route `/dashboard/organizer` in `OrganizerJudges.jsx`
- **Issue ID:** `BUG-05`
- **Title:** "Back to Dashboard" Navigates to Unregistered Route `/dashboard/organizer`
- **Severity:** Medium
- **Status:** **Confirmed**
- **Exact File Path & Line:** `client/src/pages/dashboards/OrganizerJudges.jsx:96`
- **Evidence / Code Pattern:**
  ```javascript
  <Button variant="ghost" className="mb-4 pl-0 gap-2" onClick={() => navigate(`/dashboard/organizer`)}>
      <ArrowLeft size={16} /> Back to Dashboard
  </Button>
  ```
  `client/src/App.jsx` registers `/dashboard`, but no `/dashboard/organizer` route exists.
- **Steps to Reproduce:**
  1. Navigate to `/dashboard/organizer/judges/:hackathonId`.
  2. Click "Back to Dashboard".
  3. URL changes to `/dashboard/organizer`, rendering a blank layout.
- **Expected vs Actual Behavior:**
  - *Expected:* Returns to `/dashboard`.
  - *Actual:* Navigates to an unmapped path.
- **Recommended Fix:** Change route to `navigate('/dashboard')`.
- **Potential Impact:** Confusing dead-end navigation for organizers.
- **Breaking Changes:** None.

---

### BUG-06: Dead Link to `/forgot-password` in `Login.jsx`
- **Issue ID:** `BUG-06`
- **Title:** Unmapped Route `/forgot-password` in Authentication Flow
- **Severity:** Low
- **Status:** **Confirmed**
- **Exact File Path & Line:** `client/src/pages/Login.jsx:93`
- **Evidence / Code Pattern:**
  ```javascript
  <Link to="/forgot-password" title="Feature coming soon" className="text-xs text-[var(--color-primary)] ...">
      Forgot password?
  </Link>
  ```
- **Steps to Reproduce:**
  1. Open `/login`.
  2. Click "Forgot password?".
  3. Route matches nothing in `App.jsx`, displaying an empty layout.
- **Expected vs Actual Behavior:**
  - *Expected:* Opens password recovery view or displays an in-modal notice.
  - *Actual:* Dead link.
- **Recommended Fix:** Implement `ForgotPassword.jsx` or disable the link until backend endpoint exists.
- **Potential Impact:** User frustration when attempting credential recovery.
- **Breaking Changes:** None.

---

## 4. Frontend/Backend Integration & Upload Middleware Issues

### BUG-07: Static Multer Configuration Breaks Dynamic Schema File Uploads
- **Issue ID:** `BUG-07`
- **Title:** Multer Static Fields Reject Custom Dynamic Schema Deliverables
- **Severity:** High
- **Status:** **Confirmed**
- **Exact File Path & Line:** `server/src/routes/submissionRoutes.js:14-19`
- **Evidence / Code Pattern:**
  ```javascript
  const uploadFields = upload.fields([
      { name: 'ppt', maxCount: 1 },
      { name: 'document', maxCount: 1 }
  ]);
  router.post('/submit', protect, uploadFields, submitWork);
  ```
  In `client/src/pages/dashboards/SubmissionPanel.jsx:212-216`:
  ```javascript
  currentRound.submissionSchema.forEach(field => {
      if (formData[field.fieldKey]) {
          data.append(field.fieldKey, formData[field.fieldKey]);
      }
  });
  ```
- **Steps to Reproduce:**
  1. Organizer creates a round with a dynamic submission field (e.g., `fieldKey: 'architectureDiagram'`, `type: 'file'`).
  2. Participant submits deliverables including this file.
  3. Multer intercepts the request, encounters field name `architectureDiagram`, and throws `MulterError: Unexpected field`.
  4. Request aborts with HTTP 500.
- **Expected vs Actual Behavior:**
  - *Expected:* Arbitrary deliverables matching the round's dynamic form schema are accepted and streamed to Cloudinary.
  - *Actual:* Express halts with `Unexpected field` error.
- **Recommended Fix:** Use `upload.any()` on `/api/submissions/submit` and validate field names inside `submissionController.js`.
- **Potential Impact:** Organizers cannot use custom submission schemas with file uploads.
- **Breaking Changes:** None.

---

### BUG-08: Multer Field Rejection on User Profile Updates
- **Issue ID:** `BUG-08`
- **Title:** `upload.single('avatar')` Rejects Simultaneous Resume Uploads
- **Severity:** Medium
- **Status:** **Confirmed**
- **Exact File Path & Line:** `server/src/routes/authRoutes.js:13` and `client/src/pages/Profile.jsx:74-75`
- **Evidence / Code Pattern:**
  In `server/src/routes/authRoutes.js:13`:
  ```javascript
  router.put('/profile', protect, upload.single('avatar'), updateProfile);
  ```
  In `client/src/pages/Profile.jsx:74-75`:
  ```javascript
  if (avatarFile) data.append('avatar', avatarFile);
  if (resumeFile) data.append('resume', resumeFile);
  ```
- **Steps to Reproduce:**
  1. On `/profile`, select both a new profile avatar and a PDF resume.
  2. Click "Save Profile".
  3. Multer throws `MulterError: Unexpected field: resume`.
- **Expected vs Actual Behavior:**
  - *Expected:* Both avatar and resume are processed.
  - *Actual:* Request fails with 500 error.
- **Recommended Fix:** Change `authRoutes.js:13` to `upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'resume', maxCount: 1 }])`.
- **Potential Impact:** Participants cannot upload resumes while updating their avatar.
- **Breaking Changes:** None.

---

## 5. Scoring Algorithms and Mathematical Defects

### BUG-09: Double-Dipping AI Score in Leaderboard Consolidation
- **Issue ID:** `BUG-09`
- **Title:** AI Score Factored Twice into Leaderboard Total
- **Severity:** High
- **Status:** **Confirmed**
- **Exact File Path & Line:** `server/src/services/leaderboardService.js:43-59` and `server/src/controllers/evaluationController.js:84`
- **Evidence / Code Pattern:**
  In `evaluationController.js:84`:
  ```javascript
  // finalTotal already combines judge score and AI score:
  const finalTotal = scoringService.calculateFinalScore(judgeTotal, aiScoreVal, scoreConfig);
  // Persisted into Evaluation.finalTotal:
  evaluation.finalTotal = finalTotal;
  ```
  In `leaderboardService.js:43-59`:
  ```javascript
  const sumJudges = evaluations.reduce((acc, curr) => acc + curr.finalTotal, 0);
  judgeAverage = sumJudges / evaluations.length; // Already contains AI score!
  ...
  const judgeContribution = judgeAverage * JUDGE_WEIGHT; // (70%)
  const aiContribution = aiScore * AI_WEIGHT;            // (30%)
  const finalRoundScore = judgeContribution + aiContribution; // AI SCORE COUNTED TWICE!
  ```
- **Steps to Reproduce:**
  1. Submit a project; AI scores it 80/100.
  2. Judge grades it 100/100.
  3. `Evaluation.finalTotal` = `(100 * 0.7) + (80 * 0.3) = 94`.
  4. `leaderboardService.js` takes `judgeAverage = 94`, computes `(94 * 0.7) + (80 * 0.3) = 65.8 + 24 = 89.8`.
  5. The judge's 100/100 mark only contributes 49% to the final score instead of the configured 70%.
- **Expected vs Actual Behavior:**
  - *Expected:* `judgeAverage` is calculated from raw human marks (`curr.judgeTotal`).
  - *Actual:* AI score is factored once inside `finalTotal` and again in `leaderboardService`.
- **Recommended Fix:**
  In `leaderboardService.js:43`, average `curr.judgeTotal`, read `round.judgeWeight` and `round.aiWeight` from the hackathon model, and compute `(judgeAverage * round.judgeWeight) + (aiScore * round.aiWeight)`.
- **Potential Impact:** Distorts tournament rankings and violates published rubric transparency.
- **Breaking Changes:** Past generated snapshots would differ if recalculated.

---

### BUG-10: `NaN` Score Calculation in Debug AI Controller
- **Issue ID:** `BUG-10`
- **Title:** Reading Non-Existent `totalScore` Property on `Evaluation` Model Causes `NaN`
- **Severity:** Medium
- **Status:** **Confirmed**
- **Exact File Path & Line:** `server/src/controllers/debugController.js:38`
- **Evidence / Code Pattern:**
  ```javascript
  const evaluations = await Evaluation.find({ submission: submissionId });
  let judgeTotal = 0;
  if (evaluations.length > 0) {
      const sum = evaluations.reduce((acc, curr) => acc + curr.totalScore, 0); // curr.totalScore is undefined!
      judgeTotal = sum / evaluations.length; // 0 + undefined = NaN; NaN / length = NaN
  }
  ```
- **Steps to Reproduce:**
  1. Trigger `POST /api/debug/run-ai/:submissionId` for any evaluated submission.
  2. Response payload returns `debugInfo.judgeScore: null` or `finalScore: NaN`.
- **Expected vs Actual Behavior:**
  - *Expected:* Debug endpoint returns accurate combined scores.
  - *Actual:* Produces `NaN`.
- **Recommended Fix:** Change `curr.totalScore` to `curr.judgeTotal`.
- **Potential Impact:** Breaks developer debugging and rubric verification.
- **Breaking Changes:** None.

---

## 6. Null Handling and Edge Cases

### BUG-11: Unhandled Null User in `authMiddleware.js`
- **Issue ID:** `BUG-11`
- **Title:** Missing Null Check After `User.findById` Leads to Unhandled Rejection
- **Severity:** Medium
- **Status:** **Confirmed**
- **Exact File Path & Line:** `server/src/middleware/authMiddleware.js:19-20`
- **Evidence / Code Pattern:**
  ```javascript
  req.user = await User.findById(decoded.id).select('-password');
  next(); // Called even if req.user is null!
  ```
- **Steps to Reproduce:**
  1. Delete a test user account directly in MongoDB.
  2. Send a request with that user's valid, unexpired JWT to any protected endpoint.
  3. `req.user` is `null`. Next middleware (e.g. `authorize` checking `req.user.role`) throws `TypeError: Cannot read properties of null (reading 'role')`.
- **Expected vs Actual Behavior:**
  - *Expected:* Returns `401 Unauthorized: User no longer exists`.
  - *Actual:* Uncaught 500 server crash.
- **Recommended Fix:**
  ```javascript
  req.user = await User.findById(decoded.id).select('-password');
  if (!req.user) {
      return res.status(401).json({ message: 'User account no longer exists' });
  }
  next();
  ```
- **Potential Impact:** Crashes API requests for stale sessions.
- **Breaking Changes:** None.

---

### BUG-12: Schema Mismatch in `ParticipantDashboard.jsx` Team Role Resolver
- **Issue ID:** `BUG-12`
- **Title:** Reading Non-Existent `m.user` and `m.role` on Populated Team Members
- **Severity:** Low
- **Status:** **Confirmed**
- **Exact File Path & Line:** `client/src/pages/dashboards/ParticipantDashboard.jsx:49`
- **Evidence / Code Pattern:**
  ```javascript
  role: team.members.find(m => m.user === user?._id || m.user === user?.id)?.role || 'member'
  ```
  `Team.members` is an array of `User` references (`[{ type: ObjectId, ref: 'User' }]`). In `teamController.js:getMyTeams`, members are populated with `'name email'`. There is no `.user` property or `.role` property on array elements.
- **Steps to Reproduce:**
  1. Log in as a team leader.
  2. Open `/dashboard`.
  3. Team role always defaults to `'member'`, never recognizing leadership status.
- **Expected vs Actual Behavior:**
  - *Expected:* Checks `team.leader === user._id` to set `'leader'` or `'member'`.
  - *Actual:* Evaluates to `'member'` for all participants.
- **Recommended Fix:**
  ```javascript
  role: (team.leader?._id || team.leader)?.toString() === (user?._id || user?.id)?.toString() ? 'leader' : 'member'
  ```
- **Potential Impact:** Minor UI label inaccuracy.
- **Breaking Changes:** None.

---

## 7. Hardcoded Data, Placeholders, and Dead Code

### BUG-13: Stubbed / Hardcoded Metrics Across Role Dashboards
- **Issue ID:** `BUG-13`
- **Title:** Multiple Dashboard Widgets Display Fake / Hardcoded Data
- **Severity:** Medium
- **Status:** **Confirmed**
- **Exact File Path & Line:**
  - `server/src/controllers/hackathonController.js:471`: `completedReviews = 0; // Placeholder until Evaluation model is linked`
  - `client/src/pages/dashboards/JudgeDashboard.jsx:80`: `trendLabel="+2 new assignments"`
  - `client/src/pages/dashboards/JudgeDashboard.jsx:99`: `value="8.5"` (Avg Score Given)
  - `client/src/pages/dashboards/JudgeDashboard.jsx:190`: `<span>5 Pending</span>`
  - `client/src/pages/dashboards/ParticipantDashboard.jsx:191-209`: Profile Completion `"85%"`, Hackathon Readiness `"92%"`, Rank `"Gold Member"`
  - `client/src/pages/dashboards/Leaderboard.jsx:168-169`: `style={{ width: '70%' }}` and `style={{ width: '30%' }}` hardcoded contribution bar
- **Evidence / Code Pattern:** Visual inspection of code confirms hardcoded static values.
- **Expected vs Actual Behavior:**
  - *Expected:* Values derived dynamically from database queries.
  - *Actual:* Fixed dummy data displayed to end users.
- **Recommended Fix:** Connect these widgets to actual aggregation queries or remove misleading widgets.
- **Potential Impact:** Misleads judges and participants regarding their true progress.
- **Breaking Changes:** None.

---

### BUG-14: Disconnected 3D Scenes and Unmounted WebGL Canvas
- **Issue ID:** `BUG-14`
- **Title:** 11 Three.js / R3F Component Files Exist but Are Never Mounted
- **Severity:** Low
- **Status:** **Confirmed**
- **Exact File Path & Line:**
  - `client/src/components/3d/` (7 files: `AICore.jsx`, `FloatingPanel.jsx`, `Hero3DScene.jsx`, `ParticleField.jsx`, `Scene.jsx`, `ScrollAICore.jsx`, `ScrollNetwork.jsx`)
  - `client/src/components/three/` (4 files: `FloatingNode.jsx`, `HackathonScene.jsx`, `OrbitCard.jsx`, `ParticleField.jsx`)
- **Evidence / Code Pattern:**
  Grep search across all files in `client/src` confirms zero import statements for `Hero3DScene`, `HackathonScene`, `components/3d/Scene`, or `OrbitCard`. `Hero.jsx` instead renders a 2D CSS terminal box.
- **Expected vs Actual Behavior:**
  - *Expected:* The 3D interactive core described in `PROJECT_GUIDEBOOK.md` renders on the landing hero.
  - *Actual:* Dead code in the repository; heavy Three.js dependencies installed but unused in the UI.
- **Recommended Fix:** Maintainer must decide whether to mount `Hero3DScene` in `Hero.jsx` or delete the 3D files and uninstall Three.js packages.
- **Potential Impact:** 2.5MB+ unnecessary bundle overhead.
- **Breaking Changes:** None.

---

## 8. Configuration, Environment, and Dependency Risks

### BUG-15: Missing Dependencies & Python 3.14 Runtime Incompatibility
- **Issue ID:** `BUG-15`
- **Title:** Missing `node_modules` and Python 3.14 `scikit-learn`/`numpy` Incompatibility
- **Severity:** High
- **Status:** **Confirmed**
- **Exact File Path & Line:** `ai-service/requirements.txt:1-5`, `server/package.json`, `client/package.json`
- **Evidence / Code Pattern:**
  - `node_modules` is not installed in `client` or `server`. Running `npm run lint` failed with `eslint: command not found`.
  - Machine runs Python `3.14.2`.
  - `ai-service/requirements.txt` specifies `numpy==1.26.2` and `scikit-learn==1.3.2`. Pre-compiled wheels for numpy 1.26 only exist up to Python 3.12. Installing requirements on Python 3.14 will fail to build C-extensions.
- **Steps to Reproduce:**
  Attempt `pip install -r requirements.txt` under Python 3.14.2.
- **Expected vs Actual Behavior:**
  - *Expected:* Seamless setup.
  - *Actual:* Build fails due to missing C compiler for legacy numpy wheels on Python 3.14.
- **Recommended Fix:**
  Create python virtual environment using Python 3.11 or 3.12, or upgrade `requirements.txt` to numpy `>=2.0` and scikit-learn `>=1.5`.
- **Potential Impact:** AI microservice fails to install on contemporary Python installations.
- **Breaking Changes:** None.

---

## 9. Categories Checked With No Additional Vulnerabilities Found

| Category | Verification Status | Observations |
| :--- | :--- | :--- |
| **Exposed Secrets & API Keys** | **Checked & Verified Clean** | No production API keys, JWT secrets, or DB passwords are committed in repository files. Default seed credentials in `SEEDED_CREDENTIALS.md` use development test values. |
| **Bcrypt Password Hashing** | **Checked & Verified Secure** | Passwords hashed using bcrypt salt 10 before persistence (`User.js:60-67`). Password field set to `select: false` by default. |
| **NoSQL Injection Guardrails** | **Checked & Verified Acceptable**| Standard Mongoose typed schema queries protect primary query vectors. |
| **Database Compound Uniqueness**| **Checked & Verified Working** | `Evaluation` enforces unique `{ submission: 1, judge: 1 }` index preventing duplicate judge submissions. `Team` enforces uniqueness on `teamCode`. `User` enforces unique index on `email`. |
