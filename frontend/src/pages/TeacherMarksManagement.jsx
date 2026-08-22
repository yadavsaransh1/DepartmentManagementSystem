import React, { useState, useEffect } from 'react';
import api from '../services/api';
import AddMarksModal from '../components/AddMarksModal';
import '../styles/marks-management.css';

const TeacherMarksManagement = () => {
  const [programs, setPrograms] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [allTeacherSubjects, setAllTeacherSubjects] = useState([]);
  const [allMarks, setAllMarks] = useState([]);
  
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMark, setEditingMark] = useState(null);
  const [editFormData, setEditFormData] = useState({
    obtainedMarks: '',
    totalMarks: '',
    grade: '',
    examType: '',
    comments: ''
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    console.log('[TeacherMarksManagement] Component mounted. User:', user);
    fetchTeacherSubjects();
    fetchAllMarks();
  }, []);

  useEffect(() => {
    if (selectedProgram) {
      const filtered = allTeacherSubjects.filter(s => s.course === selectedProgram);
      setFilteredSubjects(filtered);
    } else {
      setFilteredSubjects([]);
    }
  }, [selectedProgram, allTeacherSubjects]);

  const fetchTeacherSubjects = async () => {
    try {
      console.log('[TeacherMarksManagement] User object:', user);
      const teacherIdentifier = user.id || user.email;
      console.log('[TeacherMarksManagement] Teacher identifier:', teacherIdentifier);
      const response = await api.get(`/subjects/teacher/${teacherIdentifier}`);
      console.log('[TeacherMarksManagement] Teacher subjects response:', response.data);
      const teacherSubjects = Array.isArray(response.data) ? response.data : [];
      setAllTeacherSubjects(teacherSubjects);
      
      // Extract unique courses/programs from teacher's subjects
      const uniquePrograms = [...new Set(teacherSubjects.map(s => s.course).filter(Boolean))];
      console.log('[TeacherMarksManagement] Unique programs:', uniquePrograms);
      setPrograms(uniquePrograms.sort());
    } catch (error) {
      console.error('Error fetching teacher subjects:', error);
    }
  };

  const fetchAllMarks = async () => {
    try {
      setLoading(true);
      // Use email if available, which is more reliable
      const teacherIdentifier = user.email || user.id;
      console.log('[TeacherMarksManagement] Fetching marks for teacher identifier:', teacherIdentifier);
      const response = await api.get(`/marks/teacher/${teacherIdentifier}`);
      console.log('[TeacherMarksManagement] Marks response:', response.data);
      const marksData = Array.isArray(response.data) ? response.data : [];
      
      // Sort marks by createdAt in descending order (newest first)
      marksData.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;  // DESC order
      });
      
      setAllMarks(marksData);
      console.log('[TeacherMarksManagement] State updated with marks (sorted by date):', marksData);
    } catch (error) {
      console.error('Error fetching marks:', error);
      setAllMarks([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteMark = async (markId) => {
    if (!window.confirm('Are you sure you want to delete this mark? This action cannot be undone.')) {
      return;
    }
    try {
      await api.delete(`/marks/${markId}`);
      alert('Mark deleted successfully!');
      fetchAllMarks();  // Refresh the list
    } catch (error) {
      console.error('Error deleting mark:', error);
      alert('Failed to delete mark: ' + (error.response?.data?.message || error.message));
    }
  };

  const openEditModal = (mark) => {
    console.log('[TeacherMarksManagement] Opening edit modal for mark:', mark);
    setEditingMark(mark);
    setEditFormData({
      obtainedMarks: mark.marks !== undefined ? mark.marks : mark.obtainedMarks || '',
      totalMarks: mark.totalMarks || '',
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
      const payload = {
        obtainedMarks: editFormData.obtainedMarks ? parseFloat(editFormData.obtainedMarks) : null,
        grade: editFormData.grade || null,
        examType: editFormData.examType || null,
        comments: editFormData.comments || null
      };
      console.log('[TeacherMarksManagement] Updating mark', editingMark.id, 'with:', payload);
      await api.put(`/marks/${editingMark.id}`, payload);
      setMessage('Mark updated successfully');
      setShowEditModal(false);
      fetchAllMarks();
    } catch (error) {
      setMessage('Error updating mark: ' + (error.response?.data?.message || error.message));
      console.error('[TeacherMarksManagement] Update failed:', error);
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

  const getFilteredMarks = () => {
    let filtered = allMarks;

    if (selectedProgram) {
      filtered = filtered.filter(m => m.studentId && m.studentId !== '');
    }
    if (selectedSubject) {
      filtered = filtered.filter(m => m.courseId == selectedSubject || m.subjectId == selectedSubject);
    }
    if (selectedExamType) {
      filtered = filtered.filter(m => 
        m.examType && m.examType.toLowerCase().includes(selectedExamType.toLowerCase())
      );
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

  const filteredMarks = getFilteredMarks();

  return (
    <div className="marks-management-container">
      <div className="marks-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>👨‍🏫 Teacher Marks Management</h2>
            <p>View marks you have entered for all students</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
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
          type="TEACHER"
        />
      )}

      {/* Edit Marks Modal */}
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
              Student: <strong>{editingMark.student?.fullName || editingMark.studentName || 'N/A'}</strong>
            </p>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Obtained Marks:</label>
              <input
                type="number"
                value={editFormData.obtainedMarks}
                onChange={(e) => setEditFormData({ ...editFormData, obtainedMarks: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Total Marks:</label>
              <input
                type="number"
                value={editFormData.totalMarks}
                onChange={(e) => setEditFormData({ ...editFormData, totalMarks: e.target.value })}
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
              setSelectedSubject('');
            }}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="">All Programs</option>
            {programs.map(prog => <option key={prog}>{prog}</option>)}
          </select>
        </div>

        <div>
          <label style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>Subject</label>
          <select 
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            disabled={!selectedProgram}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="">All Subjects</option>
            {filteredSubjects.map(subj => <option key={subj.id} value={subj.id}>{subj.subjectName}</option>)}
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

      {/* Marks Display */}
      <div style={{
        background: 'white',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
          <h3 style={{ margin: 0 }}>📝 {filteredMarks.length} Marks Entered</h3>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
            Loading marks...
          </div>
        ) : filteredMarks.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '14px'
            }}>
              <thead>
                <tr style={{ background: '#1a58d2', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Student</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Program</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Subject</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>Exam Type</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>Total</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>Obtained</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>Percentage</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>Grade</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>Comments</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMarks.map((mark, idx) => {
                  const percentage = mark.totalMarks ? ((mark.marks / mark.totalMarks) * 100).toFixed(1) : 0;
                  const createdDate = mark.createdAt ? new Date(mark.createdAt).toLocaleDateString() : 'N/A';
                  return (
                    <tr key={mark.id || idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px' }}>
                        <strong>{mark.student?.fullName || mark.studentName || 'N/A'}</strong><br/>
                        <span style={{ fontSize: '12px', color: '#666' }}>Date: {createdDate}</span>
                      </td>
                      <td style={{ padding: '12px' }}>{mark.course?.program?.programName || mark.program || 'BCA'}</td>
                      <td style={{ padding: '12px' }}>{mark.course?.subjectName || mark.courseName || 'N/A'}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>{mark.examTypeDescription || mark.examType || 'N/A'}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>{mark.totalMarks || 0}</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#3b82f6' }}>{mark.marks || 0}</td>
                      <td style={{ padding: '12px', textAlign: 'center', color: percentage >= 40 ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                        {percentage}%
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>{mark.grade || 'N/A'}</td>
                      <td style={{ padding: '12px', fontSize: '10px', color: '#666', wordBreak: 'break-word' }}>
                        {mark.comments || '-'}
                      </td>
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
                          onMouseOver={(e) => e.target.style.background = '#2563eb'}
                          onMouseOut={(e) => e.target.style.background = '#3b82f6'}
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
                          onMouseOver={(e) => e.target.style.background = '#dc2626'}
                          onMouseOut={(e) => e.target.style.background = '#ef4444'}
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
            No marks entered yet. Create marks using the + Add Marks button.
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherMarksManagement;
