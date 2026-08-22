import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import api from '../services/api';
import '../styles/attendance.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

export const AttendanceReport = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [chartData, setChartData] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [subjectStudents, setSubjectStudents] = useState([]);
  const [studentAttendance, setStudentAttendance] = useState({});

  useEffect(() => {
    fetchTeacherSubjects();
  }, [user.email]);

  useEffect(() => {
    if (selectedSubject) {
      fetchAttendanceStats(selectedSubject);
      fetchSubjectStudents(selectedSubject);
    } else {
      setAttendanceStats(null);
      setChartData(null);
      setSubjectStudents([]);
      setStudentAttendance({});
    }
  }, [selectedSubject, startDate, endDate]);

  const fetchTeacherSubjects = async () => {
    try {
      console.log('Fetching subjects for teacher:', user.email);
      const response = await api.get(`/subjects/teacher/${user.email}`);
      console.log('Subjects response:', response.data);
      setSubjects(Array.isArray(response.data) ? response.data : []);
      if (response.data?.length > 0) {
        console.log('Setting first subject:', response.data[0].id);
        setSelectedSubject(response.data[0].id);
      }
    } catch (err) {
      console.error('Error fetching subjects:', err);
      setError('Failed to load subjects');
      setSubjects([]);
    }
  };

  const fetchAttendanceStats = async (subjectId) => {
    try {
      console.log('Fetching attendance stats for subject:', subjectId);
      setError('');
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await api.get(`/attendance/stats/subject/${subjectId}`, { params });
      console.log('Attendance stats response:', response.data);
      if (response.data) {
        const stats = response.data;
        const total = stats.present + stats.absent;
        
        console.log('Processed stats:', { total, present: stats.present, absent: stats.absent });
        
        setAttendanceStats({
          total,
          present: stats.present || 0,
          absent: stats.absent || 0,
          presentPercent: total > 0 ? ((stats.present / total) * 100).toFixed(1) : 0,
          absentPercent: total > 0 ? ((stats.absent / total) * 100).toFixed(1) : 0
        });

        // Prepare chart data
        setChartData({
          pie: {
            labels: ['Present', 'Absent'],
            datasets: [{
              data: [stats.present || 0, stats.absent || 0],
              backgroundColor: ['#4caf50', '#f44336'],
              borderColor: ['#45a049', '#da190b'],
              borderWidth: 2
            }]
          }
        });
      }
    } catch (err) {
      console.error('Error fetching attendance stats:', err);
      // Don't show error, just initialize with empty data
      setAttendanceStats({
        total: 0,
        present: 0,
        absent: 0,
        presentPercent: 0,
        absentPercent: 0
      });
      setChartData({
        pie: {
          labels: ['Present', 'Absent'],
          datasets: [{
            data: [0, 0],
            backgroundColor: ['#4caf50', '#f44336'],
            borderColor: ['#45a049', '#da190b'],
            borderWidth: 2
          }]
        }
      });
    }
  };

  const fetchSubjectStudents = async (subjectId) => {
    try {
      console.log('Fetching students for subject:', subjectId);
      const response = await api.get(`/subjects/${subjectId}/students`);
      console.log('Students response:', response.data);
      setSubjectStudents(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching subject students:', err);
      setSubjectStudents([]);
    }
  };

  const fetchStudentAttendanceDetails = async (subjectId, studentId) => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await api.get(`/attendance/student/${studentId}/subject/${subjectId}`, { params });
      console.log(`Attendance for student ${studentId}:`, response.data);
      
      // Calculate summary from list of attendance records
      const records = Array.isArray(response.data) ? response.data : [];
      const present = records.filter(r => r.status === 'PRESENT').length;
      const absent = records.filter(r => r.status === 'ABSENT').length;
      const total = records.length;
      
      return { present, absent, total };
    } catch (err) {
      console.error(`Error fetching attendance for student ${studentId}:`, err);
      return { present: 0, absent: 0, total: 0 };
    }
  };

  const fetchAllStudentAttendance = async (subjectId, students) => {
    if (!students || students.length === 0) return;
    
    const attendanceData = {};
    for (const student of students) {
      const attendance = await fetchStudentAttendanceDetails(subjectId, student.id);
      attendanceData[student.id] = attendance;
    }
    setStudentAttendance(attendanceData);
  };

  useEffect(() => {
    if (selectedSubject && subjectStudents.length > 0) {
      fetchAllStudentAttendance(selectedSubject, subjectStudents);
    }
  }, [subjectStudents, startDate, endDate]);

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

  const pieOptions = { ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Attendance Distribution' } } };

  return (
    <div className="attendance-container">
      <h1>📊 Attendance Reports & Analytics</h1>

      {error && <div className="error-message" style={{padding: '12px', marginBottom: '15px', backgroundColor: '#fee', color: '#c33', borderRadius: '4px'}}>{error}</div>}

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

      {/* Date Range Filter */}
      {selectedSubject && (
        <div style={{marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '4px', borderLeft: '4px solid #ff9800'}}>
          <label style={{fontWeight: 'bold', display: 'block', marginBottom: '10px'}}>Filter by Date Range:</label>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', alignItems: 'end'}}>
            <div>
              <label style={{fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px'}}>Start Date:</label>
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
              />
            </div>
            <div>
              <label style={{fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px'}}>End Date:</label>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
              />
            </div>
            <button 
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              style={{padding: '8px 16px', backgroundColor: '#ff9800', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
            >
              Clear Dates
            </button>
          </div>
        </div>
      )}

      {/* Statistics View */}
      {attendanceStats && chartData && selectedSubject ? (
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
            <div style={{backgroundColor: '#2196f3', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
              <h4 style={{margin: '0 0 10px 0', fontSize: '14px', opacity: 0.9}}>Total Records</h4>
              <p style={{margin: 0, fontSize: '32px', fontWeight: 'bold'}}>{attendanceStats.total}</p>
            </div>
          </div>

          {/* Charts Grid */}
          {/* <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', marginBottom: '30px'}}>
            <div style={{backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
              <h4 style={{marginTop: 0, marginBottom: '15px', textAlign: 'center', color: '#333'}}>Attendance Distribution</h4>
              <Pie data={chartData.pie} options={pieOptions} />
            </div>
          </div> */}

          {/* Student Attendance Details */}
          {subjectStudents && subjectStudents.length > 0 && (
            <div style={{backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
              <h3 style={{marginTop: 0, marginBottom: '15px', color: '#333'}}>Student Attendance Details</h3>
              <div style={{overflowX: 'auto', width: '100%'}}>
                <table className="attendance-table" style={{width: 'auto', minWidth: '100%', borderCollapse: 'collapse', tableLayout: 'fixed'}}>
                  <thead>
                    <tr style={{backgroundColor: '#1c3abf', color: 'white'}}>
                      <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold', width: '120px'}}>Student Name</th>
                      <th style={{padding: '12px', textAlign: 'center', fontWeight: 'bold', width: '120px'}}>Roll No.</th>
                      <th style={{padding: '12px', textAlign: 'center', fontWeight: 'bold', width: '70px'}}>Present</th>
                      <th style={{padding: '12px', textAlign: 'center', fontWeight: 'bold', width: '70px'}}>Absent</th>
                      <th style={{padding: '12px', textAlign: 'center', fontWeight: 'bold', width: '70px'}}>Total</th>
                      <th style={{padding: '12px', textAlign: 'center', fontWeight: 'bold', width: '80px'}}>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjectStudents.map((student, idx) => {
                      const attendance = studentAttendance[student.id] || { present: 0, absent: 0, total: 0 };
                      const percentage = attendance.total > 0 ? ((attendance.present / attendance.total) * 100).toFixed(1) : 0;
                      return (
                        <tr key={student.id} style={{borderBottom: '1px solid #eee', backgroundColor: idx % 2 === 0 ? '#f9f9f9' : 'white'}}>
                          <td style={{padding: '12px', width: '120px'}}>{student.fullName}</td>
                          <td style={{padding: '12px', textAlign: 'center', width: '120px'}}>{student.studentId || student.enrollmentNumber || 'N/A'}</td>
                          <td style={{padding: '12px', textAlign: 'center', color: '#4caf50', fontWeight: 'bold', width: '70px'}}>{attendance.present}</td>
                          <td style={{padding: '12px', textAlign: 'center', color: '#f44336', fontWeight: 'bold', width: '70px'}}>{attendance.absent}</td>
                          <td style={{padding: '12px', textAlign: 'center', fontWeight: 'bold', width: '70px'}}>{attendance.total}</td>
                          <td style={{padding: '12px', textAlign: 'center', backgroundColor: percentage >= 75 ? '#c8e6c9' : '#ffccbc', fontWeight: 'bold', width: '80px'}}>{percentage}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{padding: '20px', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '4px', color: '#666'}}>
          <p style={{margin: 0}}>Select a subject to view attendance statistics and charts.</p>
        </div>
      )}
    </div>
  );
};

export default AttendanceReport;
