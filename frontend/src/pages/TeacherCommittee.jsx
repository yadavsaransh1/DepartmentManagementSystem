import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/dashboard.css';

export const TeacherCommittee = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [committees, setCommittees] = useState([]);
  const [selectedCommittee, setSelectedCommittee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [documents, setDocuments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentType, setDocumentType] = useState('REPORT');
  const [documentDescription, setDocumentDescription] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showMessagesPanel, setShowMessagesPanel] = useState(false);

  useEffect(() => {
    if (user.email) {
      fetchMyCommittees();
    }
  }, [user.email]);

  const fetchMyCommittees = async () => {
    try {
      setLoading(true);
      const response = await api.get('/committees/my-committees');
      const committees = Array.isArray(response.data) ? response.data : [];
      committees.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setCommittees(committees);
    } catch (err) {
      console.error('Error fetching committees:', err);
      setMessage({ text: 'Failed to load committees', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCommittee = async (committee) => {
    setSelectedCommittee(committee);
    setShowMessagesPanel(false);
    setMessages([]);
    try {
      const response = await api.get(`/committees/${committee.id}/documents`);
      setDocuments(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setDocuments([]);
    }
  };

  const fetchMessages = async () => {
    if (!selectedCommittee) return;
    try {
      const response = await api.get(`/committees/${selectedCommittee.id}/messages`);
      const msgData = Array.isArray(response.data) ? response.data : [];
      // Sort messages by timestamp - newest at bottom
      msgData.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      setMessages(msgData);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  useEffect(() => {
    if (showMessagesPanel && selectedCommittee) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [showMessagesPanel, selectedCommittee]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedCommittee) {
      setMessage({ text: 'Please enter a message', type: 'warning' });
      return;
    }

    try {
      setSendingMessage(true);
      await api.post(`/committees/${selectedCommittee.id}/messages`, {
        messageText: messageText
      });

      setMessage({ text: 'Message sent successfully', type: 'success' });
      setMessageText('');
      fetchMessages();
    } catch (err) {
      console.error('Error sending message:', err);
      setMessage({ text: 'Failed to send message', type: 'error' });
    } finally {
      setSendingMessage(false);
    }
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    
    if (!uploadFile || !selectedCommittee) {
      setMessage({ text: 'Please select a file to upload', type: 'warning' });
      return;
    }

    if (!documentTitle.trim()) {
      setMessage({ text: 'Please enter a document title', type: 'warning' });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('documentName', documentTitle);
      formData.append('documentType', documentType);
      if (documentDescription) {
        formData.append('description', documentDescription);
      }

      await api.post(`/committees/${selectedCommittee.id}/documents/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessage({ text: 'Document uploaded successfully', type: 'success' });
      setUploadFile(null);
      setDocumentTitle('');
      setDocumentType('REPORT');
      setDocumentDescription('');
      setShowUploadModal(false);
      handleSelectCommittee(selectedCommittee);
    } catch (err) {
      console.error('Error uploading document:', err);
      setMessage({ text: 'Failed to upload document', type: 'error' });
    }
  };

  const handleDownloadDocument = async (documentId, fileName) => {
    try {
      const response = await api.get(`/committees/documents/${documentId}/download`, {
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
        await api.delete(`/committees/documents/${documentId}`);
        setMessage({ text: 'Document deleted successfully', type: 'success' });
        handleSelectCommittee(selectedCommittee);
      } catch (err) {
        console.error('Error deleting document:', err);
        setMessage({ text: 'Failed to delete document', type: 'error' });
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>🏛️ Committee Management</h1>

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

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px' }}>
        {/* Committee List */}
        <div style={{
          backgroundColor: '#f9f9f9',
          border: '1px solid #ddd',
          borderRadius: '4px',
          padding: '15px',
          maxHeight: '700px',
          overflowY: 'auto'
        }}>
          {loading ? (
            <p>Loading...</p>
          ) : committees.length === 0 ? (
            <p style={{ color: '#666', fontSize: '13px', textAlign: 'center', marginTop: '30px' }}>
              You are not a member of any committee yet
            </p>
          ) : (
            <>
              <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#2c3e50' }}>
                Your Committees ({committees.length})
              </h3>
              {committees.map(committee => (
                <div
                  key={committee.id}
                  onClick={() => handleSelectCommittee(committee)}
                  style={{
                    padding: '12px',
                    marginBottom: '10px',
                    backgroundColor: selectedCommittee?.id === committee.id ? '#2196f3' : 'white',
                    color: selectedCommittee?.id === committee.id ? 'white' : '#333',
                    border: `1px solid ${selectedCommittee?.id === committee.id ? '#1976d2' : '#ddd'}`,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{committee.name}</div>
                  <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '3px' }}>
                    👥 {committee.memberCount || 0} members
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Committee Details */}
        {selectedCommittee ? (
          <div>
            {/* Committee Info */}
            <div style={{
              backgroundColor: '#e3f2fd',
              border: '1px solid #6c9bcf',
              borderRadius: '4px',
              padding: '15px',
              marginBottom: '20px'
            }}>
              <h2 style={{ marginTop: 0 }}>{selectedCommittee.name}</h2>
              <p style={{ marginBottom: '10px', color: '#555' }}>{selectedCommittee.description}</p>
              <div style={{ fontSize: '13px', color: '#666' }}>
                <strong>Created:</strong> {new Date(selectedCommittee.createdAt).toLocaleDateString()}
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button
                onClick={() => setShowMessagesPanel(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: !showMessagesPanel ? '#2196f3' : '#ddd',
                  color: !showMessagesPanel ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                📄 Documents
              </button>
              <button
                onClick={() => setShowMessagesPanel(true)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: showMessagesPanel ? '#2196f3' : '#ddd',
                  color: showMessagesPanel ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                💬 Messages
              </button>
              {/* <button
                onClick={() => setShowMessagesPanel(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f57c00',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  marginLeft: 'auto'
                }}
              >
                👥 Members
              </button> */}
            </div>

            {/* Members List */}
            {!showMessagesPanel && (
              <div style={{
                backgroundColor: '#f9f9f9',
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '15px',
                marginBottom: '20px'
              }}>
                <h3 style={{ marginTop: 0 }}>Committee Members</h3>
                {selectedCommittee.members && selectedCommittee.members.length > 0 ? (
                  selectedCommittee.members.map(member => (
                    <div key={member.id} style={{
                      padding: '10px',
                      marginBottom: '8px',
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}>
                      <div style={{ fontWeight: 'bold' }}>
                        {member.teacherName} <span style={{ color: '#f57c00', fontWeight: 'normal' }}>({member.role})</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{member.teacherEmail}</div>
                      {member.powers && member.powers.length > 0 && (
                        <div style={{ fontSize: '11px', marginTop: '5px', color: '#555' }}>
                          Powers: {member.powers.join(', ')}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#666' }}>No members found</p>
                )}
              </div>
            )}

            {/* Documents Section */}
            {!showMessagesPanel && (
              <div style={{
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '15px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h3 style={{ margin: 0 }}>📄 Documents</h3>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    style={{
                      padding: '8px 15px',
                      backgroundColor: '#4caf50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  >
                    ⬆️ Upload Document
                  </button>
                </div>

                {documents.length > 0 ? (
                  documents.map(doc => (
                    <div key={doc.id} style={{
                      padding: '12px',
                      marginBottom: '10px',
                      backgroundColor: '#f9f9f9',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{doc.documentName}</div>
                        <div style={{ fontSize: '11px', color: '#666', marginTop: '3px' }}>
                          Uploaded by: {doc.uploadedByName} • {new Date(doc.uploadedAt).toLocaleDateString()}
                        </div>
                        {doc.description && (
                          <div style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>
                            {doc.description}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '5px', marginLeft: '10px' }}>
                        <button
                          onClick={() => handleDownloadDocument(doc.id, doc.documentName)}
                          style={{
                            padding: '5px 10px',
                            backgroundColor: '#2196f3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '11px'
                          }}
                        >
                          Download
                        </button>
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          style={{
                            padding: '5px 10px',
                            backgroundColor: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '11px'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#666', textAlign: 'center', marginTop: '20px' }}>No documents uploaded yet</p>
                )}
              </div>
            )}

            {/* Messages Section */}
            {showMessagesPanel && (
              <div style={{
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '15px',
                display: 'flex',
                flexDirection: 'column',
                height: '600px'
              }}>
                <h3 style={{ marginTop: 0, marginBottom: '15px' }}>💬 Committee Chat</h3>
                
                {/* Messages Display */}
                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  marginBottom: '15px',
                  backgroundColor: '#f9f9f9',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}>
                  {messages.length > 0 ? (
                    messages.map(msg => (
                      <div key={msg.id} style={{
                        marginBottom: '10px',
                        padding: '10px',
                        backgroundColor: msg.senderEmail === user.email ? '#e3f2fd' : 'white',
                        borderLeft: `3px solid ${msg.senderEmail === user.email ? '#2196f3' : '#ddd'}`,
                        borderRadius: '4px'
                      }}>
                        <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '3px' }}>
                          {msg.senderName}
                        </div>
                        <div style={{ fontSize: '13px', color: '#333', marginBottom: '4px' }}>
                          {msg.messageText}
                        </div>
                        <div style={{ fontSize: '11px', color: '#999' }}>
                          {new Date(msg.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: '#999', textAlign: 'center', marginTop: '20px' }}>
                      No messages yet. Start the conversation!
                    </p>
                  )}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message..."
                    style={{
                      flex: 1,
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '13px'
                    }}
                  />
                  <button
                    type="submit"
                    disabled={sendingMessage}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#2196f3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '12px',
                      opacity: sendingMessage ? 0.5 : 1
                    }}
                  >
                    Send
                  </button>
                </form>
              </div>
            )}
          </div>
        ) : (
          <div style={{
            backgroundColor: '#f9f9f9',
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '40px',
            textAlign: 'center',
            color: '#666'
          }}>
            <p>Select a committee to view details</p>
          </div>
        )}
      </div>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '30px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>Upload Document</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadDocument}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Document Title *</label>
                <input
                  type="text"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  placeholder="e.g., Meeting Minutes"
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

              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Document Type</label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="REPORT">Report</option>
                  <option value="MINUTES">Meeting Minutes</option>
                  <option value="AGENDA">Agenda</option>
                  <option value="GUIDELINES">Guidelines</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Description</label>
                <textarea
                  value={documentDescription}
                  onChange={(e) => setDocumentDescription(e.target.value)}
                  placeholder="Optional description"
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    fontFamily: 'Arial'
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Select File *</label>
                <input
                  type="file"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  ⬆️ Upload
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
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
        </div>
      )}
    </div>
  );
};

export default TeacherCommittee;
