import React, { useState, useEffect } from 'react';
import api from '../services/api';

export const TeacherProject = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [regularStudents, setRegularStudents] = useState([]);
  const [phdStudents, setPhdStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [showMessagesPanel, setShowMessagesPanel] = useState(false);
  const [projectMessages, setProjectMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [documentVisibility, setDocumentVisibility] = useState('EVERYONE');

  useEffect(() => {
    // Only fetch if we have user with email
    if (user.email) {
      fetchAssignedStudents();
    } else {
      setMessage({ text: 'User information not found', type: 'error' });
      setLoading(false);
    }
  }, [user.email]);

  const fetchAssignedStudents = async () => {
    try {
      setLoading(true);
      if (!user.email) {
        setMessage({ text: 'User information not found', type: 'error' });
        setLoading(false);
        return;
      }
      
      // Use email as primary key for the API
      const response = await api.get(`/supervisors/students-by-email?teacherEmail=${user.email}`);
      const students = Array.isArray(response.data) ? response.data : [];
      setAssignedStudents(students);
      
      // Separate students by allocation type
      const regular = students.filter(s => s.allocationType === 'SUPERVISOR' || !s.allocationType);
      const phd = students.filter(s => s.allocationType === 'GUIDE');
      
      setRegularStudents(regular);
      setPhdStudents(phd);
      setMessage({ text: '', type: '' });
    } catch (err) {
      console.error('Error fetching assigned students:', err);
      setAssignedStudents([]);
      setRegularStudents([]);
      setPhdStudents([]);
      setMessage({ text: 'Failed to fetch assigned students', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStudent = async (student) => {
    setSelectedStudent(student);
    setShowMessagesPanel(false);
    setProjectMessages([]);
    try {
      if (student.id) {
        const response = await api.get(`/projects/${student.id}/documents`);
        setDocuments(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
      setDocuments([]);
    }
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    
    if (!uploadFile || !selectedStudent) {
      setMessage({ text: 'Please select a file to upload', type: 'warning' });
      return;
    }

    const documentTitle = document.querySelector('[name="teacherDocumentTitle"]')?.value;
    if (!documentTitle || !documentTitle.trim()) {
      setMessage({ text: 'Please enter a document title', type: 'warning' });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('allocationId', selectedStudent.id);
      formData.append('uploadedBy', 'TEACHER');
      formData.append('documentTitle', documentTitle);
      formData.append('visibility', documentVisibility);

      await api.post('/projects/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessage({ text: 'Document uploaded successfully', type: 'success' });
      setUploadFile(null);
      setShowUploadModal(false);
      setDocumentVisibility('EVERYONE');
      handleSelectStudent(selectedStudent);
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
        handleSelectStudent(selectedStudent);
      } catch (err) {
        console.error('Error deleting document:', err);
        setMessage({ text: 'Failed to delete document', type: 'error' });
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageText.trim() || !selectedStudent) {
      setMessage({ text: 'Please enter a message', type: 'warning' });
      return;
    }

    try {
      setSendingMessage(true);
      await api.post(`/projects/${selectedStudent.id}/messages`, {
        messageText: messageText,
        senderRole: 'TEACHER'
      });

      setMessage({ text: 'Message sent successfully', type: 'success' });
      setMessageText('');
      fetchProjectMessages();
    } catch (err) {
      console.error('Error sending message:', err);
      setMessage({ text: 'Failed to send message', type: 'error' });
    } finally {
      setSendingMessage(false);
    }
  };

  const fetchProjectMessages = async () => {
    if (!selectedStudent) return;
    try {
      const response = await api.get(`/projects/${selectedStudent.id}/messages`);
      setProjectMessages(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setProjectMessages([]);
    }
  };

  useEffect(() => {
    if (showMessagesPanel && selectedStudent) {
      fetchProjectMessages();
      const interval = setInterval(fetchProjectMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [showMessagesPanel, selectedStudent]);

  return (
    <div style={{ padding: '20px' }}>
      <h1>📚 Project Management</h1>

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
        {/* Student List */}
        <div style={{
          backgroundColor: '#f9f9f9',
          border: '1px solid #ddd',
          borderRadius: '4px',
          padding: '15px',
          maxHeight: '600px',
          overflowY: 'auto'
        }}>
          {loading ? (
            <p>Loading...</p>
          ) : assignedStudents.length === 0 ? (
            <p style={{ color: '#666', fontSize: '13px', textAlign: 'center', marginTop: '30px' }}>
              No students assigned yet
            </p>
          ) : (
            <>
              {/* Regular Students Section */}
              {regularStudents.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '10px', color: '#2196f3' }}>
                    📚 Regular Project Students ({regularStudents.length})
                  </h3>
                  {regularStudents.map(student => (
                    <div
                      key={student.id}
                      onClick={() => handleSelectStudent(student)}
                      style={{
                        padding: '10px',
                        marginBottom: '8px',
                        backgroundColor: selectedStudent?.id === student.id ? '#2196f3' : 'white',
                        color: selectedStudent?.id === student.id ? 'white' : '#333',
                        border: `1px solid ${selectedStudent?.id === student.id ? '#1976d2' : '#ddd'}`,
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{student.studentName}</div>
                      <div style={{ fontSize: '11px', opacity: 0.8 }}>ID: {student.studentId}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* PhD Students Section */}
              {phdStudents.length > 0 && (
                <div>
                  <h3 style={{ marginTop: 0, marginBottom: '10px', color: '#f57c00' }}>
                    🎓 PhD Students ({phdStudents.length})
                  </h3>
                  {phdStudents.map(student => (
                    <div
                      key={student.id}
                      onClick={() => handleSelectStudent(student)}
                      style={{
                        padding: '10px',
                        marginBottom: '8px',
                        backgroundColor: selectedStudent?.id === student.id ? '#f57c00' : 'white',
                        color: selectedStudent?.id === student.id ? 'white' : '#333',
                        border: `1px solid ${selectedStudent?.id === student.id ? '#e65100' : '#ddd'}`,
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{student.studentName}</div>
                      <div style={{ fontSize: '11px', opacity: 0.8 }}>ID: {student.studentId}</div>
                      {student.specialization && (
                        <div style={{ fontSize: '11px', opacity: 0.7, fontStyle: 'italic' }}>
                          Specialization: {student.specialization}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Student Details and Documents */}
        {selectedStudent ? (
          <div>
            {/* Student Info */}
            <div style={{
              backgroundColor: '#f0f7ff',
              border: '1px solid #6c9bcf',
              borderRadius: '4px',
              padding: '15px',
              marginBottom: '20px'
            }}>
              <h2 style={{ marginTop: 0, marginBottom: '10px' }}>📋 Student Information</h2>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                <strong>Name:</strong> {selectedStudent.studentName}
              </p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                <strong>Student ID:</strong> {selectedStudent.studentId}
              </p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                <strong>Email:</strong> {selectedStudent.studentEmail}
              </p>
              {selectedStudent.studentProgram && (
                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                  <strong>Program:</strong> {selectedStudent.studentProgram}
                </p>
              )}
              {selectedStudent.studentSemester && (
                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                  <strong>Semester:</strong> {selectedStudent.studentSemester}
                </p>
              )}
              {selectedStudent.projectTitle && (
                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                  <strong>Project Title:</strong> {selectedStudent.projectTitle}
                </p>
              )}
              {selectedStudent.projectDescription && (
                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                  <strong>Project Description:</strong> {selectedStudent.projectDescription}
                </p>
              )}
            </div>

            {/* Documents Section */}
            <div style={{
              backgroundColor: '#fafafa',
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '15px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ marginTop: 0, marginBottom: 0 }}>📄 Project Documents</h3>
                <button
                  onClick={() => setShowUploadModal(!showUploadModal)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#2196f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  + Upload Document
                </button>
              </div>

              {showUploadModal && (
                <form onSubmit={handleUploadDocument} style={{
                  backgroundColor: '#f5f5f5',
                  padding: '12px',
                  borderRadius: '4px',
                  marginBottom: '15px'
                }}>
                  <div style={{ marginBottom: '10px' }}>
                    <input
                      type="text"
                      name="teacherDocumentTitle"
                      placeholder="Enter document title..."
                      style={{ width: '100%', padding: '5px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '3px', boxSizing: 'border-box' }}
                      required
                    />
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <input
                      type="file"
                      onChange={(e) => setUploadFile(e.target.files[0])}
                      style={{ width: '100%', padding: '5px' }}
                    />
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', fontSize: '13px' }}>
                      Document Visibility
                    </label>
                    <select
                      value={documentVisibility}
                      onChange={(e) => setDocumentVisibility(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '5px',
                        border: '1px solid #ddd',
                        borderRadius: '3px',
                        boxSizing: 'border-box',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      <option value="EVERYONE">👥 Visible to All Students - Share with all your supervised students</option>
                      <option value="SPECIFIC_STUDENT">👤 Visible to This Student Only - Share only with {selectedStudent?.studentName}</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="submit"
                      style={{
                        padding: '8px 15px',
                        backgroundColor: '#4caf50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowUploadModal(false)}
                      style={{
                        padding: '8px 15px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {documents.length === 0 ? (
                <p style={{ color: '#666', textAlign: 'center', fontSize: '13px' }}>No documents yet</p>
              ) : (
                <div style={{
                  display: 'grid',
                  gap: '10px'
                }}>
                  {documents.map(doc => (
                    <div
                      key={doc.id}
                      style={{
                        backgroundColor: 'white',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        padding: '10px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ flex: 1, fontSize: '13px' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>{doc.documentTitle || doc.documentName || 'Untitled Document'}</div>
                        <div style={{ fontSize: '11px', color: '#666' }}>
                          {doc.uploadedBy} • {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('en-IN', {year: 'numeric', month: 'short', day: 'numeric'}) : doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString('en-IN', {year: 'numeric', month: 'short', day: 'numeric'}) : 'Date unavailable'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleDownloadDocument(doc.id, doc.documentName)}
                          style={{
                            padding: '5px 10px',
                            backgroundColor: '#4caf50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
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
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '11px'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Messages Section */}
            <div style={{
              backgroundColor: '#fafafa',
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '15px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ marginTop: 0, marginBottom: 0 }}>💬 Messages</h3>
              </div>

              <div style={{
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '10px',
                height: '250px',
                overflowY: 'auto',
                marginBottom: '12px'
              }}>
                {projectMessages.length === 0 ? (
                  <p style={{ color: '#666', textAlign: 'center', fontSize: '13px', marginTop: '30px' }}>
                    No messages yet
                  </p>
                ) : (
                  projectMessages.map(msg => (
                    <div
                      key={msg.id}
                      style={{
                        marginBottom: '10px',
                        padding: '8px',
                        backgroundColor: msg.senderRole === 'TEACHER' ? '#e3f2fd' : '#f5f5f5',
                        borderLeft: `3px solid ${msg.senderRole === 'TEACHER' ? '#2196f3' : '#666'}`,
                        fontSize: '12px'
                      }}
                    >
                      <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>
                        {msg.senderRole === 'TEACHER' ? 'You' : 'Student'}
                      </div>
                      <div style={{ marginBottom: '3px' }}>{msg.messageText}</div>
                      <div style={{ fontSize: '10px', color: '#999' }}>
                        {new Date(msg.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>

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
                    backgroundColor: sendingMessage ? '#ccc' : '#2196f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: sendingMessage ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                    fontWeight: 'bold'
                  }}
                >
                  {sendingMessage ? 'Sending...' : '📤 Send Message'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '400px',
            backgroundColor: '#f9f9f9',
            borderRadius: '4px',
            color: '#999',
            fontSize: '16px'
          }}>
            Select a student to view details
          </div>
        )}
      </div>
    </div>
  );
};
