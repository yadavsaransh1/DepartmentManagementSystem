import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Pie, Doughnut } from 'react-chartjs-2';
import api from '../services/api';
import '../styles/attendance.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

export const MarkAttendanceWithCharts = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [chartData, setChartData] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [view, setView] = useState('mark'); // 'mark' or 'stats'

  useEffect(() => {
    fetchTeacherSubjects();
  }, [user.email]);

  useEffect(() => {
    if (selectedSubject) {
      fetchStudentsForSubject(selectedSubject);
      fetchAttendanceStats(selectedSubject);
    }
  }, [selectedSubject]);

  const fetchTeacherSubjects = async () => {
    try {
      const teacherIdentifier = user.email;
      const response = await api.get(`/subjects/teacher/${teacherIdentifier}`);
      setSubjects(Array.isArray(response.data) ? response.data : []);
      if (response.data?.length > 0) {
        setSelectedSubject(response.data[0].id);
      }
    } catch (err) {
      console.error('Error fetching subjects:', err);
      setError('Failed to load subjects');
      setSubjects([]);
    }
  };

  const fetchStudentsForSubject = async (subjectId) => {
    try {
      const response = await api.get(`/subjects/${subjectId}/students`);
      const studentsList = Array.isArray(response.data) ? response.data : [];
      setStudents(studentsList);
      const newAttendanceData = {};
      studentsList.forEach(student => {
        newAttendanceData[student.id] = { status: 'PRESENT', date: new Date().toISOString().split('T')[0], time: '10:00' };
      });
      setAttendanceData(newAttendanceData);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students for this subject');
      setStudents([]);
    }
  };

  const fetchAttendanceStats = async (subjectId) => {
    try {
      const response = await api.get(`/attendance/stats/subject/${subjectId}`);
      if (response.data) {
        const stats = response.data;
        const total = stats.present + stats.absent + stats.late;
        
        setAttendanceStats({
          total,
          present: stats.present,
          absent: stats.absent,
          late: stats.late,
          presentPercent: total > 0 ? ((stats.present / total) * 100).toFixed(1) : 0,
          absentPercent: total > 0 ? ((stats.absent / total) * 100).toFixed(1) : 0,
          latePercent: total > 0 ? ((stats.late / total) * 100).toFixed(1) : 0
        });

        // Prepare chart data
        setChartData({
          pie: {
            labels: ['Present', 'Absent', 'Late'],
            datasets: [{
              data: [stats.present, stats.absent, stats.late],
              backgroundColor: ['#4caf50', '#f44336', '#ff9800'],
              borderColor: ['#45a049', '#da190b', '#e68900'],
              borderWidth: 2
            }]
          },
          doughnut: {
            labels: ['Present', 'Absent', 'Late'],
            datasets: [{
              data: [stats.present, stats.absent, stats.late],
              backgroundColor: ['#4caf50', '#f44336', '#ff9800'],
              borderColor: ['#45a049', '#da190b', '#e68900'],
              borderWidth: 2
            }]
          },
          bar: {
            labels: ['Present', 'Absent', 'Late'],
            datasets: [{
              label: 'Count',
              data: [stats.present, stats.absent, stats.late],
              backgroundColor: ['#4caf50', '#f44336', '#ff9800'],
              borderColor: ['#45a049', '#da190b', '#e68900'],
              borderWidth: 2
            }]
          }
        });
      }
    } catch (err) {
      console.error('Error fetching attendance stats:', err);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status }
    }));
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setAttendanceData(prev => {
      const updated = {};
      Object.keys(prev).forEach(key => {
        updated[key] = { ...prev[key], date };
      });
      return updated;
    });
  };

  const handleTimeChange = (e) => {
    const time = e.target.value;
    setAttendanceData(prev => {
      const updated = {};
      Object.keys(prev).forEach(key => {
        updated[key] = { ...prev[key], time };
      });
      return updated;
    });
  };

  const handleMarkAttendance = async () => {
    if (!selectedSubject) {
      setError('Please select a subject');
      return;
    }

    try {
      setMessage('');
      setError('');
      const attendanceList = Object.entries(attendanceData).map(([studentId, data]) => ({
        studentId: parseInt(studentId),
        subjectId: parseInt(selectedSubject),
        teacherEmail: user.email,
        attendanceDate: data.date,
        status: data.status
      }));

      await api.post('/attendance/bulk', attendanceList);
      setMessage(`✓ Attendance marked for ${attendanceList.length} students successfully!`);
      setTimeout(() => {
        fetchAttendanceStats(selectedSubject);
        setMessage('');
      }, 2000);
    } catch (err) {
      console.error('Error marking attendance:', err);
      setError('Failed to mark attendance: ' + (err.response?.data?.error || err.message));
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { size: 12 },
          padding: 15
        }
      },
      title: {
        display: true,
        font: { size: 16, weight: 'bold' }
      }
    }
  };

  const pieOptions = { ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Attendance Distribution (Pie)' } } };
  const doughnutOptions = { ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Attendance Distribution (Doughnut)' } } };
  const barOptions = { ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Attendance Count by Status' } }, scales: { y: { beginAtZero: true } } };

  return (
    <div className="attendance-container">
      <h1>📊 Mark & View Attendance</h1>

      {message && <div className="success-message" style={{padding: '12px', marginBottom: '15px', backgroundColor: '#efe', color: '#3c3', borderRadius: '4px'}}>{message}</div>}
      {error && <div className="error-message" style={{padding: '12px', marginBottom: '15px', backgroundColor: '#fee', color: '#c33', borderRadius: '4px'}}>{error}</div>}

      {/* View Selector */}
      <div style={{marginBottom: '20px', display: 'flex', gap: '10px'}}>
        <button 
          onClick={() => setView('mark')}
          style={{
            padding: '10px 20px', 
            backgroundColor: view === 'mark' ? '#667eea' : '#f0f0f0',
            color: view === 'mark' ? 'white' : '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.2s'
          }}
        >
          📋 Mark Attendance
        </button>
        <button 
          onClick={() => setView('stats')}
          style={{
            padding: '10px 20px', 
            backgroundColor: view === 'stats' ? '#667eea' : '#f0f0f0',
            color: view === 'stats' ? 'white' : '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.2s'
          }}
        >
          📈 View Statistics
        </button>
      </div>

      {/* Subject Selection */}
      <div style={{marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '4px', borderLeft: '4px solid #667eea'}}>
        <label style={{fontWeight: 'bold', display: 'block', marginBottom: '8px'}}>Select Subject:</label>
        <select 
          value={selectedSubject} 
          onChange={(e) => setSelectedSubject(e.target.value)}
          style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px'}}
        >
          <option value="">-- Select a Subject --</option>
          {subjects.map(subject => (
            <option key={subject.id} value={subject.id}>
              {subject.subjectName} ({subject.course} - Sem {subject.semester})
            </option>
          ))}
        </select>
      </div>

      {view === 'mark' ? (
        // Mark Attendance View
        <>
          {selectedSubject && students.length > 0 && (
            <div style={{backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
              <h3>📝 Mark Attendance - {students.length} Students</h3>
              
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px'}}>
                <div>
                  <label style={{fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>Attendance Date:</label>
                  <input 
                    type="date" 
                    value={attendanceData[students[0]?.id]?.date || new Date().toISOString().split('T')[0]}
                    onChange={handleDateChange}
                    style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px'}}
                  />
                </div>
                <div>
                  <label style={{fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>Time:</label>
                  <input 
                    type="time" 
                    value={attendanceData[students[0]?.id]?.time || '10:00'}
                    onChange={handleTimeChange}
                    style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px'}}
                  />
                </div>
              </div>

              <div style={{overflowX: 'auto', marginBottom: '20px'}}>
                <table style={{width: '100%', borderCollapse: 'collapse', backgroundColor: 'white'}}>
                  <thead>
                    <tr style={{backgroundColor: '#f0f0f0', borderBottom: '2px solid #ddd'}}>
                      <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Student ID</th>
                      <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Name</th>
                      <th style={{padding: '12px', textAlign: 'center', fontWeight: 'bold'}}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) => (
                      <tr key={student.id} style={{borderBottom: '1px solid #eee', backgroundColor: index % 2 === 0 ? '#fafafa' : 'white'}}>
                        <td style={{padding: '12px'}}>{student.studentId || student.id}</td>
                        <td style={{padding: '12px'}}>{student.fullName}</td>
                        <td style={{padding: '12px', textAlign: 'center'}}>
                          <select 
                            value={attendanceData[student.id]?.status || 'PRESENT'}
                            onChange={(e) => handleStatusChange(student.id, e.target.value)}
                            style={{
                              padding: '8px 12px',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              backgroundColor: 
                                attendanceData[student.id]?.status === 'PRESENT' ? '#e8f5e9' :
                                attendanceData[student.id]?.status === 'ABSENT' ? '#ffebee' : '#fff3e0',
                              color: 
                                attendanceData[student.id]?.status === 'PRESENT' ? '#2e7d32' :
                                attendanceData[student.id]?.status === 'ABSENT' ? '#c62828' : '#e65100',
                              fontWeight: 'bold',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="PRESENT">✓ Present</option>
                            <option value="ABSENT">✗ Absent</option>
                            <option value="LATE">⏱ Late</option>
                            <option value="LEAVE">🏥 Leave</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button 
                onClick={handleMarkAttendance}
                style={{
                  padding: '12px 30px',
                  backgroundColor: '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  width: '100%'
                }}
              >
                ✓ Submit Attendance
              </button>
            </div>
          )}
        </>
      ) : (
        // Statistics View
        <>
          {attendanceStats && chartData && (
            <div>
              {/* Stats Cards */}
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px'}}>
                <div style={{backgroundColor: '#4caf50', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
                  <h4 style={{margin: '0 0 10px 0', fontSize: '14px', opacity: 0.9}}>Present</h4>
                  <p style={{margin: 0, fontSize: '32px', fontWeight: 'bold'}}>{attendanceStats.present}</p>
                  <small>{attendanceStats.presentPercent}%</small>
                </div>
                <div style={{backgroundColor: '#f44336', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
                  <h4 style={{margin: '0 0 10px 0', fontSize: '14px', opacity: 0.9}}>Absent</h4>
                  <p style={{margin: 0, fontSize: '32px', fontWeight: 'bold'}}>{attendanceStats.absent}</p>
                  <small>{attendanceStats.absentPercent}%</small>
                </div>
                <div style={{backgroundColor: '#ff9800', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
                  <h4 style={{margin: '0 0 10px 0', fontSize: '14px', opacity: 0.9}}>Late</h4>
                  <p style={{margin: 0, fontSize: '32px', fontWeight: 'bold'}}>{attendanceStats.late}</p>
                  <small>{attendanceStats.latePercent}%</small>
                </div>
                <div style={{backgroundColor: '#2196f3', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
                  <h4 style={{margin: '0 0 10px 0', fontSize: '14px', opacity: 0.9}}>Total Records</h4>
                  <p style={{margin: 0, fontSize: '32px', fontWeight: 'bold'}}>{attendanceStats.total}</p>
                </div>
              </div>

              {/* Charts Grid */}
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', marginBottom: '30px'}}>
                <div style={{backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
                  <h4 style={{marginTop: 0, marginBottom: '15px', textAlign: 'center', color: '#333'}}>Attendance Distribution (Pie Chart)</h4>
                  <Pie data={chartData.pie} options={pieOptions} />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MarkAttendanceWithCharts;
