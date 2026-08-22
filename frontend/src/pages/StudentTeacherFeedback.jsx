import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/dashboard.css';

export const StudentTeacherFeedback = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [isFeedbackActive, setIsFeedbackActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [submittedFeedbacks, setSubmittedFeedbacks] = useState([]);
  const [editingFeedbackId, setEditingFeedbackId] = useState(null);

  const [formData, setFormData] = useState({
    teacherId: '',
    subjectId: '',
    teachingQuality: 3,
    communication: 3,
    availability: 3,
    courseContent: 3,
    overallRating: 3,
    comments: '',
    positiveAspects: '',
    areasForImprovement: '',
    isAnonymous: false
  });

  useEffect(() => {
    checkFeedbackStatus();
    fetchTeachers();
    fetchMySubjects();
    fetchMyFeedbacks();
  }, []);

  const checkFeedbackStatus = async () => {
    try {
      setLoading(true);
      // Use profile endpoint to get student data with proper authentication context
      const studentResponse = await api.get('/students/profile');
      const student = studentResponse.data;
      
      console.log('Student data:', { program: student.program, semester: student.semester });

      if (student.program && student.semester) {
        try {
          const activationResponse = await api.get(`/feedback-activation/status?program=${student.program}&semester=${student.semester}`);
          const activation = activationResponse.data;
          console.log('Activation status:', activation);
          setIsFeedbackActive(activation && activation.isActivated === true);
          console.log('Feedback active set to:', activation && activation.isActivated === true);
        } catch (activationErr) {
          // If activation record doesn't exist, feedback is not active
          console.log('Feedback not activated for this program/semester (404 or error):', activationErr.message);
          setIsFeedbackActive(false);
        }
      } else {
        console.warn('Student does not have program or semester assigned');
        setIsFeedbackActive(false);
      }
    } catch (err) {
      console.error('Error checking feedback status:', err);
      setMessage({ text: 'Could not verify feedback status', type: 'warning' });
      setIsFeedbackActive(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await api.get('/teachers');
      setTeachers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching teachers:', err);
    }
  };

  const fetchMySubjects = async () => {
    try {
      const response = await api.get('/students/profile/all-subjects');
      console.log('Subjects response:', response.data);
      if (Array.isArray(response.data)) {
        console.log(`Loaded ${response.data.length} subjects:`, response.data);
        setSubjects(response.data);
      } else {
        console.warn('Subjects response is not an array:', response.data);
        setSubjects([]);
      }
    } catch (err) {
      console.error('Error fetching subjects:', err);
      console.error('Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message
      });
      setSubjects([]);
      setMessage({ 
        text: `Could not load subjects: ${err.response?.status === 403 ? 'Permission denied' : err.message}`, 
        type: 'error' 
      });
    }
  };

  const fetchMyFeedbacks = async () => {
    try {
      const response = await api.get('/teacher-feedback/student/my');
      setSubmittedFeedbacks(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
      setSubmittedFeedbacks([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRatingChange = (field, value) => {
    const newFormData = { ...formData, [field]: parseInt(value) };
    
    // Auto-calculate overall rating as average
    if (field !== 'overallRating') {
      const ratings = [
        parseInt(newFormData.teachingQuality),
        parseInt(newFormData.communication),
        parseInt(newFormData.availability),
        parseInt(newFormData.courseContent)
      ];
      const average = Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length);
      newFormData.overallRating = average;
    }
    
    setFormData(newFormData);
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();

    if (!formData.teacherId || !formData.subjectId) {
      setMessage({ text: 'Please select teacher and subject', type: 'warning' });
      return;
    }

    try {
      // Get current student profile using authenticated context
      const studentResponse = await api.get('/students/profile');
      const student = studentResponse.data;

      const feedbackData = {
        studentId: student.id,
        teacherId: formData.teacherId,
        subjectId: formData.subjectId,
        program: student.program,
        semester: student.semester,
        teachingQuality: parseInt(formData.teachingQuality),
        communication: parseInt(formData.communication),
        availability: parseInt(formData.availability),
        courseContent: parseInt(formData.courseContent),
        overallRating: parseInt(formData.overallRating),
        comments: formData.comments,
        positiveAspects: formData.positiveAspects,
        areasForImprovement: formData.areasForImprovement,
        isAnonymous: formData.isAnonymous
      };

      // Check if we're editing or creating
      if (editingFeedbackId) {
        // PUT request to update existing feedback
        await api.put(`/teacher-feedback/${editingFeedbackId}`, feedbackData);
        setMessage({ text: 'Feedback updated successfully', type: 'success' });
      } else {
        // POST request to create new feedback
        await api.post('/teacher-feedback', feedbackData);
        setMessage({ text: 'Feedback submitted successfully', type: 'success' });
      }

      // Reset form and state
      setFormData({
        teacherId: '',
        subjectId: '',
        teachingQuality: 3,
        communication: 3,
        availability: 3,
        courseContent: 3,
        overallRating: 3,
        comments: '',
        positiveAspects: '',
        areasForImprovement: '',
        isAnonymous: true
      });
      setEditingFeedbackId(null);
      setShowFeedbackForm(false);
      fetchMyFeedbacks();
    } catch (err) {
      console.error('Error submitting feedback:', err);
      console.error('Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message
      });
      const errorMsg = err.response?.data?.message || err.response?.statusText || err.message;
      setMessage({ text: `Failed to submit feedback: ${errorMsg}`, type: 'error' });
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/teacher-feedback/${feedbackId}`);
      setMessage({ text: 'Feedback deleted successfully', type: 'success' });
      fetchMyFeedbacks();
    } catch (err) {
      console.error('Error deleting feedback:', err);
      setMessage({ text: `Failed to delete feedback: ${err.message}`, type: 'error' });
    }
  };

  const handleEditFeedback = async (feedback) => {
    // Populate form with feedback data for editing
    setFormData({
      teacherId: feedback.teacherId,
      subjectId: feedback.subjectId,
      teachingQuality: feedback.teachingQuality,
      communication: feedback.communication,
      availability: feedback.availability,
      courseContent: feedback.courseContent,
      overallRating: parseInt(feedback.overallRating),
      comments: feedback.comments || '',
      positiveAspects: feedback.positiveAspects || '',
      areasForImprovement: feedback.areasForImprovement || '',
      isAnonymous: feedback.isAnonymous || false
    });
    setEditingFeedbackId(feedback.id);
    setShowFeedbackForm(true);
    // Scroll to form
    setTimeout(() => {
      document.querySelector('.feedback-form-container')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  if (!isFeedbackActive) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#fff3cd', borderRadius: '4px', marginTop: '20px' }}>
        <h3 style={{ color: '#856404', marginTop: 0 }}>⏳ Feedback Not Available</h3>
        <p style={{ color: '#856404', marginBottom: 0 }}>
          The feedback form for your program and semester is currently not activated by the admin. 
          Please check back later or contact your administrator.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9f9f9', minHeight: '90vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>📝 Teacher Feedback</h2>
        {!showFeedbackForm && (
          <button
            onClick={() => setShowFeedbackForm(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#248b28',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            ✍️ Give Feedback
          </button>
        )}
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

      {/* Feedback Form */}
      {showFeedbackForm && (
        <div className="feedback-form-container" style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: 0 }}>Submit Your Feedback</h3>
          <form onSubmit={handleSubmitFeedback}>
            {/* Teacher Selection */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Select Teacher <span style={{ color: 'red' }}>*</span>
              </label>
              <select
                name="teacherId"
                value={formData.teacherId}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="">-- Select a Teacher --</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.fullName || 'Unknown'}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Selection */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Select Subject <span style={{ color: 'red' }}>*</span>
              </label>
              <select
                name="subjectId"
                value={formData.subjectId}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="">-- Select a Subject --</option>
                {subjects.length > 0 ? (
                  subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.subjectName || subject.courseName || 'Unknown'}
                    </option>
                  ))
                ) : (
                  <option disabled>No subjects available</option>
                )}
              </select>
            </div>

            {/* Ratings */}
            <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
              <h4 style={{ marginTop: 0 }}>Rate Your Teacher (1-5) 🌟</h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                {/* Teaching Quality */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px' }}>Teaching Quality: {formData.teachingQuality}/5</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={formData.teachingQuality}
                    onChange={(e) => handleRatingChange('teachingQuality', e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>

                {/* Communication */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px' }}>Communication: {formData.communication}/5</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={formData.communication}
                    onChange={(e) => handleRatingChange('communication', e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>

                {/* Availability */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px' }}>Availability: {formData.availability}/5</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={formData.availability}
                    onChange={(e) => handleRatingChange('availability', e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>

                {/* Course Content */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px' }}>Course Content: {formData.courseContent}/5</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={formData.courseContent}
                    onChange={(e) => handleRatingChange('courseContent', e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>

                {/* Overall Rating */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    Overall Rating: <span style={{ color: '#4caf50' }}>{formData.overallRating}/5 {'⭐'.repeat(formData.overallRating)}</span>
                  </label>
                  <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>
                    This is automatically calculated as the average of all ratings
                  </p>
                </div>
              </div>
            </div>

            {/* Comments */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                General Comments
              </label>
              <textarea
                name="comments"
                value={formData.comments}
                onChange={handleInputChange}
                placeholder="Share your overall thoughts about the teacher..."
                rows="4"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontFamily: 'Arial, sans-serif',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Positive Aspects */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Positive Aspects
              </label>
              <textarea
                name="positiveAspects"
                value={formData.positiveAspects}
                onChange={handleInputChange}
                placeholder="What did you appreciate about this teacher?"
                rows="3"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontFamily: 'Arial, sans-serif',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Areas for Improvement */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Areas for Improvement
              </label>
              <textarea
                name="areasForImprovement"
                value={formData.areasForImprovement}
                onChange={handleInputChange}
                placeholder="What could this teacher improve on?"
                rows="3"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontFamily: 'Arial, sans-serif',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Anonymous Option */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="isAnonymous"
                  checked={formData.isAnonymous}
                  onChange={handleInputChange}
                  style={{ marginRight: '10px', cursor: 'pointer' }}
                />
                <span>Submit as Anonymous</span>
              </label>
              <p style={{ fontSize: '12px', color: '#999', margin: '5px 0 0 0' }}>
                If checked, the teacher won't know your identity
              </p>
            </div>

            {/* Submit Button */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: editingFeedbackId ? '#2196F3' : '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                {editingFeedbackId ? '💾 Update Feedback' : '✅ Submit Feedback'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowFeedbackForm(false);
                  setEditingFeedbackId(null);
                  setFormData({
                    teacherId: '',
                    subjectId: '',
                    teachingQuality: 3,
                    communication: 3,
                    availability: 3,
                    courseContent: 3,
                    overallRating: 3,
                    comments: '',
                    positiveAspects: '',
                    areasForImprovement: '',
                    isAnonymous: true
                  });
                }}
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
          </form>
        </div>
      )}

      {/* My Feedbacks */}
      {submittedFeedbacks.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: 0 }}>Your Submitted Feedback</h3>
          <div style={{ display: 'grid', gap: '15px' }}>
            {submittedFeedbacks.map(feedback => (
              <div key={feedback.id} style={{
                padding: '15px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: '#fafafa'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                  <div>
                    <strong>{feedback.teacherName || 'Unknown Teacher'}</strong>
                    <span style={{ fontSize: '12px', color: '#999', marginLeft: '10px' }}>
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleEditFeedback(feedback)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#1976D2'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#2196F3'}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteFeedback(feedback.id)}
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
                      onMouseOver={(e) => e.target.style.backgroundColor = '#d32f2f'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#f44336'}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
                <p style={{ margin: '5px 0', color: '#666' }}>
                  Subject: {feedback.subjectName || 'N/A'}
                </p>
                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                  <strong>Rating: {feedback.overallRating}/5</strong> {'⭐'.repeat(feedback.overallRating)}
                </p>
                {feedback.comments && (
                  <p style={{ margin: '10px 0 0 0', color: '#555', fontSize: '13px' }}>
                    {feedback.comments}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
