import React, { useState, useEffect } from 'react';
import api from '../services/api';
import BulkStudentUpload from '../components/BulkStudentUpload';

export const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewingId, setViewingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    studentId: '',
    course: '',
    semester: '',
    phoneNumber: '',
    department: '',
    enrollmentNumber: '',
    role: 'STUDENT',
    customFields: {}
  });
  const [editingCustomFields, setEditingCustomFields] = useState(false);

  // Fetch students and courses on mount
  useEffect(() => {
    fetchStudents();
    fetchAvailableCourses();
  }, []);

  // Filter students when search or filter changes
  useEffect(() => {
    let filtered = students.filter(student => {
      const matchesSearch = student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCourse = !filterCourse || (student.program || student.course) === filterCourse;
      return matchesSearch && matchesCourse;
    });
    setFilteredStudents(filtered);
  }, [students, searchTerm, filterCourse]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/students');
      let studentsList = Array.isArray(response.data) ? response.data : [];
      
      // Filter out alumni students
      try {
        const alumniResponse = await api.get('/alumni');
        const alumniList = Array.isArray(alumniResponse.data) ? alumniResponse.data : [];
        const alumniStudentIds = new Set(alumniList.map(alum => parseInt(alum.studentId)));
        
        // Filter out students who are already alumni (compare numeric IDs)
        studentsList = studentsList.filter(student => !alumniStudentIds.has(student.id));
        console.log('Alumni filtered. Remaining students:', studentsList.length);
      } catch (err) {
        console.error('Error filtering alumni:', err);
        // Continue with all students if alumni fetch fails
      }
      
      setStudents(studentsList);
      console.log('Students fetched:', studentsList);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students: ' + (err.response?.data?.error || err.message));
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableCourses = async () => {
    try {
      console.log('DEBUG: Fetching programs from /subjects/unique-programs');
      const response = await api.get('/subjects/unique-programs');
      console.log('DEBUG: Response from unique-programs:', response.data);
      const coursesList = Array.isArray(response.data) ? response.data : [];
      
      if (coursesList.length > 0) {
        console.log('DEBUG: Using programs from API:', coursesList);
        setCourses(coursesList.sort());
      } else {
        console.log('DEBUG: Empty list from unique-programs, trying fallback');
        // Fallback to courses-semesters endpoint
        const fallbackResponse = await api.get('/subjects/user/courses-semesters');
        console.log('DEBUG: Fallback response:', fallbackResponse.data);
        const result = fallbackResponse.data || {};
        const fallbackList = Array.isArray(result.courses) ? result.courses : [];
        const finalList = fallbackList.length > 0 ? fallbackList.sort() : ['B.Tech', 'B.Sc', 'M.Tech', 'M.Sc', 'BBA'];
        console.log('DEBUG: Using final list:', finalList);
        setCourses(finalList);
      }
    } catch (err) {
      console.error('Error fetching programs:', err);
      console.error('Error details:', err.response?.data);
      // Use default programs on error
      setCourses(['B.Tech', 'B.Sc', 'M.Tech', 'M.Sc', 'BBA']);
    }
  };

  const fetchSemestersByProgram = async (program) => {
    if (!program) {
      setSemesters([]);
      return;
    }
    
    try {
      const response = await api.get(`/subjects/semesters-by-program/${program}`);
      const semesterList = Array.isArray(response.data) ? response.data.sort((a, b) => parseInt(a) - parseInt(b)) : [];
      setSemesters(semesterList.length > 0 ? semesterList : ['1', '2', '3', '4', '5', '6', '7', '8']);
    } catch (err) {
      console.error('Error fetching semesters:', err);
      // Default semesters if API fails
      setSemesters(['1', '2', '3', '4', '5', '6', '7', '8']);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // When program changes, fetch semesters for that program
    if (name === 'course') {
      fetchSemestersByProgram(value);
    }
  };

  const handleEditStudent = (student) => {
    setEditingId(student.id);
    const studentCourse = student.program || student.course || ''; // Support both field names
    const customFieldsObj = student.customFields ? 
      (typeof student.customFields === 'string' ? JSON.parse(student.customFields) : student.customFields) 
      : {};
    setFormData({
      fullName: student.fullName || '',
      email: student.email || '',
      password: '',
      studentId: student.studentId || '',
      course: studentCourse,
      semester: student.semester || '',
      phoneNumber: student.phoneNumber || '',
      department: student.department || '',
      enrollmentNumber: student.enrollmentNumber || '',
      role: 'STUDENT',
      customFields: customFieldsObj
    });
    setEditingCustomFields(false);
    // Fetch semesters for the student's current program
    if (studentCourse) {
      fetchSemestersByProgram(studentCourse);
    }
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      fullName: '',
      email: '',
      password: 'admin123456',
      studentId: '',
      course: '',
      semester: '',
      phoneNumber: '',
      department: '',
      enrollmentNumber: '',
      role: 'STUDENT',
      customFields: {}
    });
    setEditingCustomFields(false);
    setShowForm(false);
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      
      if (!formData.fullName || !formData.email || !formData.studentId) {
        setError('Please fill in all required fields (Name, Email, Student ID)');
        return;
      }

      if (editingId) {
        // Update existing student
        console.log('DEBUG: Updating student', editingId, formData);
        const customFieldsJson = Object.keys(formData.customFields).length > 0 
          ? JSON.stringify(formData.customFields) 
          : null;
        const submitData = {
          fullName: formData.fullName,
          email: formData.email,
          studentId: formData.studentId,
          course: formData.course || null,
          semester: formData.semester || null,
          phoneNumber: formData.phoneNumber || null,
          customFields: customFieldsJson
        };
        const response = await api.put(`/students/${editingId}`, submitData);
        console.log('DEBUG: Update response:', response.data);
        setSuccess('Student updated successfully!');
      } else {
        // Add new student
        console.log('DEBUG: Adding new student', formData);
        const response = await api.post('/auth/register', formData);
        console.log('DEBUG: Add response:', response.data);
        setSuccess('Student added successfully!');
      }

      console.log('DEBUG: Form submission successful, closing form');
      handleCancelEdit();
      setTimeout(() => {
        console.log('DEBUG: Fetching updated student list');
        fetchStudents();
        setSuccess('');
      }, 1500);
    } catch (err) {
      console.error('Error saving student:', err);
      console.error('Error response:', err.response?.data);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      setError('Error saving student: ' + errorMsg);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        setError('');
        setSuccess('');
        await api.delete(`/students/${studentId}`);
        setSuccess('Student deleted successfully!');
        setTimeout(() => {
          fetchStudents();
          setSuccess('');
        }, 1500);
      } catch (err) {
        console.error('Error deleting student:', err);
        setError('Error deleting student: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  const handleSelectStudent = (studentId) => {
    setSelectedStudents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(filteredStudents.map(s => s.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedStudents.size === 0) {
      setError('Please select at least one student to delete');
      return;
    }

    const studentCount = selectedStudents.size;
    if (window.confirm(`Are you sure you want to delete ${studentCount} student(s)? This action cannot be undone.`)) {
      try {
        setError('');
        setSuccess('');
        let deletedCount = 0;
        let failedCount = 0;

        for (const studentId of selectedStudents) {
          try {
            await api.delete(`/students/${studentId}`);
            deletedCount++;
          } catch (err) {
            console.error('Error deleting student:', studentId, err);
            failedCount++;
          }
        }

        if (deletedCount > 0) {
          setSuccess(`Successfully deleted ${deletedCount} student(s)${failedCount > 0 ? `, failed to delete ${failedCount}` : ''}`);
          setSelectedStudents(new Set());
          setTimeout(() => {
            fetchStudents();
            setSuccess('');
          }, 1500);
        } else {
          setError(`Failed to delete students`);
        }
      } catch (err) {
        console.error('Error in bulk delete:', err);
        setError('Error deleting students: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  return (
    <div className="management-container">
      <h1>Student Management</h1>
      
      {error && <div className="error" style={{padding: '12px', marginBottom: '15px', backgroundColor: '#fee', color: '#c33', borderRadius: '4px'}}>{error}</div>}
      {success && <div className="success" style={{padding: '12px', marginBottom: '15px', backgroundColor: '#efe', color: '#3c3', borderRadius: '4px'}}>{success}</div>}

      <div style={{marginBottom: '20px'}}>
        {selectedStudents.size > 0 && (
          <button 
            className="bulk-delete-btn"
            onClick={handleBulkDelete}
            style={{padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'}}
          >
             Delete {selectedStudents.size} Student{selectedStudents.size !== 1 ? 's' : ''}
          </button>
        )}
      </div>

      <BulkStudentUpload />

      {/* Edit/Add Form Modal */}
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
            <h3 style={{marginTop: 0}}>{editingId ? 'Edit Student' : 'Add New Student'}</h3>
            <form onSubmit={handleAddStudent} style={{display: 'grid', gap: '12px'}}>
              <div>
                <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box'}}
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
                  style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box'}}
                />
              </div>

              <div>
                <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>Student ID *</label>
                <input
                  type="text"
                  name="studentId"
                  placeholder="Student ID (e.g., STU001)"
                  value={formData.studentId}
                  onChange={handleInputChange}
                  required
                  style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box'}}
                />
              </div>

              {!editingId && (
                <div>
                  <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box'}}
                  />
                </div>
              )}

              <div>
                <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>Program</label>
                <select
                  name="course"
                  value={formData.course}
                  onChange={handleInputChange}
                  style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box'}}
                >
                  <option value="">Select Program</option>
                  {courses.map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>Semester</label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box'}}
                >
                  <option value="">Select Semester</option>
                  {semesters.length > 0 ? (
                    semesters.map(sem => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))
                  ) : (
                    [1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder="Phone Number"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box'}}
                />
              </div>

              <div>
                <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>Department</label>
                <input
                  type="text"
                  name="department"
                  placeholder="e.g., Computer Science and Engineering"
                  value={formData.department}
                  onChange={handleInputChange}
                  style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box'}}
                />
              </div>

              <div>
                <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>Enrollment Number</label>
                <input
                  type="text"
                  name="enrollmentNumber"
                  placeholder="Enrollment Number (leave empty if not available)"
                  value={formData.enrollmentNumber}
                  onChange={handleInputChange}
                  style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box'}}
                />
              </div>

              {/* Custom Fields Display/Edit */}
              {editingId && Object.keys(formData.customFields).length > 0 && (
                <div style={{padding: '12px', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '4px'}}>
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
                    // Edit mode
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
                    // View mode
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

              <div style={{display: 'flex', gap: '10px', marginTop: '15px'}}>
                <button type="submit" style={{padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', flex: 1}}>
                  {editingId ? 'Update Student' : 'Add Student'}
                </button>
                <button type="button" onClick={handleCancelEdit} style={{padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', flex: 1}}>
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
            <h3 style={{marginTop: 0}}>Student Profile</h3>
            {(() => {
              const student = students.find(s => s.id === viewingId);
              return student ? (
                <div>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px'}}>
                    <div>
                      <p><strong>Name:</strong> {student.fullName || 'N/A'}</p>
                      <p><strong>Email:</strong> {student.email || 'N/A'}</p>
                      <p><strong>Student ID:</strong> {student.studentId || 'N/A'}</p>
                      <p><strong>Enrollment Number:</strong> {student.enrollmentNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p><strong>Program:</strong> {student.program || 'N/A'}</p>
                      <p><strong>Semester:</strong> {student.semester ? `Sem ${student.semester}` : 'N/A'}</p>
                      <p><strong>Department:</strong> {student.department || 'N/A'}</p>
                      <p><strong>Contact Number:</strong> {student.contactNo && student.contactNo.trim() ? student.contactNo : 'Not provided'}</p>
                    </div>
                  </div>
                  {student.attendancePercentage !== undefined && (
                    <div style={{marginBottom: '15px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px'}}>
                      <p><strong>Attendance Percentage:</strong> {student.attendancePercentage ? student.attendancePercentage.toFixed(2) + '%' : '0%'}</p>
                    </div>
                  )}
                  {student.customFields && (() => {
                    try {
                      const customFieldsObj = JSON.parse(student.customFields);
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
                      onClick={() => handleEditStudent(student)}
                      style={{padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1, fontWeight: 'bold'}}
                    >
                      Edit Student
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

      <div className="list-container">
        <div style={{marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
          <div>
            <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>🔍 Search (Name, Email, ID)</label>
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px'}}
            />
          </div>
          <div>
            <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>📚 Filter by Course</label>
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px'}}
            >
              <option value="">All Courses</option>
              {courses.map((course) => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p>Loading students...</p>
        ) : filteredStudents.length === 0 ? (
          <p>{students.length === 0 ? 'No students found. Add one to get started!' : 'No students match your search criteria.'}</p>
        ) : (
          <table className="student-table" style={{width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
            <thead>
              <tr style={{backgroundColor: '#023161', borderBottom: '2px solid #dee2e6'}}>
                <th style={{padding: '12px', textAlign: 'center', fontWeight: 'bold', width: '40px'}}>
                  <input 
                    type="checkbox"
                    checked={selectedStudents.size === filteredStudents.length && filteredStudents.length > 0}
                    onChange={handleSelectAll}
                    title="Select all"
                  />
                </th>
                <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Name</th>
                <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Email</th>
                <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Student ID</th>
                <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Contact</th>
                <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Course</th>
                <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Semester</th>
                <th style={{padding: '12px', textAlign: 'center', fontWeight: 'bold'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => (
                <tr key={student.id} style={{borderBottom: '1px solid #dee2e6', backgroundColor: selectedStudents.has(student.id) ? '#e7f3ff' : 'white'}}>
                  <td style={{padding: '12px', textAlign: 'center'}}>
                    <input 
                      type="checkbox"
                      checked={selectedStudents.has(student.id)}
                      onChange={() => handleSelectStudent(student.id)}
                    />
                  </td>
                  <td style={{padding: '12px'}}>{student.fullName}</td>
                  <td style={{padding: '12px'}}>{student.email}</td>
                  <td style={{padding: '12px'}}>{student.studentId || 'N/A'}</td>
                  <td style={{padding: '12px'}}>{student.contactNo || 'N/A'}</td>
                  <td style={{padding: '12px'}}>{student.course || 'N/A'}</td>
                  <td style={{padding: '12px'}}>{student.semester ? `Sem ${student.semester}` : 'N/A'}</td>
                  <td style={{padding: '12px'}}>
                    <div style={{display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center'}}>
                      <button 
                        className="view-btn"
                        onClick={() => setViewingId(student.id)}
                        style={{padding: '6px 10px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', whiteSpace: 'nowrap'}}
                        title="View Profile"
                      >
                         View
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteStudent(student.id)}
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

export default StudentManagement;
