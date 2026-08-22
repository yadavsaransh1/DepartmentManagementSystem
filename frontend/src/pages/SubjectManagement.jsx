import React, { useState, useEffect } from 'react';
import api from '../services/api';

export const SubjectManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTeacher, setFilterTeacher] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [formData, setFormData] = useState({
    subjectCode: '',
    subjectName: '',
    teacherId: '',
    semester: '',
    credits: '',
    course: '',
    description: '',
    programId: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [programFormData, setProgramFormData] = useState({
    name: '',
    semesterCount: null,
    description: '',
    isActive: true
  });
  const [editingProgramId, setEditingProgramId] = useState(null);

  // Fetch subjects, teachers, courses, and programs on mount
  useEffect(() => {
    fetchSubjects();
    fetchTeachers();
    fetchAvailableCourses();
    fetchPrograms();
  }, []);

  // Filter subjects based on search and filter criteria
  useEffect(() => {
    let filtered = subjects.filter(subject => {
      const matchesSearch = subject.subjectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           subject.subjectName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTeacher = !filterTeacher || subject.teacherId === parseInt(filterTeacher);
      const matchesCourse = !filterCourse || subject.course === filterCourse;
      return matchesSearch && matchesTeacher && matchesCourse;
    });
    setFilteredSubjects(filtered);
  }, [subjects, searchTerm, filterTeacher, filterCourse]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/subjects');
      const subjectsList = Array.isArray(response.data) ? response.data : [];
      setSubjects(subjectsList);
      console.log('Subjects fetched:', subjectsList);
    } catch (err) {
      console.error('Error fetching subjects:', err);
      setError('Failed to load subjects: ' + (err.response?.data?.error || err.message));
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await api.get('/teachers');
      const teachersList = Array.isArray(response.data) ? response.data : [];
      setTeachers(teachersList);
      console.log('Teachers fetched:', teachersList);
    } catch (err) {
      console.error('Error fetching teachers:', err);
      setTeachers([]);
    }
  };

  const fetchAvailableCourses = async () => {
    try {
      const response = await api.get('/subjects/user/courses-semesters');
      const result = response.data || {};
      const coursesList = Array.isArray(result.courses) ? result.courses : [];
      
      if (coursesList.length > 0) {
        setCourses(coursesList);
      } else {
        setCourses(['B.Tech', 'B.Sc', 'M.Tech', 'M.Sc', 'BBA']);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      // Use default courses on error
      setCourses(['B.Tech', 'B.Sc', 'M.Tech', 'M.Sc', 'BBA']);
    }
  };

  const fetchPrograms = async () => {
    try {
      const response = await api.get('/programs');
      setPrograms(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching programs:', err);
      setPrograms([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let updatedFormData = { ...formData, [name]: value };
    
    // Reset semester when program changes
    if (name === 'programId') {
      updatedFormData.semester = '';
    }
    
    setFormData(updatedFormData);
  };

  // Get semester count for selected program
  const getSelectedProgramSemesterCount = () => {
    const selectedProgram = programs.find(p => p.id === parseInt(formData.programId));
    return selectedProgram ? selectedProgram.semesterCount : 8;
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      
      if (!formData.subjectCode || !formData.subjectName || !formData.teacherId) {
        setError('Please fill in all required fields (Code, Name, Teacher)');
        return;
      }

      const submitData = {
        ...formData,
        teacherId: parseInt(formData.teacherId),
        semester: formData.semester ? parseInt(formData.semester) : null,
        credits: formData.credits ? parseInt(formData.credits) : null
      };

      console.log(editingId ? 'Updating subject:' : 'Submitting subject:', submitData);
      
      let response;
      if (editingId) {
        response = await api.put(`/subjects/${editingId}`, submitData);
        setSuccess('Subject updated successfully!');
      } else {
        response = await api.post('/subjects', submitData);
        setSuccess('Subject created successfully!');
      }
      
      console.log(editingId ? 'Subject updated:' : 'Subject created:', response.data);
      
      setFormData({
        subjectCode: '',
        subjectName: '',
        teacherId: '',
        semester: '',
        credits: '',
        course: '',
        description: '',
        programId: ''
      });
      setEditingId(null);
      setShowForm(false);
      
      setTimeout(() => {
        fetchSubjects();
        setSuccess('');
      }, 1500);
    } catch (err) {
      console.error(editingId ? 'Error updating subject:' : 'Error adding subject:', err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      setError((editingId ? 'Error updating' : 'Error adding') + ' subject: ' + errorMsg);
    }
  };

  const handleEditSubject = (subject) => {
    setEditingId(subject.id);
    setFormData({
      subjectCode: subject.subjectCode,
      subjectName: subject.subjectName,
      teacherId: subject.teacherId || '',
      semester: subject.semester || '',
      credits: subject.credits || '',
      course: subject.course || '',
      description: subject.description || '',
      programId: subject.programId || ''
    });
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      subjectCode: '',
      subjectName: '',
      teacherId: '',
      semester: '',
      credits: '',
      course: '',
      description: '',
      programId: ''
    });
    setShowForm(false);
  }

  const handleDeleteSubject = async (subjectId) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        setError('');
        setSuccess('');
        console.log('Deleting subject:', subjectId);
        await api.delete(`/subjects/${subjectId}`);
        setSuccess('Subject deleted successfully!');
        setTimeout(() => {
          fetchSubjects();
          setSuccess('');
        }, 1500);
      } catch (err) {
        console.error('Error deleting subject:', err);
        setError('Error deleting subject: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.fullName : 'Unknown';
  };

  const handleProgramSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!programFormData.name) {
        alert('Please enter program name');
        return;
      }

      // Prepare clean data for submission
      const submitData = {
        name: programFormData.name,
        semesterCount: programFormData.semesterCount || null,
        description: programFormData.description || '',
        isActive: programFormData.isActive !== undefined ? programFormData.isActive : true
      };

      if (editingProgramId) {
        await api.put(`/programs/${editingProgramId}`, submitData);
        setSuccess('Program updated successfully!');
      } else {
        await api.post('/programs', submitData);
        setSuccess('Program created successfully!');
      }

      setProgramFormData({ name: '', semesterCount: null, description: '', isActive: true });
      setEditingProgramId(null);
      setError('');
      setTimeout(() => setSuccess(''), 3000);
      fetchPrograms();
    } catch (err) {
      setError('Error saving program: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEditProgram = (program) => {
    setEditingProgramId(program.id);
    setProgramFormData({
      name: program.name || '',
      semesterCount: program.semesterCount || null,
      description: program.description || '',
      isActive: program.isActive !== undefined ? program.isActive : true
    });
  };

  const handleDeleteProgram = async (id) => {
    if (!window.confirm('Are you sure you want to delete this program?')) return;
    try {
      await api.delete(`/programs/${id}`);
      setSuccess('Program deleted successfully!');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
      fetchPrograms();
    } catch (err) {
      setError('Error deleting program: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCancelProgramEdit = () => {
    setEditingProgramId(null);
    setProgramFormData({ name: '', semesterCount: '', description: '', isActive: true });
  };

  return (
    <div className="management-container">
      <h1>📚 Course Management</h1>
      
      {error && <div className="error" style={{padding: '12px', marginBottom: '15px', backgroundColor: '#fee', color: '#c33', borderRadius: '4px'}}>{error}</div>}
      {success && <div className="success" style={{padding: '12px', marginBottom: '15px', backgroundColor: '#efe', color: '#3c3', borderRadius: '4px'}}>{success}</div>}

      <button className="action-btn" onClick={() => setShowProgramModal(true)} style={{marginBottom: '20px', marginRight: '10px',  padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
        ⚙️ Manage Programs
      </button>

      <button className="action-btn" onClick={() => setShowForm(!showForm)} style={{marginBottom: '20px', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
        {showForm && editingId ? 'Cancel Edit' : showForm ? 'Cancel' : '+ Add Course'}
      </button>

      {showForm && (
        <div className="form-box" style={{border: '1px solid #ddd', padding: '20px', marginBottom: '20px', borderRadius: '4px'}}>
          <h3>{editingId ? 'Edit Course' : 'Add New Course'}</h3>
          <form onSubmit={handleAddSubject} style={{display: 'grid', gap: '12px'}}>
            <div style={{backgroundColor: '#f8f9fa', padding: '12px', borderRadius: '4px', border: '1px solid #e9ecef'}}>
              <h4 style={{margin: '0 0 12px 0', color: '#495057'}}>Step 1: Select Program & Semester</h4>
              
              <div>
                <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>Program *</label>
                <select
                  name="programId"
                  value={formData.programId}
                  onChange={handleInputChange}
                  required
                  style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
                >
                  <option value="">Select Program</option>
                  {programs.map(prog => (
                    <option key={prog.id} value={prog.id}>{prog.name}</option>
                  ))}
                </select>
              </div>

              <div style={{marginTop: '12px'}}>
                <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>Semester *</label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  required
                  disabled={!formData.programId}
                  style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: !formData.programId ? '#f5f5f5' : 'white'}}
                >
                  <option value="">Select Semester (Choose Program First)</option>
                  {Array.from({length: getSelectedProgramSemesterCount()}, (_, i) => (
                    <option key={i+1} value={i+1}>
                      {i+1}{['st', 'nd', 'rd'][i] || 'th'} Semester
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{backgroundColor: '#f8f9fa', padding: '12px', borderRadius: '4px', border: '1px solid #e9ecef'}}>
              <h4 style={{margin: '0 0 12px 0', color: '#495057'}}>Step 2: Course Details</h4>
              
              <div>
                <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>Course Code *</label>
                <input
                  type="text"
                  name="subjectCode"
                  placeholder="Course Code (e.g., CS101)"
                  value={formData.subjectCode}
                  onChange={handleInputChange}
                  required
                  style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
                />
              </div>

              <div style={{marginTop: '12px'}}>
                <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>Course Name *</label>
                <input
                  type="text"
                  name="subjectName"
                  placeholder="Course Name (e.g., Data Structures)"
                  value={formData.subjectName}
                  onChange={handleInputChange}
                  required
                  style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
                />
              </div>
            </div>

            <div style={{backgroundColor: '#f8f9fa', padding: '12px', borderRadius: '4px', border: '1px solid #e9ecef'}}>
              <h4 style={{margin: '0 0 12px 0', color: '#495057'}}>Step 3: Teacher & Credits</h4>
              
              <div>
                <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>Teacher *</label>
                <select
                  name="teacherId"
                  value={formData.teacherId}
                  onChange={handleInputChange}
                  required
                  style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
                >
                  <option value="">Select Teacher</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{marginTop: '12px'}}>
                <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>Credits</label>
                <input
                  type="number"
                  name="credits"
                  placeholder="Credits (e.g., 3)"
                  value={formData.credits}
                  onChange={handleInputChange}
                  min="0"
                  style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
                />
              </div>
            </div>

            <div>
              <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>Description</label>
              <textarea
                name="description"
                placeholder="Subject Description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
              />
            </div>

            <button type="submit" style={{padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold'}}>
              {editingId ? 'Update Course' : 'Add Course'}
            </button>
          </form>
        </div>
      )}

      <div className="list-container">
        <div style={{marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px'}}>
          <div>
            <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>🔍 Search Courses</label>
            <input
              type="text"
              placeholder="Search by code or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px'}}
            />
          </div>
          <div>
            <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>👨‍🏫 Filter by Teacher</label>
            <select
              value={filterTeacher}
              onChange={(e) => setFilterTeacher(e.target.value)}
              style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px'}}
            >
              <option value="">All Teachers</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.fullName}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>📚 Filter by Program</label>
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px'}}
            >
              <option value="">All Programs</option>
              {programs.map((program) => (
                <option key={program.id} value={program.name || program.programName}>{program.name || program.programName}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p>Loading subjects...</p>
        ) : subjects.length === 0 ? (
          <p>No courses found. Add one to get started!</p>
        ) : filteredSubjects.length === 0 ? (
          <p>{subjects.length > 0 ? 'No courses match your filters.' : 'No courses found.'}</p>
        ) : (
          <table className='course-table' style={{width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
            <thead>
              <tr style={{backgroundColor: '#3671ac', borderBottom: '2px solid #dee2e6'}}>
                <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Code</th>
                <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Name</th>
                <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Teacher</th>
                <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Semester</th>
                <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Program</th>
                <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Credits</th>
                <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubjects.map(subject => (
                <tr key={subject.id} style={{borderBottom: '1px solid #dee2e6'}}>
                  <td style={{padding: '12px'}}>{subject.subjectCode}</td>
                  <td style={{padding: '12px'}}>{subject.subjectName}</td>
                  <td style={{padding: '12px'}}>{subject.teacherName || 'N/A'}</td>
                  <td style={{padding: '12px'}}>{subject.semester ? `Sem ${subject.semester}` : 'N/A'}</td>
                  <td style={{padding: '12px'}}>{subject.course || 'N/A'}</td>
                  <td style={{padding: '12px'}}>{subject.credits || 'N/A'}</td>
                  <td style={{padding: '12px'}}>
                    <button 
                      className="edit-btn"
                      onClick={() => handleEditSubject(subject)}
                      style={{padding: '6px 12px', backgroundColor: '#ffc107', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', marginRight: '5px'}}
                    >
                      Edit
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteSubject(subject.id)}
                      style={{padding: '6px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'}}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Program Management Modal */}
      {showProgramModal && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
          <div style={{backgroundColor: 'white', padding: '30px', borderRadius: '8px', maxWidth: '600px', width: '90%', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.2)'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
              <h2 style={{margin: 0}}>🎓 Manage Programs</h2>
              <button 
                onClick={() => {
                  setShowProgramModal(false);
                  handleCancelProgramEdit();
                }}
                style={{backgroundColor: '#ddd', border: 'none', borderRadius: '4px', padding: '8px 15px', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold'}}
              >
                ✕
              </button>
            </div>

            {error && <div style={{padding: '12px', marginBottom: '15px', backgroundColor: '#fee', color: '#c33', borderRadius: '4px'}}>{error}</div>}
            {success && <div style={{padding: '12px', marginBottom: '15px', backgroundColor: '#efe', color: '#3c3', borderRadius: '4px'}}>{success}</div>}

            {/* Add/Edit Program Form */}
            <div style={{backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '4px', marginBottom: '20px', border: '1px solid #dee2e6'}}>
              <h3>{editingProgramId ? 'Edit Program' : 'Add New Program'}</h3>
              <form onSubmit={handleProgramSubmit} style={{display: 'grid', gap: '12px'}}>
                <div>
                  <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>Program Name *</label>
                  <input
                    type="text"
                    value={programFormData.name}
                    onChange={(e) => setProgramFormData({...programFormData, name: e.target.value})}
                    placeholder="e.g., B.Tech, BBA, M.Sc"
                    required
                    style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
                  />
                </div>
                <div>
                  <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>Semester Count</label>
                  <input
                    type="number"
                    value={programFormData.semesterCount || ''}
                    onChange={(e) => setProgramFormData({...programFormData, semesterCount: e.target.value ? parseInt(e.target.value) : null})}
                    placeholder="e.g., 8"
                    min="1"
                    style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
                  />
                </div>
                <div>
                  <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>Description</label>
                  <textarea
                    value={programFormData.description}
                    onChange={(e) => setProgramFormData({...programFormData, description: e.target.value})}
                    placeholder="Program description"
                    rows="3"
                    style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
                  />
                </div>
                <div style={{display: 'flex', gap: '10px'}}>
                  <button type="submit" style={{flex: 1, padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'}}>
                    {editingProgramId ? 'Update Program' : 'Add Program'}
                  </button>
                  {editingProgramId && (
                    <button type="button" onClick={handleCancelProgramEdit} style={{flex: 1, padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'}}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Programs List */}
            <h3>Programs List</h3>
            {programs.length === 0 ? (
              <p>No programs found. Add one to get started!</p>
            ) : (
              <table style={{width: '100%', borderCollapse: 'collapse', backgroundColor: 'white'}}>
                <thead>
                  <tr style={{backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6'}}>
                    <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Name</th>
                    <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Semesters</th>
                    <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {programs.map(program => (
                    <tr key={program.id} style={{borderBottom: '1px solid #dee2e6'}}>
                      <td style={{padding: '12px'}}>{program.name}</td>
                      <td style={{padding: '12px'}}>{program.semesterCount || 'N/A'}</td>
                      <td style={{padding: '12px'}}>
                        <button 
                          onClick={() => handleEditProgram(program)}
                          style={{padding: '6px 12px', backgroundColor: '#ffc107', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', marginRight: '5px'}}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteProgram(program.id)}
                          style={{padding: '6px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'}}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectManagement;
