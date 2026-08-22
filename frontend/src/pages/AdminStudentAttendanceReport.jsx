import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Pie, Doughnut } from 'react-chartjs-2';
import api from '../services/api';
import StudentAttendanceTable from './StudentAttendanceTable';
import '../styles/attendance.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

export const AdminStudentAttendanceReport = () => {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [overallStats, setOverallStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Export by program/semester state
  const [exportProgram, setExportProgram] = useState('');
  const [exportSemester, setExportSemester] = useState('');
  const [programs, setPrograms] = useState([]);
  const [availableSemesters, setAvailableSemesters] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);
  
  // New export features
  const [exportFormat, setExportFormat] = useState('excel');
  const [nqCriteria, setNqCriteria] = useState(75);
  const [currentNqCriteria, setCurrentNqCriteria] = useState(75);
  const [attendanceMarks, setAttendanceMarks] = useState(5);
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const [settingsLoading, setSettingsLoading] = useState(false);

  useEffect(() => {
    fetchAllStudents();
    fetchPrograms();
    fetchAttendanceSettings();
  }, []);

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

  // Fetch semesters when program changes
  useEffect(() => {
    if (exportProgram) {
      fetchSemestersForProgram(exportProgram);
    } else {
      setAvailableSemesters([]);
      setExportSemester('');
    }
  }, [exportProgram]);

  const fetchAllStudents = async () => {
    try {
      const response = await api.get('/students');
      setStudents(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const fetchPrograms = async () => {
    try {
      const response = await api.get('/programs');
      const programList = Array.isArray(response.data) ? response.data : [];
      console.log('Programs fetched with IDs:', programList);
      setPrograms(programList);
    } catch (err) {
      console.error('Error fetching programs:', err);
      // Fallback: Use default programs instead of fetching students
      setPrograms([
        { id: 1, name: 'BCA', semesterCount: 6 },
        { id: 2, name: 'MCA', semesterCount: 4 },
        { id: 3, name: 'Mtech', semesterCount: 4 },
        { id: 4, name: 'PHD', semesterCount: 8 }
      ]);
    }
  };

  const fetchAttendanceSettings = async () => {
    try {
      const response = await api.get('/attendance/settings');
      if (response.data && response.data.nqCriteria) {
        setCurrentNqCriteria(response.data.nqCriteria);
        setNqCriteria(response.data.nqCriteria);
      }
    } catch (err) {
      console.error('Error fetching attendance settings:', err);
    }
  };

  const fetchSemestersForProgram = async (program) => {
    try {
      setExportLoading(true);
      // Handle both object and string formats for backwards compatibility
      const programId = typeof program === 'object' ? program.id : program;
      const programName = typeof program === 'object' ? (program.title || program.name || program.programName) : program;
      
      if (!programId) {
        console.error('Program ID not found:', program);
        setAvailableSemesters([]);
        return;
      }
      
      console.log('Fetching semesters for program ID:', programId);
      const response = await api.get(`/programs/${programId}/semesters`);
      
      if (response.data && Array.isArray(response.data)) {
        setAvailableSemesters(response.data);
        console.log('Semesters fetched:', response.data);
      } else if (response.data && response.data.semesters && Array.isArray(response.data.semesters)) {
        setAvailableSemesters(response.data.semesters);
        console.log('Semesters fetched:', response.data.semesters);
      }
      // Reset semester selection when program changes
      setExportSemester('');
    } catch (err) {
      console.error('Error fetching semesters for program:', err);
      setAvailableSemesters([]);
    } finally {
      setExportLoading(false);
    }
  };

  const updateNqCriteria = async () => {
    if (nqCriteria < 0 || nqCriteria > 100) {
      alert('NQ Criteria must be between 0 and 100');
      return;
    }
    
    try {
      setSettingsLoading(true);
      const response = await api.put('/attendance/settings/nq-criteria', null, {
        params: { criteria: nqCriteria }
      });
      if (response.data) {
        setCurrentNqCriteria(response.data.nqCriteria);
        alert('NQ Criteria updated successfully!');
      }
    } catch (err) {
      console.error('Error updating NQ criteria:', err);
      alert('Failed to update NQ criteria. Please try again.');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleExportByProgram = async () => {
    try {
      if (!exportProgram || !exportSemester) {
        alert('Please select both program and semester');
        return;
      }

      setExportLoading(true);
      
      // Extract program name - handle both object and string formats
      let programName = exportProgram;
      if (typeof exportProgram === 'object') {
        programName = exportProgram.title || exportProgram.name || exportProgram.programName;
      }
      
      // Build URL with query parameters
      let url = `/attendance/export-report?program=${encodeURIComponent(programName)}&semester=${parseInt(exportSemester)}&format=${exportFormat}&nqCriteria=${nqCriteria}&attendanceMarks=${attendanceMarks}`;
      
      // Add optional date filters
      if (exportStartDate) {
        url += `&startDate=${exportStartDate}`;
      }
      if (exportEndDate) {
        url += `&endDate=${exportEndDate}`;
      }

      console.log('Exporting from URL:', url);
      const response = await api.get(url, {
        responseType: 'blob'
      });

      // Determine file type and extension
      const fileExtension = exportFormat === 'pdf' ? 'pdf' : 'xlsx';
      const mimeType = exportFormat === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      
      // Create blob with response data
      const blob = new Blob([response.data], { type: mimeType });
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `Attendance_${programName}_Sem${exportSemester}_${new Date().toISOString().split('T')[0]}.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      }, 100);

    } catch (err) {
      console.error('Error exporting attendance:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Unknown error occurred';
      alert(`❌ Failed to export attendance report:\n${errorMsg}\n\nPlease check:\n1. Program and semester have attendance data\n2. You have proper permissions\n3. Try again in a moment`);
    } finally {
      setExportLoading(false);
    }
  };

  const loadStudentData = async () => {
    try {
      setLoading(true);
      
      if (viewMode === 'all') {
        // Fetch overall stats
        const statsRes = await api.get(`/attendance/student/${selectedStudent.id}/stats`);
        setOverallStats(statsRes.data?.overall);
        populateOverallCharts(statsRes.data?.overall);
        
        // Fetch student's subjects for subject-wise view
        const subjectsRes = await api.get(`/subjects/student/${selectedStudent.id}`);
        setSubjects(Array.isArray(subjectsRes.data) ? subjectsRes.data : []);
      }
    } catch (err) {
      console.error('Error loading student data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportStats = async (format) => {
    try {
      if (!selectedStudent) {
        alert('Please select a student first');
        return;
      }

      const response = await api.get(`/students/${selectedStudent.id}/statistics/export?format=${format}`, {
        responseType: 'blob'
      });

      const mimeType = format === 'pdf' 
        ? 'application/pdf' 
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const fileExtension = format === 'pdf' ? 'pdf' : 'xlsx';

      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Student_Stats_${selectedStudent.id}_${new Date().toISOString().split('T')[0]}.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting statistics:', err);
      alert('Failed to export statistics. Please try again.');
    }
  };

  const populateOverallCharts = (stats) => {
    if (!stats) return;

    const total = stats.total || 1;
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
      presentPercent: total > 0 ? ((stats.present / total) * 100).toFixed(1) : 0,
      absentPercent: total > 0 ? ((stats.absent / total) * 100).toFixed(1) : 0,
    });

    setChartData({
      pie: chartData
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
        presentPercent: total > 0 ? ((stats.present / total) * 100).toFixed(1) : 0,
        absentPercent: total > 0 ? ((stats.absent / total) * 100).toFixed(1) : 0,
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
        pie: chartData
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

  return (
    <div className="attendance-container">
      <h1>📊 Student Attendance Analytics</h1>

      {/* ===== Bulk Export Section with PDF & Excel, Criteria, and Date Filters ===== */}
      <div style={{marginBottom: '25px', padding: '20px', backgroundColor: '#e3f2fd', borderRadius: '4px', borderLeft: '4px solid #2196f3'}}>
        <h3 style={{margin: '0 0 15px 0', color: '#1976d2'}}>📥 Export Attendance Report by Program & Semester</h3>
        
        {/* Row 1: Program, Semester, Format */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px'}}>
          <div>
            <label style={{fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#333'}}>Program:</label>
            <select
              value={typeof exportProgram === 'object' ? JSON.stringify(exportProgram) : exportProgram}
              onChange={(e) => {
                try {
                  const value = e.target.value;
                  if (value.startsWith('{')) {
                    setExportProgram(JSON.parse(value));
                  } else {
                    setExportProgram(value);
                  }
                } catch (err) {
                  setExportProgram(e.target.value);
                }
              }}
              style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px'}}
            >
              <option value="">-- Select Program --</option>
              {programs.map(prog => {
                const progKey = typeof prog === 'object' ? prog.id : prog;
                const progLabel = typeof prog === 'object' ? (prog.title || prog.name || prog.programName) : prog;
                return (
                  <option key={progKey} value={typeof prog === 'object' ? JSON.stringify(prog) : prog}>
                    {progLabel}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label style={{fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#333'}}>Semester:</label>
            <select
              value={exportSemester}
              onChange={(e) => setExportSemester(e.target.value)}
              disabled={!exportProgram || availableSemesters.length === 0}
              style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', opacity: !exportProgram ? 0.6 : 1}}
            >
              <option value="">-- Select Semester --</option>
              {availableSemesters.map(sem => {
                const semValue = typeof sem === 'object' ? (sem.id || sem.semesterNumber) : sem;
                const semLabel = typeof sem === 'object' ? (sem.semesterNumber || sem.name) : sem;
                return (
                  <option key={semValue} value={semValue}>
                    {typeof semLabel === 'number' ? `Semester ${semLabel}` : semLabel}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label style={{fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#333'}}>Format:</label>
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

        {/* Row 2: NQ Criteria for export and optional Date Filters */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px'}}>
          <div>
            <label style={{fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#333'}}>NQ Criteria for Report (%):</label>
            <input
              type="number"
              min="0"
              max="100"
              value={nqCriteria}
              onChange={(e) => setNqCriteria(parseFloat(e.target.value))}
              placeholder="Default: 75"
              style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px'}}
            />
            <small style={{color: '#666', marginTop: '5px', display: 'block'}}>Students {'<'} this % will be marked as NQ</small>
          </div>
          <div>
            <label style={{fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#333'}}>Attendance Marks (Marks):</label>
            <input
              type="number"
              min="0"
              max="100"
              value={attendanceMarks}
              onChange={(e) => setAttendanceMarks(Math.max(0, parseFloat(e.target.value) || 5))}
              placeholder="Default: 5"
              style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px'}}
            />
            <small style={{color: '#666', marginTop: '5px', display: 'block'}}>Marks to be awarded for attendance</small>
          </div>
          <div>
            <label style={{fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#333'}}>Start Date (Optional):</label>
            <input
              type="date"
              value={exportStartDate}
              onChange={(e) => setExportStartDate(e.target.value)}
              style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px'}}
            />
          </div>
          <div>
            <label style={{fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#333'}}>End Date (Optional):</label>
            <input
              type="date"
              value={exportEndDate}
              onChange={(e) => setExportEndDate(e.target.value)}
              style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px'}}
            />
          </div>
        </div>

        {/* Export Button */}
        <div style={{display: 'flex', gap: '10px'}}>
          <button
            onClick={handleExportByProgram}
            disabled={exportLoading || !exportProgram || !exportSemester}
            style={{
              padding: '12px 25px',
              backgroundColor: exportLoading || !exportProgram || !exportSemester ? '#ccc' : '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: exportLoading || !exportProgram || !exportSemester ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '14px',
              flex: 1
            }}
          >
            {exportLoading ? '⏳ Exporting...' : `📥 Export as ${exportFormat === 'pdf' ? 'PDF' : 'Excel'}`}
          </button>
          <button
            onClick={() => {
              setExportStartDate('');
              setExportEndDate('');
            }}
            style={{
              padding: '12px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            🗑️ Clear Dates
          </button>
        </div>

        {/* Info Box */}
        {(exportStartDate || exportEndDate) && (
          <div style={{marginTop: '10px', padding: '10px', backgroundColor: '#cfe8fc', borderRadius: '4px', fontSize: '13px', color: '#0c5460', borderLeft: '3px solid #0c5460'}}>
            <strong>Filter Applied:</strong>
            {exportStartDate && ` From ${new Date(exportStartDate).toLocaleDateString()}`}
            {exportEndDate && ` To ${new Date(exportEndDate).toLocaleDateString()}`}
          </div>
        )}
      </div>

      {/* Student Search */}
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
                  backgroundColor: selectedStudent?.id === student.id ? '#e8f5e9' : 'white',
                  ':hover': { backgroundColor: '#f5f5f5' }
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
      </div>

      {selectedStudent && (
        <>
          {/* View Mode Selection */}
          <div style={{marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap'}}>
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
            <div style={{marginLeft: 'auto', display: 'flex', gap: '10px', alignItems: 'center'}}>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                style={{
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                <option value="excel">Excel</option>
                <option value="pdf">PDF</option>
              </select>
              <button
                onClick={() => handleExportStats(exportFormat)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                📊 Export as {exportFormat === 'excel' ? 'Excel' : 'PDF'}
              </button>
            </div>
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
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.subjectName} ({subject.course} - Sem {subject.semester})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date Filtering */}
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

              {/* Charts Grid - Only Pie Chart */}
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', marginBottom: '30px'}}>
                <div style={{backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
                  <h4 style={{marginTop: 0, marginBottom: '15px', textAlign: 'center', color: '#333'}}>Attendance Distribution (Pie Chart)</h4>
                  <Pie data={chartData.pie} options={pieOptions} />
                </div>
              </div>

              {/* Student Attendance Table */}
              {viewMode === 'subject' && (
                <StudentAttendanceTable selectedSubject={selectedSubject} />
              )}
            </div>
          ) : (
            <p>Select a student to view their attendance statistics.</p>
          )}
        </>
      )}
    </div>
  );
};

export default AdminStudentAttendanceReport;
