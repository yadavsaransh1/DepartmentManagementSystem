import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/ProfileEdit.css';

const EditTeacherProfile = ({ onClose }) => {
  const [teacherId, setTeacherId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    department: '',
    subject: '',
    specialization: '',
    dateOfBirth: '',
    contactNumber: '',
    qualification: '',
    certification: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchTeacherProfile();
  }, []);

  const fetchTeacherProfile = async () => {
    try {
      const response = await api.get('/teachers/profile');
      setTeacherId(response.data.id);
      setFormData({
        fullName: response.data.fullName || '',
        email: response.data.email || '',
        department: response.data.department || '',
        subject: response.data.subject || '',
        specialization: response.data.specialization || '',
        dateOfBirth: response.data.dateOfBirth || '',
        contactNumber: response.data.contactNumber || '',
        qualification: response.data.qualification || '',
        certification: response.data.certification || '',
      });
      setLoading(false);
    } catch (err) {
      setError('Failed to load profile');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (!teacherId) {
        setError('Teacher ID not found');
        return;
      }
      
      await api.put(`/teachers/${teacherId}`, {
        department: formData.department,
        subject: formData.subject,
        specialization: formData.specialization,
        dateOfBirth: formData.dateOfBirth,
        contactNumber: formData.contactNumber,
        qualification: formData.qualification,
        certification: formData.certification,
      });
      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  if (loading) {
    return <div className="profile-edit-container"><p>Loading...</p></div>;
  }

  return (
    <div className="profile-edit-overlay">
      <div className="profile-edit-modal">
        <h2>Edit Teacher Profile</h2>
        <form onSubmit={handleSubmit} className="profile-edit-form">
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-group">
              <label>Full Name (Read-only)</label>
              <input type="text" value={formData.fullName} disabled className="read-only" />
            </div>
            <div className="form-group">
              <label>Email (Read-only)</label>
              <input type="email" value={formData.email} disabled className="read-only" />
            </div>
            <div className="form-group">
              <label>Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                placeholder="e.g., Computer Science"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Academic Information</h3>
            <div className="form-group">
              <label>Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="Primary subject"
              />
            </div>
            <div className="form-group">
              <label>Specialization</label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleInputChange}
                placeholder="e.g., Networks, Databases"
              />
            </div>
            <div className="form-group">
              <label>Qualification</label>
              <input
                type="text"
                name="qualification"
                value={formData.qualification}
                onChange={handleInputChange}
                placeholder="e.g., M.Tech, Ph.D"
              />
            </div>
            <div className="form-group">
              <label>Certification</label>
              <input
                type="text"
                name="certification"
                value={formData.certification}
                onChange={handleInputChange}
                placeholder="e.g., Oracle Certified, AWS"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Personal Information</h3>
            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Contact Number</label>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-actions">
            <button type="submit" className="btn-save">Save Changes</button>
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTeacherProfile;
