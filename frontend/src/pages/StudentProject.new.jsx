import React, { useState, useEffect } from 'react';
import api from '../services/api';

export const StudentProject = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [projectInfo, setProjectInfo] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);

  useEffect(() => {
    fetchProjectInfo();
  }, []);

  const fetchProjectInfo = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/projects/student/${user.studentId}`);
      setProjectInfo(response.data || null);
      if (response.data && response.data.id) {
        fetchDocuments(response.data.id);
      }
      setMessage({ text: '', type: '' });
    } catch (err) {
      console.error('Error fetching project info:', err);
      setProjectInfo(null);
      setMessage({ text: 'Failed to fetch project information', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async (projectId) => {
    try {
      const response = await api.get(`/projects/${projectId}/documents`);
      setDocuments(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setDocuments([]);
    }
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();

    if (!uploadFile || !projectInfo) {
      setMessage({ text: 'Please select a file to upload', type: 'warning' });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('projectId', projectInfo.id);
      formData.append('uploadedBy', 'STUDENT');

      await api.post('/projects/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessage({ text: 'Document uploaded successfully', type: 'success' });
      setUploadFile(null);
      setShowUploadModal(false);
      fetchDocuments(projectInfo.id);
    } catch (err) {
      console.error('Error uploading document:', err);
      setMessage({ text: 'Failed to upload document', type: 'error' });
    }
  };

  const handleDownloadDocument = async (documentId, fileName) => {
    try {
      const response = await api.get(`/projects/documents/${documentId}/download`, {
        responseType: 'blob'
      });
      if (response.data.size > 0) {
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName || 'document.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error('Error downloading document:', err);
        setMessage({ text: 'Failed to download document', type: 'error' });
      }
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await api.delete(`/projects/documents/${documentId}`);
        setMessage({ text: 'Document deleted successfully', type: 'success' });
        if (projectInfo) {
          fetchDocuments(projectInfo.id);
        }
      } catch (err) {
        console.error('Error deleting document:', err);
        setMessage({ text: 'Failed to delete document', type: 'error' });
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>📚 My Project</h1>

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

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <p>Loading project information...</p>
        </div>
      ) : !projectInfo ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '4px',
          color: '#856404'
        }}>
          <h3>📭 No Project Assigned Yet</h3>
          <p>Your supervisor/guide will be assigned by the admin. Check back later!</p>
        </div>
      ) : (
        <div>
          {/* Supervisor/Guide Info */}
          <div style={{
            backgroundColor: '#f0f7ff',
            border: '1px solid #6c9bcf',
            borderRadius: '4px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h3 style={{ marginTop: 0, color: '#1976d2' }}>
              👨‍🏫 Project Supervisor/Guide
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px'
            }}>
              <div style={{
                padding: '15px',
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}>
                <strong style={{ color: '#1976d2' }}>Name:</strong>
                <p style={{ margin: '5px 0 0 0', fontSize: '16px' }}>
                  {projectInfo.supervisorName}
                </p>
              </div>

              {projectInfo.supervisorEmail && projectInfo.supervisorEmail !== 'N/A' && (
                <div style={{
                  padding: '15px',
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}>
                  <strong style={{ color: '#1976d2' }}>Email:</strong>
                  <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>
                    {projectInfo.supervisorEmail}
                  </p>
                </div>
              )}

              {projectInfo.allocationDate && (
                <div style={{
                  padding: '15px',
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}>
                  <strong style={{ color: '#1976d2' }}>Allocation Date:</strong>
                  <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>
                    {new Date(projectInfo.allocationDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Documents Section */}
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ marginTop: 0 }}>📄 Project Documents</h3>
              <button
                onClick={() => setShowUploadModal(!showUploadModal)}
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
                + Upload Document
              </button>
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
              <div style={{
                marginBottom: '20px',
                padding: '20px',
                backgroundColor: '#fffacd',
                border: '1px solid #f0e68c',
                borderRadius: '4px'
              }}>
                <h4 style={{ marginTop: 0 }}>Upload Project Document</h4>
                <form onSubmit={handleUploadDocument}>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                      Select File
                    </label>
                    <input
                      type="file"
                      onChange={(e) => setUploadFile(e.target.files[0])}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
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
                      Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowUploadModal(false)}
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

            {/* Documents List */}
            {documents.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                backgroundColor: '#f9f9f9',
                borderRadius: '4px',
                color: '#666'
              }}>
                <p>No documents shared yet</p>
              </div>
            ) : (
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '13px'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #ddd' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Document Name</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Uploaded By</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Date</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', width: '180px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc, index) => (
                    <tr key={doc.id} style={{
                      borderBottom: '1px solid #ddd',
                      backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9'
                    }}>
                      <td style={{ padding: '12px', fontWeight: '500' }}>
                        📄 {doc.fileName || doc.documentName}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          backgroundColor: doc.uploadedBy === 'STUDENT' ? '#e3f2fd' : '#f3e5f5',
                          color: doc.uploadedBy === 'STUDENT' ? '#1976d2' : '#7b1fa2',
                          padding: '4px 10px',
                          borderRadius: '3px',
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}>
                          {doc.uploadedBy === 'STUDENT' ? '👤 You' : '👨‍🏫 Supervisor'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontSize: '12px' }}>
                        {doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : '—'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleDownloadDocument(doc.id, doc.fileName || doc.documentName)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#2196f3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            marginRight: '5px',
                            fontSize: '11px',
                            fontWeight: 'bold'
                          }}
                        >
                          📥 Download
                        </button>
                        {doc.uploadedBy === 'STUDENT' && (
                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#f44336',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              fontSize: '11px',
                              fontWeight: 'bold'
                            }}
                          >
                            🗑️ Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
