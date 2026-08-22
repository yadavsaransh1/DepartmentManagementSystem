import React, { useState, useEffect } from 'react';
import api from '../services/api';

export const TeacherManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDesignation, setFilterDesignation] = useState('');
  const [designations, setDesignations] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: 'admin123456',
    teacherId: '',
    contactNumber: '',
    department: '',
    designation: '',
    specialization: '',
    role: 'TEACHER',
    customFields: {}
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingCustomFields, setEditingCustomFields] = useState(false);

  // Fetch teachers on mount
  useEffect(() => {
    fetchTeachers();
  }, []);

  // Extract unique designations from teachers
  useEffect(() => {
    const uniqueDesignations = [...new Set(teachers
      .map(t => t.designation)
      .filter(d => d && d.trim() !== '')
    )].sort();
    setDesignations(uniqueDesignations);
  }, [teachers]);

  // Filter teachers when search or designation filter changes
  useEffect(() => {
    let filtered = teachers.filter(teacher => {
      const matchesSearch = teacher.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           teacher.teacherId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDesignation = !filterDesignation || teacher.designation === filterDesignation;
      return matchesSearch && matchesDesignation;
    });
    setFilteredTeachers(filtered);
  }, [teachers, searchTerm, filterDesignation]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/teachers');
      const teachersList = Array.isArray(response.data) ? response.data : [];
      setTeachers(teachersList);
      console.log('Teachers fetched:', teachersList);
    } catch (err) {
      console.error('Error fetching teachers:', err);
      setError('Failed to load teachers: ' + (err.response?.data?.error || err.message));
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEditTeacher = (teacher) => {
    setEditingId(teacher.id);
    const customFieldsObj = teacher.customFields ? 
      (typeof teacher.customFields === 'string' ? JSON.parse(teacher.customFields) : teacher.customFields) 
      : {};
    setFormData({
      fullName: teacher.fullName || '',
      email: teacher.email || '',
      password: '',
      teacherId: teacher.teacherId || '',
      contactNumber: teacher.contactNumber || '',
      department: teacher.department || '',
      designation: teacher.designation || '',
      specialization: teacher.specialization || '',
      role: 'TEACHER',
      customFields: customFieldsObj
    });
    setEditingCustomFields(false);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      fullName: '',
      email: '',
      password: 'admin123456',
      teacherId: '',
      contactNumber: '',
      department: '',
      designation: '',
      specialization: '',
      role: 'TEACHER',
      customFields: {}
    });
    setEditingCustomFields(false);
    setShowForm(false);
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      
      if (!formData.fullName || !formData.email || !formData.teacherId) {
        setError('Please fill in all required fields (Name, Email, Teacher ID)');
        return;
      }

      if (editingId) {
        // Update existing teacher
        const submitData = {
          fullName: formData.fullName,
          email: formData.email,
          teacherId: formData.teacherId,
          contactNumber: formData.contactNumber || null,
          designation: formData.designation || null,
          department: formData.department || null,
          specialization: formData.specialization || null,
          customFields: Object.keys(formData.customFields).length > 0 ? JSON.stringify(formData.customFields) : null
        };
        console.log('Updating teacher:', editingId, submitData);
        await api.put(`/teachers/${editingId}`, submitData);
        setSuccess('Teacher updated successfully!');
      } else {
        // Add new teacher
        const submitData = {
          ...formData,
          customFields: Object.keys(formData.customFields).length > 0 ? JSON.stringify(formData.customFields) : null
        };
        console.log('Submitting teacher:', submitData);
        await api.post('/auth/register', submitData);
        setSuccess('Teacher added successfully!');
      }

      handleCancelEdit();
      setTimeout(() => {
        fetchTeachers();
        setSuccess('');
      }, 1500);
    } catch (err) {
      console.error('Error saving teacher:', err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      setError('Error saving teacher: ' + errorMsg);
    }
  };

  const handleDeleteTeacher = async (teacherId) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        setError('');
        setSuccess('');
        console.log('Deleting teacher:', teacherId);
        await api.delete(`/teachers/${teacherId}`);
        setSuccess('Teacher deleted successfully!');
        setTimeout(() => {
          fetchTeachers();
          setSuccess('');
        }, 1500);
      } catch (err) {
        console.error('Error deleting teacher:', err);
        setError('Error deleting teacher: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  return (
    <div className="management-container">
      <h1>Teacher Management</h1>
      
      {error && <div className="error" style={{padding: '12px', marginBottom: '15px', backgroundColor: '#fee', color: '#c33', borderRadius: '4px'}}>{error}</div>}
      {success && <div className="success" style={{padding: '12px', marginBottom: '15px', backgroundColor: '#efe', color: '#3c3', borderRadius: '4px'}}>{success}</div>}

      <button className="action-btn" onClick={() => setShowForm(!showForm)} style={{marginBottom: '20px', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
        {showForm ? 'Cancel' : '+ Add Teacher'}
      </button>

      {showForm && (
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
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '30px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }}>
            <h3 style={{marginTop: 0}}>{editingId ? 'Edit Teacher' : 'Add New Teacher'}</h3>
          {!editingId && (
            <div style={{backgroundColor: '#e7f3ff', padding: '12px', marginBottom: '15px', borderRadius: '4px', fontSize: '13px', color: '#004085', borderLeft: '4px solid #004085'}}>
              <strong>📝 Default Password:</strong> Teacher will receive password <code style={{backgroundColor: '#fff', padding: '2px 6px', borderRadius: '2px'}}>admin123456</code> for first login. They should change it in their profile.
            </div>
          )}
          <form onSubmit={handleAddTeacher} style={{display: 'grid', gap: '12px'}}>
            {/* Account Information Section */}
            <div style={{padding: '10px 0', borderBottom: '2px solid #e2e8f0', marginBottom: '10px'}}>
              <h4 style={{margin: '0 0 12px 0', color: '#1976d2'}}>📋 Account Information</h4>
            </div>
            
            <div>
              <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>Full Name *</label>
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
              />
            </div>

            <div>
              <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>Email *</label>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
                style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
              />
            </div>

            <div>
              <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>Teacher ID *</label>
              <input
                type="text"
                name="teacherId"
                placeholder="Teacher ID (e.g., TEA001)"
                value={formData.teacherId}
                onChange={handleInputChange}
                required
                style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
              />
            </div>

            <div>
              <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>Contact Number</label>
              <input
                type="tel"
                name="contactNumber"
                placeholder="Contact Number"
                value={formData.contactNumber || ''}
                onChange={handleInputChange}
                style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
              />
            </div>

            {/* Professional Information Section */}
            <div style={{padding: '10px 0', borderBottom: '2px solid #e2e8f0', marginBottom: '10px', marginTop: '15px'}}>
              <h4 style={{margin: '0 0 12px 0', color: '#1976d2'}}>💼 Professional Information</h4>
            </div>

            <div>
              <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>Department</label>
              <input
                type="text"
                name="department"
                placeholder="Department (e.g., Computer Science)"
                value={formData.department}
                onChange={handleInputChange}
                style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
              />
            </div>

            <div>
              <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>Designation</label>
              <input
                type="text"
                name="designation"
                placeholder="Designation (e.g., Assistant Professor)"
                value={formData.designation}
                onChange={handleInputChange}
                style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
              />
            </div>

            <div>
              <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>Specialization</label>
              <input
                type="text"
                name="specialization"
                placeholder="Specialization (e.g., Algorithms)"
                value={formData.specialization}
                onChange={handleInputChange}
                style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
              />
            </div>

            {/* Additional Custom Fields Section */}
            <div style={{padding: '10px 0', borderBottom: '2px solid #e2e8f0', marginBottom: '10px', marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <h4 style={{margin: '0', color: '#1976d2'}}>⚙️ Additional Custom Fields</h4>
              <button
                type="button"
                onClick={() => {
                  const fieldName = prompt('Enter custom field name:');
                  if (fieldName && fieldName.trim()) {
                    setFormData({
                      ...formData,
                      customFields: {
                        ...formData.customFields,
                        [fieldName.trim()]: ''
                      }
                    });
                  }
                }}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#e3f2fd',
                  border: '1px solid #1976d2',
                  color: '#1976d2',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                + Add Custom Field
              </button>
            </div>

            {/* Display Custom Fields */}
            {formData.customFields && Object.keys(formData.customFields).length > 0 && (
              <div style={{marginBottom: '15px'}}>
                {Object.entries(formData.customFields).map(([fieldName, fieldValue]) => (
                  <div key={fieldName} style={{marginBottom: '10px'}}>
                    <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>
                      {fieldName}
                      <button
                        type="button"
                        onClick={() => {
                          const newCustomFields = { ...formData.customFields };
                          delete newCustomFields[fieldName];
                          setFormData({ ...formData, customFields: newCustomFields });
                        }}
                        style={{
                          marginLeft: '8px',
                          padding: '2px 6px',
                          backgroundColor: '#ffebee',
                          border: '1px solid #d32f2f',
                          color: '#d32f2f',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '10px'
                        }}
                      >
                        Remove
                      </button>
                    </label>
                    <input
                      type="text"
                      placeholder={`Enter ${fieldName}`}
                      value={fieldValue}
                      onChange={(e) => setFormData({
                        ...formData,
                        customFields: {
                          ...formData.customFields,
                          [fieldName]: e.target.value
                        }
                      })}
                      style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box'}}
                    />
                  </div>
                ))}
              </div>
            )}

            <div style={{display: 'flex', gap: '10px', marginTop: '15px'}}>
              <button type="submit" style={{padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', flex: 1}}>
                {editingId ? 'Update Teacher' : 'Add Teacher'}
              </button>
              <button type="button" onClick={handleCancelEdit} style={{padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', flex: 1}}>
                Close
              </button>
            </div>

            {/* Custom Fields Display/Edit */}
            {editingId && Object.keys(formData.customFields).length > 0 && (
              <div style={{padding: '12px', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '4px', marginTop: '15px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                  <label style={{fontSize: '12px', fontWeight: 'bold'}}>Additional Fields</label>
                  <div style={{display: 'flex', gap: '8px'}}>
                    <button
                      type="button"
                      onClick={() => {
                        const fieldName = prompt('Enter custom field name:');
                        if (fieldName && fieldName.trim()) {
                          setFormData({
                            ...formData,
                            customFields: {
                              ...formData.customFields,
                              [fieldName.trim()]: ''
                            }
                          });
                        }
                      }}
                      style={{padding: '4px 12px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px'}}
                    >
                      + Add Custom Field
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCustomFields(!editingCustomFields)}
                      style={{padding: '4px 12px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px'}}
                    >
                      {editingCustomFields ? '✗ Cancel' : '✎ Edit Custom Fields'}
                    </button>
                  </div>
                </div>
                {editingCustomFields ? (
                  <div style={{display: 'grid', gap: '10px'}}>
                    {Object.entries(formData.customFields).map(([key, value]) => (
                      <input
                        key={key}
                        type="text"
                        placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                        value={value}
                        onChange={(e) => setFormData({
                          ...formData,
                          customFields: { ...formData.customFields, [key]: e.target.value }
                        })}
                        style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', fontSize: '12px'}}
                      />
                    ))}
                  </div>
                ) : (
                  <div style={{display: 'grid', gap: '8px'}}>
                    {Object.entries(formData.customFields).map(([key, value]) => (
                      <p key={key} style={{margin: 0, fontSize: '13px'}}>
                        <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </form>
          </div>
        </div>
      )}

      <div className="list-container">
        <div style={{marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
          <div>
            <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>🔍 Search (Name, Email, ID)</label>
            <input
              type="text"
              placeholder="Search teachers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px'}}
            />
          </div>
          <div>
            <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>💼 Filter by Designation</label>
            <select
              value={filterDesignation}
              onChange={(e) => setFilterDesignation(e.target.value)}
              style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px'}}
            >
              <option value="">All Designations</option>
              {designations.map(des => (
                <option key={des} value={des}>{des}</option>
              ))}
            </select>
          </div>
        </div>

      {/* View Profile Modal */}
      {viewingId && (
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
          zIndex: 999,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '30px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }}>
            <h3 style={{marginTop: 0}}>Teacher Profile</h3>
            {(() => {
              const teacher = teachers.find(t => t.id === viewingId);
              return teacher ? (
                <div>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px'}}>
                    <div>
                      <p><strong>Name:</strong> {teacher.fullName || 'N/A'}</p>
                      <p><strong>Email:</strong> {teacher.email || 'N/A'}</p>
                      <p><strong>Teacher ID:</strong> {teacher.teacherId || 'N/A'}</p>
                      <p><strong>Contact Number:</strong> {teacher.contactNumber || 'Not provided'}</p>
                    </div>
                    <div>
                      <p><strong>Department:</strong> {teacher.department || 'N/A'}</p>
                      <p><strong>Designation:</strong> {teacher.designation || 'N/A'}</p>
                      <p><strong>Specialization:</strong> {teacher.specialization || 'N/A'}</p>
                    </div>
                  </div>
                  {teacher.customFields && (() => {
                    try {
                      const customFieldsObj = JSON.parse(teacher.customFields);
                      const hasCustomFields = Object.keys(customFieldsObj).length > 0;
                      if (hasCustomFields) {
                        return (
                          <div style={{marginBottom: '15px', padding: '12px', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '4px'}}>
                            <h5 style={{marginTop: 0, marginBottom: '10px', fontSize: '14px', fontWeight: 'bold'}}>Additional Information</h5>
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                              {Object.entries(customFieldsObj).map(([key, value]) => (
                                <p key={key} style={{margin: 0, fontSize: '13px'}}>
                                  <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value || 'N/A'}
                                </p>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    } catch (e) {
                      console.error('Error parsing custom fields:', e);
                      return null;
                    }
                  })()}
                  <div style={{display: 'flex', gap: '10px', marginTop: '15px'}}>
                    <button 
                      onClick={() => handleEditTeacher(teacher)}
                      style={{padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1, fontWeight: 'bold'}}
                    >
                      Edit Teacher
                    </button>
                    <button 
                      onClick={() => setViewingId(null)}
                      style={{padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1, fontWeight: 'bold'}}
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        </div>
      )}

        {loading ? (
          <p>Loading teachers...</p>
        ) : filteredTeachers.length === 0 ? (
          <p>{teachers.length === 0 ? 'No teachers found. Add one to get started!' : 'No teachers match your search criteria.'}</p>
        ) : (
          <table className='teacher-table' style={{width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
            <thead>
              <tr style={{backgroundColor: '#0059b1', borderBottom: '2px solid #dee2e6'}}>
                <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Name</th>
                <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Email</th>
                <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Teacher ID</th>
                <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Designation</th>
                <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Department</th>
                <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map(teacher => (
                <tr key={teacher.id} style={{borderBottom: '1px solid #dee2e6'}}>
                  <td style={{padding: '12px'}}>{teacher.fullName}</td>
                  <td style={{padding: '12px'}}>{teacher.email}</td>
                  <td style={{padding: '12px'}}>{teacher.teacherId || 'N/A'}</td>
                  <td style={{padding: '12px'}}>{teacher.designation || 'N/A'}</td>
                  <td style={{padding: '12px'}}>{teacher.department || 'N/A'}</td>
                  <td style={{padding: '12px'}}>
                    <div style={{display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center'}}>
                      <button 
                        className="view-btn"
                        onClick={() => setViewingId(teacher.id)}
                        style={{padding: '6px 10px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', whiteSpace: 'nowrap'}}
                        title="View Profile"
                      >
                        View
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteTeacher(teacher.id)}
                        style={{padding: '6px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', whiteSpace: 'nowrap'}}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TeacherManagement;
