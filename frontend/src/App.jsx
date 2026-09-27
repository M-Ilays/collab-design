import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Home from "./pages/Home.jsx";
import Project from "./pages/Project.jsx";
import NewRequirement from "./pages/NewRequirement.jsx";
import ProtectedRoute from "./contexts/ProtectedRoute.jsx";
import ResetPassword from "./pages/Auth/ResetPassword.jsx";
import VerifyEmail from "./pages/Auth/VerifyEmail.jsx";
import DiscussionForum from "./pages/DiscussionForum.jsx";
import ThreadDetails from "./pages/ThreadDetails.jsx";
import DiagramCanvas from "./pages/DiagramCanvas.jsx";
import Settings from "./pages/Settings.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/project/:id"
          element={
            <ProtectedRoute>
              <Project />
            </ProtectedRoute>
          }
        />
        <Route
          path="/project/:id/NewReq"
          element={
            <ProtectedRoute>
              <NewRequirement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/project/:id/EditReq/:reqId"
          element={
            <ProtectedRoute>
              <NewRequirement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/project/:id/Canvas/:diagramId"
          element={
            <ProtectedRoute>
              <DiagramCanvas />
            </ProtectedRoute>
          }
        />

        <Route
          path="/project/:id/Canvas/:diagramId/:versionId"
          element={
            <ProtectedRoute>
              <DiagramCanvas />
            </ProtectedRoute>
          }
        />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forum" element={<DiscussionForum />} />
        <Route path="/thread/:threadId" element={<ThreadDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
