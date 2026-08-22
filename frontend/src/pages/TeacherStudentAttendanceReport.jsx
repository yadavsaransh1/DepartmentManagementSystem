import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Pie, Doughnut } from 'react-chartjs-2';
import api from '../services/api';
import AttendanceProgressBar from '../components/AttendanceProgressBar';
import '../styles/attendance.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

export const TeacherStudentAttendanceReport = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [students, setStudents] = useState([]);
  const [teacherSubjects, setTeacherSubjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [chartData, setChartData] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('all');
  const [overallAttendancePercentage, setOverallAttendancePercentage] = useState(0);
  const [subjectAttendance, setSubjectAttendance] = useState({});
  const [exportProgress, setExportProgress] = useState(0);
  const [exportFormat, setExportFormat] = useState('excel');
  const [exportSubject, setExportSubject] = useState('');
  const [exportBySubjectLoading, setExportBySubjectLoading] = useState(false);

  useEffect(() => {
    loadTeacherData();
  }, [user.id]);

  useEffect(() => {
    if (selectedStudent) {
      loadStudentData();
    }
  }, [selectedStudent, viewMode]);

  useEffect(() => {
    if (selectedStudent && selectedSubject && viewMode === 'subject') {
      fetchStudentSubjectStats(selectedStudent.id, selectedSubject);
    }
  }, [selectedSubject, viewMode]);

  const loadTeacherData = async () => {
    try {
      setLoading(true);
      // Fetch teacher's subjects
      const teacherIdentifier = user.id || user.email;
      const subjectsRes = await api.get(`/subjects/teacher/${teacherIdentifier}`);
      const teacherSubjects = Array.isArray(subjectsRes.data) ? subjectsRes.data : [];
      setTeacherSubjects(teacherSubjects);

      // Fetch all students for each subject the teacher teaches
      const allStudents = new Set();
      for (const subject of teacherSubjects) {
        try {
          const studentRes = await api.get(`/students/subject/${subject.id}`);
          if (Array.isArray(studentRes.data)) {
            studentRes.data.forEach(student => allStudents.add(JSON.stringify({
              id: student.id,
              fullName: student.fullName,
              studentId: student.studentId,
              email: student.email,
              program: student.program,
              semester: student.semester,
              enrollmentNumber: student.enrollmentNumber
            })));
          }
        } catch (err) {
          console.warn(`Error fetching students for subject ${subject.id}:`, err);
        }
      }
      
      const uniqueStudents = Array.from(allStudents).map(s => JSON.parse(s));
      setStudents(uniqueStudents);
    } catch (err) {
      console.error('Error loading teacher data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentData = async () => {
    try {
      setLoading(true);
      
      if (viewMode === 'all') {
        // Fetch overall stats
        const statsRes = await api.get(`/attendance/student/${selectedStudent.id}/stats`);
        populateOverallCharts(statsRes.data?.overall);
      }
    } catch (err) {
      console.error('Error loading student data:', err);
    } finally {
      setLoading(false);
    }
  };

  const populateOverallCharts = (stats) => {
    if (!stats) return;

    const total = stats.total || 1;
    const presentPercent = total > 0 ? ((stats.present / total) * 100).toFixed(1) : 0;
    
    // Set overall attendance percentage
    setOverallAttendancePercentage(Math.round(presentPercent));
    
    const chartData = {
      labels: ['Present', 'Absent'],
      datasets: [{
        data: [stats.present || 0, stats.absent || 0],
        backgroundColor: ['#4caf50', '#f44336'],
        borderColor: ['#45a049', '#da190b'],
        borderWidth: 2
      }]
    };

    setAttendanceStats({
      total,
      present: stats.present || 0,
      absent: stats.absent || 0,
      presentPercent: presentPercent,
      absentPercent: total > 0 ? ((stats.absent / total) * 100).toFixed(1) : 0,
    });

    setChartData({
      pie: chartData,
      doughnut: chartData,
      bar: {
        labels: ['Present', 'Absent'],
        datasets: [{
          label: 'Count',
          data: [stats.present || 0, stats.absent || 0],
          backgroundColor: ['#4caf50', '#f44336'],
          borderColor: ['#45a049', '#da190b'],
          borderWidth: 2
        }]
      }
    });
  };

  const fetchStudentSubjectStats = async (studentId, subjectId) => {
    try {
      const response = await api.get(`/attendance/student/${studentId}/stats/subject/${subjectId}`);
      const stats = response.data;
      const total = stats.total || 1;

      setAttendanceStats({
        total,
        present: stats.present || 0,
        absent: stats.absent || 0,
        late: stats.late || 0,
        leave: stats.leave || 0,
        presentPercent: total > 0 ? ((stats.present / total) * 100).toFixed(1) : 0,
        absentPercent: total > 0 ? ((stats.absent / total) * 100).toFixed(1) : 0,
        latePercent: total > 0 ? ((stats.late / total) * 100).toFixed(1) : 0,
        leavePercent: total > 0 ? ((stats.leave / total) * 100).toFixed(1) : 0,
      });

      const chartData = {
        labels: ['Present', 'Absent'],
        datasets: [{
          data: [stats.present || 0, stats.absent || 0],
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
            data: [stats.present || 0, stats.absent || 0],
            backgroundColor: ['#4caf50', '#f44336'],
            borderColor: ['#45a049', '#da190b'],
            borderWidth: 2
          }]
        }
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const filteredStudents = students.filter(s => {
    const query = searchQuery.toLowerCase();
    // Support both nested (user.fullName) and flat (fullName) structures from API
    const name = s.user?.fullName || s.user?.full_name || s.fullName || s.full_name || '';
    const studentId = s.studentId || s.id || '';
    return name.toLowerCase().includes(query) || studentId.toString().includes(query);
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { position: 'bottom', labels: { font: { size: 12 }, padding: 15 } },
      title: { display: true, font: { size: 16, weight: 'bold' } }
    }
  };

  const pieOptions = { ...chartOptions };
  const doughnutOptions = { ...chartOptions };
  const barOptions = { ...chartOptions, scales: { y: { beginAtZero: true } } };

  const exportAttendanceData = () => {
    if (!selectedStudent || !attendanceStats) {
      alert('Please select a student first');
      return;
    }

    // Create CSV content
    const csvContent = [
      ['Student Attendance Report'],
      ['Student Name:', selectedStudent.user?.fullName || selectedStudent.fullName || 'N/A'],
      ['Student ID:', selectedStudent.studentId || selectedStudent.id],
      [''],
      ['Attendance Summary'],
      ['Total Classes:', attendanceStats.total],
      ['Present:', attendanceStats.present, `(${attendanceStats.presentPercent}%)`],
      ['Absent:', attendanceStats.absent, `(${attendanceStats.absentPercent}%)`],
      ['Late:', attendanceStats.late, `(${attendanceStats.latePercent}%)`],
      ['Leave:', attendanceStats.leave, `(${attendanceStats.leavePercent}%)`],
      ['', ''],
      ['Export Date:', new Date().toLocaleString()]
    ].map(row => row.join(',')).join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_${selectedStudent.id}_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportToExcel = async () => {
    if (!selectedStudent || !attendanceStats) {
      alert('Please select a student first');
      return;
    }

    try {
      setExportProgress(50);

      const response = await api.get(
        `/students/${selectedStudent.id}/statistics/export?format=excel`,
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Attendance_${selectedStudent.studentId || selectedStudent.id}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setExportProgress(100);
      setTimeout(() => setExportProgress(0), 1000);
      // alert('✅ Attendance report exported to Excel successfully!');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export to Excel');
      setExportProgress(0);
    }
  };

  const handleExportToPDF = async () => {
    if (!selectedStudent || !attendanceStats) {
      alert('Please select a student first');
      return;
    }

    try {
      setExportProgress(50);

      const response = await api.get(
        `/students/${selectedStudent.id}/statistics/export?format=pdf`,
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Attendance_${selectedStudent.studentId || selectedStudent.id}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setExportProgress(100);
      setTimeout(() => setExportProgress(0), 1000);
      // alert('✅ Attendance report exported to PDF successfully!');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Failed to export to PDF');
      setExportProgress(0);
    }
  };

  const handleBulkExportBySubject = async () => {
    if (!exportSubject) {
      alert('Please select a subject to export');
      return;
    }

    try {
      setExportBySubjectLoading(true);
      setExportProgress(25);

      const teacherIdentifier = user.id || user.email;
      const fileExtension = exportFormat === 'pdf' ? 'pdf' : 'xlsx';
      const mimeType = exportFormat === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

      setExportProgress(50);

      const response = await api.get(
        `/attendance/teacher/${teacherIdentifier}/subject/${exportSubject}/export?format=${exportFormat}`,
        { responseType: 'blob' }
      );

      setExportProgress(75);

      const blob = new Blob([response.data], { type: mimeType });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      const subjectName = teacherSubjects.find(s => s.id.toString() === exportSubject.toString())?.subjectName || 'Subject';
      link.download = `Attendance_${subjectName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.${fileExtension}`;
      
      document.body.appendChild(link);
      link.click();
      
      setExportProgress(100);
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
        setExportProgress(0);
      }, 100);

      // alert(`✅ Attendance report for ${subjectName} exported as ${exportFormat.toUpperCase()} successfully!`);
    } catch (error) {
      console.error('Error bulk exporting by subject:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error occurred';
      alert(`❌ Failed to export attendance report:\n${errorMsg}`);
      setExportProgress(0);
    } finally {
      setExportBySubjectLoading(false);
    }
  };

  return (
    <div className="attendance-container">
      <h1>📊 Student Attendance Analytics</h1>

      {/* TAB 1: Attendance Reports */}
        <div style={{marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '4px', borderLeft: '4px solid #667eea'}}>
          <label style={{fontWeight: 'bold', display: 'block', marginBottom: '8px'}}>Search Student (by name or ID):</label>
        <input
          type="text"
          placeholder="Enter student name or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', marginBottom: '10px'}}
        />
        
        {searchQuery && filteredStudents.length > 0 && (
          <div style={{maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px'}}>
            {filteredStudents.slice(0, 10).map(student => (
              <div
                key={student.id}
                onClick={() => {
                  setSelectedStudent(student);
                  setSearchQuery('');
                  setViewMode('all');
                }}
                style={{
                  padding: '10px',
                  borderBottom: '1px solid #eee',
                  cursor: 'pointer',
                  backgroundColor: selectedStudent?.id === student.id ? '#e8f5e9' : 'white'
                }}
              >
                <strong>{student.user?.fullName || student.user?.full_name || student.fullName || student.full_name || 'N/A'}</strong> (ID: {student.studentId || student.id})
              </div>
            ))}
          </div>
        )}

        {selectedStudent && (
          <div style={{marginTop: '10px', padding: '10px', backgroundColor: '#e8f5e9', borderRadius: '4px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div>
                <strong>Selected: {selectedStudent.user?.fullName || selectedStudent.user?.full_name || selectedStudent.fullName || selectedStudent.full_name || 'Unknown'}</strong>
                <br />
                <small>ID: {selectedStudent.studentId || selectedStudent.id}</small>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                style={{padding: '5px 10px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {selectedStudent && (
          <>
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
              <label style={{fontWeight: 'bold', display: 'block', marginBottom: '8px'}}>Select Subject:</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px'}}
              >
                <option value="">-- Select a Subject --</option>
                {teacherSubjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.subjectName} ({subject.course} - Sem {subject.semester})
                  </option>
                ))}
              </select>
            </div>
          )}

         

          {/* Statistics View */}
          {loading ? (
            <p>Loading attendance data...</p>
          ) : attendanceStats && chartData ? (
            <div>
              {/* Stats Cards */}
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

              {/* Charts Grid - Only Pie Chart
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', marginBottom: '30px'}}>
                <div style={{backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
                  <h4 style={{marginTop: 0, marginBottom: '15px', textAlign: 'center', color: '#333'}}>Attendance Distribution (Pie Chart)</h4>
                  <Pie data={chartData.pie} options={pieOptions} />
                </div>
              </div> */}
            </div>
          ) : (
            <p>Select a student to view their attendance statistics.</p>
          )}
          </>
        )}
      </div>

      {/* TAB 2: Student Statistics */}
        <div style={{padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '4px'}}>
          <h2 style={{color: '#667eea', marginTop: 0}}>📊 Export All Students' Attendance</h2>
          <p style={{color: '#666', marginBottom: '20px'}}>Select a subject and export all enrolled students' attendance records</p>

          {/* Export Section */}
          <div style={{marginBottom: '20px', padding: '15px', backgroundColor: '#e8f4f8', borderRadius: '4px', borderLeft: '4px solid #00bcd4'}}>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px'}}>
              <div>
                <label style={{fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#333'}}>Select Subject:</label>
                <select
                  value={exportSubject}
                  onChange={(e) => setExportSubject(e.target.value)}
                  style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px'}}
                >
                  <option value="">-- Select Subject --</option>
                  {teacherSubjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.subjectName} ({subject.course} - Sem {subject.semester})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#333'}}>Export Format:</label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px'}}
                >
                  <option value="excel">📊 Excel (.xlsx)</option>
                  <option value="pdf">📄 PDF</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleBulkExportBySubject}
              disabled={exportBySubjectLoading || !exportSubject}
              style={{
                padding: '12px 25px',
                backgroundColor: exportBySubjectLoading || !exportSubject ? '#ccc' : '#00bcd4',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: exportBySubjectLoading || !exportSubject ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
                width: '100%'
              }}
            >
              {exportBySubjectLoading ? '⏳ Exporting...' : `📥 Export as ${exportFormat === 'pdf' ? 'PDF' : 'Excel'}`}
            </button>
          </div>

          {exportProgress === 100 && (
            <div style={{padding: '15px', backgroundColor: '#c8e6c9', borderRadius: '4px', borderLeft: '4px solid #4caf50', color: '#2e7d32'}}>
              ✅ Export completed successfully!
            </div>
          )}
        </div>


    </div>
  );
};

export default TeacherStudentAttendanceReport;
