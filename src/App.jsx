import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Assets from './pages/Assets'
import Purchases from './pages/Purchases'
import Transfers from './pages/Transfers'
import Assignments from './pages/Assignments'
import Expenditures from './pages/Expenditures'
import Users from './pages/Users'
import AuditLogs from './pages/AuditLogs'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute path="/dashboard">
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assets"
          element={
            <ProtectedRoute path="/assets">
              <Assets />
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchases"
          element={
            <ProtectedRoute path="/purchases">
              <Purchases />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transfers"
          element={
            <ProtectedRoute path="/transfers">
              <Transfers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assignments"
          element={
            <ProtectedRoute path="/assignments">
              <Assignments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenditures"
          element={
            <ProtectedRoute path="/expenditures">
              <Expenditures />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute path="/users">
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="/audit-logs"
          element={
            <ProtectedRoute path="/audit-logs">
              <AuditLogs />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
