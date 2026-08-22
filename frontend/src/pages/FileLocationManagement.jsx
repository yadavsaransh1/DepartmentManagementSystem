import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/dashboard.css';

export const FileLocationManagement = () => {
  const [fileLocations, setFileLocations] = useState([]);
  const [filteredFileLocations, setFilteredFileLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [viewingData, setViewingData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [formData, setFormData] = useState({
    fileName: '',
    almirahName: '',
    additionalInformation: ''
  });

  const [editFormData, setEditFormData] = useState({
    fileName: '',
    almirahName: '',
    additionalInformation: ''
  });

  useEffect(() => {
    fetchFileLocations();
  }, []);

  useEffect(() => {
    applySearch();
  }, [fileLocations, searchQuery]);

  const fetchFileLocations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/file-locations');
      setFileLocations(Array.isArray(response.data) ? response.data : []);
      setMessage({ text: '', type: '' });
    } catch (err) {
      console.error('Error fetching file locations:', err);
      setMessage({ text: 'Failed to load file locations', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const applySearch = () => {
    let filtered = fileLocations;
    if (searchQuery.trim()) {
      filtered = fileLocations.filter(fl =>
        fl.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fl.almirahName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredFileLocations(filtered);
  };

  const handleAddFileLocation = async (e) => {
    e.preventDefault();
    try {
      if (!formData.fileName || !formData.almirahName) {
        setMessage({ text: 'Please fill in all required fields', type: 'warning' });
        return;
      }

      const params = new URLSearchParams({
        fileName: formData.fileName,
        almirahName: formData.almirahName,
        ...(formData.additionalInformation && { additionalInformation: formData.additionalInformation })
      });

      await api.post(`/file-locations?${params}`);
      setMessage({ text: 'File location created successfully', type: 'success' });
      setFormData({ fileName: '', almirahName: '', additionalInformation: '' });
      setShowForm(false);
      fetchFileLocations();
    } catch (err) {
      console.error('Error creating file location:', err);
      setMessage({ text: 'Failed to create file location', type: 'error' });
    }
  };

  const handleDeleteFileLocation = async (id) => {
    if (window.confirm('Are you sure you want to delete this file location?')) {
      try {
        await api.delete(`/file-locations/${id}`);
        setMessage({ text: 'File location deleted successfully', type: 'success' });
        fetchFileLocations();
      } catch (err) {
        console.error('Error deleting file location:', err);
        setMessage({ text: 'Failed to delete file location', type: 'error' });
      }
    }
  };

  const handleEditFileLocation = (fl) => {
    setEditFormData({
      fileName: fl.fileName,
      almirahName: fl.almirahName,
      additionalInformation: fl.additionalInformation || ''
    });
    setEditMode(true);
  };

  const handleUpdateFileLocation = async (e) => {
    e.preventDefault();
    try {
      if (!editFormData.fileName || !editFormData.almirahName) {
        setMessage({ text: 'Please fill in all required fields', type: 'warning' });
        return;
      }

      const params = new URLSearchParams({
        ...(editFormData.fileName && { fileName: editFormData.fileName }),
        ...(editFormData.almirahName && { almirahName: editFormData.almirahName }),
        ...(editFormData.additionalInformation !== undefined && { additionalInformation: editFormData.additionalInformation })
      });

      await api.put(`/file-locations/${viewingData.id}?${params}`);
      setMessage({ text: 'File location updated successfully', type: 'success' });
      setEditMode(false);
      setEditFormData({ fileName: '', almirahName: '', additionalInformation: '' });
      fetchFileLocations();
    } catch (err) {
      console.error('Error updating file location:', err);
      setMessage({ text: 'Failed to update file location', type: 'error' });
    }
  };

  const handleViewFileLocation = (fl) => {
    setViewingId(fl.id);
    setViewingData(fl);
  };

  const handleCloseView = () => {
    setViewingId(null);
    setViewingData(null);
    setEditMode(false);
    setEditFormData({ fileName: '', almirahName: '', additionalInformation: '' });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '4px', minHeight: '80vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>📁 File Location Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {showForm ? '✕ Cancel' : '+ Add File Location'}
        </button>
      </div>

      {message.text && (
        <div style={{
          padding: '12px',
          marginBottom: '15px',
          backgroundColor: message.type === 'success' ? '#d4edda' : message.type === 'warning' ? '#fff3cd' : '#f8d7da',
          color: message.type === 'success' ? '#155724' : message.type === 'warning' ? '#856404' : '#721c24',
          borderRadius: '4px',
          border: `1px solid ${message.type === 'success' ? '#c3e6cb' : message.type === 'warning' ? '#ffeaa7' : '#f5c6cb'}`
        }}>
          {message.text}
        </div>
      )}

      {showForm && (
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '4px',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: 0 }}>Create New File Location</h3>
          <form onSubmit={handleAddFileLocation}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>File Name *</label>
                <input
                  type="text"
                  value={formData.fileName}
                  onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
                  placeholder="e.g., Student Records 2024"
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
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Almirah Name *</label>
                <input
                  type="text"
                  value={formData.almirahName}
                  onChange={(e) => setFormData({ ...formData, almirahName: e.target.value })}
                  placeholder="e.g., Cabinet A - Shelf 3"
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
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Additional Information</label>
                <textarea
                  value={formData.additionalInformation}
                  onChange={(e) => setFormData({ ...formData, additionalInformation: e.target.value })}
                  placeholder="Any notes or additional details..."
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
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
                ✓ Create
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
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
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div style={{
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: 'white',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <input
          type="text"
          placeholder="Search by file name or almirah name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      ) : filteredFileLocations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          No file locations found. {showForm ? '' : 'Click "Add File Location" to create one.'}
        </div>
      ) : (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '4px',
          overflow: 'hidden',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table className='almirah-table' style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '14px'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#2c3e50', color: 'white' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>File Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Almirah Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Created</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Last Updated</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFileLocations.map((fl, index) => (
                  <tr key={fl.id} style={{
                    backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#fff',
                    borderBottom: '1px solid #eee',
                    transition: 'background-color 0.3s'
                  }}>
                    <td style={{ padding: '12px' }}>{fl.fileName}</td>
                    <td style={{ padding: '12px' }}>{fl.almirahName}</td>
                    <td style={{ padding: '12px', fontSize: '12px', color: '#666' }}>{formatDate(fl.createdAt)}</td>
                    <td style={{ padding: '12px', fontSize: '12px', color: '#666' }}>{formatDate(fl.updatedAt)}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleViewFileLocation(fl)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#2196f3',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          marginRight: '5px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDeleteFileLocation(fl.id)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold'
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
        </div>
      )}

      {/* View Modal */}
      {viewingId && viewingData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '30px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>File Location Details</h2>
              <button
                onClick={handleCloseView}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#999'
                }}
              >
                ✕
              </button>
            </div>

            {!editMode ? (
              <div style={{ display: 'grid', gap: '15px' }}>
                <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                  <strong>File Name:</strong> {viewingData.fileName}
                </div>
                <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                  <strong>Almirah Name:</strong> {viewingData.almirahName}
                </div>
                {viewingData.additionalInformation && (
                  <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                    <strong>Additional Information:</strong> {viewingData.additionalInformation}
                  </div>
                )}
                <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                  <strong>Created:</strong> {formatDate(viewingData.createdAt)}
                </div>
                <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                  <strong>Last Updated:</strong> {formatDate(viewingData.updatedAt)}
                </div>

                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => handleEditFileLocation(viewingData)}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#ff9800',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={handleCloseView}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#666',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateFileLocation}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>File Name</label>
                    <input
                      type="text"
                      value={editFormData.fileName}
                      onChange={(e) => setEditFormData({ ...editFormData, fileName: e.target.value })}
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
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Almirah Name</label>
                    <input
                      type="text"
                      value={editFormData.almirahName}
                      onChange={(e) => setEditFormData({ ...editFormData, almirahName: e.target.value })}
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
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Additional Information</label>
                    <textarea
                      value={editFormData.additionalInformation}
                      onChange={(e) => setEditFormData({ ...editFormData, additionalInformation: e.target.value })}
                      rows="3"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="submit"
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
                    ✓ Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
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
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
