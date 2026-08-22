import React, { useState, useEffect } from 'react';
import api from '../services/api';

export const ProgramManagement = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    semesterCount: null,
    description: '',
    isActive: true
  });

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const response = await api.get('/programs');
      setPrograms(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError('Failed to load programs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Prepare clean data for submission - exclude id during creation, convert empty semesterCount to null
      const submitData = {
        name: formData.name,
        semesterCount: formData.semesterCount || null,
        description: formData.description || '',
        isActive: formData.isActive !== undefined ? formData.isActive : true
      };
      
      console.log('Submitting program data:', submitData);
      
      if (editingId) {
        await api.put(`/programs/${editingId}`, submitData);
        setMessage('Program updated successfully');
      } else {
        await api.post('/programs', submitData);
        setMessage('Program created successfully');
      }
      setFormData({ name: '', semesterCount: null, description: '', isActive: true });
      setEditingId(null);
      setError('');
      setTimeout(() => setMessage(''), 3000);
      fetchPrograms();
    } catch (err) {
      console.error('Error response:', err.response);
      const errorMsg = err.response?.data?.message || err.response?.data || 'Failed to save program';
      setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      console.error('Full error:', err);
    }
  };

  const handleEdit = (program) => {
    setEditingId(program.id);
    // Only set the specific fields we need, ensuring proper types
    setFormData({
      name: program.name || '',
      semesterCount: program.semesterCount || null,
      description: program.description || '',
      isActive: program.isActive !== undefined ? program.isActive : true
    });
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this program?')) return;
    try {
      await api.delete(`/programs/${id}`);
      setMessage('Program deleted successfully');
      setError('');
      setTimeout(() => setMessage(''), 3000);
      fetchPrograms();
    } catch (err) {
      setError('Failed to delete program');
      console.error(err);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: '', semesterCount: null, description: '', isActive: true });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>📚 Program Management</h1>

      {message && <div style={{backgroundColor: '#d4edda', color: '#155724', padding: '12px', marginBottom: '15px', borderRadius: '4px'}}>{message}</div>}
      {error && <div style={{backgroundColor: '#f8d7da', color: '#721c24', padding: '12px', marginBottom: '15px', borderRadius: '4px'}}>{error}</div>}

      {/* Add/Edit Form */}
      <div style={{backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #dee2e6'}}>
        <h3>{editingId ? 'Edit Program' : 'Add New Program'}</h3>
        <form onSubmit={handleSubmit} style={{display: 'grid', gap: '12px'}}>
          <div>
            <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Program Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
              placeholder="e.g., B.Tech, BBA, B.Sc"
              style={{width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd'}}
            />
          </div>

          <div>
            <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Number of Semesters</label>
            <input
              type="number"
              value={formData.semesterCount || ''}
              onChange={(e) => setFormData({...formData, semesterCount: e.target.value ? parseInt(e.target.value) : null})}
              placeholder="e.g., 8"
              style={{width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd'}}
            />
          </div>

          <div>
            <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Enter program description"
              rows="3"
              style={{width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd'}}
            />
          </div>

          <div>
            <label style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              />
              Active
            </label>
          </div>

          <div style={{display: 'flex', gap: '10px'}}>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              {editingId ? 'Update Program' : 'Add Program'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Programs List */}
      {loading ? (
        <p>Loading programs...</p>
      ) : programs.length > 0 ? (
        <div style={{overflow: 'x-auto'}}>
          <table style={{width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
            <thead>
              <tr style={{backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6'}}>
                <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Program Name</th>
                <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Semesters</th>
                <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Description</th>
                <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Status</th>
                <th style={{padding: '12px', textAlign: 'center', fontWeight: 'bold'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {programs.map(program => (
                <tr key={program.id} style={{borderBottom: '1px solid #dee2e6'}}>
                  <td style={{padding: '12px'}}><strong>{program.name}</strong></td>
                  <td style={{padding: '12px'}}>{program.semesterCount || 'N/A'}</td>
                  <td style={{padding: '12px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis'}}>{program.description || '—'}</td>
                  <td style={{padding: '12px'}}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      backgroundColor: program.isActive ? '#d4edda' : '#f8d7da',
                      color: program.isActive ? '#155724' : '#721c24',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {program.isActive ? '✓ Active' : '✗ Inactive'}
                    </span>
                  </td>
                  <td style={{padding: '12px', textAlign: 'center'}}>
                    <button
                      onClick={() => handleEdit(program)}
                      style={{
                        padding: '6px 12px',
                        marginRight: '5px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(program.id)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p style={{padding: '20px', textAlign: 'center', color: '#666'}}>No programs found. Create one to get started!</p>
      )}
    </div>
  );
};

export default ProgramManagement;
