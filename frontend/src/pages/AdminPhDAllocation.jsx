import React, { useState, useEffect } from 'react';
import api from '../services/api';

export const AdminPhDAllocation = () => {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    teacherId: '',
    guideDepartment: '',
    specialization: ''
  });
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchStudents();
    fetchTeachers();
    fetchAllocations();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students');
      // Filter only PhD students (program = 'PhD')
      const phdStudents = Array.isArray(response.data) 
        ? response.data.filter(s => s.program && s.program.toUpperCase() === 'PHD')
        : [];
      setStudents(phdStudents);
    } catch (err) {
      console.error('Error fetching students:', err);
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
      const phdOnly = Array.isArray(response.data)
        ? response.data.filter(a => a.allocationType === 'GUIDE')
        : [];
      setAllocations(phdOnly);
      setMessage({ text: '', type: '' });
    } catch (err) {
      console.error('Error fetching allocations:', err);
      setMessage({ text: 'Failed to load allocations', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAllocate = async (e) => {
    e.preventDefault();
    try {
      if (!formData.studentId || !formData.teacherId) {
        setMessage({ text: 'Please select student and guide', type: 'warning' });
        return;
      }

      // Get the selected teacher details
      const selectedTeacher = teachers.find(t => t.id === parseInt(formData.teacherId));
      if (!selectedTeacher) {
        setMessage({ text: 'Selected guide not found', type: 'error' });
        return;
      }

      await api.post('/supervisors/allocate-phd', null, {
        params: {
          studentId: formData.studentId,
          teacherId: formData.teacherId,
          guideName: selectedTeacher.fullName,
          guideDepartment: formData.guideDepartment || selectedTeacher.department || '',
          specialization: formData.specialization
        }
      });
      setMessage({ text: 'PhD Guide allocated successfully', type: 'success' });
      setFormData({ studentId: '', teacherId: '', guideDepartment: '', specialization: '' });
      setShowForm(false);
      fetchAllocations();
    } catch (err) {
      console.error('Error allocating PhD guide:', err);
      setMessage({ text: err.response?.data?.message || 'Failed to allocate guide', type: 'error' });
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
      <h2 style={{ color: '#7b1fa2', marginTop: 0 }}>🎓 PhD Student Guide Allocation</h2>

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
          backgroundColor: showForm ? '#f44336' : '#9c27b0',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '14px'
        }}
      >
        {showForm ? '✕ Close Form' : '+ Add PhD Guide Allocation'}
      </button>

      {/* Allocation Form */}
      {showForm && (
        <div style={{
          marginBottom: '20px',
          padding: '20px',
          backgroundColor: '#f3e5f5',
          borderRadius: '4px',
          border: '2px solid #9c27b0'
        }}>
          <h3 style={{ marginTop: 0, color: '#7b1fa2' }}>Allocate PhD Guide</h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '15px',
            marginBottom: '20px'
          }}>
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>PhD Student *</label>
              <select
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
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
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Guide Name *</label>
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
                <option value="">Select Guide</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.fullName}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Department</label>
              <input
                type="text"
                value={formData.guideDepartment}
                onChange={(e) => setFormData({ ...formData, guideDepartment: e.target.value })}
                placeholder="e.g., Computer Science"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Specialization</label>
              <input
                type="text"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                placeholder="e.g., AI/ML"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <button
            onClick={handleAllocate}
            style={{
              padding: '10px 20px',
              backgroundColor: '#9c27b0',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            ✓ Allocate Guide
          </button>
        </div>
      )}

      {/* Allocations Table */}
      <div className='global-container' style={{ marginTop: '20px' }}>
        <h3>Existing PhD Allocations ({allocations.length})</h3>
        {loading ? (
          <p>Loading...</p>
        ) : allocations.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center', padding: '30px' }}>No PhD guide allocations yet</p>
        ) : (
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '13px'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#9c27b0', borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '10px', textAlign: 'left' }}>Student Name</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Student ID</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Guide Name</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Department</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Specialization</th>
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
                  <td style={{ padding: '10px', fontWeight: 'bold', color: '#7b1fa2' }}>
                    {alloc.supervisorName || alloc.guideName}
                  </td>
                  <td style={{ padding: '10px' }}>{alloc.guideDepartment || '—'}</td>
                  <td style={{ padding: '10px' }}>{alloc.specialization || '—'}</td>
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
