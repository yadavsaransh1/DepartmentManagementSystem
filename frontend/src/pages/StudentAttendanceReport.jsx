import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Pie, Doughnut } from 'react-chartjs-2';
import api from '../services/api';
import '../styles/attendance.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

export const StudentAttendanceReport = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [overallStats, setOverallStats] = useState(null);
  const [subjectStats, setSubjectStats] = useState({});
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'subject'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!user.studentId) {
          setError('Student information not found. Please login again.');
          return;
        }

        // Fetch student's subjects using the Student database ID
        console.log('Fetching subjects for student ID:', user.studentId);
        const subjectsRes = await api.get(`/students/${user.studentId}/all-subjects`);
        console.log('Subjects API Response:', subjectsRes.data);
        const subjectsList = Array.isArray(subjectsRes.data) ? subjectsRes.data : [];
        console.log('Subjects Array length:', subjectsList.length);
        console.log('Subjects fetched for student', user.studentId, ':', subjectsList);
        setSubjects(subjectsList);

        // Fetch overall stats
        if (viewMode === 'all') {
          const overallRes = await api.get(`/attendance/student/${user.studentId}/stats`);
          const stats = overallRes.data?.overall;
          setOverallStats(stats);
          setSubjectStats(overallRes.data?.bySubject || {});
          if (stats) {
            populateOverallCharts(stats);
          } else {
            setAttendanceStats(null);
            setChartData(null);
          }
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load attendance data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user.studentId, viewMode]);

  useEffect(() => {
    if (selectedSubject && viewMode === 'subject') {
      fetchSubjectStats(selectedSubject);
    }
  }, [selectedSubject, viewMode, user.studentId]);

  const populateOverallCharts = (stats) => {
    if (!stats) return;

    const total = stats.total || 0;
    const present = stats.present || 0;
    const absent = stats.absent || 0;
    
    // Validate that data is consistent
    if (total > 0 && (present + absent !== total)) {
      console.warn('Data inconsistency detected: total=' + total + ', present=' + present + ', absent=' + absent);
      // If data is inconsistent, don't show anything
      setAttendanceStats(null);
      setChartData(null);
      return;
    }

    const chartData = {
      labels: ['Present', 'Absent'],
      datasets: [{
        data: [present, absent],
        backgroundColor: ['#4caf50', '#f44336'],
        borderColor: ['#45a049', '#da190b'],
        borderWidth: 2
      }]
    };

    setAttendanceStats({
      total,
      present,
      absent,
      presentPercent: total > 0 ? ((present / total) * 100).toFixed(1) : 0,
      absentPercent: total > 0 ? ((absent / total) * 100).toFixed(1) : 0,
    });

    setChartData({
      pie: chartData,
      doughnut: chartData,
      bar: {
        labels: ['Present', 'Absent'],
        datasets: [{
          label: 'Count',
          data: [present, absent],
          backgroundColor: ['#4caf50', '#f44336'],
          borderColor: ['#45a049', '#da190b'],
          borderWidth: 2
        }]
      }
    });
  };

  const fetchSubjectStats = async (subjectId) => {
    try {
      console.log('Fetching subject stats for student:', user.studentId, 'subject:', subjectId);
      const response = await api.get(`/attendance/student/${user.studentId}/stats/subject/${subjectId}`);
      const stats = response.data;
      const total = stats.total || 0;
      const present = stats.present || 0;
      const absent = stats.absent || 0;

      console.log('Subject stats response:', stats);

      // Validate that data is consistent
      if (total > 0 && (present + absent !== total)) {
        console.warn('Data inconsistency detected: total=' + total + ', present=' + present + ', absent=' + absent);
        setAttendanceStats(null);
        setChartData(null);
        return;
      }

      setAttendanceStats({
        total,
        present,
        absent,
        presentPercent: total > 0 ? ((present / total) * 100).toFixed(1) : 0,
        absentPercent: total > 0 ? ((absent / total) * 100).toFixed(1) : 0,
      });

      const chartData = {
        labels: ['Present', 'Absent'],
        datasets: [{
          data: [present, absent],
          backgroundColor: ['#4caf50', '#f44336'],
          borderColor: ['#45a049', '#da190b'],
          borderWidth: 2
        }]
      };

      setChartData({
        pie: chartData,
        doughnut: chartData,
        bar: {
          labels: ['Present', 'Absent'],
          datasets: [{
            label: 'Count',
            data: [present, absent],
            backgroundColor: ['#4caf50', '#f44336'],
            borderColor: ['#45a049', '#da190b'],
            borderWidth: 2
          }]
        }
      });
    } catch (err) {
      console.error('Error fetching subject stats:', err);
      setAttendanceStats(null);
      setChartData(null);
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { font: { size: 12 }, padding: 15 }
      },
      title: { display: true, font: { size: 16, weight: 'bold' } }
    }
  };

  const pieOptions = { ...chartOptions };
  const doughnutOptions = { ...chartOptions };
  const barOptions = { ...chartOptions, scales: { y: { beginAtZero: true } } };

  return (
    <div className="attendance-container">
      <h1>📊 My Attendance Reports</h1>

      {error && (
        <div style={{padding: '15px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '4px', marginBottom: '20px', border: '1px solid #ef5350'}}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading && (
        <div style={{padding: '15px', backgroundColor: '#e3f2fd', color: '#1565c0', borderRadius: '4px', marginBottom: '20px'}}>
          Loading attendance data...
        </div>
      )}

      {/* View Mode Selection */}
      <div style={{marginBottom: '20px', display: 'flex', gap: '10px'}}>
        <button
          onClick={() => setViewMode('all')}
          style={{
            padding: '10px 20px',
            backgroundColor: viewMode === 'all' ? '#667eea' : '#ddd',
            color: viewMode === 'all' ? 'white' : '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Overall Attendance
        </button>
        <button
          onClick={() => setViewMode('subject')}
          style={{
            padding: '10px 20px',
            backgroundColor: viewMode === 'subject' ? '#667eea' : '#ddd',
            color: viewMode === 'subject' ? 'white' : '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Subject-wise View
        </button>
      </div>

      {/* Subject Selection (only for subject view) */}
      {viewMode === 'subject' && (
        <div style={{marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '4px', borderLeft: '4px solid #667eea'}}>
          <label style={{fontWeight: 'bold', display: 'block', marginBottom: '8px'}}>Select Subject: ({subjects.length} available)</label>
          {subjects.length === 0 ? (
            <div style={{color: '#f44336', padding: '10px', backgroundColor: '#ffebee', borderRadius: '4px'}}>
              No subjects found. Please ensure you are enrolled in subjects.
            </div>
          ) : (
            <select
              value={selectedSubject || ''}
              onChange={(e) => {
                const value = e.target.value;
                console.log('Subject selected:', value);
                if (value) {
                  setSelectedSubject(parseInt(value));
                }
              }}
              style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px'}}
            >
              <option value="">-- Select a Subject --</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.subjectName} ({subject.course} - Sem {subject.semester})
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Statistics View */}
      {!loading && !error && (
        <>
          {attendanceStats && chartData && (viewMode === 'all' || (viewMode === 'subject' && selectedSubject)) ? (
            <div>
              {/* Stats Cards - Present, Absent, and Total Records */}
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '30px'}}>
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

          {/* Charts Grid - Only Pie Chart */}
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', marginBottom: '30px'}}>
            <div style={{backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
              <h4 style={{marginTop: 0, marginBottom: '15px', textAlign: 'center', color: '#333'}}>Attendance Distribution (Pie Chart)</h4>
              <Pie data={chartData.pie} options={pieOptions} />
            </div>
          </div>
            </div>
        ) : viewMode === 'subject' && !selectedSubject ? (
          <div style={{padding: '20px', backgroundColor: '#e3f2fd', color: '#1565c0', borderRadius: '4px', textAlign: 'center'}}>
            <p>Please select a subject to view attendance records.</p>
          </div>
        ) : (
          <div style={{padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '4px', textAlign: 'center', color: '#666'}}>
            <p>No attendance records found yet. Attendance will appear once your teacher marks it.</p>
          </div>
        )}
      </>
      )}
    </div>
  );
};

export default StudentAttendanceReport;
