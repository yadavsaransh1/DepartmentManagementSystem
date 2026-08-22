import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import api from '../services/api';
import '../styles/attendance.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

export const AdminAttendanceReport = () => {
  const [allPrograms, setAllPrograms] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [chartData, setChartData] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [subjectStudents, setSubjectStudents] = useState([]);
  const [studentAttendance, setStudentAttendance] = useState({});

  useEffect(() => {
    fetchAllPrograms();
    fetchAllSubjects();
  }, []);

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

  const handleProgramChange = (programId) => {
    setSelectedProgram(programId);
    setSelectedSubject(''); // Reset subject when program changes
  };

  const fetchAllPrograms = async () => {
    try {
      const response = await api.get('/programs');
      let programs = Array.isArray(response.data) ? response.data : [];
      
      // If no programs from API, extract from subjects
      if (programs.length === 0) {
        const subjectsResponse = await api.get('/subjects');
        const subjects = Array.isArray(subjectsResponse.data) ? subjectsResponse.data : [];
        const uniquePrograms = [...new Set(subjects
          .map(s => s.course || s.program)
          .filter(p => p)
        )];
        programs = uniquePrograms.map(name => ({ id: name, programName: name, name }));
      }
      
      setAllPrograms(programs);
    } catch (err) {
      console.error('Error fetching programs:', err);
      setAllPrograms([]);
    }
  };

  const fetchAllSubjects = async () => {
    try {
      const response = await api.get('/subjects');
      setAllSubjects(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching subjects:', err);
      setError('Failed to load subjects');
      setAllSubjects([]);
    }
  };

  const fetchAttendanceStats = async (subjectId) => {
    try {
      setError('');
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await api.get(`/attendance/stats/subject/${subjectId}`, { params });
      if (response.data) {
        const stats = response.data;
        const total = stats.present + stats.absent;
        
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

  const getStudentsForSubject = async (subjectId) => {
    try {
      // Fetch all students and filter by those enrolled in this subject
      const studentsRes = await api.get('/students');
      const students = Array.isArray(studentsRes.data) ? studentsRes.data : [];
      
      if (students.length === 0) {
        setSubjectStudents([]);
        setStudentAttendance({});
        return;
      }

      // Get the selected subject to filter by semester and program
      const subject = allSubjects.find(s => s.id == subjectId);
      if (!subject) {
        setSubjectStudents([]);
        setStudentAttendance({});
        return;
      }

      // Filter students by subject's semester and program/course
      const enrolledStudents = students.filter(student => {
        const studentProgram = student.program || student.course;
        const subjectProgram = subject.program || subject.course;
        return student.semester === subject.semester && studentProgram === subjectProgram;
      });

      if (enrolledStudents.length === 0) {
        setSubjectStudents([]);
        setStudentAttendance({});
        return;
      }

      // Fetch attendance stats for each student in this subject
      const studentsWithAttendance = await Promise.all(
        enrolledStudents.map(async (student) => {
          try {
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            const attendanceRes = await api.get(`/attendance/student/${student.id}/subject/${subjectId}`, { params });
            const records = Array.isArray(attendanceRes.data) ? attendanceRes.data : [];
            
            const present = records.filter(r => r.status === 'PRESENT').length;
            const absent = records.filter(r => r.status === 'ABSENT').length;
            const total = records.length;
            const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;
            
            return {
              ...student,
              enrolledInSubject: true,
              present,
              absent,
              total,
              percentage
            };
          } catch (err) {
            return { ...student, present: 0, absent: 0, total: 0, percentage: 0 };
          }
        })
      );
      
      // Show all enrolled students (even those with 0 attendance records)
      setSubjectStudents(studentsWithAttendance);
      
      const attendanceMap = {};
      studentsWithAttendance.forEach(student => {
        attendanceMap[student.id] = {
          present: student.present || 0,
          absent: student.absent || 0,
          total: student.total || 0,
          percentage: student.percentage || 0
        };
      });
      setStudentAttendance(attendanceMap);
    } catch (err) {
      console.error('Error fetching students for subject:', err);
      setSubjectStudents([]);
      setStudentAttendance({});
    }
  };

  const fetchSubjectStudents = async (subjectId) => {
    getStudentsForSubject(subjectId);
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

  return (
    <div className="attendance-container">
      <h1>📊 System Attendance Analytics</h1>

      {error && <div className="error-message" style={{padding: '12px', marginBottom: '15px', backgroundColor: '#fee', color: '#c33', borderRadius: '4px'}}>{error}</div>}

      {/* Program Selection */}
      <div style={{marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '4px', borderLeft: '4px solid #2196f3'}}>
        <label style={{fontWeight: 'bold', display: 'block', marginBottom: '8px'}}>Select Program:</label>
        <select 
          value={selectedProgram} 
          onChange={(e) => handleProgramChange(e.target.value)}
          style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px'}}
        >
          <option value="">-- Select a Program --</option>
          {allPrograms.map(program => (
            <option key={program.id} value={program.programName || program.name || program.id}>
              {program.programName || program.name}
            </option>
          ))}
        </select>
      </div>

      {/* Subject Selection */}
      {selectedProgram && (
        <div style={{marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '4px', borderLeft: '4px solid #667eea'}}>
          <label style={{fontWeight: 'bold', display: 'block', marginBottom: '8px'}}>Select Subject:</label>
          <select 
            value={selectedSubject} 
            onChange={(e) => setSelectedSubject(e.target.value)}
            style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px'}}
          >
            <option value="">-- Select a Subject --</option>
            {allSubjects
              .filter(subject => {
                const subjectProgram = subject.program || subject.course;
                return subjectProgram === selectedProgram;
              })
              .map(subject => (
              <option key={subject.id} value={subject.id}>
                {subject.courseName || subject.subjectName} ({subject.semester ? `Sem ${subject.semester}` : 'No Semester'})
              </option>
            ))}
          </select>
        </div>
      )}

      {!selectedProgram && (
        <div style={{marginBottom: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '4px', borderLeft: '4px solid #ff9800', color: '#856404'}}>
          📌 Please select a program first to view available subjects
        </div>
      )}

      {/* Date Range Filtering */}
      <div style={{marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '4px', borderLeft: '4px solid #ff9800'}}>
        <h4 style={{margin: '0 0 15px 0', color: '#333'}}>🗓️ Filter by Date Range</h4>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px'}}>
          <div>
            <label style={{fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#333'}}>Start Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px'}}
            />
          </div>
          <div>
            <label style={{fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#333'}}>End Date:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px'}}
            />
          </div>
          <div style={{display: 'flex', alignItems: 'flex-end'}}>
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              style={{width: '100%', padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px'}}
            >
              Clear Dates
            </button>
          </div>
        </div>
        {(startDate || endDate) && (
          <div style={{marginTop: '10px', padding: '10px', backgroundColor: '#e8f4f8', borderRadius: '4px', fontSize: '13px', color: '#555'}}>
            {startDate && <div> Start: {new Date(startDate).toLocaleDateString()}</div>}
            {endDate && <div> End: {new Date(endDate).toLocaleDateString()}</div>}
          </div>
        )}
      </div>

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
            <div style={{backgroundColor: '#9c27b0', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
              <h4 style={{margin: '0 0 10px 0', fontSize: '14px', opacity: 0.9}}>Total Records</h4>
              <p style={{margin: 0, fontSize: '32px', fontWeight: 'bold'}}>{attendanceStats.total}</p>
            </div>
          </div>

          {/* Charts Grid - Only Pie Chart
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', marginBottom: '30px'}}>
            <div style={{backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
              <h4 style={{marginTop: 0, marginBottom: '15px', textAlign: 'center', color: '#333'}}>Attendance Distribution (Pie Chart)</h4>
              <Pie data={chartData.pie} options={pieOptions} />
            </div>
          </div> */}

          {/* Student List with Attendance Progress Bars */}
          <div style={{backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
            <h3 style={{marginTop: 0, marginBottom: '20px', color: '#333', borderBottom: '2px solid #667eea', paddingBottom: '10px'}}>📋 Student Attendance Progress</h3>
            
            {subjectStudents.length > 0 ? (
              <div style={{display: 'grid', gap: '15px'}}>
                {subjectStudents.map(student => {
                  const attendance = studentAttendance[student.id];
                  const percentage = attendance ? attendance.percentage : 0;
                  
                  return (
                    <div 
                      key={student.id}
                      style={{
                        padding: '12px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '6px',
                        borderLeft: `4px solid ${percentage >= 75 ? '#4caf50' : percentage >= 50 ? '#ff9800' : '#f44336'}`,
                        display: 'grid',
                        gridTemplateColumns: '1fr auto',
                        gap: '15px',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <h5 style={{margin: '0 0 5px 0', color: '#333', fontSize: '14px', fontWeight: '600'}}>
                          {student.fullName}
                        </h5>
                        <p style={{margin: '0 0 8px 0', fontSize: '12px', color: '#999'}}>
                          ID: {student.studentId}
                        </p>
                        <div style={{width: '100%', height: '6px', backgroundColor: '#e0e0e0', borderRadius: '3px', overflow: 'hidden'}}>
                          <div 
                            style={{
                              width: `${percentage}%`,
                              height: '100%',
                              backgroundColor: percentage >= 75 ? '#4caf50' : percentage >= 50 ? '#ff9800' : '#f44336',
                              transition: 'width 0.3s ease'
                            }}
                          />
                        </div>
                      </div>
                      
                      <div style={{textAlign: 'right', whiteSpace: 'nowrap'}}>
                        <div style={{fontSize: '20px', fontWeight: 'bold', color: percentage >= 75 ? '#4caf50' : percentage >= 50 ? '#ff9800' : '#f44336'}}>
                          {percentage}%
                        </div>
                        <div style={{fontSize: '11px', color: '#999', marginTop: '3px'}}>
                          {attendance.present}P / {attendance.absent}A
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{padding: '20px', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '4px', color: '#999'}}>
                <p style={{margin: 0}}>No students found for this subject.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{padding: '20px', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '4px', color: '#666'}}>
          <p style={{margin: 0}}>Select a subject to view attendance statistics and charts.</p>
        </div>
      )}
    </div>
  );
};

export default AdminAttendanceReport;
