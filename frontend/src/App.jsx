import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPasswordPage from './pages/ResetPasswordPage';
import HomePage from './pages/HomePage';
import ViewAllNotices from './pages/ViewAllNotices';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import './styles/index.css';

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [user, setUser] = useState(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);
  const location = useLocation();

  // Check auth on mount and on every route change
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      setIsAuthenticated(!!token);
      setUser(userData ? JSON.parse(userData) : null);
    };

    checkAuth();
  }, [location]);

  // Also listen to storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      setIsAuthenticated(!!token);
      setUser(userData ? JSON.parse(userData) : null);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={isAuthenticated ? 
        (user?.role === 'ADMIN' ? <Navigate to="/admin" /> : 
         (user?.role === 'TEACHER' || user?.role === 'HOD') ? <Navigate to="/teacher" /> : 
         <Navigate to="/student" />) 
        : <HomePage />
      } />
      <Route path="/home" element={<HomePage />} />
      <Route path="/all-notices" element={<ViewAllNotices />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      
      {/* Protected routes */}
      <Route path="/student" element={
        isAuthenticated && user?.role === 'STUDENT' ? <StudentDashboard /> : 
        isAuthenticated ? <Navigate to="/" /> : <Navigate to="/login" />
      } />
      <Route path="/teacher" element={
        isAuthenticated && (user?.role === 'TEACHER' || user?.role === 'HOD') ? <TeacherDashboard /> :
        isAuthenticated ? <Navigate to="/" /> : <Navigate to="/login" />
      } />
      <Route path="/admin" element={
        isAuthenticated && user?.role === 'ADMIN' ? <AdminDashboard /> :
        isAuthenticated ? <Navigate to="/" /> : <Navigate to="/login" />
      } />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/'} />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
