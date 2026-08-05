import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from "react-router";
import { AuthContextProvider } from '../context/AuthContextProvider.tsx';
import AppLayout from './AppLayout.tsx';
import LoginPage from './auth/LoginPage.tsx';
import BoreholePage from './BoreholePage.tsx';
import './index.css';
import ProjectListPage from './ProjectListPage.tsx';
import ProjectPage from './ProjectPage.tsx';
import { ProtectedRoute } from './ProtectedRoute.tsx';
import SettingsPage from './SettingsPage.tsx';

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthContextProvider>
        <Routes>
          <Route index path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/projects" element={<ProjectListPage />} />
              <Route path="/projects/:projectCode" element={<ProjectPage />} />
              <Route path="/projects/:projectCode/boreholes/:boreholeName" element={<BoreholePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>
        </Routes>
      </AuthContextProvider>
    </BrowserRouter>
  </StrictMode>
)
