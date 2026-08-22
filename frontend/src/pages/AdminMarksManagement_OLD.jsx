import React, { useState, useEffect } from 'react';
import api from '../services/api';
import AddMarksModal from '../components/AddMarksModal';
import '../styles/marks-management.css';

const AdminMarksManagement = () => {
  const [programs, setPrograms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [allMarks, setAllMarks] = useState([]);
  
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPrograms();
    fetchAllMarks();
  }, []);

  useEffect(() => {
    if (selectedProgram) {
      fetchSubjectsForProgram(selectedProgram);
    } else {
      setSubjects([]);
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

  const fetchSubjectsForProgram = async (program) => {
    try {
      const response = await api.get(`/subjects/program/${program}/semester/1`);
      const uniqueSubjects = [...new Set(response.data.map(s => ({ id: s.id, name: s.subjectName })))];
      setSubjects(uniqueSubjects || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchAllMarks = async () => {
    try {
      setLoading(true);
      // Fetch admin marks
      const response = await api.get('/marks/admin');
      const marksData = Array.isArray(response.data) ? response.data : [];
      setAllMarks(marksData);
    } catch (error) {
      console.error('Error fetching marks:', error);
      setAllMarks([]);
    } finally {
      setLoading(false);
    }
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

  const filteredMarks = getFilteredMarks();

  return (
    <div className="marks-management-container">
      <div className="marks-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>📊 Admin Marks Management</h2>
            <p>View all student marks across programs</p>
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
          type="ADMIN"
        />
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
            {subjects.map(subj => <option key={subj.id} value={subj.id}>{subj.name}</option>)}
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
          <h3 style={{ margin: 0 }}>📝 {filteredMarks.length} Marks Found</h3>
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
                <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Student</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Program</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Subject</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>Exam Type</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>Total</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>Obtained</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>Percentage</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>Grade</th>
                </tr>
              </thead>
              <tbody>
                {filteredMarks.map((mark, idx) => {
                  const percentage = mark.totalMarks ? ((mark.marks / mark.totalMarks) * 100).toFixed(1) : 0;
                  return (
                    <tr key={mark.id || idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px' }}>
                        <strong>{mark.studentName || 'N/A'}</strong><br/>
                        <span style={{ fontSize: '12px', color: '#666' }}>{mark.studentId || 'N/A'}</span>
                      </td>
                      <td style={{ padding: '12px' }}>BCA</td>
                      <td style={{ padding: '12px' }}>{mark.courseName || 'N/A'}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>{mark.examTypeDescription || mark.examType || 'N/A'}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>{mark.totalMarks || 0}</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#3b82f6' }}>{mark.marks || 0}</td>
                      <td style={{ padding: '12px', textAlign: 'center', color: percentage >= 40 ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                        {percentage}%
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>{mark.grade || 'N/A'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
            No marks found. Try adjusting filters or add new marks.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMarksManagement;
