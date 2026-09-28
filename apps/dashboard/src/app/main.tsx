import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { AuthContextProvider } from '../context/auth.tsx';
import { canViewMembers } from '../data/memberRoles.ts';
import AppLayout from './AppLayout.tsx';
import LoginPage from './auth/LoginPage.tsx';
import BoreholePage from './BoreholePage.tsx';
import './index.css';
import MembersPage from './MembersPage.tsx';
import ProjectListPage from './ProjectListPage.tsx';
import ProjectPage from './ProjectPage.tsx';
import { ProtectedRoute } from './ProtectedRoute.tsx';
import { RequireRole } from './RequireRole.tsx';
import SettingsPage from './SettingsPage.tsx';

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthContextProvider>
        <Routes>
          {/*
            An invite link and a magic link both land on the Site URL root, which had
            no route and no catch-all: react-router rendered nothing while
            `detectSessionInUrl` quietly established the session behind a blank page.
            ProtectedRoute bounces to /login when there is no session, so sending both
            here is right whether or not the visitor is signed in.
          */}
          <Route path="/" element={<Navigate to="/projects" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/projects" element={<ProjectListPage />} />
              <Route path="/projects/:projectCode" element={<ProjectPage />} />
              <Route path="/projects/:projectCode/boreholes/:boreholeName" element={<BoreholePage />} />
              <Route element={<RequireRole allow={canViewMembers} />}>
                <Route path="/members" element={<MembersPage />} />
              </Route>
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/projects" replace />} />
        </Routes>
      </AuthContextProvider>
    </BrowserRouter>
  </StrictMode>
)
