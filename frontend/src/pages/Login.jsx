import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import '../styles/auth.css';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      console.log('Attempting login with:', email);
      const response = await authService.login(email, password);
      console.log('Login response:', response);
      console.log('Response data:', response.data);
      
      if (!response.data.token) {
        setError('No token received from server');
        return;
      }
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
      
      // Store role-specific IDs for easy access
      if (response.data.role === 'STUDENT' && response.data.studentId) {
        localStorage.setItem('userId', response.data.studentId.toString());
      } else if ((response.data.role === 'TEACHER' || response.data.role === 'HOD') && response.data.teacherId) {
        localStorage.setItem('userId', response.data.teacherId);
      } else if (response.data.role === 'ADMIN') {
        // For admin users, use a placeholder or user email
        // This prevents null errors in components that check for userId
        localStorage.setItem('userId', `ADMIN_${response.data.email}`);
        console.log('Admin user logged in, userId set to: ADMIN_' + response.data.email);
      }
      
      console.log('User data stored in localStorage:', response.data);
      console.log('Teacher ID in response:', response.data.teacherId);
      console.log('Student ID in response:', response.data.studentId);
      console.log('User ID stored:', localStorage.getItem('userId'));
      console.log('Login successful, navigating...');
      navigate(response.data.role === 'ADMIN' ? '/admin' : 
               (response.data.role === 'TEACHER' || response.data.role === 'HOD') ? '/teacher' : '/student');
    } catch (err) {
      console.error('Login error:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Invalid email or password';
      console.error('Error message:', errorMsg);
      setError(errorMsg);
    }
  };

  return (
    <div className="auth-container">
      <button 
        className="back-btn"
        onClick={() => navigate('/')}
      >
        ← Back
      </button>
      <div className="auth-form">
        <h1>Department Management System</h1>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
        <div style={{marginTop: '30px', textAlign: 'center'}}>
          <button 
            type="button"
            className="forgot-password-link"
            onClick={() => setShowForgotPasswordModal(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#667eea',
              cursor: 'pointer',
              fontSize: '14px',
              marginBottom: '18px',
              textDecoration: 'none',
              fontWeight: '600',
              letterSpacing: '0.3px',
              transition: 'all 0.3s ease',
              padding: '9px 4px',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = '#764ba2';
              e.target.style.textDecoration = 'underline';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#667eea';
              e.target.style.textDecoration = 'none';
            }}
          >
            🔑 Forgot Password?
          </button>
          <p style={{fontSize: '13px', color: '#999', lineHeight: '1.7', letterSpacing: '0.3px'}}>
            Don't have an account? <br />
            <strong style={{color: '#666'}}>Contact your administrator for account creation</strong>
          </p>
        </div>
      </div>
      <ForgotPasswordModal 
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
      />
    </div>
  );
};

export default Login;
