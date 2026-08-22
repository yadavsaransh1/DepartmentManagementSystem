import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import ChangePasswordModal from './ChangePasswordModal';
import '../styles/dashboard.css';

const AdminPasswordReset = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showAdminEditModal, setShowAdminEditModal] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const selectedUserFormRef = useRef(null);

  // Load current admin info
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.fullName) setAdminName(user.fullName);
    if (user.email) setAdminEmail(user.email);
  }, []);

  // Monitor selectedUser changes
  useEffect(() => {
    console.log('selectedUser state changed to:', selectedUser);
    if (selectedUser && selectedUserFormRef.current) {
      // Scroll to the password reset form
      setTimeout(() => {
        selectedUserFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [selectedUser]);

  // Fetch all users for search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setUsers([]);
      return;
    }

    const searchUsers = async () => {
      try {
        setSearchLoading(true);
        const response = await api.get(`/users/search?query=${encodeURIComponent(searchQuery)}`);
        setUsers(response.data || []);
      } catch (error) {
        console.error('Error searching users:', error);
        setMessage({ text: 'Error searching users', type: 'error' });
      } finally {
        setSearchLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSelectUser = (user) => {
    console.log('handleSelectUser called with:', user);
    setSelectedUser(user);
    setUsers([]);
    setSearchQuery('');
    setNewPassword('');
    setConfirmPassword('');
    setMessage({ text: '', type: '' });
    console.log('State after setting selectedUser:', user);
  };

  const handleUpdateAdminProfile = async () => {
    if (!adminName || !adminEmail) {
      setMessage({ text: 'Name and email are required', type: 'error' });
      return;
    }

    try {
      setAdminLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await api.put(`/users/update-profile/${user.email}`, {
        fullName: adminName,
        email: adminEmail
      });

      // Update local storage
      user.fullName = adminName;
      user.email = adminEmail;
      localStorage.setItem('user', JSON.stringify(user));

      setMessage({ text: 'Profile updated successfully! Please refresh the page.', type: 'success' });
      setShowAdminEditModal(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({
        text: error.response?.data?.message || 'Error updating profile',
        type: 'error'
      });
    } finally {
      setAdminLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser) {
      setMessage({ text: 'Please select a user', type: 'error' });
      return;
    }

    if (!newPassword || !confirmPassword) {
      setMessage({ text: 'Please enter both passwords', type: 'error' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ text: 'Password must be at least 6 characters', type: 'error' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Passwords do not match', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/auth/admin/reset-user-password', {
        userEmail: selectedUser.email,
        newPassword: newPassword
      });

      setMessage({ text: 'Password reset successfully!', type: 'success' });
      setSelectedUser(null);
      setNewPassword('');
      setConfirmPassword('');
      setShowConfirmDialog(false);

      // Clear message after 3 seconds
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      console.error('Error resetting password:', error);
      setMessage({
        text: error.response?.data?.message || 'Error resetting password',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="management-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>🔐 User Password Reset</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowPasswordModal(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#1976d2'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#2196f3'}
          >
            🔒 Change My Password
          </button>
          <button
            onClick={() => setShowAdminEditModal(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ff9800',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f57c00'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#ff9800'}
          >
            ✏️ Edit Admin Profile
          </button>
        </div>
      </div>
      <ChangePasswordModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} />
      
      {message.text && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '20px',
          borderRadius: '4px',
          backgroundColor: message.type === 'error' ? '#fee' : '#efe',
          color: message.type === 'error' ? '#c00' : '#060',
          border: `1px solid ${message.type === 'error' ? '#fcc' : '#cfc'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>{message.type === 'error' ? '❌' : '✅'}</span>
          <span>{message.text}</span>
        </div>
      )}

      <div className="form-box" style={{ position: 'relative' }}>
        <h3>Search for User</h3>
        <p style={{ color: '#666', fontSize: '14px' }}>Enter user's name or email to find them</p>
        
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            marginBottom: '10px',
            boxSizing: 'border-box'
          }}
        />
        
        {searchLoading && (
          <div style={{ padding: '10px', color: '#999', fontSize: '14px' }}>
            Searching...
          </div>
        )}

        {users.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '120px',
            left: '20px',
            right: '20px',
            backgroundColor: 'white',
            border: '1px solid #2196f3',
            maxHeight: '300px',
            overflowY: 'auto',
            zIndex: 1000,
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            {users.map((user) => (
              <div
                key={user.id}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('User clicked:', user);
                  handleSelectUser(user);
                }}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #eee',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  backgroundColor: 'white'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e3f2fd'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                <div style={{ fontWeight: '600', color: '#333' }}>
                  {user.fullName || 'Unknown'}
                </div>
                <div style={{ fontSize: '12px', color: '#999' }}>
                  {user.email} • {user.role}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedUser && (() => {
        console.log('Rendering selectedUser form for:', selectedUser.fullName);
        return (
          <div ref={selectedUserFormRef} className="form-box" style={{ 
            backgroundColor: '#fff8f0', 
            borderLeftColor: '#2196f3',
            borderLeft: '6px solid #f44336',
            marginTop: '30px',
            border: '3px solid #2196f3'
          }}>
            <h3 style={{ color: '#d32f2f' }}>👤 ✅ Selected User - Password Reset Form</h3>
          <div style={{
            padding: '15px',
            backgroundColor: 'white',
            borderRadius: '4px',
            marginBottom: '20px',
            border: '2px solid #2196f3'
          }}>
            <div style={{ marginBottom: '10px' }}>
              <strong style={{ color: '#333' }}>Name:</strong> 
              <span style={{ marginLeft: '10px', color: '#1976d2', fontWeight: '600' }}>{selectedUser.fullName}</span>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong style={{ color: '#333' }}>Email:</strong> 
              <span style={{ marginLeft: '10px', color: '#1976d2', fontWeight: '600' }}>{selectedUser.email}</span>
            </div>
            <div>
              <strong style={{ color: '#333' }}>Role:</strong> 
              <span style={{
                display: 'inline-block',
                marginLeft: '10px',
                backgroundColor: '#2196f3',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {selectedUser.role}
              </span>
            </div>
          </div>

          <div style={{
            padding: '15px',
            backgroundColor: '#fff3cd',
            borderLeft: '4px solid #ff9800',
            borderRadius: '4px',
            marginBottom: '20px'
          }}>
            <strong style={{ color: '#ff6f00' }}>⚠️ Password Reset Instructions:</strong>
            <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#333' }}>
              Enter a new password below. The user will be required to use this password on their next login.
            </p>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#333'
            }}>
              New Password
            </label>
            <input
              type="password"
              placeholder="Enter new password (min 6 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
            <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
              Password must be at least 6 characters long
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#333'
            }}>
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '15px', marginTop: '25px' }}>
            <button
              onClick={() => setShowConfirmDialog(true)}
              disabled={loading || !newPassword || !confirmPassword}
              style={{
                flex: 1,
                padding: '14px 20px',
                backgroundColor: loading || !newPassword || !confirmPassword ? '#90caf9' : '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: loading || !newPassword || !confirmPassword ? 'not-allowed' : 'pointer',
                fontWeight: '700',
                fontSize: '16px',
                opacity: loading || !newPassword || !confirmPassword ? 0.6 : 1,
                transition: 'all 0.3s',
                boxShadow: loading || !newPassword || !confirmPassword ? 'none' : '0 2px 8px rgba(25, 118, 210, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!loading && newPassword && confirmPassword) {
                  e.target.style.backgroundColor = '#1565c0';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(25, 118, 210, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#1976d2';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 8px rgba(25, 118, 210, 0.3)';
              }}
            >
              {loading ? '⏳ Resetting...' : '🔄 Reset Password'}
            </button>
            <button
              onClick={() => {
                setSelectedUser(null);
                setNewPassword('');
                setConfirmPassword('');
                setMessage({ text: '', type: '' });
              }}
              style={{
                flex: 1,
                padding: '14px 20px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '16px',
                transition: 'all 0.3s',
                boxShadow: '0 2px 8px rgba(244, 67, 54, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#d32f2f';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(244, 67, 54, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#f44336';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 8px rgba(244, 67, 54, 0.2)';
              }}
            >
              🗑️ Clear Selection
            </button>
          </div>
        </div>
        );
      })()}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{ marginTop: 0, color: '#333' }}>⚠️ Confirm Password Reset</h3>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Are you sure you want to reset the password for <strong>{selectedUser?.fullName}</strong>?
            </p>
            <p style={{ color: '#f44336', fontSize: '12px', marginBottom: '20px' }}>
              ⚠️ This action cannot be undone. The user will need to use the new password to login.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleResetPassword}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#2196f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                {loading ? '⏳ Resetting...' : '✅ Confirm Reset'}
              </button>
              <button
                onClick={() => setShowConfirmDialog(false)}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div style={{
        marginTop: '30px',
        padding: '20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '4px',
        border: '1px solid #eee'
      }}>
        <h4 style={{ marginTop: 0, color: '#333' }}>ℹ️ How to Use</h4>
        <ul style={{ color: '#666', fontSize: '14px', margin: '10px 0' }}>
          <li>Type the user's name or email in the search box</li>
          <li>Click on a user from the search results to select them</li>
          <li>Enter a new password (minimum 6 characters)</li>
          <li>Confirm the password and click "Reset Password"</li>
          <li>The user will use the new password for their next login</li>
        </ul>
      </div>

      {/* Admin Profile Edit Modal */}
      {showAdminEditModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            maxWidth: '450px',
            width: '90%'
          }}>
            <h3 style={{ marginTop: 0, color: '#333' }}>✏️ Edit Admin Profile</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#333'
              }}>
                Full Name
              </label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#333'
              }}>
                Email Address
              </label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleUpdateAdminProfile}
                disabled={adminLoading}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  opacity: adminLoading ? 0.6 : 1
                }}
              >
                {adminLoading ? '⏳ Saving...' : '✅ Save Changes'}
              </button>
              <button
                onClick={() => setShowAdminEditModal(false)}
                disabled={adminLoading}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPasswordReset;
