import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { API_BASE_URL } from '../utils/apiClient';
import '../styles/assignments.css';

export const TeacherAssignmentManagement = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [visibleToAllStudents, setVisibleToAllStudents] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [assignmentFile, setAssignmentFile] = useState(null);
  const [refreshIntervalRef, setRefreshIntervalRef] = useState(null);
  const [lastCheckedSubmissions, setLastCheckedSubmissions] = useState({});
  const [teacherId, setTeacherId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    subjectId: '',
    dueDate: '',
    maxScore: 100
  });

  useEffect(() => {
    const initializeData = async () => {
      try {
        // First, get teacher profile to get numeric ID
        const profileRes = await api.get('/teachers/profile');
        const numericTeacherId = profileRes.data.id;
        setTeacherId(numericTeacherId);

        // Then fetch data using the numeric ID
        fetchData(numericTeacherId);
      } catch (err) {
        console.error('Error initializing:', err);
        setError('Failed to load teacher profile');
        setLoading(false);
      }
    };

    initializeData();
    
    // Background refresh for submissions every 10 seconds
    const interval = setInterval(() => {
      if (teacherId) {
        refreshSubmissions();
      }
    }, 10000);
    setRefreshIntervalRef(interval);
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  const refreshSubmissions = async () => {
    try {
      if (assignments.length > 0) {
        // Fetch all submissions for all assignments
        const allSubmissions = [];
        for (const assignment of assignments) {
          try {
            const submissionRes = await api.get(`/submissions/assignment/${assignment.id}`);
            allSubmissions.push(...(Array.isArray(submissionRes.data) ? submissionRes.data : []));
          } catch (err) {
            // Continue if one fails
          }
        }
        
        setSubmissions(allSubmissions);
      }
    } catch (err) {
      // Silent fail for background refresh
    }
  };

  const fetchStudentsBySubject = async (subjectId) => {
    try {
      const studentsRes = await api.get(`/students/subject/${subjectId}`);
      const studentList = Array.isArray(studentsRes.data) ? studentsRes.data : [];
      setStudents(studentList);
      // Select all students by default
      setSelectedStudents(new Set(studentList.map(s => s.id)));
    } catch (err) {
      console.error('Error fetching students:', err);
      setStudents([]);
      setSelectedStudents(new Set());
    }
  };

  const handleViewSubmissionsClick = () => {
    // Just used to track when submissions are viewed
  };

  const fetchData = async (numericTeacherId) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch teacher's subjects using email (subjects endpoint supports email)
      const teacherIdentifier = user.email;
      const subjectsRes = await api.get(`/subjects/teacher/${teacherIdentifier}`);
      setSubjects(Array.isArray(subjectsRes.data) ? subjectsRes.data : []);

      // Fetch assignments using numeric teacher ID
      const assignRes = await api.get(`/assignments/teacher/${numericTeacherId}`);
      setAssignments(Array.isArray(assignRes.data) ? assignRes.data : []);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.subjectId || !formData.dueDate) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      // Convert datetime-local string to ISO format that backend expects
      const dueDateValue = formData.dueDate;
      let isoDate = dueDateValue;
      // If it looks like "2026-03-16T14:30", add seconds
      if (dueDateValue && !dueDateValue.includes(':00')) {
        isoDate = dueDateValue + ':00';
      }

      // Always use FormData (backend expects @RequestParam)
      const formDataPayload = new FormData();
      formDataPayload.append('title', formData.title);
      formDataPayload.append('description', formData.description);
      formDataPayload.append('instructions', formData.instructions);
      formDataPayload.append('subjectId', parseInt(formData.subjectId));
      formDataPayload.append('teacherId', teacherId);
      formDataPayload.append('maxScore', parseInt(formData.maxScore) || 100);
      formDataPayload.append('dueDate', isoDate);
      formDataPayload.append('visibleToAllStudents', visibleToAllStudents);
      
      // Convert selected students to comma-separated string
      if (!visibleToAllStudents && selectedStudents.size > 0) {
        formDataPayload.append('visibleStudentIds', Array.from(selectedStudents).join(','));
      }
      
      if (assignmentFile) {
        formDataPayload.append('file', assignmentFile);
      }

      await api.post('/assignments', formDataPayload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setError(null);
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        instructions: '',
        subjectId: '',
        dueDate: '',
        maxScore: 100
      });
      setAssignmentFile(null);
      setSelectedStudents(new Set());
      setVisibleToAllStudents(true);
      if (teacherId) {
        fetchData(teacherId);
      }
    } catch (err) {
      console.error('Error creating assignment:', err);
      setError(err.response?.data?.error || err.message || 'Failed to create assignment');
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await api.delete(`/assignments/${id}`);
        fetchData();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete assignment');
      }
    }
  };

  const handleViewSubmissions = async (assignment) => {
    try {
      setSelectedAssignment(assignment);
      const submissionRes = await api.get(`/submissions/assignment/${assignment.id}`);
      setSubmissions(Array.isArray(submissionRes.data) ? submissionRes.data : []);
      setShowGradeModal(true);
      handleViewSubmissionsClick();
      setLastCheckedSubmissions(prev => ({...prev, [assignment.id]: new Date().getTime()}));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load submissions');
    }
  };

  const handleGradeSubmission = async (e) => {
    e.preventDefault();

    if (!selectedSubmission || score === '' || !feedback) {
      setError('Please enter score and feedback');
      return;
    }

    try {
      await api.post(`/submissions/${selectedSubmission.id}/grade`, {
        score: parseInt(score),
        feedback
      });

      setScore('');
      setFeedback('');
      setSelectedSubmission(null);
      setError(null);
      
      // Refresh submissions
      const submissionRes = await api.get(`/submissions/assignment/${selectedAssignment.id}`);
      setSubmissions(Array.isArray(submissionRes.data) ? submissionRes.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to grade submission');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSubmissionStats = (assignment) => {
    const assignmentSubmissions = submissions.filter(s => s.assignment?.id === assignment.id);
    const submitted = assignmentSubmissions.filter(s => s.status !== 'NOT_SUBMITTED').length;
    return {
      submitted,
      total: assignmentSubmissions.length,
      graded: assignmentSubmissions.filter(s => s.status === 'GRADED').length
    };
  };

  const getStatusColor = (status) => {
    const colors = {
      'NOT_SUBMITTED': '#999',
      'SUBMITTED': '#2196f3',
      'LATE_SUBMITTED': '#ff9800',
      'GRADED': '#4caf50'
    };
    return colors[status] || '#666';
  };

  if (loading) {
    return (
      <div style={{padding: '20px', textAlign: 'center', color: '#1565c0'}}>
        Loading assignments...
      </div>
    );
  }

  return (
    <div className="assignments-container">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
        <h1>📚 Assignment Management</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px'
          }}
        >
          + Create Assignment
        </button>
      </div>

      {error && (
        <div style={{padding: '15px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '4px', marginBottom: '20px', border: '1px solid #ef5350'}}>
          ⚠️ {error}
        </div>
      )}

      {assignments.length === 0 ? (
        <div style={{padding: '40px', textAlign: 'center', backgroundColor: '#f5f5f5', borderRadius: '8px', color: '#666'}}>
          <p>No assignments created yet</p>
        </div>
      ) : (
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px'}}>
          {assignments.map(assignment => (
            <div
              key={assignment.id}
              style={{
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <h3 style={{margin: '0 0 12px 0', color: '#333', fontSize: '18px'}}>
                {assignment.title}
              </h3>

              {assignment.description && (
                <p style={{color: '#666', fontSize: '14px', marginBottom: '12px', lineHeight: '1.5'}}>
                  {assignment.description}
                </p>
              )}

              {assignment.fileName && (
                <div style={{backgroundColor: '#fff3e0', padding: '12px', borderRadius: '4px', marginBottom: '12px', borderLeft: '4px solid #ff9800'}}>
                  <strong style={{color: '#e65100', display: 'block', marginBottom: '8px'}}>Attached File:</strong>
                  <a 
                    href={`${API_BASE_URL}/api/assignments/${assignment.id}/download-file`}
                    style={{
                      display: 'inline-block',
                      padding: '6px 10px',
                      backgroundColor: '#ff9800',
                      color: 'white',
                      borderRadius: '4px',
                      textDecoration: 'none',
                      fontSize: '13px'
                    }}
                  >
                    📥 Download {assignment.fileName}
                  </a>
                </div>
              )}

              <div style={{backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '4px', marginBottom: '12px', fontSize: '14px'}}>
                <div style={{marginBottom: '8px'}}>
                  <strong>Due Date:</strong> {formatDate(assignment.dueDate)}
                </div>
                <div style={{marginBottom: '8px'}}>
                  <strong>Max Score:</strong> {assignment.maxScore || 100} points
                </div>
                <div>
                  <strong>Subject:</strong> {assignment.subject?.subjectName || 'N/A'}
                </div>
              </div>

              <div style={{backgroundColor: '#e3f2fd', padding: '12px', borderRadius: '4px', marginBottom: '12px', fontSize: '14px'}}>
                <div>
                  <strong>Submissions:</strong> {submissions.filter(s => s.assignment?.id === assignment.id && s.status !== 'NOT_SUBMITTED').length} submitted
                </div>
                <div>
                  <strong>Graded:</strong> {submissions.filter(s => s.assignment?.id === assignment.id && s.status === 'GRADED').length}
                </div>
              </div>

              <div style={{marginTop: 'auto', display: 'flex', gap: '10px'}}>
                <button
                  onClick={() => handleViewSubmissions(assignment)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#2196f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}
                >
                  View Submissions
                </button>
                <button
                  onClick={() => handleDeleteAssignment(assignment.id)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div
          style={{
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
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '30px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{marginTop: 0, color: '#333'}}>Create Assignment</h2>

            <form onSubmit={handleCreateAssignment}>
              <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box'}}
                  required
                />
              </div>

              <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
                  Subject *
                </label>
                <select
                  value={formData.subjectId}
                  onChange={(e) => {
                    setFormData({...formData, subjectId: e.target.value});
                    if (e.target.value) {
                      fetchStudentsBySubject(e.target.value);
                    } else {
                      setStudents([]);
                      setSelectedStudents(new Set());
                    }
                  }}
                  style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box'}}
                  required
                >
                  <option value="">-- Select Subject --</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.subjectName}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  style={{width: '100%', minHeight: '100px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box'}}
                  placeholder="Enter assignment description..."
                />
              </div>

              <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
                  Instructions
                </label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                  style={{width: '100%', minHeight: '80px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box'}}
                  placeholder="Enter assignment instructions..."
                />
              </div>

              <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
                  Attach File (Optional) - PDF or Document
                </label>
                <input
                  type="file"
                  onChange={(e) => setAssignmentFile(e.target.files[0])}
                  style={{
                    display: 'block',
                    marginBottom: '8px'
                  }}
                />
                {assignmentFile && (
                  <p style={{color: '#4caf50', fontSize: '14px'}}>
                    ✓ File selected: {assignmentFile.name}
                  </p>
                )}
              </div>

              <div style={{marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
                <div>
                  <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
                    Due Date *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box'}}
                    required
                  />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
                    Max Score
                  </label>
                  <input
                    type="number"
                    value={formData.maxScore}
                    onChange={(e) => setFormData({...formData, maxScore: e.target.value})}
                    style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box'}}
                    min="1"
                  />
                </div>
              </div>

              {/* Visibility Section */}
              <div style={{marginBottom: '20px', backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '4px', border: '1px solid #ddd'}}>
                <label style={{display: 'flex', alignItems: 'center', marginBottom: '15px', fontWeight: 'bold', cursor: 'pointer'}}>
                  <input
                    type="checkbox"
                    checked={visibleToAllStudents}
                    onChange={(e) => setVisibleToAllStudents(e.target.checked)}
                    style={{marginRight: '10px', width: '18px', height: '18px', cursor: 'pointer'}}
                  />
                  Visible to All Students
                </label>

                {!visibleToAllStudents && students.length > 0 && (
                  <div>
                    <div style={{display: 'flex', gap: '10px', marginBottom: '12px'}}>
                      <button
                        type="button"
                        onClick={() => setSelectedStudents(new Set(students.map(s => s.id)))}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#667eea',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        ✓ Select All
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedStudents(new Set())}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        ✗ Deselect All
                      </button>
                    </div>
                    <p style={{marginBottom: '12px', fontSize: '13px', color: '#666'}}>
                      Select students who can see this assignment:
                    </p>
                    <div style={{maxHeight: '250px', overflowY: 'auto', border: '1px solid #ccc', borderRadius: '4px', padding: '10px', backgroundColor: 'white'}}>
                      {students.map(student => (
                        <label key={student.id} style={{display: 'flex', alignItems: 'center', marginBottom: '8px', cursor: 'pointer', fontSize: '14px'}}>
                          <input
                            type="checkbox"
                            checked={selectedStudents.has(student.id)}
                            onChange={(e) => {
                              const newSelected = new Set(selectedStudents);
                              if (e.target.checked) {
                                newSelected.add(student.id);
                              } else {
                                newSelected.delete(student.id);
                              }
                              setSelectedStudents(newSelected);
                            }}
                            style={{marginRight: '10px', width: '16px', height: '16px', cursor: 'pointer'}}
                          />
                          {student.user?.fullName || student.fullName || `Student #${student.id}`}
                        </label>
                      ))}
                    </div>
                    <div style={{marginTop: '10px', fontSize: '12px', color: '#666'}}>
                      {selectedStudents.size} of {students.length} students selected
                    </div>
                  </div>
                )}

                {students.length === 0 && !visibleToAllStudents && (
                  <p style={{color: '#f44336', fontSize: '13px', marginTop: '10px'}}>
                    Please select a subject first to see available students
                  </p>
                )}
              </div>

              <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#ddd',
                    color: '#333',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grade Submissions Modal */}
      {showGradeModal && selectedAssignment && (
        <div
          style={{
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
          }}
          onClick={() => setShowGradeModal(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '30px',
              maxWidth: '800px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{marginTop: 0, color: '#333'}}>
              Submissions for: {selectedAssignment.title}
            </h2>

            {selectedSubmission ? (
              <div>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  style={{
                    marginBottom: '20px',
                    padding: '8px 16px',
                    backgroundColor: '#ddd',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  ← Back
                </button>

                <div style={{backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '4px', marginBottom: '20px'}}>
                  <p><strong>Student:</strong> {selectedSubmission.student?.user?.fullName}</p>
                  <p><strong>Submitted:</strong> {formatDate(selectedSubmission.submittedAt)}</p>
                  <p><strong>Status:</strong> {selectedSubmission.status}</p>
                </div>

                {selectedSubmission.submissionText && (
                  <div style={{backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '4px', marginBottom: '20px'}}>
                    <h4>Submission Text:</h4>
                    <p style={{whiteSpace: 'pre-wrap'}}>{selectedSubmission.submissionText}</p>
                  </div>
                )}

                {selectedSubmission.submissionFileName && (
                  <div style={{backgroundColor: '#e8f5e9', padding: '15px', borderRadius: '4px', marginBottom: '20px', borderLeft: '4px solid #4caf50'}}>
                    <h4 style={{marginTop: 0, color: '#2e7d32'}}>Submitted File:</h4>
                    <a 
                      href={`${API_BASE_URL}/api/submissions/${selectedSubmission.id}/download-file`}
                      style={{
                        display: 'inline-block',
                        padding: '8px 12px',
                        backgroundColor: '#4caf50',
                        color: 'white',
                        borderRadius: '4px',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}
                    >
                      📥 Download {selectedSubmission.submissionFileName}
                    </a>
                  </div>
                )}

                <form onSubmit={handleGradeSubmission}>
                  <div style={{marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px'}}>
                    <div>
                      <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
                        Score (out of {selectedAssignment.maxScore || 100})
                      </label>
                      <input
                        type="number"
                        value={score}
                        onChange={(e) => setScore(e.target.value)}
                        style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box'}}
                        min="0"
                        max={selectedAssignment.maxScore || 100}
                        required
                      />
                    </div>
                  </div>

                  <div style={{marginBottom: '20px'}}>
                    <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
                      Feedback
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      style={{width: '100%', minHeight: '120px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box'}}
                      placeholder="Enter your feedback for the student..."
                      required
                    />
                  </div>

                  <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
                    <button
                      type="button"
                      onClick={() => setSelectedSubmission(null)}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#ddd',
                        color: '#333',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      Cancel
                    </button>
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
                      Grade & Send Feedback
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div>
                {submissions.filter(s => s.assignment?.id === selectedAssignment.id).length === 0 ? (
                  <p style={{textAlign: 'center', color: '#666'}}>No submissions yet</p>
                ) : (
                  <table style={{width: '100%', borderCollapse: 'collapse'}}>
                    <thead>
                      <tr style={{backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd'}}>
                        <th style={{padding: '12px', textAlign: 'left'}}>Student</th>
                        <th style={{padding: '12px', textAlign: 'left'}}>Status</th>
                        <th style={{padding: '12px', textAlign: 'left'}}>Score</th>
                        <th style={{padding: '12px', textAlign: 'left'}}>Submitted</th>
                        <th style={{padding: '12px', textAlign: 'center'}}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.filter(s => s.assignment?.id === selectedAssignment.id).map(submission => (
                        <tr key={submission.id} style={{borderBottom: '1px solid #eee'}}>
                          <td style={{padding: '12px'}}>{submission.student?.user?.fullName}</td>
                          <td style={{padding: '12px'}}>
                            <span style={{
                              backgroundColor: getStatusColor(submission.status),
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}>
                              {submission.status}
                            </span>
                          </td>
                          <td style={{padding: '12px'}}>
                            {submission.score !== null ? `${submission.score}/${selectedAssignment.maxScore || 100}` : '-'}
                          </td>
                          <td style={{padding: '12px'}}>
                            {submission.submittedAt ? formatDate(submission.submittedAt) : '-'}
                          </td>
                          <td style={{padding: '12px', textAlign: 'center'}}>
                            <button
                              onClick={() => setSelectedSubmission(submission)}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#2196f3',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 'bold'
                              }}
                            >
                              {submission.status === 'GRADED' ? 'Edit' : 'Grade'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                <div style={{marginTop: '20px', display: 'flex', justifyContent: 'flex-end'}}>
                  <button
                    onClick={() => setShowGradeModal(false)}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#ddd',
                      color: '#333',
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
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAssignmentManagement;
