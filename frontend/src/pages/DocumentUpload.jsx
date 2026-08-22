import React, { useState, useEffect } from 'react';
import api from '../services/api';

export const DocumentUpload = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'LECTURE_NOTES',
    otherCategoryValue: '',
    visibility: 'PUBLIC',
    allowedRoles: '',
    allowedUserIds: '',
    allowedCourses: '',
  });
  const [file, setFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

  // Academic categories that should NOT be shown by teachers in their upload list
  const ACADEMIC_CATEGORIES = ['CERTIFICATE', 'RESULT', 'IDENTITY', 'ADMISSION'];
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [selectedPrograms, setSelectedPrograms] = useState(new Set());
  const [selectedSemesters, setSelectedSemesters] = useState(new Set());
  const [expandedProgram, setExpandedProgram] = useState(null);
  const [programSemesters, setProgramSemesters] = useState({}); // Map of programId -> semesters array

  // Fetch documents and users on mount
  useEffect(() => {
    fetchDocuments();
    fetchUsers();
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const response = await api.get('/programs');
      let data = response.data;
      
      data = Array.isArray(data) ? data : [];
      
      console.log('✓ Fetched programs:', data);
      console.log('✓ Programs count:', data.length);
      setPrograms(data);
    } catch (error) {
      console.error('Error fetching programs:', error);
      setPrograms([]);
    }
  };

  // Fetch semesters for a specific program (like AdminMarksManagement does)
  const fetchSemestersForProgram = async (programId) => {
    try {
      const response = await api.get(`/programs/${programId}/semesters`);
      const semesterList = Array.isArray(response.data) ? response.data : [];
      
      console.log(`✓ Fetched semesters for program ${programId}:`, semesterList);
      
      // Store in map
      setProgramSemesters(prev => ({
        ...prev,
        [programId]: semesterList
      }));
      
      return semesterList;
    } catch (error) {
      console.error(`Error fetching semesters for program ${programId}:`, error);
      setProgramSemesters(prev => ({
        ...prev,
        [programId]: []
      }));
      return [];
    }
  };

  const generateDefaultCourses = () => {
    const defaultCourses = [
      { id: '', course: '', name: '' }
    ];
    return defaultCourses;
  };

  // Filter documents when search, category, or date filter changes
  useEffect(() => {
    let filtered = documents.filter(doc => {
      const docTitle = doc.title || doc.documentName || '';
      const matchesSearch = docTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !filterCategory || doc.category === filterCategory;
      
      let matchesDate = true;
      if (filterStartDate || filterEndDate) {
        const docDate = doc.createdAt ? new Date(doc.createdAt) : 
                       doc.uploadmentDate ? new Date(doc.uploadmentDate) : null;
        if (!docDate) matchesDate = false;
        else {
          if (filterStartDate) {
            const startDate = new Date(filterStartDate);
            if (docDate < startDate) matchesDate = false;
          }
          if (filterEndDate) {
            const endDate = new Date(filterEndDate);
            endDate.setHours(23, 59, 59, 999);
            if (docDate > endDate) matchesDate = false;
          }
        }
      }
      
      return matchesSearch && matchesCategory && matchesDate;
    });
    
    // Sort by most recent first (descending by createdAt)
    filtered = filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.uploadmentDate || 0).getTime();
      const dateB = new Date(b.createdAt || b.uploadmentDate || 0).getTime();
      return dateB - dateA; // Most recent first
    });
    
    setFilteredDocuments(filtered);
  }, [documents, searchTerm, filterCategory, filterStartDate, filterEndDate]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError('');
      // Fetch study materials (now in separate endpoint)
      // Backend handles visibility/access control so we don't need to filter
      const response = await api.get('/study-materials');
      let docsList = Array.isArray(response.data) ? response.data : [];
      
      // Sort by most recent first (descending by createdAt)
      docsList = docsList.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.uploadmentDate || 0).getTime();
        const dateB = new Date(b.createdAt || b.uploadmentDate || 0).getTime();
        return dateB - dateA; // Most recent first
      });
      
      setDocuments(docsList);
      console.log('Study Materials fetched:', docsList);
    } catch (err) {
      console.error('Error fetching study materials:', err);
      setError('Failed to load study materials: ' + (err.response?.data?.error || err.message));
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const studentsRes = await api.get('/students');
      const teachersRes = await api.get('/teachers');
      const allUsers = [
        ...(Array.isArray(studentsRes.data) ? studentsRes.data : []).map(s => ({ id: s.id, name: s.fullName, email: s.email, type: 'STUDENT' })),
        ...(Array.isArray(teachersRes.data) ? teachersRes.data : []).map(t => ({ id: t.id, name: t.fullName, email: t.email, type: 'TEACHER' }))
      ];
      setUsers(allUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'visibility') {
      // Reset visibility-dependent states when visibility changes
      setSelectedPrograms(new Set());
      setSelectedSemesters(new Set());
      setExpandedProgram(null);
      setSelectedUsers([]);
      // Reset visibility-related form fields
      setFormData({
        ...formData,
        [name]: value,
        allowedRoles: '',
        allowedCourses: '',
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUserToggle = (userEmail) => {
    setSelectedUsers(prev => 
      prev.includes(userEmail) 
        ? prev.filter(email => email !== userEmail)
        : [...prev, userEmail]
    );
  };

  const handleCourseToggle = (courseId) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleCourseAdd = () => {
    const semesters = Array.isArray(selectedSemester) ? selectedSemester : (selectedSemester ? [selectedSemester] : []);
    
    if (semesters.length === 0) {
      setError('Please select at least one semester');
      return;
    }
    
    if (selectedCourses.length === 0) {
      setError('Please select at least one course');
      return;
    }

    // Create course:semester combinations for all selected combinations
    const newSelections = [];
    selectedCourses.forEach(course => {
      semesters.forEach(sem => {
        const combination = `${course}:${sem}`;
        newSelections.push(combination);
      });
    });
    
    // Check if already added
    const newSelections_unique = newSelections.filter(sel => 
      !formData.allowedCourses.includes(sel)
    );
    
    if (newSelections_unique.length > 0) {
      const updated = formData.allowedCourses 
        ? formData.allowedCourses + ',' + newSelections_unique.join(',')
        : newSelections_unique.join(',');
      
      setFormData({ ...formData, allowedCourses: updated });
      setSelectedCourses([]);
      setSelectedSemester('');
      setError('');
    }
  };

  const handleRemoveCourseSelection = (idx) => {
    const selections = formData.allowedCourses.split(',');
    selections.splice(idx, 1);
    setFormData({ ...formData, allowedCourses: selections.join(',') });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    if (!formData.title.trim()) {
      setError('Please enter document title');
      return;
    }

    if (formData.category === 'OTHER' && !formData.otherCategoryValue.trim()) {
      setError('Please specify the category');
      return;
    }

    if (formData.visibility === 'COURSE' && !formData.allowedCourses) {
      setError('Please select at least one program-semester combination for course-based visibility');
      return;
    }

    if (formData.visibility === 'PRIVATE' && selectedUsers.length === 0) {
      setError('Please select at least one user for private visibility');
      return;
    }

    try {
      setMessage('');
      setError('');
      
      const formDataObj = new FormData();
      formDataObj.append('file', file);
      formDataObj.append('title', formData.title);
      formDataObj.append('description', formData.description);
      formDataObj.append('category', formData.category);
      formDataObj.append('otherCategoryValue', formData.otherCategoryValue);
      formDataObj.append('visibility', formData.visibility);
      formDataObj.append('uploadedBy', user.email);
      
      if (formData.visibility === 'RESTRICTED' && formData.allowedRoles) {
        formDataObj.append('allowedRoles', formData.allowedRoles);
      }
      
      if (formData.visibility === 'PRIVATE' && selectedUsers.length > 0) {
        formDataObj.append('allowedUserEmails', selectedUsers.join(','));
      }

      if (formData.visibility === 'COURSE' && formData.allowedCourses) {
        formDataObj.append('allowedCourses', formData.allowedCourses);
      }

      console.log('Uploading document with visibility:', formData.visibility);
      
      // Choose endpoint based on category
      // Study material categories go to /study-materials
      // Academic categories go to /documents
      const studyMaterialCategories = ['LECTURE_NOTES', 'ASSIGNMENT', 'SYLLABUS', 'EXAM_PAPER', 'REFERENCE', 'OTHER'];
      const endpoint = studyMaterialCategories.includes(formData.category) 
        ? '/study-materials/upload' 
        : '/documents/upload';
      
      const response = await api.post(endpoint, formDataObj, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      console.log('Upload response:', response.data);
      setMessage('Document uploaded successfully!');
      setFormData({
        title: '',
        description: '',
        category: 'LECTURE_NOTES',
        otherCategoryValue: '',
        visibility: 'PUBLIC',
        allowedRoles: '',
        allowedUserIds: '',
        allowedCourses: '',
      });
      setFile(null);
      setSelectedUsers([]);
      setSelectedPrograms(new Set());
      setSelectedSemesters(new Set());
      setExpandedProgram(null);

      // Refresh documents list
      setTimeout(() => {
        fetchDocuments();
        setMessage('');
      }, 1500);
    } catch (err) {
      console.error('Error uploading document:', err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      setError('Error uploading document: ' + errorMsg);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        setError('');
        setMessage('');
        console.log('Deleting study material:', docId);
        // Delete from /study-materials endpoint (not /documents)
        // since we fetch from /study-materials
        await api.delete(`/study-materials/${docId}`);
        setMessage('Study material deleted successfully!');
        setTimeout(() => {
          fetchDocuments();
          setMessage('');
        }, 1500);
      } catch (err) {
        console.error('Error deleting study material:', err);
        setError('Error deleting study material: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  return (
    <div className="document-container">
      <h1>Study Material</h1>
      
      {message && <div className="success" style={{padding: '12px', marginBottom: '15px', backgroundColor: '#efe', color: '#3c3', borderRadius: '4px'}}>{message}</div>}
      {error && <div className="error" style={{padding: '12px', marginBottom: '15px', backgroundColor: '#fee', color: '#c33', borderRadius: '4px'}}>{error}</div>}
      
      <form onSubmit={handleSubmit} className="form-box" style={{border: '1px solid #ddd', padding: '20px', marginBottom: '20px', borderRadius: '4px'}}>
        <h3>Upload Study Material</h3>
        
        <div style={{display: 'grid', gap: '12px'}}>
          <div>
            <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>Study Material Title *</label>
            <input
              type="text"
              name="title"
              placeholder="Document Title"
              value={formData.title}
              onChange={handleChange}
              required
              style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
            />
          </div>
          
          <div>
            <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>Description</label>
            <textarea
              name="description"
              placeholder="Description (optional)"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontFamily: 'inherit', resize: 'vertical'}}
            ></textarea>
          </div>
          
          <div>
            <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>Category</label>
            <select name="category" value={formData.category} onChange={handleChange} style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}>
              <option value="LECTURE_NOTES">Lecture Notes</option>
              <option value="ASSIGNMENT">Assignment</option>
              <option value="SYLLABUS">Syllabus</option>
              <option value="EXAM_PAPER">Exam Paper</option>
              <option value="REFERENCE">Reference Material</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {formData.category === 'OTHER' && (
            <div>
              <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>Please Specify *</label>
              <input
                type="text"
                name="otherCategoryValue"
                placeholder="e.g., Class Notes, Study Guide"
                value={formData.otherCategoryValue}
                onChange={handleChange}
                required={formData.category === 'OTHER'}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: formData.category === 'OTHER' && !formData.otherCategoryValue ? '2px solid #d32f2f' : '1px solid #ddd',
                  borderRadius: '4px',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          )}

          <div>
            <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>Visibility</label>
            <select name="visibility" value={formData.visibility} onChange={handleChange} style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}>
              <option value="PUBLIC">Public (Everyone)</option>
              <option value="RESTRICTED">Restricted (By Role)</option>
              <option value="PRIVATE">Tagged Members Only</option>
              <option value="COURSE">Course Members Only</option>
            </select>
          </div>

          {formData.visibility === 'RESTRICTED' && (
            <div>
              <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '8px'}}>Select Roles:</label>
              <div style={{border: '1px solid #ddd', borderRadius: '4px', padding: '12px', backgroundColor: '#f9f9f9'}}>
                <div style={{display: 'flex', gap: '8px', marginBottom: '10px'}}>
                  <button
                    type="button"
                    onClick={() => {
                      handleChange({target: {name: 'allowedRoles', value: 'ADMIN,TEACHER,STUDENT,HOD,ALUMNI'}});
                    }}
                    style={{padding: '6px 12px', fontSize: '11px', backgroundColor: '#667eea', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '3px', fontWeight: 'bold'}}
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleChange({target: {name: 'allowedRoles', value: ''}});
                    }}
                    style={{padding: '6px 12px', fontSize: '11px', backgroundColor: '#f44336', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '3px', fontWeight: 'bold'}}
                  >
                    Deselect All
                  </button>
                </div>
                {['STUDENT', 'TEACHER'].map(role => (
                  <label key={role} style={{display: 'flex', alignItems: 'center', marginBottom: '8px', cursor: 'pointer', fontSize: '12px'}}>
                    <input
                      type="checkbox"
                      checked={formData.allowedRoles.includes(role)}
                      onChange={(e) => {
                        const roles = formData.allowedRoles ? formData.allowedRoles.split(',') : [];
                        const newRoles = e.target.checked
                          ? [...roles, role]
                          : roles.filter(r => r !== role);
                        handleChange({target: {name: 'allowedRoles', value: newRoles.join(',')}});
                      }}
                      style={{marginRight: '8px', width: '14px', height: '14px', cursor: 'pointer'}}
                    />
                    {role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()}
                  </label>
                ))}
              </div>
            </div>
          )}

          {formData.visibility === 'COURSE' && (
            <div>
              <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '8px'}}>Select Program and Semester</label>
              
                <div style={{border: '1px solid #ddd', borderRadius: '4px', padding: '15px', backgroundColor: '#fafafa', marginBottom: '15px'}}>
                {/* Program/Course Selection with Nested Semesters - Similar to NotificationCenter */}
                <label style={{fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '10px'}}>Programs & Semesters:</label>
                <div style={{maxHeight: '300px', overflowY: 'auto', border: '1px solid #ccc', borderRadius: '3px', padding: '8px', backgroundColor: 'white'}}>
                  {programs && programs.length > 0 ? (
                    programs.map(program => (
                      <div key={program.id} style={{marginBottom: '10px', padding: '8px', backgroundColor: '#f9f9f9', borderRadius: '3px'}}>
                        <label style={{display: 'flex', alignItems: 'center', marginBottom: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold'}}>
                          <input
                            type="checkbox"
                            checked={selectedPrograms.has(program.id)}
                            onChange={async (e) => {
                              const newSelected = new Set(selectedPrograms);
                              if (e.target.checked) {
                                newSelected.add(program.id);
                                // Fetch semesters for this program
                                await fetchSemestersForProgram(program.id);
                              } else {
                                newSelected.delete(program.id);
                                // Clear expanded state if unchecked
                                if (expandedProgram === program.id) {
                                  setExpandedProgram(null);
                                }
                              }
                              setSelectedPrograms(newSelected);
                            }}
                            style={{marginRight: '6px', cursor: 'pointer', width: '14px', height: '14px'}}
                          />
                          {program.name || program.programName}
                          {programSemesters[program.id] && Array.isArray(programSemesters[program.id]) && programSemesters[program.id].length > 0 && (
                            <button
                              type="button"
                              onClick={() => setExpandedProgram(expandedProgram === program.id ? null : program.id)}
                              style={{
                                marginLeft: '8px',
                                padding: '2px 8px',
                                backgroundColor: '#667eea',
                                color: 'white',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: 'pointer',
                                fontSize: '11px',
                                fontWeight: 'bold'
                              }}
                            >
                              {expandedProgram === program.id ? '▼ Hide' : '▶ Show'} Semesters
                            </button>
                          )}
                        </label>
                        {/* Show semesters if program is expanded - semesters fetched from backend based on program's semesterCount */}
                        {expandedProgram === program.id && programSemesters[program.id] && Array.isArray(programSemesters[program.id]) && programSemesters[program.id].length > 0 && (
                          <div style={{marginLeft: '22px', borderLeft: '2px solid #ddd', paddingLeft: '8px', marginTop: '8px'}}>
                            {programSemesters[program.id].map(semNum => {
                              const semId = `${program.id}:${semNum}`;
                              return (
                                <label key={semId} style={{display: 'flex', alignItems: 'center', marginBottom: '4px', cursor: 'pointer', fontSize: '12px'}}>
                                  <input
                                    type="checkbox"
                                    checked={selectedSemesters.has(semId) && selectedPrograms.has(program.id)}
                                    onChange={(e) => {
                                      // Only allow semester selection if program is checked
                                      if (!selectedPrograms.has(program.id)) {
                                        return;
                                      }
                                      const newSelected = new Set(selectedSemesters);
                                      if (e.target.checked) {
                                        newSelected.add(semId);
                                      } else {
                                        newSelected.delete(semId);
                                      }
                                      setSelectedSemesters(newSelected);
                                    }}
                                    disabled={!selectedPrograms.has(program.id)}
                                    style={{marginRight: '6px', cursor: selectedPrograms.has(program.id) ? 'pointer' : 'not-allowed', width: '13px', height: '13px', opacity: selectedPrograms.has(program.id) ? 1 : 0.5}}
                                  />
                                  Semester {semNum}
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p style={{margin: '0', fontSize: '12px', color: '#999'}}>No programs available</p>
                  )}
                </div>

                {/* Add Button */}
                <button
                  type="button"
                  onClick={() => {
                    // Convert selectedPrograms and selectedSemesters to allowedCourses format
                    const selections = Array.from(selectedSemesters);
                    if (selections.length === 0) {
                      setError('Please select at least one program and semester combination');
                      return;
                    }
                    
                    const updated = formData.allowedCourses 
                      ? formData.allowedCourses + ',' + selections.join(',')
                      : selections.join(',');
                    
                    setFormData({ ...formData, allowedCourses: updated });
                    setSelectedPrograms(new Set());
                    setSelectedSemesters(new Set());
                    setExpandedProgram(null);
                    setError('');
                  }}
                  style={{
                    width: '100%',
                    padding: '8px',
                    marginTop: '12px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  + Add Program-Semester
                </button>
              </div>

              {/* Selected Programs Display */}
              {formData.allowedCourses && (
                <div>
                  <label style={{fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '6px'}}>Selected Program-Semester Combinations:</label>
                  <div style={{backgroundColor: '#e8f5e9', border: '1px solid #4caf50', borderRadius: '4px', padding: '10px'}}>
                    {formData.allowedCourses.split(',').map((selection, idx) => {
                      const [programId, semId] = selection.split(':');
                      const program = programs.find(p => p.id == programId);
                      const semester = program?.semesters?.find(s => s.id == semId);
                      
                      return (
                        <div key={idx} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: idx < formData.allowedCourses.split(',').length - 1 ? '1px solid #ddd' : 'none', fontSize: '12px'}}>
                          <span>
                            <strong>{program?.name || program?.programName || programId}</strong> - {semester?.name || `Semester ${semester?.semesterNumber || semId}`}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCourseSelection(idx)}
                            style={{padding: '2px 8px', backgroundColor: '#ff5252', color: 'white', border: 'none', borderRadius: '2px', cursor: 'pointer', fontSize: '10px'}}
                          >
                            Remove
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {formData.visibility === 'PRIVATE' && (
            <div>
              <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '8px'}}>Tag Members</label>
              <div style={{border: '1px solid #ddd', borderRadius: '4px', padding: '12px', backgroundColor: '#f9f9f9'}}>
                <div style={{display: 'flex', gap: '8px', marginBottom: '10px'}}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUsers(users.map(u => u.email || u.id));
                    }}
                    style={{padding: '6px 12px', fontSize: '11px', backgroundColor: '#667eea', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '3px', fontWeight: 'bold'}}
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUsers([]);
                    }}
                    style={{padding: '6px 12px', fontSize: '11px', backgroundColor: '#f44336', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '3px', fontWeight: 'bold'}}
                  >
                    Deselect All
                  </button>
                </div>
                <div style={{maxHeight: '200px', overflowY: 'auto'}}>
                  {users.map(u => (
                    <label key={u.email || `${u.type}-${u.id}`} style={{display: 'flex', alignItems: 'center', marginBottom: '8px', cursor: 'pointer', fontSize: '12px'}}>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(u.email || u.id)}
                        onChange={() => handleUserToggle(u.email || u.id)}
                        style={{marginRight: '8px', width: '14px', height: '14px', cursor: 'pointer'}}
                      />
                      {u.name || u.fullName} <span style={{fontSize: '11px', color: '#666', marginLeft: '6px'}}>({u.type})</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div>
            <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>Select File *</label>
            <input
              type="file"
              onChange={handleFileChange}
              required
              style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
            />
            {file && <p style={{fontSize: '12px', color: '#666', marginTop: '5px'}}>✓ Selected: {file.name}</p>}
          </div>
          
          <button type="submit" style={{padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold'}}>
            Upload Study Material
          </button>
        </div>
      </form>

      <div className="list-container" style={{marginTop: '30px'}}>
        <h3>Uploaded Study Material</h3>
        
        <div style={{marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px'}}>
          <div>
            <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>🔍 Search Study Material</label>
            <input
              type="text"
              placeholder="Search by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px'}}
            />
          </div>
          <div>
            <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>📂 Filter by Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px'}}
            >
              <option value="">All Categories</option>
              <option value="LECTURE_NOTES">Lecture Notes</option>
              <option value="ASSIGNMENT">Assignment</option>
              <option value="SYLLABUS">Syllabus</option>
              <option value="EXAM_PAPER">Exam Paper</option>
              <option value="REFERENCE">Reference Material</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px'}}> From Date</label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px'}}
            />
          </div>
          <div>
            <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px'}}> To Date</label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px'}}
            />
          </div>
        </div>

        {loading ? (
          <p>Loading study material...</p>
        ) : filteredDocuments.length === 0 ? (
          <p>{documents.length === 0 ? 'No study material uploaded yet.' : 'No study material matches your search criteria.'}</p>
        ) : (
          <table className='document-table' style={{width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
            <thead>
              <tr style={{backgroundColor: '#0884ff', borderBottom: '2px solid #dee2e6'}}>
                <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Title</th>
                <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Category</th>
                <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Visibility</th>
                <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Uploaded By</th>
                <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Date</th>
                <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map(doc => (
                <tr key={doc.id} style={{borderBottom: '1px solid #dee2e6'}}>
                  <td style={{padding: '12px'}}>{doc.title || doc.documentName}</td>
                  <td style={{padding: '12px'}}><span style={{backgroundColor: '#e3f2fd', padding: '2px 8px', borderRadius: '3px', fontSize: '11px'}}>
                    {doc.category === 'OTHER' && doc.otherCategoryValue 
                      ? `Other (${doc.otherCategoryValue})` 
                      : doc.category || 'N/A'}
                  </span></td>
                  <td style={{padding: '12px'}}><span style={{backgroundColor: '#f3e5f5', padding: '2px 8px', borderRadius: '3px', fontSize: '11px'}}>{doc.visibility || 'PUBLIC'}</span></td>
                  <td style={{padding: '12px'}}>{doc.uploadedByEmail || doc.uploadedByName || 'Unknown'}</td>
                  <td style={{padding: '12px'}}>
                    {doc.createdAt || doc.uploadmentDate 
                      ? new Date(doc.createdAt || doc.uploadmentDate).toLocaleDateString()
                      : 'N/A'
                    }
                  </td>
                  <td style={{padding: '12px'}}>
                    <button 
                      className="download-btn"
                      onClick={() => window.open(`/api/documents/${doc.id}/download`, '_blank')}
                      style={{padding: '6px 12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'}}
                    >
                       Download
                    </button>
                    {(doc.uploadedByEmail === user.email || user.role === 'ADMIN') && (
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteDocument(doc.id)}
                        style={{marginLeft: '5px', padding: '6px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'}}
                      >
                         Delete
                      </button>
                    )}
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

export default DocumentUpload;
