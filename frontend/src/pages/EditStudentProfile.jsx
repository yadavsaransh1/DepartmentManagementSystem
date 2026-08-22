import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/ProfileEdit.css';

const EditStudentProfile = ({ onClose }) => {
  const [studentId, setStudentId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    studentId: '',
    enrollmentNumber: '',
    department: '',
    course: '',
    semester: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchStudentProfile();
  }, []);

  const fetchStudentProfile = async () => {
    try {
      const response = await api.get('/students/profile');
      setStudentId(response.data.id);
      setFormData({
        fullName: response.data.fullName || '',
        email: response.data.email || '',
        studentId: response.data.studentId || '',
        enrollmentNumber: response.data.enrollmentNumber || '',
        department: response.data.department || '',
        course: response.data.course || '',
        semester: response.data.semester || '',
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
      if (!studentId) {
        setError('Student ID not found');
        return;
      }
      
      await api.put(`/students/${studentId}`, {
        department: formData.department,
        course: formData.course,
        semester: formData.semester ? parseInt(formData.semester) : null,
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
        <h2>Edit Student Profile</h2>
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
              <label>Student ID (Read-only)</label>
              <input type="text" value={formData.studentId} disabled className="read-only" />
            </div>
            <div className="form-group">
              <label>Enrollment Number (Read-only)</label>
              <input type="text" value={formData.enrollmentNumber} disabled className="read-only" />
            </div>
          </div>

          <div className="form-section">
            <h3>Academic Information</h3>
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
            <div className="form-group">
              <label>Course</label>
              <input
                type="text"
                name="course"
                value={formData.course}
                onChange={handleInputChange}
                placeholder="e.g., B.Tech CSE"
              />
            </div>
            <div className="form-group">
              <label>Semester</label>
              <select name="semester" value={formData.semester} onChange={handleInputChange}>
                <option value="">Select Semester</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <option key={sem} value={sem}>{sem}</option>
                ))}
              </select>
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

export default EditStudentProfile;
