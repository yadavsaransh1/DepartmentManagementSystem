import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/dashboard.css';
import * as XLSX from 'xlsx';

export const AdminTeacherFeedback = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [activations, setActivations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [programs, setPrograms] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [exportTeacherId, setExportTeacherId] = useState('');
  const [exportSubjectId, setExportSubjectId] = useState('');
  const [exportProgram, setExportProgram] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [expandedFeedback, setExpandedFeedback] = useState({});

  useEffect(() => {
    fetchFeedback();
    fetchActivations();
    fetchProgramsAndSemesters();
    fetchTeachersAndSubjects();
  }, []);

  const fetchTeachersAndSubjects = async () => {
    try {
      const teacherResponse = await api.get('/teachers');
      setTeachers(Array.isArray(teacherResponse.data) ? teacherResponse.data : []);
      
      const subjectResponse = await api.get('/subjects');
      setSubjects(Array.isArray(subjectResponse.data) ? subjectResponse.data : []);
    } catch (err) {
      console.error('Error fetching teachers and subjects:', err);
    }
  };

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await api.get('/teacher-feedback');
      const allFeedback = Array.isArray(response.data) ? response.data : [];
      // Filter out deleted feedback
      const activeFeedback = allFeedback.filter(f => !f.isDeleted);
      setFeedbackList(activeFeedback);
    } catch (err) {
      console.error('Error fetching feedback:', err);
      setMessage({ text: 'Failed to load feedback', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchActivations = async () => {
    try {
      const response = await api.get('/feedback-activation');
      setActivations(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching activations:', err);
    }
  };

  const fetchProgramsAndSemesters = async () => {
    try {
      // Fetch programs from dedicated endpoint
      const programResponse = await api.get('/programs');
      const programs = Array.isArray(programResponse.data) ? programResponse.data : [];
      
      // Extract program names - handle both string and object formats
      const programNames = programs
        .map(p => typeof p === 'string' ? p : p.name)
        .filter(Boolean);
      
      setPrograms(programNames);

      // Fetch subjects to get semesters
      const subjectResponse = await api.get('/subjects');
      const subjects = Array.isArray(subjectResponse.data) ? subjectResponse.data : [];
      
      const uniqueSemesters = [...new Set(subjects.map(s => s.semester).filter(Boolean))].sort((a, b) => a - b);
      setSemesters(uniqueSemesters);
    } catch (err) {
      console.error('Error fetching programs and semesters:', err);
    }
  };

  const handleActivateFeedback = async () => {
    if (!selectedProgram || !selectedSemester) {
      setMessage({ text: 'Please select both program and semester', type: 'warning' });
      return;
    }

    try {
      await api.post('/feedback-activation', {
        program: selectedProgram,
        semester: parseInt(selectedSemester),
        isActivated: true
      });
      
      setMessage({ text: 'Feedback form activated successfully', type: 'success' });
      setSelectedProgram('');
      setSelectedSemester('');
      setShowActivationModal(false);
      fetchActivations();
    } catch (err) {
      console.error('Error activating feedback:', err);
      setMessage({ text: 'Failed to activate feedback', type: 'error' });
    }
  };

  const handleDeactivateFeedback = async (activationId) => {
    try {
      await api.put(`/feedback-activation/${activationId}`, { isActivated: false });
      setMessage({ text: 'Feedback form deactivated successfully', type: 'success' });
      fetchActivations();
    } catch (err) {
      console.error('Error deactivating feedback:', err);
      setMessage({ text: 'Failed to deactivate feedback', type: 'error' });
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (window.confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) {
      try {
        await api.delete(`/teacher-feedback/${feedbackId}`);
        setMessage({ text: 'Feedback deleted successfully', type: 'success' });
        fetchFeedback();
      } catch (err) {
        console.error('Error deleting feedback:', err);
        setMessage({ text: 'Failed to delete feedback', type: 'error' });
      }
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return '#28a745';
    if (rating >= 3) return '#ffc107';
    return '#dc3545';
  };

  const handleExportFeedback = () => {
    let filteredFeedback = [...feedbackList];

    // Apply filters
    if (exportTeacherId) {
      filteredFeedback = filteredFeedback.filter(f => f.teacherId === parseInt(exportTeacherId));
    }
    if (exportSubjectId) {
      filteredFeedback = filteredFeedback.filter(f => f.subjectId === parseInt(exportSubjectId));
    }
    if (exportProgram) {
      filteredFeedback = filteredFeedback.filter(f => f.program === exportProgram);
    }

    if (filteredFeedback.length === 0) {
      setMessage({ text: 'No feedback found matching the filters', type: 'warning' });
      return;
    }

    // Prepare export data
    const exportData = filteredFeedback.map(f => ({
      'Feedback ID': f.id,
      'Student Name': f.studentName,
      'Student ID': f.studentEnrollmentNumber,
      'Teacher Name': f.teacherName,
      'Subject': f.subjectName,
      'Program': f.program,
      'Semester': f.semester,
      'Teaching Quality': f.teachingQuality,
      'Communication': f.communication,
      'Availability': f.availability,
      'Course Content': f.courseContent,
      'Overall Rating': f.overallRating,
      'Comments': f.comments,
      'Positive Aspects': f.positiveAspects,
      'Areas for Improvement': f.areasForImprovement,
      'Date': new Date(f.createdAt).toLocaleDateString()
    }));

    // Create workbook and sheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Feedback');

    // Set column widths
    const columnWidths = [
      { wch: 12 },
      { wch: 20 },
      { wch: 15 },
      { wch: 20 },
      { wch: 20 },
      { wch: 12 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 },
      { wch: 15 },
      { wch: 12 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 12 }
    ];
    ws['!cols'] = columnWidths;

    // Generate filename
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `Feedback_Export_${timestamp}.xlsx`;

    // Write file
    XLSX.writeFile(wb, filename);
    setMessage({ text: `Exported ${filteredFeedback.length} feedback records`, type: 'success' });
    setShowExportModal(false);
    setExportTeacherId('');
    setExportSubjectId('');
    setExportProgram('');
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading feedback data...</div>;
  }

  const isActivated = (program, semester) => {
    return activations.some(a => a.program === program && a.semester === semester && a.isActivated);
  };

  return (
    
    <div style={{ padding: '20px', backgroundColor: '#f9f9f9', minHeight: '90vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>📊 Teacher Feedback Management</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowActivationModal(true)}
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
            ✅ Activate Feedback Form
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            📊 Export Feedback
          </button>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div style={{
          padding: '12px',
          marginBottom: '15px',
          backgroundColor: message.type === 'success' ? '#d4edda' : message.type === 'warning' ? '#fff3cd' : '#f8d7da',
          color: message.type === 'success' ? '#155724' : message.type === 'warning' ? '#856404' : '#721c24',
          borderRadius: '4px',
          border: `1px solid ${message.type === 'success' ? '#c3e6cb' : message.type === 'warning' ? '#ffeaa7' : '#f5c6cb'}`
        }}>
          {message.text}
        </div>
      )}

      {/* Activation Modal */}
      {showActivationModal && (
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
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
            maxWidth: '500px',
            width: '90%',
            padding: '30px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>Activate Feedback Form</h2>
              <button
                onClick={() => setShowActivationModal(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#999'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Program</label>
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="">Select Program</option>
                {programs.map(program => (
                  <option key={program} value={program}>{program}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Semester</label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="">Select Semester</option>
                {semesters.map(semester => (
                  <option key={semester} value={semester}>Semester {semester}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleActivateFeedback}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Activate
              </button>
              <button
                onClick={() => setShowActivationModal(false)}
                style={{
                  flex: 1,
                  padding: '10px',
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
          </div>
        </div>
      )}

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
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
            maxWidth: '500px',
            width: '90%',
            padding: '30px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>Export Feedback</h2>
              <button
                onClick={() => setShowExportModal(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#999'
                }}
              >
                ✕
              </button>
            </div>

            <p style={{ color: '#666', marginBottom: '15px' }}>Select filters to export feedback (optional)</p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Teacher</label>
              <select
                value={exportTeacherId}
                onChange={(e) => setExportTeacherId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="">All Teachers</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.user?.fullName || 'Unknown'}
                  </option>
                ))}
              </select>
            </div>
                
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Subject</label>
              <select
                value={exportSubjectId}
                onChange={(e) => setExportSubjectId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.courseName || 'Unknown'}
                  </option>
                ))}
              </select>
            </div>
                
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Program</label>
              <select
                value={exportProgram}
                onChange={(e) => setExportProgram(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="">All Programs</option>
                {programs.map(program => (
                  <option key={program} value={program}>{program}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleExportFeedback}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#2196f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                📥 Export to Excel
              </button>
              <button
                onClick={() => setShowExportModal(false)}
                style={{
                  flex: 1,
                  padding: '10px',
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
          </div>
        </div>
      )}

      {/* Activated Feedback Forms */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginTop: 0 }}>✅ Active Feedback Forms</h3>
        {activations.filter(a => a.isActivated).length > 0 ? (
          <div style={{ display: 'grid', gap: '10px' }}>
            {activations.filter(a => a.isActivated).map(activation => (
              <div key={activation.id} style={{
                padding: '15px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#f0f8ff'
              }}>
                <div>
                  <strong>{activation.program}</strong> - Semester {activation.semester}
                </div>
                <button
                  onClick={() => handleDeactivateFeedback(activation.id)}
                  style={{
                    padding: '8px 15px',
                    backgroundColor: '#ff9800',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Deactivate
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#999' }}>No active feedback forms. Click "Activate Feedback Form" to create one.</p>
        )}
      </div>

      {/* Feedback List */}
      <div className="global-container">
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginTop: 0 }}>📋 Student Feedback</h3>
        {feedbackList.length > 0 ? (
          <div style={{ display: 'grid', gap: '15px' }}>
            {feedbackList.map(feedback => (
              <div key={feedback.id} style={{
                padding: '15px',
                border: '1px solid #5a0000',
                borderRadius: '4px',
                backgroundColor: '#ffffff'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                  <div>
                    <strong style={{ fontSize: '16px' }}>Overall Rating:</strong>
                    <span style={{
                      marginLeft: '10px',
                      padding: '5px 10px',
                      backgroundColor: getRatingColor(feedback.overallRating),
                      color: 'white',
                      borderRadius: '4px',
                      fontWeight: 'bold'
                    }}>
                      {feedback.overallRating}/5 {'⭐'.repeat(feedback.overallRating)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteFeedback(feedback.id)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                     Delete
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 600 ? '1fr' : '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <strong>Teaching Quality:</strong> {feedback.teachingQuality}/5
                  </div>
                  <div>
                    <strong>Communication:</strong> {feedback.communication}/5
                  </div>
                  <div>
                    <strong>Availability:</strong> {feedback.availability}/5
                  </div>
                  <div>
                    <strong>Course Content:</strong> {feedback.courseContent}/5
                  </div>
                </div>

                {feedback.comments && (
                  <div style={{
                    backgroundColor: 'white',
                    padding: '10px',
                    borderRadius: '4px',
                    marginBottom: '10px',
                    borderLeft: '3px solid #2196f3'
                  }}>
                    <strong>Comments:</strong>
                    <p style={{ margin: '5px 0 0 0' }}>{feedback.comments}</p>
                  </div>
                )}

                <div style={{ fontSize: '12px', color: '#6d0b0b', marginTop: '10px' }}>
                  <span>Student: {feedback.studentName || 'N/A'}</span>
                  <span style={{ marginLeft: '20px' }}>Teacher: {feedback.teacherName || 'N/A'}</span>
                  <span style={{ marginLeft: '20px' }}>Subject: {feedback.subjectName || 'N/A'}</span>
                  <span style={{ marginLeft: '20px' }}>Program: {feedback.program}</span>
                  <span style={{ marginLeft: '20px' }}>Semester: {feedback.semester}</span>
                  <span style={{ marginLeft: '20px' }}>Date: {new Date(feedback.createdAt).toLocaleDateString()}</span>
                </div>
                
              </div>
            ))}
          </div>
          
        ) : (
          <p style={{ color: '#999' }}>No feedback received yet.</p>
        )}
      </div>
      </div>
    </div>
  );
};
