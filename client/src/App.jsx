import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';


import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import CreateHackathon from './pages/dashboards/CreateHackathon';
import TeamPanel from './pages/dashboards/TeamPanel';
import OrganizerTeams from './pages/dashboards/OrganizerTeams';
import OrganizerRounds from './pages/dashboards/OrganizerRounds';
import OrganizerJudges from './pages/dashboards/OrganizerJudges';
import SubmissionPanel from './pages/dashboards/SubmissionPanel';
import SubmissionReview from './pages/dashboards/SubmissionReview';
import JudgeEvaluation from './pages/dashboards/JudgeEvaluation';
import Leaderboard from './pages/dashboards/Leaderboard';
import HackathonDetails from './pages/HackathonDetails';
import Hackathons from './pages/Hackathons';
import TeamStep from './pages/TeamStep';
import Participation from './pages/Participation';
import ParticipantProfileForm from './pages/ParticipantProfileForm';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/hackathons" element={<Hackathons />} />
            <Route path="/hackathon/:id" element={<HackathonDetails />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/create-hackathon" element={<CreateHackathon />} />
              <Route path="/dashboard/edit-hackathon/:id" element={<CreateHackathon />} />
              <Route path="/dashboard/team" element={<TeamPanel />} />
              <Route path="/dashboard/organizer/teams/:hackathonId" element={<OrganizerTeams />} />
              <Route path="/dashboard/organizer/rounds/:hackathonId" element={<OrganizerRounds />} />
              <Route path="/dashboard/organizer/judges/:hackathonId" element={<OrganizerJudges />} />
              <Route path="/dashboard/submission" element={<SubmissionPanel />} />
              <Route path="/dashboard/organizer/submissions/:hackathonId" element={<SubmissionReview />} />
              <Route path="/dashboard/judge/evaluate/:submissionId" element={<JudgeEvaluation />} />
              <Route path="/leaderboard/:hackathonId" element={<Leaderboard />} />
              <Route path="/hackathon/:id/team-step" element={<TeamStep />} />
              <Route path="/hackathon/:id/participant-form" element={<ParticipantProfileForm />} />
              <Route path="/hackathon/:id/participation" element={<Participation />} />
              <Route path="/hackathon/:id/round/:roundIndex/submit" element={<SubmissionPanel />} />
              <Route path="/hackathon/:id/round/:roundIndex/view" element={<SubmissionPanel />} />
            </Route>

          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;
