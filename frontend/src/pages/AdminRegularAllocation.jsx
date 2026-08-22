import React, { useState, useEffect } from 'react';
import api from '../services/api';

export const AdminRegularAllocation = () => {
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ studentId: '', teacherId: '' });
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchPrograms();
    fetchTeachers();
    fetchAllocations();
  }, []);

  const fetchPrograms = async () => {
    try {
      const response = await api.get('/programs');
      setPrograms(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching programs:', err);
      setMessage({ text: 'Failed to load programs', type: 'error' });
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await api.get('/teachers');
      setTeachers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching teachers:', err);
    }
  };

  const fetchAllocations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/supervisors/allocations');
      const regularOnly = Array.isArray(response.data)
        ? response.data.filter(a => a.allocationType === 'SUPERVISOR' || !a.allocationType)
        : [];
      setAllocations(regularOnly);
      setMessage({ text: '', type: '' });
    } catch (err) {
      console.error('Error fetching allocations:', err);
      setMessage({ text: 'Failed to load allocations', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleProgramChange = async (programNameOrId) => {
    // Extract program name if it's an object, otherwise use as is
    const programName = typeof programNameOrId === 'object' ? programNameOrId.name : programNameOrId;
    setSelectedProgram(programName);
    setSelectedSemester('');
    setStudents([]);

    if (!programName) {
      setSemesters([]);
      return;
    }

    try {
      const response = await api.get(`/attendance/program/${programName}/semesters`);
      const semesterArray = Array.isArray(response.data.semesters) ? response.data.semesters : [];
      setSemesters(semesterArray);
    } catch (err) {
      console.error('Error fetching semesters:', err);
      setMessage({ text: 'Failed to load semesters', type: 'error' });
    }
  };

  const handleSemesterChange = async (semesterValue) => {
    // Extract semester if it's an object, otherwise use as is
    const semester = typeof semesterValue === 'object' ? semesterValue.semesterNumber || semesterValue.name || semesterValue : semesterValue;
    setSelectedSemester(semester);

    if (!selectedProgram || !semester) {
      setStudents([]);
      return;
    }

    try {
      // Try fetching students using the program name and semester value
      const token = localStorage.getItem('token');
      console.log('DEBUG: Token present:', !!token);
      console.log('DEBUG: Fetching from URL: /students/program/' + selectedProgram + '/semester/' + semester);
      
      const response = await api.get(`/students/program/${selectedProgram}/semester/${semester}`);
      setStudents(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching students:', err);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      console.error('Request URL: /students/program/' + selectedProgram + '/semester/' + semester);
      setMessage({ text: 'Failed to load students: ' + (err.response?.data?.error || err.message), type: 'error' });
      setStudents([]);
    }
  };

  const handleAllocate = async (e) => {
    e.preventDefault();
    try {
      if (!formData.studentId || !formData.teacherId) {
        setMessage({ text: 'Please select both student and supervisor', type: 'warning' });
        return;
      }

      const params = new URLSearchParams({
        studentId: formData.studentId,
        teacherId: formData.teacherId
      });

      await api.post(`/supervisors/allocate?${params}`);
      setMessage({ text: 'Supervisor allocated successfully', type: 'success' });
      setFormData({ studentId: '', teacherId: '' });
      setShowForm(false);
      setSelectedProgram('');
      setSelectedSemester('');
      setStudents([]);
      fetchAllocations();
    } catch (err) {
      console.error('Error allocating supervisor:', err);
      setMessage({ text: err.response?.data?.message || 'Failed to allocate supervisor', type: 'error' });
    }
  };

  const handleDeleteAllocation = async (allocationId) => {
    if (window.confirm('Are you sure you want to remove this allocation?')) {
      try {
        await api.delete(`/supervisors/${allocationId}`);
        setMessage({ text: 'Allocation removed successfully', type: 'success' });
        fetchAllocations();
      } catch (err) {
        console.error('Error deleting allocation:', err);
        setMessage({ text: 'Failed to remove allocation', type: 'error' });
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: '#1976d2', marginTop: 0 }}>👨‍🎓 Regular Student Supervisor Allocation</h2>

      {message.text && (
        <div style={{
          padding: '12px',
          marginBottom: '15px',
          borderRadius: '4px',
          backgroundColor: message.type === 'error' ? '#f8d7da' : message.type === 'warning' ? '#fff3cd' : '#d4edda',
          color: message.type === 'error' ? '#721c24' : message.type === 'warning' ? '#856404' : '#155724',
          border: `1px solid ${message.type === 'error' ? '#f5c6cb' : message.type === 'warning' ? '#ffeaa7' : '#c3e6cb'}`
        }}>
          {message.text}
        </div>
      )}

      {/* Form Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          marginBottom: '20px',
          padding: '12px 20px',
          backgroundColor: showForm ? '#f44336' : '#2196f3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '14px'
        }}
      >
        {showForm ? '✕ Close Form' : '+ Add Supervisor Allocation'}
      </button>

      {/* Allocation Form */}
      {showForm && (
        <div style={{
          marginBottom: '20px',
          padding: '20px',
          backgroundColor: '#f9f9f9',
          borderRadius: '4px',
          border: '2px solid #2196f3'
        }}>
          <h3 style={{ marginTop: 0, color: '#1976d2' }}>Allocate Supervisor</h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '15px',
            marginBottom: '20px'
          }}>
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Program *</label>
              <select
                value={selectedProgram}
                onChange={(e) => handleProgramChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  fontSize: '14px'
                }}
              >
                <option value="">Select Program</option>
                {programs.map(p => {
                  const programName = typeof p === 'object' ? p.name : p;
                  return <option key={programName} value={programName}>{programName}</option>;
                })}
              </select>
            </div>

            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Semester *</label>
              <select
                value={selectedSemester}
                onChange={(e) => handleSemesterChange(e.target.value)}
                disabled={!selectedProgram}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  fontSize: '14px'
                }}
              >
                <option value="">Select Semester</option>
                {semesters.map(s => {
                  const semesterValue = typeof s === 'object' ? (s.semesterNumber || s.name || s) : s;
                  const semesterDisplay = typeof s === 'object' ? (s.semesterNumber || s.name || s) : s;
                  return <option key={String(semesterValue)} value={String(semesterValue)}>{semesterDisplay}</option>;
                })}
              </select>
            </div>

            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Student *</label>
              <select
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                disabled={!selectedSemester}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  fontSize: '14px'
                }}
              >
                <option value="">Select Student</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.fullName} (ID: {s.studentId})</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Supervisor (Teacher) *</label>
              <select
                value={formData.teacherId}
                onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  fontSize: '14px'
                }}
              >
                <option value="">Select Supervisor</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.fullName}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleAllocate}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            ✓ Allocate Supervisor
          </button>
        </div>
      )}

      {/* Allocations Table */}
      <div className='global-container' style={{ marginTop: '20px' }}>
        <h3>Existing Allocations ({allocations.length})</h3>
        {loading ? (
          <p>Loading...</p>
        ) : allocations.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center', padding: '30px' }}>No supervisor allocations yet</p>
        ) : (
          <table className='project-table' style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '13px',
          }}>
            <thead>
              <tr style={{ backgroundColor: '#9b0000', borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '10px', textAlign: 'left' }}>Student Name</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Student ID</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Supervisor</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Allocation Date</th>
                <th style={{ padding: '10px', textAlign: 'center', width: '100px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allocations.map((alloc, idx) => (
                <tr key={alloc.id} style={{
                  borderBottom: '1px solid #ddd',
                  backgroundColor: idx % 2 === 0 ? '#fff' : '#f9f9f9'
                }}>
                  <td style={{ padding: '10px' }}>{alloc.studentName}</td>
                  <td style={{ padding: '10px' }}>{alloc.studentId}</td>
                  <td style={{ padding: '10px' }}>{alloc.supervisorName}</td>
                  <td style={{ padding: '10px', fontSize: '12px' }}>
                    {alloc.allocationDate ? new Date(alloc.allocationDate).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleDeleteAllocation(alloc.id)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
