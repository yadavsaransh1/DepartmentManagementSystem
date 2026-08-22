import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/dashboard.css';

export const TeacherViewFeedback = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [stats, setStats] = useState({
    totalFeedback: 0,
    averageRating: 0,
    totalTeachingQuality: 0,
    totalCommunication: 0,
    totalAvailability: 0,
    totalCourseContent: 0
  });

  useEffect(() => {
    fetchMyFeedback();
  }, []);

  const fetchMyFeedback = async () => {
    try {
      setLoading(true);
      
      // First, get the teacher profile to get the actual teacher ID
      console.log('DEBUG: Fetching teacher profile...');
      const teacherProfileResponse = await api.get('/teachers/profile');
      const teacherProfile = teacherProfileResponse.data;
      console.log('DEBUG: Teacher profile:', teacherProfile);
      
      if (!teacherProfile.id) {
        console.error('ERROR: Teacher ID not found in profile');
        setMessage({ text: 'Could not load teacher information', type: 'error' });
        setLoading(false);
        return;
      }
      
      // Now fetch feedback using the actual teacher ID
      console.log('DEBUG: Fetching feedback for teacher ID:', teacherProfile.id);
      const response = await api.get(`/teacher-feedback/teacher/${teacherProfile.id}`);
      const allFeedback = Array.isArray(response.data) ? response.data : [];
      console.log('DEBUG: Received feedback:', allFeedback);
      
      // Filter out deleted feedback
      const activeFeedback = allFeedback.filter(f => !f.isDeleted);
      setFeedbackList(activeFeedback);
      
      // Calculate statistics
      if (activeFeedback.length > 0) {
        const avgRating = (activeFeedback.reduce((sum, f) => sum + (f.overallRating || 0), 0) / activeFeedback.length).toFixed(2);
        const avgTeachingQuality = (activeFeedback.reduce((sum, f) => sum + (f.teachingQuality || 0), 0) / activeFeedback.length).toFixed(2);
        const avgCommunication = (activeFeedback.reduce((sum, f) => sum + (f.communication || 0), 0) / activeFeedback.length).toFixed(2);
        const avgAvailability = (activeFeedback.reduce((sum, f) => sum + (f.availability || 0), 0) / activeFeedback.length).toFixed(2);
        const avgCourseContent = (activeFeedback.reduce((sum, f) => sum + (f.courseContent || 0), 0) / activeFeedback.length).toFixed(2);

        setStats({
          totalFeedback: activeFeedback.length,
          averageRating: parseFloat(avgRating),
          totalTeachingQuality: parseFloat(avgTeachingQuality),
          totalCommunication: parseFloat(avgCommunication),
          totalAvailability: parseFloat(avgAvailability),
          totalCourseContent: parseFloat(avgCourseContent)
        });
      }

      setMessage({ text: '', type: '' });
    } catch (err) {
      console.error('Error fetching feedback:', err);
      setMessage({ text: 'Failed to load feedback', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return '#28a745';
    if (rating >= 3) return '#ffc107';
    return '#dc3545';
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading your feedback...</div>;
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9f9f9', minHeight: '90vh' }}>
      {/* Header */}
      <h2 style={{ margin: 0, marginBottom: '20px' }}>📊 My Feedback</h2>

      {/* Message */}
      {message.text && (
        <div style={{
          padding: '12px',
          marginBottom: '15px',
          backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
          color: message.type === 'success' ? '#155724' : '#721c24',
          borderRadius: '4px',
          border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message.text}
        </div>
      )}

      {/* Statistics Cards */}
      {stats.totalFeedback > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          marginBottom: '25px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            borderTop: `4px solid ${getRatingColor(stats.averageRating)}`
          }}>
            <h4 style={{ marginTop: 0, color: '#666' }}>Overall Rating</h4>
            <p style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: getRatingColor(stats.averageRating),
              margin: '10px 0'
            }}>
              {stats.averageRating}/5.0
            </p>
            <p style={{ fontSize: '14px', color: '#999', margin: 0 }}>
              {'⭐'.repeat(Math.round(stats.averageRating))}
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            borderTop: '4px solid #2196f3'
          }}>
            <h4 style={{ marginTop: 0, color: '#666' }}>Total Feedback</h4>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#2196f3', margin: '10px 0' }}>
              {stats.totalFeedback}
            </p>
            <p style={{ fontSize: '14px', color: '#999', margin: 0 }}>
              Students have provided feedback
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h4 style={{ marginTop: 0, color: '#666' }}>Teaching Quality</h4>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#4caf50', margin: '10px 0' }}>
              {stats.totalTeachingQuality.toFixed(1)}/5
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h4 style={{ marginTop: 0, color: '#666' }}>Communication</h4>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff9800', margin: '10px 0' }}>
              {stats.totalCommunication.toFixed(1)}/5
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h4 style={{ marginTop: 0, color: '#666' }}>Availability</h4>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#9c27b0', margin: '10px 0' }}>
              {stats.totalAvailability.toFixed(1)}/5
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h4 style={{ marginTop: 0, color: '#666' }}>Course Content</h4>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196f3', margin: '10px 0' }}>
              {stats.totalCourseContent.toFixed(1)}/5
            </p>
          </div>
        </div>
      )}

      {/* Feedback List */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginTop: 0 }}>📋 All Feedback</h3>
        
        {feedbackList.length > 0 ? (
          <div style={{ display: 'grid', gap: '20px' }}>
            {feedbackList.map(feedback => (
              <div key={feedback.id} style={{
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: '#ddfffc',
                borderLeft: `4px solid ${getRatingColor(feedback.overallRating)}`
              }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 8px 0' }}>
                      {feedback.isAnonymous ? '👤 Anonymous Student' : `${feedback.studentName} (${feedback.studentId})`}
                    </h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#999' }}>
                      Subject: <strong>{feedback.subjectName || 'N/A'}</strong> | Program: <strong>{feedback.program}</strong> | Semester: <strong>{feedback.semester}</strong>
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      backgroundColor: getRatingColor(feedback.overallRating),
                      color: 'white',
                      padding: '8px 15px',
                      borderRadius: '4px',
                      fontWeight: 'bold',
                      marginBottom: '8px'
                    }}>
                      {feedback.overallRating}/5 {' ⭐'.repeat(feedback.overallRating)}
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Individual Ratings */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  marginBottom: '15px',
                  backgroundColor: 'white',
                  padding: '12px',
                  borderRadius: '4px'
                }}>
                  <div>
                    <small style={{ color: '#999' }}>Teaching Quality</small>
                    <p style={{ margin: '5px 0', fontWeight: 'bold' }}>{feedback.teachingQuality}/5</p>
                  </div>
                  <div>
                    <small style={{ color: '#999' }}>Communication</small>
                    <p style={{ margin: '5px 0', fontWeight: 'bold' }}>{feedback.communication}/5</p>
                  </div>
                  <div>
                    <small style={{ color: '#999' }}>Availability</small>
                    <p style={{ margin: '5px 0', fontWeight: 'bold' }}>{feedback.availability}/5</p>
                  </div>
                  <div>
                    <small style={{ color: '#999' }}>Course Content</small>
                    <p style={{ margin: '5px 0', fontWeight: 'bold' }}>{feedback.courseContent}/5</p>
                  </div>
                </div>

                {/* Comments */}
                {feedback.comments && (
                  <div style={{
                    backgroundColor: 'white',
                    padding: '12px',
                    borderRadius: '4px',
                    marginBottom: '12px',
                    borderLeft: '3px solid #2196f3'
                  }}>
                    <strong style={{ fontSize: '12px', color: '#999' }}>Comments:</strong>
                    <p style={{ margin: '8px 0 0 0', color: '#555' }}>{feedback.comments}</p>
                  </div>
                )}

                {/* Positive Aspects */}
                {feedback.positiveAspects && (
                  <div style={{
                    backgroundColor: 'white',
                    padding: '12px',
                    borderRadius: '4px',
                    marginBottom: '12px',
                    borderLeft: '3px solid #4caf50'
                  }}>
                    <strong style={{ fontSize: '12px', color: '#999' }}>✅ Positive Aspects:</strong>
                    <p style={{ margin: '8px 0 0 0', color: '#555' }}>{feedback.positiveAspects}</p>
                  </div>
                )}

                {/* Areas for Improvement */}
                {feedback.areasForImprovement && (
                  <div style={{
                    backgroundColor: 'white',
                    padding: '12px',
                    borderRadius: '4px',
                    borderLeft: '3px solid #ff9800'
                  }}>
                    <strong style={{ fontSize: '12px', color: '#999' }}>💡 Areas for Improvement:</strong>
                    <p style={{ margin: '8px 0 0 0', color: '#555' }}>{feedback.areasForImprovement}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px'
          }}>
            <p style={{ color: '#999', margin: 0 }}>
              📭 No feedback received yet. Check back later when students provide feedback.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
