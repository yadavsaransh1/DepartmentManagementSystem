import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ChangePasswordModal from './ChangePasswordModal';
import '../styles/student.css';

export const TeacherProfile = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [isEditing, setIsEditing] = useState(false);
  const [teacher, setTeacher] = useState(null);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [teacherPowers, setTeacherPowers] = useState(null);
  const [powersLoading, setPowersLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const getCustomFieldsObject = () => {
    if (!formData?.customFields) return {};
    if (typeof formData.customFields === 'string') {
      try {
        return JSON.parse(formData.customFields);
      } catch (e) {
        console.error('Error parsing customFields:', e);
        return {};
      }
    }
    return formData.customFields;
  };

  useEffect(() => {
    fetchTeacherProfile();
    // Teacher powers are admin-only, don't fetch for regular teachers
  }, []);

  const fetchTeacherProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/teachers/profile`);
      setTeacher(response.data);
      setFormData(response.data);
    } catch (err) {
      console.error('Error fetching teacher profile:', err);
      const fallbackData = {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        teacherId: user.teacherId || 'N/A',
        employeeId: user.employeeId || 'N/A',
        department: user.department || 'N/A',
        qualification: user.qualification || 'N/A',
        specialization: user.specialization || 'N/A',
        contactNumber: user.contactNumber || 'N/A',
        officeLocation: user.officeLocation || 'N/A'
      };
      setTeacher(fallbackData);
      setFormData(fallbackData);
      setError('Using cached profile data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherPowers = async () => {
    try {
      setPowersLoading(true);
      if (!user.email) {
        setTeacherPowers(null);
        return;
      }
      
      const response = await api.get(`/admin-power/teacher-powers?email=${user.email}`);
      if (response.data) {
        setTeacherPowers(response.data);
      }
    } catch (err) {
      // Silently ignore - teacher powers is optional and requires admin authorization
      setTeacherPowers(null);
    } finally {
      setPowersLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setError('');
      setMessage('');
      const response = await api.put(`/teachers/${teacher.id}`, formData);
      setTeacher(response.data);
      setIsEditing(false);
      setMessage('✓ Profile updated successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCancel = () => {
    setFormData(teacher);
    setIsEditing(false);
  };

  return (
    <div className="student-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>My Profile</h1>
        <button
          onClick={() => setShowPasswordModal(true)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          🔒 Change Password
        </button>
      </div>
      <ChangePasswordModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} />
      
      {error && <div className="error" style={{padding: '12px', marginBottom: '12px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px'}}>{error}</div>}
      {message && <div className="success" style={{padding: '12px', marginBottom: '12px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px'}}>{message}</div>}

      {loading ? (
        <p>Loading profile...</p>
      ) : (
        <div>
          {/* Basic Information */}
          <div className="profile-card" style={{backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ddd'}}>
            <h2>📋 Basic Information</h2>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
            <div className="form-group" style={{marginBottom: '15px'}}>
              <label>Full Name:</label>
              {isEditing ? (
                <input
                  type="text"
                  name="fullName"
                  value={formData?.fullName || ''}
                  onChange={handleInputChange}
                  style={{width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd'}}
                />
              ) : (
                <p style={{padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #ddd'}}>{teacher?.fullName || 'N/A'}</p>
              )}
            </div>

            <div className="form-group" style={{marginBottom: '15px'}}>
              <label>Email:</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData?.email || ''}
                  onChange={handleInputChange}
                  style={{width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd'}}
                />
              ) : (
                <p style={{padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #ddd'}}>{teacher?.email || 'N/A'}</p>
              )}
            </div>

            <div className="form-group" style={{marginBottom: '15px'}}>
              <label>Teacher ID:</label>
              {isEditing ? (
                <input
                  type="text"
                  name="teacherId"
                  value={formData?.teacherId || ''}
                  onChange={handleInputChange}
                  style={{width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd'}}
                />
              ) : (
                <p style={{padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #ddd'}}>{teacher?.teacherId || 'N/A'}</p>
              )}
            </div>

            <div className="form-group" style={{marginBottom: '15px'}}>
              <label>Employee ID:</label>
              {isEditing ? (
                <input
                  type="text"
                  name="employeeId"
                  value={formData?.employeeId || ''}
                  onChange={handleInputChange}
                  style={{width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd'}}
                />
              ) : (
                <p style={{padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #ddd'}}>{teacher?.employeeId || 'N/A'}</p>
              )}
            </div>

            <div className="form-group" style={{marginBottom: '15px'}}>
              <label>Contact Number:</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData?.contactNumber || ''}
                  onChange={handleInputChange}
                  style={{width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd'}}
                />
              ) : (
                <p style={{padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #ddd'}}>{teacher?.contactNumber || 'N/A'}</p>
              )}
            </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="profile-card" style={{backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ddd'}}>
            <h2>👤 Personal Information</h2>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
              <div className="form-group" style={{marginBottom: '15px'}}>
                <label>Gender:</label>
                {isEditing ? (
                  <select
                    name="gender"
                    value={formData?.gender || ''}
                    onChange={handleInputChange}
                    style={{width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd'}}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p style={{padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #ddd'}}>{teacher?.gender || 'N/A'}</p>
                )}
              </div>

              <div className="form-group" style={{marginBottom: '15px'}}>
                <label>Category:</label>
                {isEditing ? (
                  <select
                    name="category"
                    value={formData?.category || (() => {
                      const customFields = getCustomFieldsObject();
                      return customFields?.category || '';
                    })()}
                    onChange={(e) => {
                      const value = e.target.value;
                      const customFields = getCustomFieldsObject();
                      setFormData(prev => ({
                        ...prev,
                        category: value,
                        customFields: {
                          ...customFields,
                          category: value
                        }
                      }));
                    }}
                    style={{width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd'}}
                  >
                    <option value="">Select Category</option>
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                  </select>
                ) : (
                  <p style={{padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #ddd'}}>
                    {teacher?.category || (() => {
                      const customFields = getCustomFieldsObject();
                      return customFields?.category || 'N/A';
                    })()}
                  </p>
                )}
              </div>

              <div className="form-group" style={{marginBottom: '15px'}}>
                <label>Religion:</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="religion"
                    value={formData?.religion || (() => {
                      const customFields = getCustomFieldsObject();
                      return customFields?.religion || '';
                    })()}
                    onChange={(e) => {
                      const value = e.target.value;
                      const customFields = getCustomFieldsObject();
                      setFormData(prev => ({
                        ...prev,
                        religion: value,
                        customFields: {
                          ...customFields,
                          religion: value
                        }
                      }));
                    }}
                    style={{width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd'}}
                  />
                ) : (
                  <p style={{padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #ddd'}}>
                    {teacher?.religion || (() => {
                      const customFields = getCustomFieldsObject();
                      return customFields?.religion || 'N/A';
                    })()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="profile-card" style={{backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ddd'}}>
            <h2>🎓 Professional Information</h2>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
              <div className="form-group" style={{marginBottom: '15px'}}>
                <label>Department:</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="department"
                    value={formData?.department || ''}
                    onChange={handleInputChange}
                    style={{width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd'}}
                  />
                ) : (
                  <p style={{padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #ddd'}}>{teacher?.department || 'N/A'}</p>
                )}
              </div>

              <div className="form-group" style={{marginBottom: '15px'}}>
                <label>Qualification:</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="qualification"
                    value={formData?.qualification || ''}
                    onChange={handleInputChange}
                    placeholder="e.g., PhD, M.Tech, B.Tech"
                    style={{width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd'}}
                  />
                ) : (
                  <p style={{padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #ddd'}}>{teacher?.qualification || 'N/A'}</p>
                )}
              </div>

              <div className="form-group" style={{marginBottom: '15px'}}>
                <label>Specialization:</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="specialization"
                    value={formData?.specialization || ''}
                    onChange={handleInputChange}
                    placeholder="e.g., Data Science, AI, Database"
                    style={{width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd'}}
                  />
                ) : (
                  <p style={{padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #ddd'}}>{teacher?.specialization || 'N/A'}</p>
                )}
              </div>

              <div className="form-group" style={{marginBottom: '15px'}}>
                <label>Office Location:</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="officeLocation"
                    value={formData?.officeLocation || ''}
                    onChange={handleInputChange}
                    placeholder="e.g., Block A, Room 101"
                    style={{width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd'}}
                  />
                ) : (
                  <p style={{padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #ddd'}}>{teacher?.officeLocation || 'N/A'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Custom Fields Section */}
          {(() => {
            const customFieldsObj = getCustomFieldsObject();
            // List of fields already displayed in other sections
            const displayedFields = ['fullName', 'email', 'teacherId', 'employeeId', 'contactNumber', 'department', 'qualification', 'specialization', 'officeLocation', 'gender', 'category', 'religion', 'id', 'userId', 'customFields'];
            
            // Filter out fields that are already displayed
            const uniqueCustomFields = Object.entries(customFieldsObj)
              .filter(([key]) => !displayedFields.includes(key))
              .reduce((acc, [key, value]) => {
                acc[key] = value;
                return acc;
              }, {});
            
            const hasCustomFields = Object.keys(uniqueCustomFields).length > 0;
            
            return hasCustomFields && (
              <div className="profile-card" style={{backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ddd'}}>
                <h2>⚙️ Additional Information</h2>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                  {Object.entries(uniqueCustomFields).map(([key, value]) => (
                    <div key={key} className="form-group" style={{marginBottom: '15px'}}>
                      <label>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}:</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={value || ''}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              customFields: {
                                ...customFieldsObj,
                                [key]: e.target.value
                              }
                            }));
                          }}
                          style={{width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd'}}
                        />
                      ) : (
                        <p style={{padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #ddd'}}>{value || 'N/A'}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}



          <div style={{display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '30px'}}>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                style={{padding: '12px 24px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', transition: 'all 0.3s'}}
                onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
              >
                ✏️ Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleSaveProfile}
                  style={{padding: '12px 24px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', transition: 'all 0.3s'}}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
                >
                  ✅ Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  style={{padding: '12px 24px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', transition: 'all 0.3s'}}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#5a6268'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
                >
                  ❌ Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherProfile;
