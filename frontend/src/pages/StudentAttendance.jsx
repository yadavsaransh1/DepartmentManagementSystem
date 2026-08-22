import React, { useState, useEffect } from 'react';
import api from '../services/api';
import AttendanceProgressBar from '../components/AttendanceProgressBar';

export const StudentAttendance = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [studentId, setStudentId] = useState(null);
  const [overallAttendance, setOverallAttendance] = useState(0);
  const [subjectAttendance, setSubjectAttendance] = useState({});

  useEffect(() => {
    // Get current student profile using JWT authentication
    fetchStudentProfile();
  }, []);

  const fetchStudentProfile = async () => {
    try {
      setLoading(true);
      // Use the /profile endpoint which authenticates via JWT token to get the current student
      const response = await api.get('/students/profile');
      
      if (response.data && response.data.id) {
        setStudentId(response.data.id);
        fetchAttendance(response.data.id);
      } else {
        setError('Student record not found');
      }
    } catch (err) {
      console.error('Error fetching student profile:', err);
      setError('Failed to load attendance records');
    }
  };

  const fetchAttendance = async (sid) => {
    try {
      const response = await api.get(`/attendance/my-records?studentId=${sid}`);
      const records = Array.isArray(response.data) ? response.data : [];
      setAttendanceRecords(records);
      
      // Calculate overall attendance percentage
      if (records.length > 0) {
        const presentCount = records.filter(r => r.status === 'PRESENT').length;
        const percentage = Math.round((presentCount / records.length) * 100);
        setOverallAttendance(percentage);
        
        // Calculate attendance by subject
        const bySubject = {};
        records.forEach(record => {
          const subject = record.subjectCode || 'Unknown';
          if (!bySubject[subject]) {
            bySubject[subject] = { present: 0, total: 0 };
          }
          bySubject[subject].total++;
          if (record.status === 'PRESENT') {
            bySubject[subject].present++;
          }
        });
        
        // Convert to percentages
        Object.keys(bySubject).forEach(subject => {
          bySubject[subject].percentage = Math.round((bySubject[subject].present / bySubject[subject].total) * 100);
        });
        setSubjectAttendance(bySubject);
      }
      setError('');
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setError('Failed to load attendance records');
      setAttendanceRecords([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="management-container">
      <h1>My Attendance Records</h1>
      
      {/* Overall Attendance Progress Bar */}
      <AttendanceProgressBar percentage={overallAttendance} role="STUDENT" />
      
      {/* Subject-wise Attendance */}
      {Object.keys(subjectAttendance).length > 0 && (
        <div style={{marginBottom: '30px', padding: '15px', background: '#f8f9fa', borderRadius: '8px'}}>
          <h3 style={{marginTop: 0, marginBottom: '15px'}}>Attendance by Subject</h3>
          {Object.keys(subjectAttendance).map(subject => (
            <div key={subject} className="subject-progress-item">
              <div className="subject-name">
                <span>{subject}</span>
                <span className="subject-percentage">{subjectAttendance[subject].percentage}%</span>
              </div>
              <div style={{width: '100%', height: '20px', background: '#e9ecef', borderRadius: '4px', overflow: 'hidden'}}>
                <div style={{
                  width: `${subjectAttendance[subject].percentage}%`,
                  height: '100%',
                  background: subjectAttendance[subject].percentage >= 75 ? '#27ae60' : 
                              subjectAttendance[subject].percentage >= 40 ? '#f39c12' : '#e74c3c'
                }}></div>
              </div>
              <small style={{color: '#666'}}>
                {subjectAttendance[subject].present} / {subjectAttendance[subject].total} classes attended
              </small>
            </div>
          ))}
        </div>
      )}
      
      {error && <div className="error" style={{padding: '12px', marginBottom: '15px', backgroundColor: '#fee', color: '#c33', borderRadius: '4px'}}>{error}</div>}

      <div className="list-container">
        {loading ? (
          <p>Loading attendance records...</p>
        ) : attendanceRecords.length === 0 ? (
          <p>No attendance records found yet.</p>
        ) : (
          <table className='attendence-table' style={{width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
            <thead>
              <tr style={{backgroundColor: '#0051a2', borderBottom: '2px solid #dee2e6'}}>
                <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Subject</th>
                <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Date</th>
                <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Status</th>
                <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.map((record, idx) => (
                <tr key={idx} style={{borderBottom: '1px solid #dee2e6'}}>
                  <td style={{padding: '12px'}}>{record.subjectCode || 'N/A'}</td>
                  <td style={{padding: '12px'}}>{record.attendanceDate || 'N/A'}</td>
                  <td style={{padding: '12px'}}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: record.status === 'PRESENT' ? '#d4edda' : record.status === 'ABSENT' ? '#f8d7da' : '#fff3cd',
                      color: record.status === 'PRESENT' ? '#155724' : record.status === 'ABSENT' ? '#721c24' : '#856404'
                    }}>
                      {record.status || 'N/A'}
                    </span>
                  </td>
                  <td style={{padding: '12px'}}>{record.remarks || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StudentAttendance;
