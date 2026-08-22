import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { apiFetch, API_BASE_URL } from '../utils/apiClient';
import '../styles/assignments.css';

export default function AssignmentManagement() {
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterProgram, setFilterProgram] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [selectedAssignmentForSubmissions, setSelectedAssignmentForSubmissions] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const refreshIntervalRef = useRef(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectId: '',
    totalMarks: 100,
    dueDate: ''
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return; // Wait until token is available
    
    const initializeData = async () => {
      await fetchPrograms();
      await fetchAssignments();
    };
    
    initializeData();
    
    // Background refresh for new assignments every 10 seconds
    refreshIntervalRef.current = setInterval(() => {
      refreshAssignmentCount();
    }, 10000);
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [token]);

  const refreshAssignmentCount = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/assignments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const newAssignments = Array.isArray(response.data) ? response.data : [];
      
      setAssignments(newAssignments);
    } catch (err) {
      // Silent fail for background refresh
    }
  };

  const handleAssignmentTabClick = () => {
    // Placeholder function
  };

  const fetchPrograms = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/programs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = Array.isArray(response.data) ? response.data : [];
      console.log('Programs fetched:', data);
      setPrograms(data);
    } catch (error) {
      console.error('Error fetching programs:', error);
      setPrograms([]);
    }
  };

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/assignments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssignments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchSemesters = async (programName) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/attendance/program/${programName}/semesters`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // API returns {semesters: [1,2,3...], semesterCount: 8, program: "BCA"}
      const semesterList = response.data.semesters ? response.data.semesters : [];
      setSemesters(semesterList);
      setFilterSemester('');
      setFilterSubject('');
      setSubjects([]);
    } catch (error) {
      console.error('Error fetching semesters:', error);
      setSemesters([]);
    }
  };

  const handleFetchSubjects = async (programName, semesterId) => {
    try {
      if (!semesterId || !programName) {
        setSubjects([]);
        return;
      }
      // Fetch subjects for this program and semester
      const response = await axios.get(`${API_BASE_URL}/api/subjects/program/${programName}/semester/${semesterId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubjects(Array.isArray(response.data) ? response.data : []);
      setFilterSubject('');
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setSubjects([]);
    }
  };

  const handleViewSubmissions = async (assignment) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/submissions/assignment/${assignment.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedAssignmentForSubmissions(assignment);
      setSubmissions(Array.isArray(response.data) ? response.data : []);
      setShowSubmissionsModal(true);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      alert('Failed to load submissions');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_BASE_URL}/api/assignments/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Admin cannot create assignments
        alert('Admins can only view, edit, and delete assignments.');
        return;
      }
      fetchAssignments();
      resetForm();
    } catch (error) {
      console.error('Error saving assignment:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/assignments/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchAssignments();
      } catch (error) {
        console.error('Error deleting assignment:', error);
      }
    }
  };

  const handleEdit = (assignment) => {
    setFormData(assignment);
    setEditingId(assignment.id);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      subjectId: '',
      totalMarks: 100,
      dueDate: ''
    });
    setEditingId(null);
    setShowModal(false);
  };

  const getTeacherName = (assignment) => {
    return assignment.teacher?.user?.fullName || 'Unknown';
  };

  const getSubjectName = (assignment) => {
    return assignment.subject?.subjectName || 'Unknown';
  };

  const filteredAssignments = assignments.filter(assignment => {
    // Filter by program if selected
    if (filterProgram && assignment.subject?.program?.name !== filterProgram) {
      return false;
    }
    // Filter by semester if selected
    if (filterSemester && parseInt(assignment.subject?.semester) !== parseInt(filterSemester)) {
      return false;
    }
    // Filter by subject if selected
    if (filterSubject && assignment.subject?.id !== parseInt(filterSubject)) {
      return false;
    }
    return true;
  });

  return (
    <div className="assignment-container">
      <div className="assignment-header">
        <h2>📚 Assignment Management</h2>
      </div>

      {/* Filters */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px'
      }}>
        <div>
          <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px'}}>Program</label>
          <select 
            value={filterProgram} 
            onChange={(e) => {
              setFilterProgram(e.target.value);
              if (e.target.value) handleFetchSemesters(e.target.value);
            }}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            <option value="">-- All Programs --</option>
            {programs.map(prog => (
              <option key={prog.id} value={prog.name}>{prog.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px'}}>Semester</label>
          <select 
            value={filterSemester} 
            onChange={(e) => {
              const newSemester = e.target.value;
              setFilterSemester(newSemester);
              if (newSemester && filterProgram) handleFetchSubjects(filterProgram, newSemester);
              else setSubjects([]);
            }}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            <option value="">-- All Semesters --</option>
            {semesters.map(sem => (
              <option key={sem} value={sem}>Semester {sem}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px'}}>Subject</label>
          <select 
            value={filterSubject} 
            onChange={(e) => setFilterSubject(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            <option value="">-- All Subjects --</option>
            {subjects.map(subj => (
              <option key={subj.id} value={subj.id}>{subj.subjectName}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading assignments...</div>
      ) : (
        <div className="assignments-grid">
          {filteredAssignments.map(assignment => (
            <div key={assignment.id} className="assignment-card">
              <h3>{assignment.title}</h3>
              <p className="description">{assignment.description}</p>
              <div className="assignment-meta">
                <span>👨‍🏫 Teacher: {getTeacherName(assignment)}</span>
                <span>📌 Subject: {getSubjectName(assignment)}</span>
                <span>⭐ Marks: {assignment.maxScore}</span>
                <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
              </div>
              <div className="assignment-actions">
                <button className="btn-secondary" onClick={() => handleViewSubmissions(assignment)}>View Submissions</button>
                <button className="btn-secondary" onClick={() => handleEdit(assignment)}>Edit</button>
                <button className="btn-danger" onClick={() => handleDelete(assignment.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingId && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Edit Assignment</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Assignment Title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
              <input
                type="number"
                placeholder="Total Marks"
                value={formData.totalMarks}
                onChange={(e) => setFormData({...formData, totalMarks: parseInt(e.target.value)})}
              />
              <input
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
              />
              <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
                <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>
                <button type="submit" className="btn-primary">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSubmissionsModal && selectedAssignmentForSubmissions && (
        <div className="modal-overlay" onClick={() => setShowSubmissionsModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '900px', maxHeight: '80vh', overflowY: 'auto'}}>
            <h3>📋 Submissions - {selectedAssignmentForSubmissions.title}</h3>
            {submissions.length === 0 ? (
              <p>No submissions yet.</p>
            ) : (
              <div style={{overflowX: 'auto'}}>
                <table style={{width: '100%', borderCollapse: 'collapse', marginBottom: '20px'}}>
                  <thead>
                    <tr style={{backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd'}}>
                      <th style={{padding: '10px', textAlign: 'left', fontWeight: 'bold'}}>Student</th>
                      <th style={{padding: '10px', textAlign: 'left', fontWeight: 'bold'}}>Status</th>
                      <th style={{padding: '10px', textAlign: 'left', fontWeight: 'bold'}}>Submitted</th>
                      <th style={{padding: '10px', textAlign: 'left', fontWeight: 'bold'}}>Score</th>
                      <th style={{padding: '10px', textAlign: 'left', fontWeight: 'bold'}}>Late</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((submission, idx) => (
                      <tr key={idx} style={{borderBottom: '1px solid #ddd'}}>
                        <td style={{padding: '10px'}}>{submission.student?.user?.fullName || 'Unknown'}</td>
                        <td style={{padding: '10px'}}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor: submission.status === 'GRADED' ? '#d4edda' : submission.status === 'SUBMITTED' ? '#cfe2ff' : '#f8d7da',
                            color: submission.status === 'GRADED' ? '#155724' : submission.status === 'SUBMITTED' ? '#0c5460' : '#721c24'
                          }}>
                            {submission.status}
                          </span>
                        </td>
                        <td style={{padding: '10px'}}>
                          {submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : '-'}
                        </td>
                        <td style={{padding: '10px'}}>{submission.score !== null ? `${submission.score}/${selectedAssignmentForSubmissions.maxScore}` : '-'}</td>
                        <td style={{padding: '10px'}}>{submission.isLate ? '⚠️ Yes' : 'No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <button className="btn-secondary" onClick={() => setShowSubmissionsModal(false)} style={{marginTop: '10px'}}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

