import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { API_BASE_URL } from '../utils/apiClient';
import '../styles/assignments.css';

export const StudentAssignments = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFile, setSubmissionFile] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const refreshIntervalRef = useRef(null);

  useEffect(() => {
    fetchAssignments();
    
    // Background refresh for new assignments every 8 seconds
    refreshIntervalRef.current = setInterval(() => {
      refreshAssignments();
    }, 8000);
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch student's subjects
      const subjectsRes = await api.get(`/students/${user.studentId}/all-subjects`);
      const subjects = Array.isArray(subjectsRes.data) ? subjectsRes.data : [];
      
      // Fetch all assignments for these subjects
      const allAssignments = [];
      for (const subject of subjects) {
        try {
          const assignRes = await api.get(`/assignments/subject/${subject.id}`);
          const assignmentData = Array.isArray(assignRes.data) ? assignRes.data : [];
          allAssignments.push(...assignmentData);
        } catch (err) {
          console.error(`Error fetching assignments for subject ${subject.id}:`, err);
        }
      }
      
      setAssignments(allAssignments);
      
      // Fetch student's submissions
      try {
        const submissionRes = await api.get(`/submissions/student/${user.studentId}`);
        const submissionData = Array.isArray(submissionRes.data) ? submissionRes.data : [];
        const submissionMap = {};
        submissionData.forEach(sub => {
          if (sub && sub.assignment && sub.assignment.id) {
            submissionMap[sub.assignment.id] = sub;
          }
        });
        setSubmissions(submissionMap);
      } catch (err) {
        console.error('Error fetching submissions:', err);
        setSubmissions({});
      }
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError(err.response?.data?.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const refreshAssignments = async () => {
    try {
      // Fetch student's subjects
      const subjectsRes = await api.get(`/students/${user.studentId}/all-subjects`);
      const subjects = Array.isArray(subjectsRes.data) ? subjectsRes.data : [];
      
      // Fetch all assignments
      const allAssignments = [];
      for (const subject of subjects) {
        try {
          const assignRes = await api.get(`/assignments/subject/${subject.id}`);
          const assignmentData = Array.isArray(assignRes.data) ? assignRes.data : [];
          allAssignments.push(...assignmentData);
        } catch (err) {
          console.error(`Error fetching assignments for subject ${subject.id}:`, err);
        }
      }
      
      // Fetch student's submissions
      try {
        const submissionRes = await api.get(`/submissions/student/${user.studentId}`);
        const submissionData = Array.isArray(submissionRes.data) ? submissionRes.data : [];
        const submissionMap = {};
        submissionData.forEach(sub => {
          if (sub && sub.assignment && sub.assignment.id) {
            submissionMap[sub.assignment.id] = sub;
          }
        });
        
        // Check if there are new assignments or status changes
        const oldAssignmentCount = assignments.length;
        const oldGradedCount = Object.values(submissions).filter(s => s.status === 'GRADED').length;
        const newGradedCount = Object.values(submissionMap).filter(s => s.status === 'GRADED').length;
        
        setAssignments(allAssignments);
        setSubmissions(submissionMap);
      } catch (err) {
        console.error('Error fetching submissions in refresh:', err);
        setAssignments(allAssignments);
      }
    } catch (err) {
      // Silent fail for background refresh
    }
  };

  const handleSubmitClick = (assignment) => {
    setSelectedAssignment(assignment);
    setShowSubmitModal(true);
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    
    if (!submissionText.trim() && !submissionFile) {
      setError('Please provide submission text or file');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('assignmentId', selectedAssignment.id);
      formData.append('studentId', user.studentId);
      formData.append('submissionText', submissionText);
      if (submissionFile) {
        formData.append('file', submissionFile);
      }

      await api.post('/submissions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setError(null);
      setShowSubmitModal(false);
      setSubmissionText('');
      setSubmissionFile(null);
      fetchAssignments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit assignment');
    }
  };

  const getSubmissionStatus = (assignment) => {
    const submission = submissions[assignment.id];
    if (!submission) return 'NOT_SUBMITTED';
    return submission.status;
  };

  const handleViewResponse = (assignment) => {
    const submission = submissions[assignment.id];
    if (submission) {
      setSelectedResponse({ assignment, submission });
      setShowResponseModal(true);
    }
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

  const getStatusBadge = (status) => {
    const labels = {
      'NOT_SUBMITTED': 'Not Submitted',
      'SUBMITTED': 'Submitted',
      'LATE_SUBMITTED': 'Late Submitted',
      'GRADED': 'Graded'
    };
    return labels[status] || status;
  };

  const isAssignmentDue = (dueDate) => {
    return new Date() > new Date(dueDate);
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

  const filteredAssignments = filterStatus === 'all' 
    ? assignments 
    : assignments.filter(a => getSubmissionStatus(a) === filterStatus);

  if (loading) {
    return (
      <div className="assignments-container">
        <div style={{padding: '20px', textAlign: 'center', color: '#1565c0'}}>
          Loading assignments...
        </div>
      </div>
    );
  }

  return (
    <div className="assignments-container">
      <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px'}}>
        <h1>📝 My Assignments</h1>
      </div>

      {error && (
        <div style={{padding: '15px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '4px', marginBottom: '20px', border: '1px solid #ef5350'}}>
          ⚠️ {error}
        </div>
      )}

      {/* Filter Buttons */}
      <div style={{marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
        {['all', 'NOT_SUBMITTED', 'SUBMITTED', 'LATE_SUBMITTED', 'GRADED'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            style={{
              padding: '8px 16px',
              backgroundColor: filterStatus === status ? '#667eea' : '#ddd',
              color: filterStatus === status ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {status === 'all' ? 'All' : getStatusBadge(status)}
          </button>
        ))}
      </div>

      {filteredAssignments.length === 0 ? (
        <div style={{padding: '40px', textAlign: 'center', backgroundColor: '#f5f5f5', borderRadius: '8px', color: '#666'}}>
          <p>No assignments found</p>
        </div>
      ) : (
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px'}}>
          {filteredAssignments.map(assignment => {
            const status = getSubmissionStatus(assignment);
            const isDue = isAssignmentDue(assignment.dueDate);
            const submission = submissions[assignment.id];

            return (
              <div 
                key={assignment.id} 
                style={{
                  backgroundColor: 'white',
                  border: `2px solid ${getStatusColor(status)}`,
                  borderRadius: '8px',
                  padding: '20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px'}}>
                  <h3 style={{margin: '0 0 8px 0', color: '#333', fontSize: '18px'}}>
                    {assignment.title}
                  </h3>
                  <span style={{
                    backgroundColor: getStatusColor(status),
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {getStatusBadge(status)}
                  </span>
                </div>

                {assignment.description && (
                  <p style={{color: '#666', fontSize: '14px', marginBottom: '12px', lineHeight: '1.5'}}>
                    {assignment.description}
                  </p>
                )}

                {assignment.instructions && (
                  <div style={{backgroundColor: '#f3e5f5', padding: '12px', borderRadius: '4px', marginBottom: '12px', borderLeft: '4px solid #9c27b0'}}>
                    <strong style={{color: '#7b1fa2', display: 'block', marginBottom: '8px'}}>Instructions:</strong>
                    <p style={{color: '#555', fontSize: '14px', margin: '0', whiteSpace: 'pre-wrap', lineHeight: '1.5'}}>
                      {assignment.instructions}
                    </p>
                  </div>
                )}

                <div style={{backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '4px', marginBottom: '12px', fontSize: '14px'}}>
                  <div style={{marginBottom: '8px'}}>
                    <strong>Due Date:</strong> {formatDate(assignment.dueDate)}
                    {isDue && <span style={{color: '#f44336', marginLeft: '8px'}}>⚠️ OVERDUE</span>}
                  </div>
                  <div>
                    <strong>Max Score:</strong> {assignment.maxScore || 100} points
                  </div>
                </div>

                {submission && (
                  <div style={{backgroundColor: '#e8f5e9', padding: '12px', borderRadius: '4px', marginBottom: '12px', fontSize: '14px'}}>
                    <div style={{marginBottom: '4px'}}>
                      <strong>Submitted:</strong> {formatDate(submission.submittedAt)}
                    </div>
                    {submission.score !== null && (
                      <div style={{marginBottom: '4px'}}>
                        <strong>Score:</strong> {submission.score} / {assignment.maxScore || 100}
                      </div>
                    )}
                    {submission.feedback && (
                      <div style={{marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #c8e6c9'}}>
                        <strong>Feedback:</strong>
                        <p style={{margin: '4px 0 0 0', color: '#555'}}>{submission.feedback}</p>
                      </div>
                    )}
                  </div>
                )}

                <div style={{marginTop: 'auto'}}>
                  {status === 'NOT_SUBMITTED' ? (
                    <button
                      onClick={() => handleSubmitClick(assignment)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}
                    >
                      Submit Assignment
                    </button>
                  ) : (
                    <div style={{display: 'flex', gap: '8px'}}>
                      <button
                        onClick={() => handleSubmitClick(assignment)}
                        style={{
                          flex: 1,
                          padding: '10px',
                          backgroundColor: '#ff9800',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '14px'
                        }}
                      >
                        Resubmit Assignment
                      </button>
                      <button
                        onClick={() => handleViewResponse(assignment)}
                        style={{
                          flex: 1,
                          padding: '10px',
                          backgroundColor: '#4caf50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '14px'
                        }}
                      >
                        View Response
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submit Modal */}
      {showSubmitModal && selectedAssignment && (
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
          onClick={() => setShowSubmitModal(false)}
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
            <h2 style={{marginTop: 0, color: '#333'}}>Submit: {selectedAssignment.title}</h2>

            <form onSubmit={handleSubmitAssignment}>
              <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
                  Submission Text:
                </label>
                <textarea
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '150px',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '14px'
                  }}
                  placeholder="Enter your submission here (or attach a file)..."
                />
              </div>

              <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
                  Attach File:
                </label>
                <input
                  type="file"
                  onChange={(e) => setSubmissionFile(e.target.files[0])}
                  style={{
                    display: 'block',
                    marginBottom: '8px'
                  }}
                />
                {submissionFile && (
                  <p style={{color: '#4caf50', fontSize: '14px'}}>
                    ✓ File selected: {submissionFile.name}
                  </p>
                )}
              </div>

              <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
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
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* View Response Modal */}
      {showResponseModal && selectedResponse && (
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
          onClick={() => setShowResponseModal(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '30px',
              maxWidth: '700px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{marginTop: 0, color: '#333'}}>Response: {selectedResponse.assignment.title}</h2>
            
            <div style={{backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '4px', marginBottom: '20px'}}>
              <div style={{marginBottom: '12px'}}>
                <strong>Submitted:</strong> {formatDate(selectedResponse.submission.submittedAt)}
                {selectedResponse.submission.status === 'LATE_SUBMITTED' && (
                  <span style={{color: '#f44336', marginLeft: '8px'}}>⚠️ LATE SUBMISSION</span>
                )}
              </div>
              {selectedResponse.submission.score !== null && (
                <div>
                  <strong>Score:</strong> {selectedResponse.submission.score} / {selectedResponse.assignment.maxScore || 100}
                </div>
              )}
            </div>

            <div style={{marginBottom: '20px'}}>
              <strong style={{display: 'block', marginBottom: '8px'}}>Your Submission Text:</strong>
              <div style={{
                backgroundColor: '#f5f5f5',
                padding: '15px',
                borderRadius: '4px',
                minHeight: '100px',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                color: '#333',
                lineHeight: '1.6'
              }}>
                {selectedResponse.submission.submissionText || '(No submission text provided)'}
              </div>
            </div>

            {selectedResponse.submission.submissionFileName && (
              <div style={{marginBottom: '20px'}}>
                <strong style={{display: 'block', marginBottom: '8px'}}>Attached File:</strong>
                <a 
                  href={`${API_BASE_URL}/api/submissions/${selectedResponse.submission.id}/download-file`}
                  style={{
                    display: 'inline-block',
                    padding: '8px 12px',
                    backgroundColor: '#2196f3',
                    color: 'white',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    fontSize: '14px'
                  }}
                >
                  📥 Download {selectedResponse.submission.submissionFileName}
                </a>
              </div>
            )}

            {selectedResponse.submission.feedback && (
              <div style={{marginBottom: '20px'}}>
                <strong style={{display: 'block', marginBottom: '8px', color: '#d32f2f'}}>Teacher Feedback:</strong>
                <div style={{
                  backgroundColor: '#ffebee',
                  padding: '15px',
                  borderRadius: '4px',
                  borderLeft: '4px solid #d32f2f',
                  color: '#c62828',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word'
                }}>
                  {selectedResponse.submission.feedback}
                </div>
              </div>
            )}

            <div style={{display: 'flex', justifyContent: 'flex-end'}}>
              <button
                onClick={() => setShowResponseModal(false)}
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
                Close
              </button>
            </div>
          </div>
        </div>
      )}    </div>
  );
};

export default StudentAssignments;
