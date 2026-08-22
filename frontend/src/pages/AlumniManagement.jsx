import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/dashboard.css';

export const AlumniManagement = () => {
  const [alumni, setAlumni] = useState([]);
  const [filteredAlumni, setFilteredAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProgram, setFilterProgram] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [programs, setPrograms] = useState([]);
  const [programDetails, setProgramDetails] = useState({}); // Map program name to semester count
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [viewingData, setViewingData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showCustomFieldsDialog, setShowCustomFieldsDialog] = useState(false);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [studentSearchInput, setStudentSearchInput] = useState('');
  
  const [formData, setFormData] = useState({
    studentId: '',
    program: '',
    semester: '',
    marks: '',
    passFail: '',
    backPaperSubjects: [],
    backPaperSubjectInput: '',
    currentOccupation: '',
    company: '',
    customFields: ''
  });
  const [editFormData, setEditFormData] = useState({
    marks: '',
    passFail: '',
    backPaperSubjects: [],
    backPaperSubjectInput: '',
    currentOccupation: '',
    company: '',
    customFields: ''
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFilters, setExportFilters] = useState({
    program: '',
    status: '',
    yearFrom: '',
    yearTo: ''
  });
  const [customFieldKey, setCustomFieldKey] = useState('');
  const [customFieldValue, setCustomFieldValue] = useState('');

  useEffect(() => {
    fetchAlumni();
    fetchPrograms();
    fetchAllStudents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [alumni, searchQuery, filterProgram, filterSemester, filterStatus]);

  const fetchAlumni = async () => {
    try {
      setLoading(true);
      const response = await api.get('/alumni');
      let alumniList = Array.isArray(response.data) ? response.data : [];
      setAlumni(alumniList);
      setMessage({ text: '', type: '' });
    } catch (err) {
      console.error('Error fetching alumni:', err);
      setMessage({ text: 'Failed to load alumni data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      const response = await api.get('/programs');
      if (Array.isArray(response.data)) {
        const progs = response.data.map(p => p.name);
        setPrograms(progs);
        
        // Create map of program name to semester count
        const details = {};
        response.data.forEach(p => {
          details[p.name] = p.semesterCount || 6;
        });
        setProgramDetails(details);
      }
    } catch (err) {
      console.error('Error fetching programs:', err);
      // Set default programs if fetch fails
      setPrograms(['BCA', 'MCA', 'Mtech', 'PHD']);
      const defaultDetails = {
        'BCA': 6,
        'MCA': 4,
        'Mtech': 4,
        'PHD': 8
      };
      setProgramDetails(defaultDetails);
    }
  };

  const fetchAllStudents = async () => {
    try {
      const response = await api.get('/students');
      const students = Array.isArray(response.data) ? response.data : [];
      
      // Get list of alumni numeric IDs
      const alumniIds = new Set(alumni.map(a => parseInt(a.studentId)));
      
      // Filter out students who are already alumni
      const nonAlumniStudents = students.filter(s => !alumniIds.has(s.id));
      setAvailableStudents(nonAlumniStudents);
    } catch (err) {
      console.error('Error fetching students:', err);
      setAvailableStudents([]);
    }
  };

  const applyFilters = () => {
    let filtered = alumni;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.studentName?.toLowerCase().includes(query) ||
        a.studentEmail?.toLowerCase().includes(query) ||
        a.studentId?.toString().includes(query)
      );
    }

    if (filterProgram) {
      filtered = filtered.filter(a => a.program === filterProgram);
    }

    if (filterSemester) {
      filtered = filtered.filter(a => a.semester === parseInt(filterSemester));
    }

    if (filterStatus) {
      filtered = filtered.filter(a => {
        if (filterStatus === 'BackPaper') {
          try {
            const customData = JSON.parse(a.customFields || '{}');
            return customData.backPaperSubjects && customData.backPaperSubjects.length > 0;
          } catch (e) {
            return false;
          }
        }
        return a.passFail === filterStatus;
      });
    }

    setFilteredAlumni(filtered);
  };

  const getAvailableSemesters = () => {
    if (!formData.program) return [];
    const count = programDetails[formData.program] || 8;
    return Array.from({ length: count }, (_, i) => i + 1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Reset semester if program changes
    if (name === 'program') {
      setFormData(prev => ({ ...prev, [name]: value, semester: '' }));
    }
  };

  const handleAddBackPaperSubject = () => {
    const subject = formData.backPaperSubjectInput.trim();
    if (subject) {
      setFormData(prev => ({
        ...prev,
        backPaperSubjects: [...prev.backPaperSubjects, subject],
        backPaperSubjectInput: ''
      }));
    }
  };

  const handleRemoveBackPaperSubject = (index) => {
    setFormData(prev => ({
      ...prev,
      backPaperSubjects: prev.backPaperSubjects.filter((_, i) => i !== index)
    }));
  };

  const handleAddBackPaperSubjectEdit = () => {
    const subject = editFormData.backPaperSubjectInput.trim();
    if (subject) {
      setEditFormData(prev => ({
        ...prev,
        backPaperSubjects: [...prev.backPaperSubjects, subject],
        backPaperSubjectInput: ''
      }));
    }
  };

  const handleRemoveBackPaperSubjectEdit = (index) => {
    setEditFormData(prev => ({
      ...prev,
      backPaperSubjects: prev.backPaperSubjects.filter((_, i) => i !== index)
    }));
  };

  const handleAddAlumni = async (e) => {
    e.preventDefault();
    try {
      if (!formData.studentId || !formData.program || !formData.semester) {
        setMessage({ text: 'Please fill in all required fields', type: 'warning' });
        return;
      }

      // Build customFields with ALL student details transferred from Student record
      let customFieldsData = formData.customFields;
      try {
        const selStudent = availableStudents.find(s => s.id === parseInt(formData.studentId));
        if (!selStudent) {
          setMessage({ text: 'Student not found', type: 'error' });
          return;
        }

        // Start with any existing customFields from the student
        let parsed = {};
        if (selStudent.customFields) {
          try {
            parsed = typeof selStudent.customFields === 'string' 
              ? JSON.parse(selStudent.customFields) 
              : selStudent.customFields;
          } catch (e) {
            console.warn('Could not parse student customFields:', e);
          }
        }

        // Ensure all student information is preserved
        parsed.fullStudentId = selStudent.studentId;
        parsed.studentDetails = {
          name: selStudent.name,
          email: selStudent.email,
          enrollmentNumber: selStudent.enrollmentNumber,
          department: selStudent.department,
          contactNumber: selStudent.contactNumber,
          address: selStudent.address,
          gender: selStudent.gender,
          // IMPORTANT: Also transfer student's program, semester, and attendance
          originalProgram: selStudent.program,
          originalSemester: selStudent.semester,
          attendancePercentage: selStudent.attendancePercentage
        };
        
        // Add back paper subjects if applicable
        if (formData.passFail === 'BackPaper' && formData.backPaperSubjects.length > 0) {
          parsed.backPaperSubjects = formData.backPaperSubjects;
        }
        
        customFieldsData = JSON.stringify(parsed);
        console.log('CustomFields prepared for submission (ALL student data transferred):', parsed);
      } catch (e) {
        console.error('Error preparing customFields:', e);
        const selStudent = availableStudents.find(s => s.id === parseInt(formData.studentId));
        if (selStudent) {
          const parsed = {
            fullStudentId: selStudent.studentId || '',
            studentDetails: {
              name: selStudent.name || '',
              email: selStudent.email || '',
              enrollmentNumber: selStudent.enrollmentNumber || '',
              department: selStudent.department || '',
              contactNumber: selStudent.contactNumber || '',
              address: selStudent.address || '',
              gender: selStudent.gender || '',
              originalProgram: selStudent.program,
              originalSemester: selStudent.semester,
              attendancePercentage: selStudent.attendancePercentage
            },
            additionalNotes: formData.customFields
          };
          customFieldsData = JSON.stringify(parsed);
        }
      }

      const params = new URLSearchParams({
        studentId: formData.studentId,
        program: formData.program,
        semester: formData.semester,
        ...(formData.marks && { marks: formData.marks }),
        ...(formData.passFail && { passFail: formData.passFail }),
        ...(customFieldsData && { customFields: customFieldsData })
      });

      const response = await api.post(`/alumni?${params}`);
      setMessage({ text: 'Alumni record created successfully', type: 'success' });
      setFormData({
        studentId: '',
        program: '',
        semester: '',
        marks: '',
        passFail: '',
        backPaperSubjects: [],
        backPaperSubjectInput: '',
        currentOccupation: '',
        company: '',
        customFields: ''
      });
      setShowForm(false);
      fetchAlumni();
      fetchAllStudents();
    } catch (err) {
      console.error('Error creating alumni record:', err);
      setMessage({ text: 'Failed to create alumni record', type: 'error' });
    }
  };

  const handleDeleteAlumni = async (alumniId) => {
    if (window.confirm('Are you sure you want to delete this alumni record?')) {
      try {
        await api.delete(`/alumni/${alumniId}`);
        setMessage({ text: 'Alumni record deleted successfully', type: 'success' });
        fetchAlumni();
        fetchAllStudents();
      } catch (err) {
        console.error('Error deleting alumni:', err);
        setMessage({ text: 'Failed to delete alumni record', type: 'error' });
      }
    }
  };

  const handleEditAlumni = (alum) => {
    let backPaperSubjects = [];
    
    try {
      const customData = JSON.parse(alum.customFields || '{}');
      if (customData.backPaperSubjects) {
        backPaperSubjects = customData.backPaperSubjects;
      }
    } catch (e) {
      // Handle non-JSON customFields
    }
    
    setEditFormData({
      marks: alum.marks || '',
      passFail: alum.passFail || '',
      backPaperSubjects: backPaperSubjects,
      backPaperSubjectInput: '',
      currentOccupation: alum.currentOccupation || '',
      company: alum.company || '',
      customFields: alum.customFields || ''
    });
    setEditMode(true);
  };

  const handleUpdateAlumni = async (e) => {
    e.preventDefault();
    try {
      // Preserve existing customFields data, only update back paper subjects if needed
      let customFieldsData = editFormData.customFields;
      try {
        const parsed = customFieldsData ? JSON.parse(customFieldsData) : {};
        
        // Update back paper subjects if applicable
        if (editFormData.passFail === 'BackPaper' && editFormData.backPaperSubjects.length > 0) {
          parsed.backPaperSubjects = editFormData.backPaperSubjects;
        }
        
        customFieldsData = JSON.stringify(parsed);
      } catch (e) {
        // If JSON parsing fails, preserve as is
        customFieldsData = editFormData.customFields;
      }

      const params = new URLSearchParams({
        ...(editFormData.marks && { marks: editFormData.marks }),
        ...(editFormData.passFail && { passFail: editFormData.passFail }),
        ...(editFormData.currentOccupation && { currentOccupation: editFormData.currentOccupation }),
        ...(editFormData.company && { company: editFormData.company }),
        ...(customFieldsData && { customFields: customFieldsData })
      });

      await api.put(`/alumni/${viewingData.id}?${params}`);
      setMessage({ text: 'Alumni record updated successfully', type: 'success' });
      setEditMode(false);
      setEditFormData({
        marks: '',
        passFail: '',
        backPaperSubjects: [],
        backPaperSubjectInput: '',
        currentOccupation: '',
        company: '',
        customFields: ''
      });
      fetchAlumni();
    } catch (err) {
      console.error('Error updating alumni record:', err);
      setMessage({ text: 'Failed to update alumni record', type: 'error' });
    }
  };

  const handleViewAlumni = (alum) => {
    setViewingId(alum.id);
    setViewingData(alum);
  };

  const handleCloseView = () => {
    setViewingId(null);
    setViewingData(null);
    setEditMode(false);
    setEditFormData({
      marks: '',
      passFail: '',
      backPaperSubjects: [],
      backPaperSubjectInput: '',
      currentOccupation: '',
      company: '',
      customFields: ''
    });
  };

  const parseCustomFields = (customFieldsStr) => {
    try {
      return customFieldsStr ? JSON.parse(customFieldsStr) : {};
    } catch (e) {
      return {};
    }
  };

  const getDisplayStudentId = (alum) => {
    try {
      const customData = JSON.parse(alum.customFields || '{}');
      return customData.fullStudentId || alum.studentId || 'N/A';
    } catch (e) {
      return alum.studentId || 'N/A';
    }
  };

  const exportAlumniData = () => {
    try {
      let dataToExport = [...filteredAlumni];

      // Apply export-specific filters
      if (exportFilters.program && exportFilters.program !== 'all') {
        dataToExport = dataToExport.filter(a => a.program === exportFilters.program);
      }

      if (exportFilters.status && exportFilters.status !== 'all') {
        if (exportFilters.status === 'BackPaper') {
          dataToExport = dataToExport.filter(a => {
            try {
              const customData = JSON.parse(a.customFields || '{}');
              return customData.backPaperSubjects && customData.backPaperSubjects.length > 0;
            } catch (e) {
              return false;
            }
          });
        } else {
          dataToExport = dataToExport.filter(a => a.passFail === exportFilters.status);
        }
      }

      // Filter by year of passing
      if (exportFilters.yearFrom) {
        const yearFromStr = exportFilters.yearFrom;
        dataToExport = dataToExport.filter(a => {
          if (!a.passingDate) return false;
          const year = a.passingDate.substring(0, 4);
          return year >= yearFromStr;
        });
      }

      if (exportFilters.yearTo) {
        const yearToStr = exportFilters.yearTo;
        dataToExport = dataToExport.filter(a => {
          if (!a.passingDate) return false;
          const year = a.passingDate.substring(0, 4);
          return year <= yearToStr;
        });
      }

      // Create CSV header
      const headers = [
        'Name',
        'Email',
        'Student ID',
        'Program',
        'Semester',
        'Marks',
        'Status',
        'Passing Date',
        'Join Date',
        'Current Occupation',
        'Company',
        'Contact No',
        'Enrollment Number',
        'Department',
        'Address'
      ];

      // Create CSV rows
      const rows = dataToExport.map(alum => {
        try {
          const customData = JSON.parse(alum.customFields || '{}');
          const studentDetails = customData.studentDetails || {};
          
          return [
            alum.studentName || '',
            alum.studentEmail || '',
            getDisplayStudentId(alum),
            alum.program || '',
            alum.semester || '',
            alum.marks ? alum.marks.toFixed(2) : '',
            alum.passFail || '',
            alum.passingDate || '',
            alum.joinDate || '',
            alum.currentOccupation || '',
            alum.company || '',
            alum.studentContactNo || studentDetails.contactNumber || '',
            alum.studentEnrollmentNumber || studentDetails.enrollmentNumber || '',
            alum.studentDepartment || studentDetails.department || '',
            studentDetails.address || ''
          ];
        } catch (e) {
          return [
            alum.studentName || '',
            alum.studentEmail || '',
            getDisplayStudentId(alum),
            alum.program || '',
            alum.semester || '',
            alum.marks ? alum.marks.toFixed(2) : '',
            alum.passFail || '',
            alum.passingDate || '',
            alum.joinDate || '',
            alum.currentOccupation || '',
            alum.company || '',
            alum.studentContactNo || '',
            alum.studentEnrollmentNumber || '',
            alum.studentDepartment || '',
            ''
          ];
        }
      });

      // Build CSV content
      const csvContent = [
        headers.map(h => `"${h}"`).join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Download CSV
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
      element.setAttribute('download', `alumni_export_${new Date().toISOString().split('T')[0]}.csv`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      setMessage({ text: `Successfully exported ${dataToExport.length} alumni records`, type: 'success' });
      setShowExportModal(false);
    } catch (error) {
      console.error('Error exporting data:', error);
      setMessage({ text: 'Error exporting data: ' + error.message, type: 'error' });
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>👨‍🎓 Alumni Management</h1>

      {message.text && (
        <div style={{
          padding: '12px',
          marginBottom: '15px',
          borderRadius: '4px',
          backgroundColor: message.type === 'error' ? '#f8d7da' : message.type === 'warning' ? '#fff3cd' : '#d4edda',
          color: message.type === 'error' ? '#721c24' : message.type === 'warning' ? '#856404' : '#155724',
          border: `1px solid ${message.type === 'error' ? '#f5c6cb' : message.type === 'warning' ? '#ffeaa7' : '#c3e6cb'}`
        }}>
          {message.text}
        </div>
      )}

      {/* Add Alumni Button */}
      <button
        onClick={() => {
          setFormData({
            studentId: '',
            program: '',
            semester: '',
            marks: '',
            passFail: '',
            backPaperSubjects: [],
            backPaperSubjectInput: '',
            currentOccupation: '',
            company: '',
            customFields: ''
          });
          setShowForm(!showForm);
        }}
        style={{
          marginBottom: '20px',
          marginRight: '10px',
          padding: '10px 20px',
          backgroundColor: '#2196f3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        {showForm ? '✕ Cancel' : '+ Add Alumni Record'}
      </button>

      {/* Export Alumni Button */}
      <button
        onClick={() => setShowExportModal(true)}
        style={{
          marginBottom: '20px',
          padding: '10px 20px',
          backgroundColor: '#4caf50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        📥 Export Alumni Data
      </button>

      {/* Add/Edit Alumni Form */}
      {showForm && (
        <div style={{
          marginBottom: '20px',
          padding: '20px',
          backgroundColor: '#f9f9f9',
          borderRadius: '4px',
          border: '1px solid #ddd'
        }}>
          <h3 style={{ marginTop: 0 }}>{editingId ? 'Edit Alumni Record' : 'Create New Alumni Record'}</h3>
          <form onSubmit={editingId ? handleUpdateAlumni : handleAddAlumni}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
              {!editingId && (
                            <div>
                  <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Student ID * <span style={{fontSize:'12px', color:'#666'}}>(Select from list)</span></label>
                  <select
                    name="studentId"
                    value={formData.studentId}
                    onChange={(e) => {
                      const selectedStudent = availableStudents.find(s => s.id === parseInt(e.target.value));
                      if (selectedStudent) {
                        const customFieldsObj = {
                          fullStudentId: selectedStudent.studentId,
                          studentDetails: {
                            name: selectedStudent.name,
                            email: selectedStudent.email,
                            enrollmentNumber: selectedStudent.enrollmentNumber,
                            department: selectedStudent.department,
                            contactNumber: selectedStudent.contactNumber,
                            address: selectedStudent.address,
                            gender: selectedStudent.gender
                          }
                        };
                        setFormData(prev => ({
                          ...prev,
                          studentId: e.target.value,
                          customFields: JSON.stringify(customFieldsObj)
                        }));
                        console.log('Student selected, customFields set:', customFieldsObj);
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          studentId: e.target.value,
                          customFields: ''
                        }));
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    required
                    disabled={editingId}
                  >
                    <option value="">-- Select a Student --</option>
                    {availableStudents.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.studentId} - {student.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {editingId && (
                <div>
                  <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Student ID (Read-only)</label>
                  <input
                    type="text"
                    value={formData.studentId}
                    disabled
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      backgroundColor: '#f0f0f0'
                    }}
                  />
                </div>
              )}
              {!editingId && (
                <div>
                  <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Program *</label>
                  <select
                    name="program"
                    value={formData.program}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    required
                    disabled={editingId}
                  >
                    <option value="">-- Select Program --</option>
                    {programs.map(prog => (
                      <option key={prog} value={prog}>{prog}</option>
                    ))}
                  </select>
                </div>
              )}
              {editingId && (
                <div>
                  <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Program (Read-only)</label>
                  <input
                    type="text"
                    value={formData.program}
                    disabled
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      backgroundColor: '#f0f0f0'
                    }}
                  />
                </div>
              )}
              {!editingId && (
                <div>
                  <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Semester *</label>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    required
                    disabled={!formData.program || editingId}
                  >
                    <option value="">-- Select Semester --</option>
                    {getAvailableSemesters().map(sem => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </select>
                </div>
              )}
              {editingId && (
                <div>
                  <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Semester (Read-only)</label>
                  <input
                    type="text"
                    value={`Semester ${formData.semester}`}
                    disabled
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      backgroundColor: '#f0f0f0'
                    }}
                  />
                </div>
              )}
              <div>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Marks</label>
                <input
                  type="number"
                  name="marks"
                  value={formData.marks}
                  onChange={handleInputChange}
                  placeholder="Enter marks"
                  step="0.01"
                  min="0"
                  max="100"
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
              <div>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Pass/Fail</label>
                <select
                  name="passFail"
                  value={formData.passFail}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">-- Select Status --</option>
                  <option value="Pass">Pass</option>
                  <option value="Fail">Fail</option>
                  <option value="BackPaper">Back Paper</option>
                </select>
              </div>
              {formData.passFail === 'BackPaper' && (
                <div style={{ gridColumn: '1 / -1', padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '4px', border: '1px solid #90caf9' }}>
                  <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>📚 Back Paper Subjects</label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                    <input
                      type="text"
                      value={formData.backPaperSubjectInput}
                      onChange={(e) => setFormData({ ...formData, backPaperSubjectInput: e.target.value })}
                      placeholder="Enter subject name"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddBackPaperSubject()}
                      style={{
                        flex: 1,
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddBackPaperSubject}
                      style={{
                        padding: '8px 15px',
                        backgroundColor: '#2196f3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      + Add Subject
                    </button>
                  </div>
                  {formData.backPaperSubjects.length > 0 && (
                    <div>
                      <label style={{ fontWeight: 'bold', fontSize: '12px', display: 'block', marginBottom: '5px' }}>Added Subjects:</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {formData.backPaperSubjects.map((subject, index) => (
                          <div
                            key={index}
                            style={{
                              backgroundColor: '#fff',
                              border: '1px solid #2196f3',
                              borderRadius: '4px',
                              padding: '5px 10px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}
                          >
                            <span>{subject}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveBackPaperSubject(index)}
                              style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                color: '#f44336',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '16px',
                                padding: '0'
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Current Occupation</label>
                <input
                  type="text"
                  name="currentOccupation"
                  value={formData.currentOccupation}
                  onChange={handleInputChange}
                  placeholder="e.g., Software Engineer"
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
              <div>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Company</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="e.g., Google Inc."
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
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Additional Details</label>
              <textarea
                name="customFields"
                value={formData.customFields}
                onChange={handleInputChange}
                placeholder="Additional information (JSON format or free text)"
                rows="3"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  fontFamily: 'monospace'
                }}
              />
              <small style={{ color: '#666' }}>
                Example JSON: {"{"}"location": "NYC", "salary": "100k"{"}"} or free text
              </small>
            </div>

            <button
              type="submit"
              style={{
                padding: '10px 20px',
                backgroundColor: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                marginRight: '10px'
              }}
            >
              {editingId ? 'Update Record' : 'Create Alumni Record'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setFormData({
                  studentId: '',
                  program: '',
                  semester: '',
                  marks: '',
                  passFail: '',
                  backPaperSubjects: [],
                  backPaperSubjectInput: '',
                  currentOccupation: '',
                  company: '',
                  customFields: ''
                });
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* View Alumni Details Modal with Inline Edit */}
      {viewingId && viewingData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '30px',
            maxWidth: '650px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>Alumni Details</h2>
              <button
                onClick={handleCloseView}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            {!editMode ? (
              // VIEW MODE
              <div style={{ display: 'grid', gap: '15px' }}>
                <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                  <strong>Name:</strong> {viewingData.studentName}
                </div>
                <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                  <strong>Email:</strong> {viewingData.studentEmail}
                </div>
                <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                  <strong>Student ID:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                    {(() => {
                      try {
                        const customData = JSON.parse(viewingData.customFields || '{}');
                        return customData.fullStudentId || viewingData.studentId || 'N/A';
                      } catch (e) {
                        return viewingData.studentId || 'N/A';
                      }
                    })()}
                  </span>
                </div>
                {(() => {
                  try {
                    const customData = JSON.parse(viewingData.customFields || '{}');
                    const customDetails = customData.studentDetails || {};
                    
                    // Use enriched student data from API (fetched at load time)
                    const enrollmentNumber = viewingData.studentEnrollmentNumber || customDetails.enrollmentNumber;
                    const contactNumber = viewingData.studentContactNo || customDetails.contactNumber;
                    const department = viewingData.studentDepartment || customDetails.department;
                    const attendancePercentage = viewingData.studentAttendancePercentage !== undefined ? viewingData.studentAttendancePercentage : customDetails.attendancePercentage;
                    
                    // Try to get gender and address from student customFields
                    let gender = customDetails.gender;
                    let address = customDetails.address;
                    try {
                      if (viewingData.studentCustomFields) {
                        const studentCustom = typeof viewingData.studentCustomFields === 'string' 
                          ? JSON.parse(viewingData.studentCustomFields) 
                          : viewingData.studentCustomFields;
                        gender = gender || studentCustom.gender;
                        address = address || studentCustom.address;
                      }
                    } catch (e) {
                      // Silently fail if student customFields parsing fails
                    }
                    
                    // Only show the section if there's at least one detail
                    if (enrollmentNumber || contactNumber || gender || department || address || attendancePercentage !== undefined) {
                      return (
                        <>
                          <div style={{ backgroundColor: '#e3f2fd', padding: '10px', borderRadius: '4px', marginTop: '10px', marginBottom: '10px' }}>
                            <strong style={{ color: '#1976d2' }}>👤 Student Details (from Student Record):</strong>
                          </div>
                          {enrollmentNumber && (
                            <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', paddingLeft: '10px' }}>
                              <strong>Enrollment Number:</strong> {enrollmentNumber}
                            </div>
                          )}
                          {contactNumber && (
                            <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', paddingLeft: '10px' }}>
                              <strong>Contact Number:</strong> {contactNumber}
                            </div>
                          )}
                          {gender && (
                            <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', paddingLeft: '10px' }}>
                              <strong>Gender:</strong> {gender}
                            </div>
                          )}
                          {department && (
                            <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', paddingLeft: '10px' }}>
                              <strong>Department:</strong> {department}
                            </div>
                          )}
                          {address && (
                            <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', paddingLeft: '10px' }}>
                              <strong>Address:</strong> {address}
                            </div>
                          )}
                          {attendancePercentage !== undefined && (
                            <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', paddingLeft: '10px' }}>
                              <strong>Student Attendance:</strong> {attendancePercentage}%
                            </div>
                          )}
                        </>
                      );
                    }
                  } catch (e) {
                    console.warn('Error displaying student details:', e);
                  }
                  return null;
                })()}
                {(() => {
                  try {
                    const customData = JSON.parse(viewingData.customFields || '{}');
                    if (customData.studentDetails) {
                      const details = customData.studentDetails;
                      return (
                        <>
                          <div style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px', marginTop: '15px', marginBottom: '10px' }}>
                            <strong style={{ color: '#666' }}>📋 Original Student Information:</strong>
                          </div>
                          {details.originalProgram && (
                            <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', paddingLeft: '10px' }}>
                              <strong>Original Program:</strong> {details.originalProgram}
                            </div>
                          )}
                          {details.originalSemester && (
                            <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', paddingLeft: '10px' }}>
                              <strong>Original Semester:</strong> {details.originalSemester}
                            </div>
                          )}
                          {details.attendancePercentage !== undefined && (
                            <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', paddingLeft: '10px' }}>
                              <strong>Student Attendance:</strong> {details.attendancePercentage}%
                            </div>
                          )}
                        </>
                      );
                    }
                  } catch (e) {
                    // Silently fail
                  }
                  return null;
                })()}
                <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                  <strong>Program (Alumni):</strong> {viewingData.program}
                </div>
                <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                  <strong>Semester:</strong> {viewingData.semester}
                </div>
                <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                  <strong>Marks:</strong> {viewingData.marks ? viewingData.marks.toFixed(2) : 'N/A'}
                </div>
                <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                  <strong>Status:</strong> <span style={{
                    fontWeight: 'bold',
                    color: viewingData.passFail === 'Pass' ? '#4caf50' : viewingData.passFail === 'Fail' ? '#f44336' : '#999'
                  }}>
                    {viewingData.passFail || 'N/A'}
                  </span>
                </div>
                {(() => {
                  try {
                    const customData = JSON.parse(viewingData.customFields || '{}');
                    if (customData.backPaperSubjects && customData.backPaperSubjects.length > 0) {
                      return (
                        <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                          <strong>📚 Back Paper Subjects:</strong>
                          <div style={{ marginTop: '5px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {customData.backPaperSubjects.map((subject, index) => (
                              <span key={index} style={{
                                backgroundColor: '#fff3cd',
                                border: '1px solid #ffc107',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                fontSize: '13px'
                              }}>
                                {subject}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    }
                  } catch (e) {
                    // Silently fail
                  }
                  return null;
                })()}
                <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                  <strong>Join Date:</strong> {viewingData.joinDate || 'N/A'}
                </div>
                <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                  <strong>Passing Date:</strong> {viewingData.passingDate || 'N/A'}
                </div>
                <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                  <strong>Current Occupation:</strong> {viewingData.currentOccupation || 'N/A'}
                </div>
                <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                  <strong>Company:</strong> {viewingData.company || 'N/A'}
                </div>

                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => handleEditAlumni(viewingData)}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#ff9800',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    Edit Information
                  </button>
                  <button
                    onClick={handleCloseView}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              // EDIT MODE
              <form onSubmit={handleUpdateAlumni}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  {/* Basic Academic Info */}
                  <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Marks</label>
                    <input
                      type="number"
                      value={editFormData.marks}
                      onChange={(e) => setEditFormData({ ...editFormData, marks: e.target.value })}
                      placeholder="Enter marks"
                      step="0.01"
                      min="0"
                      max="100"
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
                  <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Pass/Fail</label>
                    <select
                      value={editFormData.passFail}
                      onChange={(e) => setEditFormData({ ...editFormData, passFail: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="">-- Select Status --</option>
                      <option value="Pass">Pass</option>
                      <option value="Fail">Fail</option>
                      <option value="BackPaper">Back Paper</option>
                    </select>
                  </div>

                  {/* Career Info */}
                  <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Current Occupation</label>
                    <input
                      type="text"
                      value={editFormData.currentOccupation}
                      onChange={(e) => setEditFormData({ ...editFormData, currentOccupation: e.target.value })}
                      placeholder="e.g., Software Engineer"
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
                  <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Company</label>
                    <input
                      type="text"
                      value={editFormData.company}
                      onChange={(e) => setEditFormData({ ...editFormData, company: e.target.value })}
                      placeholder="e.g., Google Inc."
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
                </div>

                {/* Back Paper Subjects */}
                {editFormData.passFail === 'BackPaper' && (
                  <div style={{ paddingBottom: '15px', marginBottom: '15px', padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '4px', border: '1px solid #90caf9' }}>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>📚 Back Paper Subjects</label>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                      <input
                        type="text"
                        value={editFormData.backPaperSubjectInput}
                        onChange={(e) => setEditFormData({ ...editFormData, backPaperSubjectInput: e.target.value })}
                        placeholder="Enter subject name"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddBackPaperSubjectEdit()}
                        style={{
                          flex: 1,
                          padding: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddBackPaperSubjectEdit}
                        style={{
                          padding: '8px 15px',
                          backgroundColor: '#2196f3',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        + Add Subject
                      </button>
                    </div>
                    {editFormData.backPaperSubjects.length > 0 && (
                      <div>
                        <label style={{ fontWeight: 'bold', fontSize: '12px', display: 'block', marginBottom: '5px' }}>Added Subjects:</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {editFormData.backPaperSubjects.map((subject, index) => (
                            <div
                              key={index}
                              style={{
                                backgroundColor: '#fff',
                                border: '1px solid #2196f3',
                                borderRadius: '4px',
                                padding: '5px 10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}
                            >
                              <span>{subject}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveBackPaperSubjectEdit(index)}
                                style={{
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  color: '#f44336',
                                  cursor: 'pointer',
                                  fontWeight: 'bold',
                                  fontSize: '16px',
                                  padding: '0'
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Add Custom Field Button */}
                <div style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #ddd' }}>
                  <button
                    type="button"
                    onClick={() => setShowCustomFieldsDialog(true)}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#ff9800',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}
                  >
                    + Add Custom Field
                  </button>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                  <button
                    type="submit"
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#4caf50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    ✓ Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#f9f9f9',
        borderRadius: '4px',
        border: '1px solid #ddd'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Search & Filter</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
          <select
            value={filterProgram}
            onChange={(e) => setFilterProgram(e.target.value)}
            style={{
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            <option value="">-- All Programs --</option>
            {programs.map(prog => (
              <option key={prog} value={prog}>{prog}</option>
            ))}
          </select>
          <select
            value={filterSemester}
            onChange={(e) => setFilterSemester(e.target.value)}
            style={{
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            <option value="">-- All Semesters --</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
              <option key={sem} value={sem}>Semester {sem}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            <option value="">-- All Status --</option>
            <option value="Pass">Pass</option>
            <option value="Fail">Fail</option>
            <option value="BackPaper">Back Paper</option>
          </select>
        </div>
      </div>

      {/* Alumni Table */}
      {loading ? (
        <p>Loading alumni records...</p>
      ) : filteredAlumni.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666' }}>No alumni records found</p>
      ) : (
        <div style={{
          overflowX: 'auto',
          backgroundColor: 'white',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <table className='alumni-table' style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '900px'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#2c3e50', color: 'white' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', borderRight: '1px solid #bbb' }}>Name</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', borderRight: '1px solid #bbb' }}>Student ID</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', borderRight: '1px solid #bbb', minWidth: '100px' }}>Program</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', borderRight: '1px solid #bbb', minWidth: '80px' }}>Semester</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', borderRight: '1px solid #bbb', minWidth: '80px' }}>Marks</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', borderRight: '1px solid #bbb', minWidth: '80px' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', borderRight: '1px solid #bbb', minWidth: '120px' }}>Passing Date</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', minWidth: '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlumni.map((alum, index) => (
                <tr key={alum.id} style={{
                  borderBottom: '1px solid #ddd',
                  backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white'
                }}>
                  <td style={{ padding: '12px', borderRight: '1px solid #ddd' }}>
                    <strong>{alum.studentName || 'N/A'}</strong>
                  </td>
                  <td style={{ padding: '12px', borderRight: '1px solid #ddd', fontSize: '13px', fontFamily: 'monospace' }}>
                    {(() => {
                      try {
                        const customData = JSON.parse(alum.customFields || '{}');
                        return customData.fullStudentId || alum.studentId || 'N/A';
                      } catch (e) {
                        return alum.studentId || 'N/A';
                      }
                    })()}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', borderRight: '1px solid #ddd' }}>
                    {alum.program}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', borderRight: '1px solid #ddd' }}>
                    {alum.semester}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', borderRight: '1px solid #ddd' }}>
                    {alum.marks ? alum.marks.toFixed(2) : '—'}
                  </td>
                  <td style={{
                    padding: '12px',
                    textAlign: 'center',
                    borderRight: '1px solid #ddd',
                    fontWeight: 'bold',
                    color: alum.passFail === 'Pass' ? '#4caf50' : alum.passFail === 'Fail' ? '#f44336' : '#999'
                  }}>
                    {alum.passFail || '—'}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', borderRight: '1px solid #ddd', fontSize: '13px' }}>
                    {alum.passingDate || '—'}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleViewAlumni(alum)}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#2196f3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        marginRight: '5px'
                      }}
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteAlumni(alum.id)}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p style={{ marginTop: '20px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
        Total alumni records: {filteredAlumni.length}
      </p>

      {/* Export Modal */}
      {showExportModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>Export Alumni Data</h2>
              <button
                onClick={() => setShowExportModal(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gap: '15px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Program</label>
                <select
                  value={exportFilters.program}
                  onChange={(e) => setExportFilters({ ...exportFilters, program: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">-- All Programs --</option>
                  {programs.map(prog => (
                    <option key={prog} value={prog}>{prog}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Status</label>
                <select
                  value={exportFilters.status}
                  onChange={(e) => setExportFilters({ ...exportFilters, status: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">-- All Status --</option>
                  <option value="Pass">Pass</option>
                  <option value="Fail">Fail</option>
                  <option value="BackPaper">Back Paper</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Year From</label>
                  <input
                    type="number"
                    min="2000"
                    max={new Date().getFullYear()}
                    value={exportFilters.yearFrom}
                    onChange={(e) => setExportFilters({ ...exportFilters, yearFrom: e.target.value })}
                    placeholder="e.g., 2020"
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

                <div>
                  <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Year To</label>
                  <input
                    type="number"
                    min="2000"
                    max={new Date().getFullYear()}
                    value={exportFilters.yearTo}
                    onChange={(e) => setExportFilters({ ...exportFilters, yearTo: e.target.value })}
                    placeholder="e.g., 2024"
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
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={exportAlumniData}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                📥 Export as CSV
              </button>
              <button
                onClick={() => setShowExportModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Fields Dialog */}
      {showCustomFieldsDialog && viewingData && editMode && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1001
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '30px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>Add Custom Field</h2>
              <button
                onClick={() => setShowCustomFieldsDialog(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gap: '15px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Field Name *</label>
                <input
                  type="text"
                  value={customFieldKey}
                  onChange={(e) => setCustomFieldKey(e.target.value)}
                  placeholder="e.g., certification, location"
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

              <div>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Field Value *</label>
                <textarea
                  value={customFieldValue}
                  onChange={(e) => setCustomFieldValue(e.target.value)}
                  placeholder="e.g., AWS Certified Developer"
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    fontFamily: 'Arial, sans-serif'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  if (!customFieldKey.trim() || !customFieldValue.trim()) {
                    alert('Please fill in both field name and value');
                    return;
                  }

                  try {
                    const currentCustomFields = JSON.parse(editFormData.customFields || '{}');
                    currentCustomFields[customFieldKey] = customFieldValue;
                    setEditFormData({
                      ...editFormData,
                      customFields: JSON.stringify(currentCustomFields)
                    });
                    setCustomFieldKey('');
                    setCustomFieldValue('');
                    setShowCustomFieldsDialog(false);
                    setMessage({ text: 'Custom field added successfully', type: 'success' });
                  } catch (error) {
                    alert('Error adding custom field: ' + error.message);
                  }
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                ✓ Add Field
              </button>
              <button
                onClick={() => setShowCustomFieldsDialog(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px'
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

export default AlumniManagement;
