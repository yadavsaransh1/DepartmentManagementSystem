import React, { useState, useEffect } from 'react';
import api from '../services/api';
import MarksCard from '../components/MarksCard';
import '../styles/marks-management.css';

const StudentMarksView = () => {
  const [studentMarks, setStudentMarks] = useState({
    teacherMarks: [],
    adminMarks: []
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Get user ID directly from localStorage
  let studentId = localStorage.getItem('userId');
  
  // Fallback: try to extract from user object if not directly stored
  if (!studentId) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    studentId = user.studentId || user.id;
    console.warn('DEBUG: studentId not found directly, extracted from user object:', studentId);
  }
  
  console.log('StudentMarksView - studentId from localStorage:', studentId);

  useEffect(() => {
    if (studentId) {
      fetchStudentMarks();
    } else {
      console.warn('DEBUG: No studentId available, cannot fetch marks');
      setErrorMsg('User ID not available');
    }
  }, []);

  const fetchStudentMarks = async () => {
    try {
      setLoading(true);
      
      // Fetch both teacher and admin marks in parallel
      const [teacherResponse, adminResponse] = await Promise.all([
        api.get(`/marks/student/${studentId}/type/TEACHER`),
        api.get(`/marks/student/${studentId}/type/ADMIN`)
      ]);

      console.log('Teacher marks response:', teacherResponse.data);
      console.log('Admin marks response:', adminResponse.data);

      // Ensure we always have arrays
      const teacherMarks = Array.isArray(teacherResponse.data) ? teacherResponse.data : [];
      const adminMarks = Array.isArray(adminResponse.data) ? adminResponse.data : [];

      setStudentMarks({
        teacherMarks: teacherMarks,
        adminMarks: adminMarks
      });
      setErrorMsg('');
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to load marks');
      console.error('Error fetching marks:', error);
      // Set empty arrays on error
      setStudentMarks({
        teacherMarks: [],
        adminMarks: []
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="marks-management-container">
      <div className="marks-header">
        <h2>My Marks & Performance</h2>
        <p>View your semester marks, assignments, and overall performance</p>
      </div>

      {errorMsg && <div className="alert alert-error">{errorMsg}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          Loading your marks...
        </div>
      ) : (
        <>
          {/* Teacher Marks Section */}
          {studentMarks?.teacherMarks && Array.isArray(studentMarks.teacherMarks) && studentMarks.teacherMarks.length > 0 ? (
            <div style={{ marginBottom: '30px' }}>
              <div style={{
                background: '#f0f4ff',
                padding: '20px',
                borderRadius: '8px',
                borderLeft: '4px solid #3b82f6',
                marginBottom: '20px'
              }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>👨‍🏫 Teacher Marks</h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>Marks entered by your teachers</p>
              </div>
              
              {studentMarks.teacherMarks.map(mark => (
                <MarksCard key={mark.id || Math.random()} mark={mark} type="TEACHER" />
              ))}
            </div>
          ) : null}

          {/* Admin/Semester Marks Section */}
          {studentMarks?.adminMarks && Array.isArray(studentMarks.adminMarks) && studentMarks.adminMarks.length > 0 ? (
            <div style={{ marginBottom: '30px' }}>
              <div style={{
                background: '#fef3f1',
                padding: '20px',
                borderRadius: '8px',
                borderLeft: '4px solid #ef4444',
                marginBottom: '20px'
              }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>📋 Admin/Semester Marks</h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>Semester marks entered by admin</p>
              </div>
              
              {studentMarks.adminMarks.map(mark => (
                <MarksCard key={mark.id || Math.random()} mark={mark} type="ADMIN" />
              ))}
            </div>
          ) : null}

          {!loading && studentMarks.teacherMarks.length === 0 && studentMarks.adminMarks.length === 0 && (
            <div style={{
              background: '#f3f4f6',
              padding: '40px',
              borderRadius: '8px',
              textAlign: 'center',
              color: '#666'
            }}>
              <p>No marks data available yet. Please check back later.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StudentMarksView;
