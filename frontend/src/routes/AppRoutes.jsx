import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { MainLayout } from '../layouts/MainLayout';

// Pages
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { Users } from '../pages/Users';
import { UserMonitoring } from '../pages/UserMonitoring';
import { ActivityLog } from '../pages/ActivityLog';
import { LoginHistory } from '../pages/LoginHistory';
import { Cases } from '../pages/Cases';
import { CreateCase } from '../pages/CreateCase';
import { CaseDetails } from '../pages/CaseDetails';
import { EditCase } from '../pages/EditCase';
import { Reports } from '../pages/Reports';
import { Settings } from '../pages/Settings';
import { NotFound } from '../pages/NotFound';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes inside MainLayout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        {/* Core Dashboard */}
        <Route path="dashboard" element={<Dashboard />} />

        {/* Funeral Case Management */}
        <Route path="cases" element={<Cases />} />
        <Route path="cases/new" element={<CreateCase />} />
        <Route path="cases/:id" element={<CaseDetails />} />
        <Route
          path="cases/:id/edit"
          element={
            <ProtectedRoute allowedRoles={['MASTER_ADMIN', 'ADMIN']}>
              <EditCase />
            </ProtectedRoute>
          }
        />

        {/* Master Admin Only Routes (Governance, Surveillance & Auditing) */}
        <Route
          path="users"
          element={
            <ProtectedRoute allowedRoles={['MASTER_ADMIN']}>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="monitoring"
          element={
            <ProtectedRoute allowedRoles={['MASTER_ADMIN']}>
              <UserMonitoring />
            </ProtectedRoute>
          }
        />
        <Route
          path="activity-log"
          element={
            <ProtectedRoute allowedRoles={['MASTER_ADMIN']}>
              <ActivityLog />
            </ProtectedRoute>
          }
        />
        <Route
          path="login-history"
          element={
            <ProtectedRoute allowedRoles={['MASTER_ADMIN']}>
              <LoginHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="reports"
          element={
            <ProtectedRoute allowedRoles={['MASTER_ADMIN', 'ADMIN']}>
              <Reports />
            </ProtectedRoute>
          }
        />

        {/* System Settings */}
        <Route path="settings" element={<Settings />} />

        {/* Catch-all 404 inside layout */}
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Global Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
