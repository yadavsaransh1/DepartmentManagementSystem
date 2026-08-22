import React, { useState, useEffect } from 'react';
import api from '../services/api';

export const AttendanceManagement = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [filterStudent, setFilterStudent] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch attendance on mount
  useEffect(() => {
    if (user.role === 'TEACHER') {
      fetchTeacherSubjects();
    } else {
      fetchAttendance();
    }
  }, []);

  const fetchTeacherSubjects = async () => {
    try {
      const response = await api.get(`/subjects/teacher/${user.email}`);
      setSubjects(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching subjects:', err);
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError('');
      
      // For teachers, fetch with date range
      if (user.role === 'TEACHER' && filterSubject) {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        
        const response = await api.get(`/attendance/teacher/${user.email}/subject/${filterSubject}?${params.toString()}`);
        setAttendanceRecords(Array.isArray(response.data) ? response.data : []);
      } else {
        // For admins, fetch all
        const response = await api.get('/attendance');
        let records = Array.isArray(response.data) ? response.data : [];
        
        // Apply date filtering
        if (startDate || endDate) {
          const start = startDate ? new Date(startDate) : new Date('1900-01-01');
          const end = endDate ? new Date(endDate) : new Date('2100-12-31');
          
          records = records.filter(r => {
            const recordDate = new Date(r.attendanceDate);
            return recordDate >= start && recordDate <= end;
          });
        }
        
        setAttendanceRecords(records);
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setError('Failed to load attendance records');
      setAttendanceRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'PRESENT': return '#4caf50';
      case 'ABSENT': return '#f44336';
      default: return '#666';
    }
  };

  const filteredRecords = attendanceRecords.filter(r => 
    (r.studentName || r.student?.fullName || '').toLowerCase().includes(filterStudent.toLowerCase())
  );

  const presentCount = filteredRecords.filter(r => r.status === 'PRESENT').length;
  const absentCount = filteredRecords.filter(r => r.status === 'ABSENT').length;

  return (
    <div className="management-container">
      <h1>Attendance Management</h1>
      
      {error && <div className="error">{error}</div>}

      <div className="filter-box" style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '20px'}}>
        <div>
          <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>Student Name Filter</label>
          <input 
            type="text" 
            placeholder="Search by student name..."
            value={filterStudent}
            onChange={(e) => setFilterStudent(e.target.value)}
            style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
          />
        </div>

        {user.role === 'TEACHER' && (
          <div>
            <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>Select Subject</label>
            <select 
              value={filterSubject} 
              onChange={(e) => {
                setFilterSubject(e.target.value);
              }}
              style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
            >
              <option value="">Select a subject</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.subjectName}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>From Date (Optional)</label>
          <input 
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
          />
        </div>

        <div>
          <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>To Date (Optional)</label>
          <input 
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
          />
        </div>
      </div>

      <button 
        onClick={fetchAttendance}
        style={{padding: '8px 16px', backgroundColor: '#0066cc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px'}}
      >
        Apply Filters
      </button>

      <div className="list-container">
        {loading ? (
          <p>Loading attendance records...</p>
        ) : filteredRecords.length === 0 ? (
          <p>No attendance records found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Date</th>
                <th>Subject</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map(record => (
                <tr key={record.id}>
                  <td>{record.studentName || record.student?.fullName || 'N/A'}</td>
                  <td>{new Date(record.attendanceDate || record.date).toLocaleDateString()}</td>
                  <td>{record.subjectName || record.subject?.name || record.subject || 'N/A'}</td>
                  <td>
                    <span style={{
                      backgroundColor: getStatusColor(record.status),
                      color: 'white',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="stats-box">
        <div className="stat-item">
          <h4>Present</h4>
          <p>{presentCount}</p>
        </div>
        <div className="stat-item">
          <h4>Absent</h4>
          <p>{absentCount}</p>
        </div>
        </div>
      </div>
  );
};

export default AttendanceManagement;
