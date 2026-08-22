import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ChangePasswordModal from './ChangePasswordModal';
import '../styles/student.css';

export const StudentProfile = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [isEditing, setIsEditing] = useState(false);
  const [student, setStudent] = useState(null);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([1, 2, 3, 4, 5, 6, 7, 8]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    fetchStudentProfile();
    fetchAvailableCourses();
  }, []);

  const fetchStudentProfile = async () => {
    try {
      setLoading(true);
      setError('');
      // Use the /profile endpoint which authenticates via JWT token to get the correct student
      const response = await api.get(`/students/profile`);
      
      // The attendance percentage is now calculated in the backend
      console.log('Student profile loaded:', response.data);
      
      setStudent(response.data);
      setFormData(response.data);
    } catch (err) {
      console.error('Error fetching student profile:', err);
      const fallbackData = {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        studentId: user.studentId || 'N/A',
        enrollmentNumber: user.enrollmentNumber || 'N/A',
        department: user.department || 'N/A',
        course: user.course || user.program || 'N/A',
        program: user.program || user.course || 'N/A',
        semester: user.semester || 'N/A',
        attendancePercentage: 0
      };
      setStudent(fallbackData);
      setFormData(fallbackData);
      setError('Using cached profile data');
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallAttendancePercentage = (studentData) => {
    // If student data includes enrollments with attendance info, calculate from there
    if (studentData.enrollments && Array.isArray(studentData.enrollments)) {
      const percentages = studentData.enrollments
        .filter(e => e.attendancePercentage !== undefined && e.attendancePercentage !== null)
        .map(e => parseFloat(e.attendancePercentage) || 0);
      
      if (percentages.length > 0) {
        return (percentages.reduce((a, b) => a + b, 0) / percentages.length).toFixed(2);
      }
    }
    return 0;
  };

  const fetchAvailableCourses = async () => {
    try {
      const response = await api.get('/subjects/user/courses-semesters');
      const result = response.data || {};
      const coursesList = Array.isArray(result.courses) ? result.courses : [];
      const semestersList = Array.isArray(result.semesters) ? result.semesters : [];
      
      if (coursesList.length > 0) {
        setCourses(coursesList);
      } else {
        setCourses(['B.Tech', 'B.Sc', 'M.Tech', 'M.Sc', 'BBA']);
      }
      
      if (semestersList.length > 0) {
        setSemesters(semestersList.sort((a, b) => a - b));
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      // Use default values on error
      setCourses(['B.Tech', 'B.Sc', 'M.Tech', 'M.Sc', 'BBA']);
      setSemesters([1, 2, 3, 4, 5, 6, 7, 8]);
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
      // Use the student ID from the fetched student data, not the user ID
      const response = await api.put(`/students/${student.id}`, formData);
      setStudent(response.data);
      setIsEditing(false);
      setMessage('✓ Profile updated successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile: ' + (err.response?.data?.message || err.message));
    }
  };

  const getCustomFieldsObject = () => {
    if (!formData?.customFields) return {};
    
    // If it's a string, try to parse it
    if (typeof formData.customFields === 'string') {
      try {
        return JSON.parse(formData.customFields);
      } catch (e) {
        console.error('Error parsing customFields:', e);
        return {};
      }
    }
    
    // If it's already an object, return it
    return formData.customFields;
  };

  const handleCancel = () => {
    setFormData(student);
    setIsEditing(false);
  };

  return (
    <div className="student-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>My Profile</h1>
        <button
          onClick={() => setShowPasswordModal(true)}
          style={{
            padding: '10px 15px',
            backgroundColor: '#ff6506',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
           Change Password
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
                  <p style={{padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #ddd'}}>{student?.fullName || 'N/A'}</p>
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
                  <p style={{padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #ddd'}}>{student?.email || 'N/A'}</p>
                )}
              </div>

              <div className="form-group" style={{marginBottom: '15px'}}>
                <label>Student ID:</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="studentId"
                    value={formData?.studentId || ''}
                    onChange={handleInputChange}
                    style={{width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd'}}
                  />
                ) : (
                  <p style={{padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #ddd'}}>{student?.studentId || 'N/A'}</p>
                )}
              </div>

              <div className="form-group" style={{marginBottom: '15px'}}>
                <label>Enrollment Number:</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="enrollmentNumber"
                    value={formData?.enrollmentNumber || ''}
                    onChange={handleInputChange}
                    style={{width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd'}}
                  />
                ) : (
                  <p style={{padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #ddd'}}>{student?.enrollmentNumber || 'N/A'}</p>
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
                  <p style={{padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #ddd'}}>{student?.gender || 'N/A'}</p>
                )}
              </div>

              <div className="form-group" style={{marginBottom: '15px'}}>
                <label>Phone Number:</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData?.phoneNumber || ''}
                    onChange={handleInputChange}
                    style={{width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd'}}
                  />
                ) : (
                  <p style={{padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #ddd'}}>{student?.phoneNumber || 'N/A'}</p>
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
                    {student?.category || (() => {
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
                    {student?.religion || (() => {
                      const customFields = getCustomFieldsObject();
                      return customFields?.religion || 'N/A';
                    })()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="profile-card" style={{backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ddd'}}>
            <h2>🏠 Address Information</h2>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
              <div className="form-group" style={{marginBottom: '15px', gridColumn: '1 / -1'}}>
                <label>Address:</label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={formData?.address || ''}
                    onChange={handleInputChange}
                    style={{width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', minHeight: '80px', fontFamily: 'Arial'}}
                  />
                ) : (
                  <p style={{padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #ddd'}}>{student?.address || 'N/A'}</p>
                )}
              </div>

              <div className="form-group" style={{marginBottom: '15px'}}>
                <label>District:</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="district"
                    value={formData?.district || ''}
                    onChange={handleInputChange}
                    style={{width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd'}}
                  />
                ) : (
                  <p style={{padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #ddd'}}>{student?.district || 'N/A'}</p>
                )}
              </div>

              <div className="form-group" style={{marginBottom: '15px'}}>
                <label>State:</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="state"
                    value={formData?.state || ''}
                    onChange={handleInputChange}
                    style={{width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd'}}
                  />
                ) : (
                  <p style={{padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #ddd'}}>{student?.state || 'N/A'}</p>
                )}
              </div>

              <div className="form-group" style={{marginBottom: '15px'}}>
                <label>Pincode:</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="pincode"
                    value={formData?.pincode || (formData?.customFields?.pincode) || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        pincode: value,
                        customFields: {
                          ...(prev?.customFields || {}),
                          pincode: value
                        }
                      }));
                    }}
                    style={{width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd'}}
                  />
                ) : (
                  <p style={{padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #ddd'}}>{student?.pincode || student?.customFields?.pincode || 'N/A'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="profile-card" style={{backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ddd'}}>
            <h2>🎓 Academic Information</h2>
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
                  <p style={{padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #ddd'}}>{student?.department || 'N/A'}</p>
                )}
              </div>

              <div className="form-group" style={{marginBottom: '15px'}}>
                <label>Program:</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="program"
                    value={formData?.program || ''}
                    onChange={handleInputChange}
                    style={{width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd'}}
                  />
                ) : (
                  <p style={{padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #ddd'}}>{student?.program || 'N/A'}</p>
                )}
              </div>

              <div className="form-group" style={{marginBottom: '15px'}}>
                <label>Course:</label>
                {isEditing ? (
                  <select
                    name="course"
                    value={formData?.course || ''}
                    onChange={handleInputChange}
                    style={{width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd'}}
                  >
                    <option value="">Select Course</option>
                    {courses.map((course) => (
                      <option key={course} value={course}>{course}</option>
                    ))}
                  </select>
                ) : (
                  <p style={{padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #ddd'}}>{student?.course || 'N/A'}</p>
                )}
              </div>

              <div className="form-group" style={{marginBottom: '15px'}}>
                <label>Semester:</label>
                {isEditing ? (
                  <select
                    name="semester"
                    value={formData?.semester || ''}
                    onChange={handleInputChange}
                    style={{width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd'}}
                  >
                    <option value="">Select Semester</option>
                    {semesters.map((sem) => (
                      <option key={sem} value={sem}>{sem}</option>
                    ))}
                  </select>
                ) : (
                  <p style={{padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #ddd'}}>{student?.semester || 'N/A'}</p>
                )}
              </div>

            </div>
          </div>

          {/* Custom Fields Section */}
          {(() => {
            const customFieldsObj = getCustomFieldsObject();
            // List of fields already displayed in other sections
            const displayedFields = ['fullName', 'email', 'studentId', 'enrollmentNumber', 'gender', 'phoneNumber', 'address', 'district', 'state', 'pincode', 'department', 'program', 'course', 'semester', 'attendancePercentage', 'category', 'religion', 'id', 'userId', 'customFields'];
            
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
      )}    </div>
  );
};

export default StudentProfile;