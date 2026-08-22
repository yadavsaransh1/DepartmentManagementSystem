import React, { useState } from 'react';
import axios from 'axios';
import { apiPost, API_BASE_URL } from '../utils/apiClient';
import './ForgotPasswordModal.css';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setMessage('Please enter your email address');
      setMessageType('error');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        'http://:8080/api/auth/forgot-password',
        { email },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      setMessageType('success');
      setMessage('If the email exists, a password reset link has been sent. Please check your inbox.');
      setEmail('');
      
      // Close modal after 3 seconds
      setTimeout(() => {
        onClose();
        setMessage('');
      }, 3000);
    } catch (error) {
      setMessageType('error');
      setMessage(error.response?.data?.message || 'Error sending reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="forgot-password-modal-overlay">
      <div className="forgot-password-modal">
        <div className="modal-header">
          <h2>Forgot Password</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email"
              disabled={loading}
              required
            />
          </div>

          {message && (
            <div className={`message ${messageType}`}>
              {message}
            </div>
          )}

          <div className="form-actions">
            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;

