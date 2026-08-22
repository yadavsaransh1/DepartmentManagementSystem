import React, { useState, useEffect } from 'react';
import '../styles/adminDepartmentLogo.css';
import { HOME_PAGE_ENDPOINTS } from '../config/api';

const AdminDepartmentLogo = () => {
  const [homePageContent, setHomePageContent] = useState(null);
  const [logo, setLogo] = useState('');
  const [logoAltText, setLogoAltText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchHomePageContent();
  }, []);

  const fetchHomePageContent = async () => {
    try {
      const response = await fetch(HOME_PAGE_ENDPOINTS.CONTENT);
      if (response.ok) {
        const data = await response.json();
        setHomePageContent(data);
        setLogo(data.departmentLogo || '');
        setLogoAltText(data.logoAltText || '');
      }
    } catch (error) {
      console.error('Error fetching home page content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!logo) {
      setMessage('Please select a logo image');
      return;
    }

    try {
      setSaving(true);
      const updateData = {
        ...homePageContent,
        departmentLogo: logo,
        logoAltText: logoAltText
      };

      // Try PUT first, if it fails try POST
      let response = await fetch(HOME_PAGE_ENDPOINTS.CONTENT, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData)
      });

      // If PUT fails (404 or 400), try POST
      if (!response.ok && (response.status === 404 || response.status === 400)) {
        response = await fetch(HOME_PAGE_ENDPOINTS.CONTENT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(updateData)
        });
      }

      if (response.ok) {
        setMessage('Department logo updated successfully');
        fetchHomePageContent();
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setMessage(`Error updating logo: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error saving logo:', error);
      setMessage(`Error saving logo: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveLogo = () => {
    if (window.confirm('Are you sure you want to remove the logo?')) {
      setLogo('');
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading...</div>;
  }

  return (
    <div className="admin-department-logo">
      <div className="logo-section">
        <h2>🏛️ Department Logo</h2>
        <p className="description">Upload a logo to display in the top-left corner of the home page</p>

        {message && (
          <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSave} className="logo-form">
          <div className="form-group">
            <label>Logo Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoFileSelect}
              className="file-input"
            />
            <small className="hint">Recommended size: 70x70 pixels (PNG or SVG with transparent background)</small>
          </div>

          {logo && (
            <div className="logo-preview-container">
              <div className="logo-preview-box">
                <img src={logo} alt="Logo Preview" className="logo-preview" />
              </div>
              <button 
                type="button"
                className="btn-remove-logo"
                onClick={handleRemoveLogo}
              >
                ✕ Remove Logo
              </button>
            </div>
          )}

          <div className="form-group">
            <label>Alt Text (for accessibility):</label>
            <input
              type="text"
              value={logoAltText}
              onChange={(e) => setLogoAltText(e.target.value)}
              placeholder="E.g., Department Logo"
              className="form-input"
            />
            <small className="hint">Describe the logo for users with screen readers</small>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-save"
              disabled={saving}
            >
              {saving ? 'Saving...' : '💾 Save Logo'}
            </button>
          </div>
        </form>

        <div className="preview-section">
          <h3>Header Preview</h3>
          <div className="header-preview">
            {logo && (
              <img src={logo} alt={logoAltText} className="preview-logo" />
            )}
            <h1>Department Management System</h1>
            <button className="preview-login">Login</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDepartmentLogo;
