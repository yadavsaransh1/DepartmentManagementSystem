import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/dashboard.css';

export const SupervisorAllocation = () => {
  const [allocations, setAllocations] = useState([]);
  const [filteredAllocations, setFilteredAllocations] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    teacherId: ''
  });
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchAllocations();
    fetchStudents();
    fetchTeachers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [allocations, searchQuery]);

  const fetchAllocations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/supervisors/allocations');
      setAllocations(Array.isArray(response.data) ? response.data : []);
      setMessage({ text: '', type: '' });
    } catch (err) {
      console.error('Error fetching allocations:', err);
      setMessage({ text: 'Failed to load allocations', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students');
      setStudents(Array.isArray(response.data) ? response.data : []);
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

  const applyFilters = () => {
    let filtered = allocations;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.studentName?.toLowerCase().includes(query) ||
        a.supervisorName?.toLowerCase().includes(query) ||
        a.studentEmail?.toLowerCase().includes(query)
      );
    }

    setFilteredAllocations(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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

      const response = await api.post(`/supervisors/allocate?${params}`);
      setMessage({ text: 'Supervisor allocated successfully', type: 'success' });
      setFormData({ studentId: '', teacherId: '' });
      setShowForm(false);
      fetchAllocations();
    } catch (err) {
      console.error('Error allocating supervisor:', err);
      setMessage({ text: err.response?.data?.message || 'Failed to allocate supervisor', type: 'error' });
    }
  };

  const handleDeleteAllocation = async (allocationId) => {
    if (window.confirm('Are you sure you want to remove this supervisor allocation?')) {
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
      <h1>👨‍🏫 Supervisor Allocation</h1>

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

      {/* Allocate Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          marginBottom: '20px',
          padding: '10px 20px',
          backgroundColor: '#2196f3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        {showForm ? '✕ Cancel' : '+ Allocate Supervisor'}
      </button>

      {/* Allocation Form */}
      {showForm && (
        <div style={{
          marginBottom: '20px',
          padding: '20px',
          backgroundColor: '#f9f9f9',
          borderRadius: '4px',
          border: '1px solid #ddd'
        }}>
          <h3 style={{ marginTop: 0 }}>Allocate Supervisor to Student</h3>
          <form onSubmit={handleAllocate}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Student *</label>
                <select
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  required
                >
                  <option value="">-- Select Student --</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.user?.fullName || student.fullName} ({student.studentId})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Supervisor (Teacher) *</label>
                <select
                  name="teacherId"
                  value={formData.teacherId}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  required
                >
                  <option value="">-- Select Teacher --</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.user?.fullName || teacher.fullName} ({teacher.teacherId})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                backgroundColor: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                marginRight: '10px'
              }}
            >
              Allocate Supervisor
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setFormData({ studentId: '', teacherId: '' });
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Search */}
      <div style={{
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#f9f9f9',
        borderRadius: '4px',
        border: '1px solid #ddd'
      }}>
        <input
          type="text"
          placeholder="Search by student or supervisor name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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

      {/* Allocations Table */}
      {loading ? (
        <p>Loading allocations...</p>
      ) : filteredAllocations.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666' }}>No supervisor allocations found</p>
      ) : (
        <div style={{
          overflowX: 'auto',
          backgroundColor: 'white',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '900px'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#2c3e50', color: 'white' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', borderRight: '1px solid #bbb' }}>Student Name</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', borderRight: '1px solid #bbb' }}>Student ID</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', borderRight: '1px solid #bbb' }}>Student Email</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', borderRight: '1px solid #bbb' }}>Supervisor Name</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', borderRight: '1px solid #bbb' }}>Supervisor Email</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', borderRight: '1px solid #bbb', minWidth: '140px' }}>Allocation Date</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', minWidth: '100px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAllocations.map((alloc, index) => (
                <tr key={alloc.id} style={{
                  borderBottom: '1px solid #ddd',
                  backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white'
                }}>
                  <td style={{ padding: '12px', borderRight: '1px solid #ddd', fontWeight: 'bold' }}>
                    {alloc.studentName || 'N/A'}
                  </td>
                  <td style={{ padding: '12px', borderRight: '1px solid #ddd', fontSize: '13px' }}>
                    {alloc.studentId || 'N/A'}
                  </td>
                  <td style={{ padding: '12px', borderRight: '1px solid #ddd', fontSize: '13px' }}>
                    {alloc.studentEmail || 'N/A'}
                  </td>
                  <td style={{ padding: '12px', borderRight: '1px solid #ddd', fontWeight: 'bold' }}>
                    {alloc.supervisorName || 'N/A'}
                  </td>
                  <td style={{ padding: '12px', borderRight: '1px solid #ddd', fontSize: '13px' }}>
                    {alloc.supervisorEmail || 'N/A'}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', borderRight: '1px solid #ddd', fontSize: '13px' }}>
                    {alloc.allocationDate ? new Date(alloc.allocationDate).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleDeleteAllocation(alloc.id)}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p style={{ marginTop: '20px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
        Total allocations: {filteredAllocations.length}
      </p>
    </div>
  );
};

export default SupervisorAllocation;
