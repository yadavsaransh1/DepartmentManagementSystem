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

  const [projectMessages, setProjectMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [editingProject, setEditingProject] = useState(false);

  useEffect(() => {
    fetchProjectInfo();
  }, []);

  useEffect(() => {
    if (projectInfo) {
      setProjectTitle(projectInfo.projectTitle || '');
      setProjectDescription(projectInfo.projectDescription || '');
    }
  }, [projectInfo]);

  const fetchProjectInfo = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/projects/student/${user.studentId || user.id}`);
      setProjectInfo(response.data || null);
      if (response.data && response.data.id) {
        fetchDocuments(response.data.id);
      }
      setMessage({ text: '', type: '' });
    } catch (err) {
      console.error('Error fetching project info:', err);
      setProjectInfo(null);
      // Check if it's a 404 (not found) error
      if (err.response?.status === 404) {
        setMessage({ text: 'No project allocated yet. Please contact your supervisor.', type: 'info' });
      } else {
        setMessage({ text: 'Failed to fetch project information', type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async (projectId) => {
    if (!projectId) {
      console.warn('No projectId provided to fetchDocuments');
      setDocuments([]);
      return;
    }
    
    try {
      const response = await api.get(`/projects/${projectId}/documents`);
      const documentData = Array.isArray(response.data) ? response.data : [];
      setDocuments(documentData);
    } catch (err) {
      console.error('Error fetching documents:', err);
      // Set empty array - documents might not exist or endpoint has issues
      setDocuments([]);
      // Only show error for unexpected status codes
      if (err.response?.status && ![400, 404, 500].includes(err.response.status)) {
        setMessage({ text: 'Note: Could not load project documents', type: 'info' });
      }
    }
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();

    if (!uploadFile || !projectInfo) {
      setMessage({ text: 'Please select a file and enter a title', type: 'warning' });
      return;
    }

    const documentTitle = document.querySelector('[name="documentTitle"]')?.value;
    if (!documentTitle || !documentTitle.trim()) {
      setMessage({ text: 'Please enter a document title', type: 'warning' });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('allocationId', projectInfo.id);
      formData.append('uploadedBy', 'STUDENT');
      formData.append('documentTitle', documentTitle);
      formData.append('visibility', 'EVERYONE');

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
        window.URL.revokeObjectURL(url);
      } else {
        setMessage({ text: 'Downloaded file is empty', type: 'error' });
      }
    } catch (err) {
      console.error('Error downloading document:', err);
      setMessage({ text: 'Failed to download document', type: 'error' });
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

  const fetchMessages = async () => {
    try {
      if (!projectInfo || !projectInfo.id) return;
      const response = await api.get(`/projects/${projectInfo.id}/messages`);
      setProjectMessages(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const handleUpdateProjectInfo = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/projects/${projectInfo.id}/info`, {
        projectTitle,
        projectDescription
      });
      setMessage({ text: 'Project information updated successfully', type: 'success' });
      setEditingProject(false);
      fetchProjectInfo();
    } catch (err) {
      console.error('Error updating project info:', err);
      setMessage({ text: 'Failed to update project information', type: 'error' });
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !projectInfo) {
      setMessage({ text: 'Please enter a message', type: 'warning' });
      return;
    }

    try {
      setSendingMessage(true);
      await api.post(`/projects/${projectInfo.id}/messages`, {
        messageText: messageText,
        senderRole: 'STUDENT'
      });
      setMessage({ text: 'Message sent successfully', type: 'success' });
      setMessageText('');
      await fetchMessages();
    } catch (err) {
      console.error('Error sending message:', err);
      setMessage({ text: 'Failed to send message', type: 'error' });
    } finally {
      setSendingMessage(false);
    }
  };

  useEffect(() => {
    if (projectInfo && projectInfo.id) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [projectInfo]);

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

          {/* Messages Section */}
          <div style={{
            backgroundColor: '#fafafa',
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '15px'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px' }}>💬 Messages</h3>

            {/* Messages List */}
            <div style={{
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: '4px',
              maxHeight: '250px',
              overflowY: 'auto',
              marginBottom: '12px',
              padding: '10px'
            }}>
              {projectMessages.length === 0 ? (
                <p style={{ color: '#999', margin: '10px 0', textAlign: 'center', fontSize: '13px' }}>No messages yet</p>
              ) : (
                projectMessages.map((msg, idx) => (
                  <div key={idx} style={{
                    backgroundColor: msg.senderRole === 'STUDENT' ? '#e3f2fd' : '#f5f5f5',
                    borderLeft: '3px solid ' + (msg.senderRole === 'STUDENT' ? '#2196f3' : '#666'),
                    padding: '8px',
                    marginBottom: '8px',
                    borderRadius: '2px',
                    fontSize: '12px'
                  }}>
                    <strong style={{ color: msg.senderRole === 'STUDENT' ? '#1976d2' : '#333' }}>
                      {msg.senderRole === 'STUDENT' ? 'You' : 'Supervisor'}
                    </strong>
                    <p style={{ margin: '3px 0 0 0' }}>{msg.messageText}</p>
                    <small style={{ color: '#999' }}>
                      {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ''}
                    </small>
                  </div>
                ))
              )}
            </div>

            {/* Send Message Form */}
            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type a message..."
                style={{
                  flex: 1,
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '13px'
                }}
              />
              <button
                type="submit"
                disabled={sendingMessage}
                style={{
                  padding: '8px 15px',
                  backgroundColor: sendingMessage ? '#ccc' : '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: sendingMessage ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '13px'
                }}
              >
                {sendingMessage ? 'Sending...' : '📤 Send'}
              </button>
            </form>

          </div>

          {/* Project Information Section */}
          <div style={{
            backgroundColor: '#fff9e6',
            border: '1px solid #ffc107',
            borderRadius: '4px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ marginTop: 0, color: '#ff6f00' }}>📋 Project Information</h3>
              <button
                onClick={() => setEditingProject(!editingProject)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: editingProject ? '#f44336' : '#2196f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '13px'
                }}
              >
                {editingProject ? '✕ Cancel' : '✏️ Edit'}
              </button>
            </div>

            {editingProject ? (
              <form onSubmit={handleUpdateProjectInfo} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Project Title</label>
                  <input
                    type="text"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="Enter project title..."
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
                  <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Project Description</label>
                  <textarea
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Enter project description..."
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      minHeight: '100px',
                      boxSizing: 'border-box',
                      fontFamily: 'arial'
                    }}
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
                    ✓ Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingProject(false)}
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
                    ✕ Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div>
                {projectTitle ? (
                  <div style={{ marginBottom: '10px' }}>
                    <strong style={{ color: '#ff6f00' }}>Title:</strong>
                    <p style={{ margin: '5px 0 0 0', fontSize: '15px' }}>{projectTitle}</p>
                  </div>
                ) : (
                  <p style={{ color: '#999', fontStyle: 'italic' }}>No project title added yet</p>
                )}
                {projectDescription && (
                  <div>
                    <strong style={{ color: '#ff6f00' }}>Description:</strong>
                    <p style={{ margin: '5px 0 0 0', fontSize: '14px', whiteSpace: 'pre-wrap' }}>{projectDescription}</p>
                  </div>
                )}
              </div>
            )}
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
                      Document Title
                    </label>
                    <input
                      type="text"
                      name="documentTitle"
                      placeholder="Enter document title..."
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                        marginBottom: '10px'
                      }}
                      required
                    />
                  </div>
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
                  <tr style={{ backgroundColor: '#a600a1', borderBottom: '2px solid #ddd' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Document Name</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Uploaded By</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Date</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', width: '200px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc, index) => (
                    <tr key={doc.id} style={{
                      borderBottom: '1px solid #ddd',
                      backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9'
                    }}>
                      <td style={{ padding: '12px', fontWeight: '500' }}>
                        📄 {doc.documentTitle || doc.documentName || doc.fileName}
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
                        {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : '—'}
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
