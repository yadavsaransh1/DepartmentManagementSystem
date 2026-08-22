import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/dashboard.css';

export const AdminCommittee = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [committees, setCommittees] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCommittee, setSelectedCommittee] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [newCommittee, setNewCommittee] = useState({
    name: '',
    description: '',
    selectedMembers: []
  });
  const [memberRoles, setMemberRoles] = useState({});
  const [customRoles, setCustomRoles] = useState(['Member', 'Chairman', 'Convenor']);
  const [showNewRoleInput, setShowNewRoleInput] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [editingMember, setEditingMember] = useState(null);
  const [editingRole, setEditingRole] = useState('');
  const [editingPowers, setEditingPowers] = useState([]);
  const [availablePowers, setAvailablePowers] = useState([
    { id: 'canAccessHomePage', label: 'Home Page Access' },
    { id: 'canAccessStudentDetails', label: 'Student Details Access' },
    { id: 'canAccessTeacherDetails', label: 'Teacher Details Access' },
    { id: 'canAccessResults', label: 'Results Access' },
    { id: 'canAccessStudentStatistics', label: 'Student Statistics Access' },
    { id: 'canAccessProject', label: 'Project Access' },
    { id: 'canAccessFeedback', label: 'Feedback Access' },
    { id: 'canAccessAssignment', label: 'Assignment Access' }
  ]);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [addingMemberEmail, setAddingMemberEmail] = useState('');
  const [addingMemberRole, setAddingMemberRole] = useState('Member');

  useEffect(() => {
    fetchCommittees();
    fetchTeachers();
  }, []);

  const fetchCommittees = async () => {
    try {
      setLoading(true);
      const response = await api.get('/committees');
      setCommittees(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching committees:', err);
      setMessage({ text: 'Failed to load committees', type: 'error' });
    } finally {
      setLoading(false);
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

  const handleCreateCommittee = async (e) => {
    e.preventDefault();
    if (!newCommittee.name.trim()) {
      setMessage({ text: 'Please enter committee name', type: 'warning' });
      return;
    }

    try {
      const params = new URLSearchParams();
      params.append('name', newCommittee.name);
      if (newCommittee.description) {
        params.append('description', newCommittee.description);
      }
      
      // Add members and their roles
      if (newCommittee.selectedMembers.length > 0) {
        newCommittee.selectedMembers.forEach(email => {
          params.append('memberEmails', email);
        });
        
        // Send roles as JSON
        const rolesJson = {};
        newCommittee.selectedMembers.forEach(email => {
          rolesJson[email] = memberRoles[email] || 'Member';
        });
        params.append('memberRolesJson', JSON.stringify(rolesJson));
      }

      await api.post(`/committees?${params}`);
      setMessage({ text: 'Committee created successfully', type: 'success' });
      setNewCommittee({ name: '', description: '', selectedMembers: [] });
      setMemberRoles({});
      setShowCreateModal(false);
      fetchCommittees();
    } catch (err) {
      console.error('Error creating committee:', err);
      setMessage({ text: err.response?.data?.error || 'Failed to create committee', type: 'error' });
    }
  };

  const handleViewCommittee = async (committee) => {
    setSelectedCommittee(committee);
    setShowDetailsModal(true);
    try {
      const response = await api.get(`/committees/${committee.id}/documents`);
      setDocuments(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching committee documents:', err);
      setDocuments([]);
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

  const handleDeleteCommittee = async (id) => {
    if (window.confirm('Are you sure you want to delete this committee?')) {
      try {
        await api.delete(`/committees/${id}`);
        setMessage({ text: 'Committee deleted successfully', type: 'success' });
        fetchCommittees();
      } catch (err) {
        setMessage({ text: 'Failed to delete committee', type: 'error' });
      }
    }
  };

  const handleAddMember = async (committeeId, teacherEmail) => {
    try {
      const role = memberRoles[`${committeeId}-${teacherEmail}`] || 'Member';
      const powers = memberPowers[`${committeeId}-${teacherEmail}`] || [];

      const response = await api.post(`/committees/${committeeId}/members`, null, {
        params: {
          teacherEmail,
          role,
          powers: powers.length > 0 ? powers.join(',') : undefined
        }
      });

      setMessage({ text: 'Member added successfully', type: 'success' });
      setSelectedCommittee({
        ...selectedCommittee,
        members: [...selectedCommittee.members, response.data]
      });
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Failed to add member', type: 'error' });
    }
  };

  const handleRemoveMember = async (committeeId, teacherEmail) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      try {
        await api.delete(`/committees/${committeeId}/members/${teacherEmail}`);
        setMessage({ text: 'Member removed successfully', type: 'success' });
        setSelectedCommittee({
          ...selectedCommittee,
          members: selectedCommittee.members.filter(m => m.teacherEmail !== teacherEmail)
        });
      } catch (err) {
        setMessage({ text: 'Failed to remove member', type: 'error' });
      }
    }
  };

  const handleUpdateMemberRole = async (committeeId, teacherEmail, newRole) => {
    try {
      await api.put(`/committees/${committeeId}/members/${teacherEmail}/role`, null, {
        params: { newRole }
      });
      setMessage({ text: 'Member role updated', type: 'success' });
      setSelectedCommittee({
        ...selectedCommittee,
        members: selectedCommittee.members.map(m =>
          m.teacherEmail === teacherEmail ? { ...m, role: newRole } : m
        )
      });
    } catch (err) {
      setMessage({ text: 'Failed to update member role', type: 'error' });
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>🏛️ Committee Management</h1>
        <button
          onClick={() => setShowCreateModal(true)}
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
          ➕ Create New Committee
        </button>
      </div>

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

      {/* Committees Grid */}
      {loading ? (
        <p>Loading committees...</p>
      ) : committees.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666' }}>No committees yet. Create your first committee!</p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {committees.map(committee => (
            <div
              key={committee.id}
              style={{
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <h3 style={{ marginTop: 0, color: '#2c3e50' }}>{committee.name}</h3>
              <p style={{ color: '#666', fontSize: '13px', marginBottom: '10px', minHeight: '40px' }}>
                {committee.description || 'No description provided'}
              </p>
              <div style={{
                fontSize: '12px',
                color: '#999',
                marginBottom: '15px'
              }}>
                <div>👥 Members: {committee.memberCount || 0}</div>
                <div>📅 Created: {new Date(committee.createdAt).toLocaleDateString()}</div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleViewCommittee(committee)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    backgroundColor: '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  View Details
                </button>
                <button
                  onClick={() => handleDeleteCommittee(committee.id)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
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
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>Create New Committee</h2>
              <button
                onClick={() => setShowCreateModal(false)}
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

            <form onSubmit={handleCreateCommittee}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Committee Name *</label>
                <input
                  type="text"
                  value={newCommittee.name}
                  onChange={(e) => setNewCommittee({ ...newCommittee, name: e.target.value })}
                  placeholder="e.g., Academic Committee"
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
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Description</label>
                <textarea
                  value={newCommittee.description}
                  onChange={(e) => setNewCommittee({ ...newCommittee, description: e.target.value })}
                  placeholder="Describe the purpose of this committee"
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

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>Add Members</label>
                <div style={{
                  backgroundColor: '#f9f9f9',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '10px',
                  maxHeight: '350px',
                  overflowY: 'auto'
                }}>
                  {teachers.length === 0 ? (
                    <p style={{ color: '#999', textAlign: 'center' }}>No teachers available</p>
                  ) : (
                    teachers.map(teacher => (
                      <div key={teacher.id} style={{ marginBottom: '12px', padding: '8px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #e0e0e0' }}>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: '6px' }}>
                          <input
                            type="checkbox"
                            checked={newCommittee.selectedMembers.includes(teacher.email)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewCommittee({
                                  ...newCommittee,
                                  selectedMembers: [...newCommittee.selectedMembers, teacher.email]
                                });
                                setMemberRoles({ ...memberRoles, [teacher.email]: 'Member' });
                              } else {
                                setNewCommittee({
                                  ...newCommittee,
                                  selectedMembers: newCommittee.selectedMembers.filter(e => e !== teacher.email)
                                });
                                const newRoles = { ...memberRoles };
                                delete newRoles[teacher.email];
                                setMemberRoles(newRoles);
                              }
                            }}
                          />
                          <span style={{ marginLeft: '8px', fontWeight: '600', fontSize: '14px' }}>{teacher.fullName || 'Unknown'}</span>
                        </label>
                        <div style={{ fontSize: '12px', color: '#666', marginLeft: '24px', marginBottom: '6px' }}>{teacher.email}</div>
                        
                        {newCommittee.selectedMembers.includes(teacher.email) && (
                          <div style={{ marginLeft: '24px', marginTop: '6px' }}>
                            <div style={{ fontSize: '11px', marginBottom: '4px', fontWeight: '600' }}>Role:</div>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <select
                                value={memberRoles[teacher.email] || 'Member'}
                                onChange={(e) => setMemberRoles({ ...memberRoles, [teacher.email]: e.target.value })}
                                style={{
                                  flex: 1,
                                  padding: '6px',
                                  fontSize: '12px',
                                  border: '1px solid #ddd',
                                  borderRadius: '3px'
                                }}
                              >
                                {customRoles.map(role => (
                                  <option key={role} value={role}>{role}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
                
                <div style={{ marginTop: '10px' }}>
                  {!showNewRoleInput ? (
                    <button
                      type="button"
                      onClick={() => setShowNewRoleInput(true)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#ff9800',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      + New Role
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <input
                        type="text"
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        placeholder="Enter role name"
                        style={{
                          flex: 1,
                          padding: '6px',
                          border: '1px solid #ddd',
                          borderRadius: '3px',
                          fontSize: '12px'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newRole.trim() && !customRoles.includes(newRole)) {
                            setCustomRoles([...customRoles, newRole]);
                            setNewRole('');
                            setShowNewRoleInput(false);
                          }
                        }}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#4caf50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewRoleInput(false);
                          setNewRole('');
                        }}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#2196f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  ✓ Create Committee
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
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

      {/* Committee Details Modal */}
      {showDetailsModal && selectedCommittee && (
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
          zIndex: 1001
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '30px',
            maxWidth: '700px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>{selectedCommittee.name}</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
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

            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
              <strong>Description:</strong>
              <p style={{ margin: '5px 0 0 0' }}>{selectedCommittee.description || 'No description'}</p>
            </div>

            <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>👥 Members</h3>
            <div style={{
              backgroundColor: '#f9f9f9',
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '15px'
            }}>
              {selectedCommittee.members && selectedCommittee.members.length > 0 ? (
                selectedCommittee.members.map(member => (
                  <div key={member.id} style={{
                    padding: '12px',
                    marginBottom: '10px',
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <strong style={{ fontSize: '14px' }}>{member.teacherName || 'Unknown'}</strong>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>{member.teacherEmail}</div>
                        <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                          Role: <strong>{member.role}</strong>
                        </div>
                        {member.powers && member.powers.length > 0 && (
                          <div style={{ fontSize: '11px', marginTop: '5px', flexWrap: 'wrap' }}>
                            Powers: {member.powers.join(', ')}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '5px', marginLeft: '10px' }}>
                        <button
                          onClick={() => {
                            setEditingMember(member);
                            setEditingRole(member.role);
                            setEditingPowers(member.powers || []);
                          }}
                          style={{
                            padding: '5px 10px',
                            backgroundColor: '#2196f3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: 'bold'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleRemoveMember(selectedCommittee.id, member.teacherEmail)}
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
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: '#666', textAlign: 'center' }}>No members yet</p>
              )}
            </div>

            <div style={{ marginTop: '25px' }}>
              <h3 style={{ marginBottom: '12px' }}>📄 Committee Documents</h3>
              <div style={{
                backgroundColor: '#f9f9f9',
                border: '1px solid #ddd',
                borderRadius: '6px',
                padding: '15px'
              }}>
                {documents.length > 0 ? (
                  documents.map(doc => (
                    <div key={doc.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      marginBottom: '10px',
                      backgroundColor: 'white',
                      border: '1px solid #eee',
                      borderRadius: '6px'
                    }}>
                      <div>
                        <div style={{ fontWeight: '700', color: '#333' }}>{doc.documentName}</div>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                          Uploaded by: {doc.uploadedByName || 'Unknown'} • {new Date(doc.uploadedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownloadDocument(doc.id, doc.documentName)}
                        style={{
                          padding: '8px 14px',
                          backgroundColor: '#2196f3',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        Download
                      </button>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#666', margin: 0 }}>No documents uploaded for this committee yet.</p>
                )}
              </div>
            </div>

            <div style={{ marginTop: '15px', textAlign: 'left' }}>
              <button
                onClick={() => {
                  setShowAddMemberModal(true);
                  setAddingMemberEmail('');
                  setAddingMemberRole('Member');
                }}
                style={{
                  padding: '10px 15px',
                  backgroundColor: '#2196f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                + Add Member
              </button>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button
                onClick={() => setShowDetailsModal(false)}
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
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
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
          zIndex: 1002
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}>
            <h2 style={{ marginTop: 0 }}>Edit Member: {editingMember.teacherName}</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Role</label>
              <select
                value={editingRole}
                onChange={(e) => setEditingRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                {customRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Powers</label>
              <div style={{
                backgroundColor: '#f9f9f9',
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '10px',
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {availablePowers.map(power => (
                  <label key={power.id} style={{ display: 'block', marginBottom: '6px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={editingPowers.includes(power.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditingPowers([...editingPowers, power.id]);
                        } else {
                          setEditingPowers(editingPowers.filter(p => p !== power.id));
                        }
                      }}
                    />
                    <span style={{ marginLeft: '6px', fontSize: '13px' }}>{power.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={async () => {
                  try {
                    // Update role
                    await api.put(`/committees/${selectedCommittee.id}/members/${editingMember.teacherEmail}/role`, null, {
                      params: { newRole: editingRole }
                    });
                    
                    // Update powers
                    if (editingPowers.length > 0) {
                      await api.put(`/committees/${selectedCommittee.id}/members/${editingMember.teacherEmail}/powers`, editingPowers);
                    }
                    
                    setMessage({ text: 'Member updated successfully', type: 'success' });
                    setEditingMember(null);
                    setSelectedCommittee({
                      ...selectedCommittee,
                      members: selectedCommittee.members.map(m =>
                        m.id === editingMember.id ? { ...m, role: editingRole, powers: editingPowers } : m
                      )
                    });
                  } catch (err) {
                    setMessage({ text: 'Failed to update member', type: 'error' });
                  }
                }}
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
                Save Changes
              </button>
              <button
                onClick={() => setEditingMember(null)}
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
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && selectedCommittee && (
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
          zIndex: 1002
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}>
            <h2 style={{ marginTop: 0 }}>Add New Member</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Select Teacher</label>
              <select
                value={addingMemberEmail}
                onChange={(e) => setAddingMemberEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="">-- Choose a teacher --</option>
                {teachers
                  .filter(t => !selectedCommittee.members.some(m => m.teacherEmail === t.email))
                  .map(teacher => (
                    <option key={teacher.id} value={teacher.email}>
                      {teacher.fullName} ({teacher.email})
                    </option>
                  ))
                }
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Role</label>
              <select
                value={addingMemberRole}
                onChange={(e) => setAddingMemberRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                {customRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={async () => {
                  if (!addingMemberEmail) {
                    setMessage({ text: 'Please select a teacher', type: 'warning' });
                    return;
                  }
                  try {
                    const response = await api.post(
                      `/committees/${selectedCommittee.id}/members`,
                      {},
                      {
                        params: {
                          teacherEmail: addingMemberEmail,
                          role: addingMemberRole
                        }
                      }
                    );
                    setMessage({ text: 'Member added successfully', type: 'success' });
                    setShowAddMemberModal(false);
                    setAddingMemberEmail('');
                    setAddingMemberRole('Member');
                    // Refresh committee details
                    const updatedCommittee = {
                      ...selectedCommittee,
                      members: [...selectedCommittee.members, response.data]
                    };
                    setSelectedCommittee(updatedCommittee);
                  } catch (err) {
                    console.error('Error adding member:', err);
                    setMessage({ text: 'Failed to add member', type: 'error' });
                  }
                }}
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
                Add Member
              </button>
              <button
                onClick={() => {
                  setShowAddMemberModal(false);
                  setAddingMemberEmail('');
                  setAddingMemberRole('Member');
                }}
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
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCommittee;
