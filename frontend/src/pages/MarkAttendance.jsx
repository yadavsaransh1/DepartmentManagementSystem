import React, { useState, useEffect } from 'react';
import api from '../services/api';

export const MarkAttendance = () => {
  const [course, setCourse] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceTime, setAttendanceTime] = useState('');
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const teacherId = user?.id;

  // Fetch subjects on mount
  useEffect(() => {
    fetchSubjects();
  }, []);

  // Filter subjects by course
  useEffect(() => {
    if (course) {
      const filtered = subjects.filter(s => s.course === course);
      setFilteredSubjects(filtered);
      setSubjectId(''); // Reset subject when course changes
    } else {
      setFilteredSubjects([]);
    }
  }, [course, subjects]);

  // Fetch filtered students when subject changes
  useEffect(() => {
    if (subjectId) {
      fetchStudentsBySubject(subjectId);
    } else {
      setStudents([]);
      setAttendance({});
    }
  }, [subjectId]);

  const fetchSubjects = async () => {
    try {
      const teacherIdentifier = user.email;
      const response = await api.get(`/subjects/teacher/${teacherIdentifier}`);
      const subjectsList = Array.isArray(response.data) ? response.data : [];
      setSubjects(subjectsList);
      
      // Extract unique courses from subjects
      const uniqueCourses = [...new Set(subjectsList.map(s => s.course).filter(Boolean))];
      setCourses(uniqueCourses.sort());
      
      console.log('Teacher subjects fetched:', subjectsList);
      console.log('Teacher courses:', uniqueCourses);
    } catch (err) {
      console.error('Error fetching subjects:', err);
      setError('Failed to load subjects');
    }
  };

  const fetchStudentsBySubject = async (subjId) => {
    try {
      setLoading(true);
      setError('');
      
      // Find the selected subject to get its semester
      const selectedSubject = subjects.find(s => s.id === parseInt(subjId));
      if (!selectedSubject) {
        setError('Subject not found');
        setStudents([]);
        return;
      }

      // Fetch all students
      const response = await api.get('/students');
      const allStudents = Array.isArray(response.data) ? response.data : [];
      
      // Filter students by semester AND course matching the subject's semester and course
      const filteredStudents = allStudents.filter(s => 
        s.semester === selectedSubject.semester && s.course === selectedSubject.course
      );
      setStudents(filteredStudents);
      
      // Initialize attendance object (true = Present, false = Absent)
      const initialAttendance = {};
      filteredStudents.forEach(student => {
        initialAttendance[student.id] = true; // Default to Present
      });
      setAttendance(initialAttendance);
      console.log(`Loaded ${filteredStudents.length} students for semester ${selectedSubject.semester}, course ${selectedSubject.course}`);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, isPresent) => {
    setAttendance({
      ...attendance,
      [studentId]: isPresent
    });
  };

  const handleSelectAll = (selectAll) => {
    const updatedAttendance = {};
    students.forEach(student => {
      updatedAttendance[student.id] = selectAll;
    });
    setAttendance(updatedAttendance);
  };

  const handleSubmitAttendance = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      
      if (!subjectId) {
        setError('Please select a subject');
        return;
      }

      if (students.length === 0) {
        setError('No students found for this subject\'s semester and course');
        return;
      }

      // Submit attendance for each student
      const attendanceRecords = Object.entries(attendance).map(([studentId, isPresent]) => ({
        studentId: parseInt(studentId),
        subjectId: parseInt(subjectId),
        status: isPresent ? 'PRESENT' : 'ABSENT',
        attendanceDate
      }));

      // For each record, call the API
      for (const record of attendanceRecords) {
        await api.post('/attendance/mark', record);
      }

      setSuccess(`Attendance marked for ${attendanceRecords.length} students!`);
      setSubjectId('');
      setAttendanceDate(new Date().toISOString().split('T')[0]);
      
      // Reset attendance states
      const resetAttendance = {};
      students.forEach(student => {
        resetAttendance[student.id] = true; // Default to Present
      });
      setAttendance(resetAttendance);

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error marking attendance:', err);
      setError(err.response?.data?.error || 'Failed to mark attendance');
    }
  };

  return (
    <div className="management-container">
      <h1>Mark Attendance</h1>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <form onSubmit={handleSubmitAttendance} className="form-box">
        <h3>Mark Attendance</h3>
        
        <div style={{marginBottom: '15px'}}>
          <label>📚 Course *:</label>
          <select
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          >
            <option value="">Select Course</option>
            {courses.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        
        <div style={{marginBottom: '15px'}}>
          <label>📖 Subject {!course && '(Select course first)'} *:</label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            required
            disabled={!course}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              backgroundColor: !course ? '#f5f5f5' : 'white'
            }}
          >
            <option value="">Select Subject</option>
            {filteredSubjects.map(subject => (
              <option key={subject.id} value={subject.id}>
                {subject.subjectName} ({subject.subjectCode})
              </option>
            ))}
          </select>
        </div>

        <div className="form-row" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px'}}>
          <div>
            <label> Date *:</label>
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
            />
          </div>

          <div>
            <label>🕐 Time *:</label>
            <input
              type="time"
              value={attendanceTime}
              onChange={(e) => setAttendanceTime(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
            />
          </div>
        </div>

        <div style={{marginBottom: '20px'}}>
          <label>Student Attendance:</label>
          {loading ? (
            <p>Loading students...</p>
          ) : students.length === 0 ? (
            <p>No students enrolled yet.</p>
          ) : (
            <div>
              <div style={{marginBottom: '15px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px', display: 'flex', gap: '10px', alignItems: 'center'}}>
                <button
                  type="button"
                  onClick={() => handleSelectAll(true)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  ✓ Select All Present
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectAll(false)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  ✗ Select All Absent
                </button>
              </div>
              <div className="table-container1">
              <table className='markAttendence-table' style={{width: '100%', borderCollapse: 'collapse'}}>
                <thead>
                  <tr style={{backgroundColor: '#667eea', color: 'white'}}>
                    <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Student Name</th>
                    <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Email</th>
                    <th style={{padding: '12px', textAlign: 'center', fontWeight: 'bold'}}>Mark Present</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, idx) => (
                    <tr key={student.id} style={{borderBottom: '1px solid #eee', backgroundColor: idx % 2 === 0 ? '#f9f9f9' : 'white'}}>
                      <td style={{padding: '12px'}}>{student.fullName}</td>
                      <td style={{padding: '12px'}}>{student.email}</td>
                      <td style={{padding: '12px', textAlign: 'center'}}>
                        <input
                          type="checkbox"
                          checked={attendance[student.id] === true}
                          onChange={(e) => handleStatusChange(student.id, e.target.checked)}
                          style={{width: '18px', height: '18px', cursor: 'pointer'}}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          )}
        </div>

        <button type="submit" disabled={loading}>Submit Attendance</button>
      </form>
    </div>
  );
};

export default MarkAttendance;
