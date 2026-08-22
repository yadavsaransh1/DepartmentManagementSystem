import React, { useState, useEffect } from 'react';
import api from '../services/api';
import AddMarksModal from '../components/AddMarksModal';
import '../styles/marks-management.css';

const AdminMarksManagement = () => {
  // State for marks data
  const [adminMarks, setAdminMarks] = useState([]);
  const [teacherMarks, setTeacherMarks] = useState([]);
  
  // State for filtering
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [subjects, setSubjects] = useState([]);
  
  // State for UI
  const [activeTab, setActiveTab] = useState('admin'); // 'admin' or 'teacher'
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('ADMIN');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [programs, setPrograms] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [editingMark, setEditingMark] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    obtainedMarks: '',
    totalMarks: '',
    grade: '',
    examType: '',
    comments: ''
  });

  useEffect(() => {
    fetchPrograms();
    fetchSubjects();
    fetchAllMarks();
  }, []);

  useEffect(() => {
    if (selectedProgram) {
      fetchSemestersForProgram(selectedProgram);
    } else {
      setSemesters([]);
    }
  }, [selectedProgram]);

  const fetchPrograms = async () => {
    try {
      const response = await api.get('/subjects/unique-programs');
      setPrograms(response.data || []);
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  const fetchSemestersForProgram = async (program) => {
    try {
      const response = await api.get(`/subjects/semesters-by-program/${program}`);
      const semesterList = Array.isArray(response.data) ? response.data : [];
      setSemesters(semesterList.sort((a, b) => parseInt(a) - parseInt(b)));
    } catch (error) {
      console.error('Error fetching semesters:', error);
      setSemesters([]);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/subjects');
      const subjectsList = Array.isArray(response.data) ? response.data : [];
      setSubjects(subjectsList);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setSubjects([]);
    }
  };

  const fetchAllMarks = async () => {
    try {
      setLoading(true);
      
      // Fetch admin-added marks
      const adminResponse = await api.get('/marks/admin');
      const adminMarksData = Array.isArray(adminResponse.data) ? adminResponse.data : [];
      
      // Fetch teacher-added marks
      const teacherResponse = await api.get('/marks/admin/teacher-added');
      const teacherMarksData = Array.isArray(teacherResponse.data) ? teacherResponse.data : [];
      
      // Sort by createdAt DESC (most recent first)
      const sortByRecent = (marks) => {
        return marks.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
      };
      
      setAdminMarks(sortByRecent(adminMarksData));
      setTeacherMarks(sortByRecent(teacherMarksData));
      
      console.log(`Loaded: ${adminMarksData.length} admin marks, ${teacherMarksData.length} teacher marks`);
    } catch (error) {
      console.error('Error fetching marks:', error);
      setAdminMarks([]);
      setTeacherMarks([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteMark = async (markId) => {
    if (!window.confirm('Are you sure you want to delete this mark?')) return;
    try {
      await api.delete(`/marks/${markId}`);
      setMessage('Mark deleted successfully');
      setTimeout(() => setMessage(''), 3000);
      fetchAllMarks();
    } catch (error) {
      setMessage('Error deleting mark: ' + (error.response?.data?.message || error.message));
    }
  };

  const openEditModal = (mark) => {
    setEditingMark(mark);
    setEditFormData({
      obtainedMarks: mark.marks !== undefined && mark.marks !== null ? String(mark.marks) : '',
      totalMarks: mark.totalMarks !== undefined && mark.totalMarks !== null ? String(mark.totalMarks) : '',
      grade: mark.grade || '',
      examType: mark.examTypeDescription || mark.examType || '',
      comments: mark.comments || ''
    });
    setShowEditModal(true);
  };

  const updateMark = async () => {
    if (!editingMark) return;
    try {
      setLoading(true);
      
      // Validate required fields
      if (!editFormData.obtainedMarks && !editFormData.totalMarks) {
        setMessage('Please enter at least obtained marks or total marks');
        setLoading(false);
        return;
      }
      
      const payload = {
        obtainedMarks: editFormData.obtainedMarks && editFormData.obtainedMarks !== '' ? parseFloat(editFormData.obtainedMarks) : null,
        totalMarks: editFormData.totalMarks && editFormData.totalMarks !== '' ? parseInt(editFormData.totalMarks) : null,
        grade: editFormData.grade && editFormData.grade !== '' ? editFormData.grade : null,
        examType: editFormData.examType && editFormData.examType !== '' ? editFormData.examType : null,
        comments: editFormData.comments && editFormData.comments !== '' ? editFormData.comments : null
      };
      
      console.log('Sending update payload:', payload);
      await api.put(`/marks/${editingMark.id}`, payload);
      setMessage('Mark updated successfully');
      setShowEditModal(false);
      setEditingMark(null);
      setEditFormData({
        obtainedMarks: '',
        totalMarks: '',
        grade: '',
        examType: '',
        comments: ''
      });
      // Refresh the data
      await fetchAllMarks();
    } catch (error) {
      console.error('Update error:', error);
      setMessage('Error updating mark: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setShowEditModal(false);
    setEditingMark(null);
    setEditFormData({
      obtainedMarks: '',
      totalMarks: '',
      grade: '',
      examType: '',
      comments: ''
    });
  };

  const filterMarks = (marks) => {
    let filtered = marks;

    if (selectedProgram) {
      filtered = filtered.filter(m => m.studentProgram === selectedProgram);
    }
    if (selectedSemester) {
      filtered = filtered.filter(m => m.studentSemester === parseInt(selectedSemester));
    }
    if (selectedSubject) {
      filtered = filtered.filter(m => m.courseName && m.courseName.toLowerCase().includes(selectedSubject.toLowerCase()));
    }
    if (selectedExamType) {
      filtered = filtered.filter(m => {
        const examTypeToCheck = (m.examTypeDescription || m.examType || '').toLowerCase();
        return examTypeToCheck.includes(selectedExamType.toLowerCase());
      });
    }
    if (dateFrom) {
      filtered = filtered.filter(m => {
        if (!m.createdAt) return true;
        return new Date(m.createdAt) >= new Date(dateFrom);
      });
    }
    if (dateTo) {
      filtered = filtered.filter(m => {
        if (!m.createdAt) return true;
        return new Date(m.createdAt) <= new Date(dateTo);
      });
    }

    return filtered;
  };

  const filteredAdminMarks = filterMarks(adminMarks);
  const filteredTeacherMarks = filterMarks(teacherMarks);

  const MarksTable = ({ marks, title, type }) => (
    <div style={{
      background: 'white',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      overflow: 'hidden',
      marginBottom: '30px'
    }}>
      <div style={{ 
        padding: '20px', 
        borderBottom: '1px solid #e5e7eb', 
        background: type === 'ADMIN' ? '#f0f7ff' : '#fdf9f0'
      }}>
        <h3 style={{ margin: 0 }}>{title}: {marks.length} Marks</h3>
      </div>

      {marks.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table className='marks-table' style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px'
          }}>
            <thead>
              <tr style={{ background: '#1b4aa6', color: 'white', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Student</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>Program</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>Sem</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Subject</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>Exam Type</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>Total</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>Obtained</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>%</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>Grade</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>Date</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {marks.map((mark, idx) => {
                const percentage = mark.totalMarks ? ((mark.marks / mark.totalMarks) * 100).toFixed(1) : 0;
                const createdDate = mark.createdAt ? new Date(mark.createdAt).toLocaleDateString() : 'N/A';
                return (
                  <tr key={mark.id || idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px' }}>
                      <strong>{mark.studentName || 'N/A'}</strong>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: '#666' }}>
                      {mark.studentProgram || 'N/A'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: '#666' }}>
                      {mark.studentSemester || 'N/A'}
                    </td>
                    <td style={{ padding: '12px' }}>{mark.courseName || 'N/A'}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>{mark.examTypeDescription || mark.examType || 'N/A'}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>{mark.totalMarks || 0}</td>
                    <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#3b82f6' }}>{mark.marks || 0}</td>
                    <td style={{ padding: '12px', textAlign: 'center', color: percentage >= 40 ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                      {percentage}%
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>{mark.grade || 'N/A'}</td>
                    <td style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: '#666' }}>{createdDate}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => openEditModal(mark)}
                        style={{
                          padding: '6px 12px',
                          background: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          marginRight: '5px'
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => deleteMark(mark.id)}
                        style={{
                          padding: '6px 12px',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
          No marks found for this filter.
        </div>
      )}
    </div>
  );

  return (
    <div className="marks-management-container">
      <div className="marks-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>📊 Admin Marks Management</h2>
            <p>Manage all marks across the university</p>
          </div>
          <button 
            onClick={() => {
              setModalType(activeTab === 'admin' ? 'ADMIN' : 'TEACHER');
              setShowModal(true);
            }}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            + Add Marks
          </button>
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}

      {showModal && (
        <AddMarksModal 
          onClose={() => setShowModal(false)} 
          onMarksAdded={() => {
            setShowModal(false);
            setMessage('Marks added successfully!');
            setTimeout(() => setMessage(''), 3000);
            fetchAllMarks();
          }} 
          type={modalType}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && editingMark && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ marginTop: 0 }}>✏️ Edit Mark</h3>
            <p style={{ color: '#666', fontSize: '14px' }}>
              Student: <strong>{editingMark.studentName || 'N/A'}</strong>
            </p>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Obtained Marks:</label>
              <input
                type="number"
                step="0.01"
                value={editFormData.obtainedMarks}
                onChange={(e) => setEditFormData({ ...editFormData, obtainedMarks: e.target.value })}
                onBlur={(e) => {
                  // Validate and clean up on blur
                  const val = e.target.value;
                  if (val === '' || isNaN(parseFloat(val))) {
                    setEditFormData({ ...editFormData, obtainedMarks: '' });
                  }
                }}
                placeholder="e.g., 45.5"
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Total Marks:</label>
              <input
                type="number"
                step="1"
                value={editFormData.totalMarks}
                onChange={(e) => setEditFormData({ ...editFormData, totalMarks: e.target.value })}
                onBlur={(e) => {
                  // Validate and clean up on blur
                  const val = e.target.value;
                  if (val === '' || isNaN(parseInt(val))) {
                    setEditFormData({ ...editFormData, totalMarks: '' });
                  }
                }}
                placeholder="e.g., 100"
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Grade:</label>
              <input
                type="text"
                value={editFormData.grade}
                onChange={(e) => setEditFormData({ ...editFormData, grade: e.target.value })}
                placeholder="e.g., A, B+, C"
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Exam Type:</label>
              <input
                type="text"
                value={editFormData.examType}
                onChange={(e) => setEditFormData({ ...editFormData, examType: e.target.value })}
                placeholder="e.g., Sessional-1, Final"
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Comments:</label>
              <textarea
                value={editFormData.comments}
                onChange={(e) => setEditFormData({ ...editFormData, comments: e.target.value })}
                placeholder="Additional comments..."
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box', height: '80px', fontFamily: 'Arial, sans-serif' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={cancelEdit}
                style={{
                  padding: '10px 20px',
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Cancel
              </button>
              <button
                onClick={updateMark}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  background: loading ? '#b0b0b0' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {loading ? 'Updating...' : 'Update Mark'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{
        background: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '15px'
      }}>
        <div>
          <label style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>Program</label>
          <select 
            value={selectedProgram}
            onChange={(e) => {
              setSelectedProgram(e.target.value);
              setSelectedSemester('');
            }}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="">All Programs</option>
            {programs.map(prog => <option key={prog}>{prog}</option>)}
          </select>
        </div>

        <div>
          <label style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>Semester</label>
          <select 
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            disabled={!selectedProgram}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="">All Semesters</option>
            {semesters.map(sem => <option key={sem}>{sem}</option>)}
          </select>
        </div>

        <div>
          <label style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>Exam Type</label>
          <input 
            type="text"
            value={selectedExamType}
            onChange={(e) => setSelectedExamType(e.target.value)}
            placeholder="Filter by type..."
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>From Date</label>
          <input 
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>To Date</label>
          <input 
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
          Loading marks...
        </div>
      ) : (
        <>
          {/* Tab Navigation */}
          <div style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '20px',
            borderBottom: '2px solid #e5e7eb'
          }}>
            <button
              onClick={() => setActiveTab('admin')}
              style={{
                padding: '12px 24px',
                background: activeTab === 'admin' ? '#3b82f6' : 'transparent',
                color: activeTab === 'admin' ? 'white' : '#666',
                border: 'none',
                borderBottom: activeTab === 'admin' ? '3px solid #1f2937' : 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '16px',
                transition: 'all 0.3s ease'
              }}
            >
              📋 Admin Marks ({adminMarks.length})
            </button>
            <button
              onClick={() => setActiveTab('teacher')}
              style={{
                padding: '12px 24px',
                background: activeTab === 'teacher' ? '#3b82f6' : 'transparent',
                color: activeTab === 'teacher' ? 'white' : '#666',
                border: 'none',
                borderBottom: activeTab === 'teacher' ? '3px solid #1f2937' : 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '16px',
                transition: 'all 0.3s ease'
              }}
            >
              👨‍🏫 Teacher Marks ({teacherMarks.length})
            </button>
          </div>

          {/* Admin Marks Tab Content */}
          {activeTab === 'admin' && (
            <div>
              <MarksTable 
                marks={filteredAdminMarks} 
                title="Marks Added by Admin"
                type="ADMIN"
              />
              {filteredAdminMarks.length === 0 && (
                <div style={{
                  background: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  padding: '40px',
                  textAlign: 'center',
                  color: '#999'
                }}>
                  No admin marks found. Try adjusting filters or add new marks.
                </div>
              )}
            </div>
          )}

          {/* Teacher Marks Tab Content */}
          {activeTab === 'teacher' && (
            <div>
              <MarksTable 
                marks={filteredTeacherMarks} 
                title="Marks Added by Teachers"
                type="TEACHER"
              />
              {filteredTeacherMarks.length === 0 && (
                <div style={{
                  background: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  padding: '40px',
                  textAlign: 'center',
                  color: '#999'
                }}>
                  No teacher marks found. Try adjusting filters or add new marks.
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminMarksManagement;
