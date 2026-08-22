import React, { useState, useEffect } from 'react';
import api from '../services/api';

export const BulkSemesterUpdate = () => {
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedProgramObj, setSelectedProgramObj] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [programsLoading, setProgramsLoading] = useState(true);
  const [alumniLoading, setAlumniLoading] = useState(false);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      setProgramsLoading(true);
      const response = await api.get('/programs');
      setPrograms(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching programs:', err);
      setError('Failed to load programs');
    } finally {
      setProgramsLoading(false);
    }
  };

  const handleProgramChange = async (programName) => {
    setSelectedProgram(programName);
    setSelectedSemester('');
    setStudents([]);
    setSelectedStudents({});

    if (!programName) {
      setSemesters([]);
      setSelectedProgramObj(null);
      return;
    }

    // Find the program object to get semester count
    const programObj = programs.find(p => p.name === programName);
    setSelectedProgramObj(programObj);

    try {
      const response = await api.get(`/attendance/program/${programName}/semesters`);
      const semesterArray = Array.isArray(response.data.semesters) ? response.data.semesters : [];
      setSemesters(semesterArray);
    } catch (err) {
      console.error('Error fetching semesters:', err);
      setError('Failed to load semesters');
    }
  };

  const handleSemesterChange = async (semester) => {
    setSelectedSemester(semester);
    setStudents([]);
    setSelectedStudents({});

    if (!selectedProgram || !semester) return;

    try {
      // Fetch students for the selected semester
      const studentResponse = await api.get(`/students/program/${selectedProgram}/semester/${semester}`);
      const studentList = Array.isArray(studentResponse.data) ? studentResponse.data : [];
      
      // Fetch alumni to filter them out (alumni stores numeric studentId)
      const alumniResponse = await api.get('/alumni');
      const alumniList = Array.isArray(alumniResponse.data) ? alumniResponse.data : [];
      const alumniStudentIds = new Set(alumniList.map(alum => parseInt(alum.studentId)));
      
      // Filter out students who are already alumni (compare numeric IDs)
      const filteredStudents = studentList.filter(student => !alumniStudentIds.has(student.id));
      
      setStudents(filteredStudents);
      
      // Select all students by default
      const selectedMap = {};
      studentList.forEach(student => {
        selectedMap[student.id] = true;
      });
      setSelectedStudents(selectedMap);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students');
    }
  };

  const handleStudentCheckboxChange = (studentId) => {
    setSelectedStudents(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const handleSelectAllStudents = () => {
    const allSelected = students.every(s => selectedStudents[s.id]);
    const newSelection = {};
    students.forEach(student => {
      newSelection[student.id] = !allSelected;
    });
    setSelectedStudents(newSelection);
  };

  const handleAddStudentToAlumni = async (student) => {
    try {
      setAlumniLoading(true);
      
      // Build customFields with full student ID and all details
      const customFields = JSON.stringify({
        fullStudentId: student.studentId,
        studentDetails: {
          name: student.name,
          email: student.email,
          enrollmentNumber: student.enrollmentNumber,
          department: student.department,
          contactNumber: student.contactNumber,
          address: student.address,
          gender: student.gender
        }
      });
      await api.post(`/alumni?studentId=${student.id}&program=${selectedProgram}&semester=${selectedSemester}&customFields=${encodeURIComponent(customFields)}`);

      // Remove from list immediately
      const updatedStudents = students.filter(s => s.id !== student.id);
      setStudents(updatedStudents);
      const newSelected = { ...selectedStudents };
      delete newSelected[student.id];
      setSelectedStudents(newSelected);

      setError('');
    } catch (err) {
      console.error('Error adding to alumni:', err);
      setError(`Failed to add Student - ${student.id} to alumni: ${err.response?.data?.message || err.message}`);
    } finally {
      setAlumniLoading(false);
    }
  };

  const handleBulkAddToAlumni = async () => {
    const selectedStudentIds = Object.entries(selectedStudents)
      .filter(([_, isSelected]) => isSelected)
      .map(([studentId, _]) => parseInt(studentId));

    if (selectedStudentIds.length === 0) {
      setError('Please select at least one student');
      return;
    }

    try {
      setAlumniLoading(true);
      setError('');

      // Add all selected students to alumni
      for (const studentId of selectedStudentIds) {
        const student = students.find(s => s.id === studentId);
        if (student) {
          const customFields = JSON.stringify({
            fullStudentId: student.studentId,
            studentDetails: {
              name: student.name,
              email: student.email,
              enrollmentNumber: student.enrollmentNumber,
              department: student.department,
              contactNumber: student.contactNumber,
              address: student.address,
              gender: student.gender
            }
          });
          await api.post(`/alumni?studentId=${student.id}&program=${selectedProgram}&semester=${selectedSemester}&customFields=${encodeURIComponent(customFields)}`);
        }
      }

      // Remove all selected students from list
      const remainingStudents = students.filter(s => !selectedStudentIds.includes(s.id));
      setStudents(remainingStudents);
      setSelectedStudents({});

      setError('');
    } catch (err) {
      console.error('Error bulk adding to alumni:', err);
      setError(`Failed to add students to alumni: ${err.response?.data?.message || err.message}`);
    } finally {
      setAlumniLoading(false);
    }
  };

  const handleBulkUpdateSemester = async () => {
    const selectedStudentIds = Object.entries(selectedStudents)
      .filter(([_, isSelected]) => isSelected)
      .map(([studentId, _]) => parseInt(studentId));

    if (selectedStudentIds.length === 0) {
      setError('Please select at least one student');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setResult(null);

      const response = await api.post('/students/bulk-update-semester', {
        studentIds: selectedStudentIds
      });

      if (response.data) {
        setResult(response.data);
        // Clear students after successful update
        if (response.data.success) {
          setStudents([]);
          setSelectedStudents({});
        }
      }
    } catch (err) {
      console.error('Error updating semesters:', err);
      setError('Failed to update semesters: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const selectedCount = Object.values(selectedStudents).filter(Boolean).length;

  const getNextSemester = () => {
    if (!selectedSemester) return null;
    return parseInt(selectedSemester) + 1;
  };

  const getMaxSemesterForProgram = () => {
    if (!selectedProgramObj) return 8; // Default max
    return selectedProgramObj.semesterCount || 8;
  };

  const isNextSemesterValid = () => {
    const nextSem = getNextSemester();
    const maxSem = getMaxSemesterForProgram();
    return nextSem !== null && nextSem <= maxSem;
  };

  const getIncrementButtonText = () => {
    const nextSem = getNextSemester();
    const maxSem = getMaxSemesterForProgram();
    
    if (!selectedSemester || !nextSem) {
      return 'Select Semester First';
    }
    
    if (nextSem > maxSem) {
      return `👨‍🎓 Add ${selectedCount} Student(s) to Alumni`;
    }
    
    return `🚀 Increment Selected ${selectedCount} Student(s) to Semester ${nextSem}`;
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>📚 Bulk Semester Update</h1>

      {error && (
        <div style={{
          padding: '12px',
          marginBottom: '15px',
          borderRadius: '4px',
          backgroundColor: '#fee',
          color: '#c33',
          border: '1px solid #fcc'
        }}>
          ❌ {error}
        </div>
      )}

      {result && (
        <div style={{
          padding: '15px',
          marginBottom: '15px',
          borderRadius: '4px',
          backgroundColor: result.success ? '#efe' : '#fee',
          color: result.success ? '#3c3' : '#c33',
          border: `1px solid ${result.success ? '#cfc' : '#fcc'}`
        }}>
          <div style={{ marginBottom: '10px', fontWeight: 'bold', fontSize: '16px' }}>
            {result.success ? '✅ Success!' : '❌ Failed!'}
          </div>
          <div style={{ marginBottom: '8px' }}>{result.message}</div>
          {result.updatedCount !== undefined && (
            <div style={{ fontSize: '13px', marginBottom: '5px' }}>
              <strong>Updated:</strong> {result.updatedCount}
            </div>
          )}
          {result.addedToAlumniCount !== undefined && (
            <div style={{ fontSize: '13px', marginBottom: '5px' }}>
              <strong>Added to Alumni:</strong> {result.addedToAlumniCount}
            </div>
          )}
          {result.failedCount !== undefined && (
            <div style={{ fontSize: '13px', marginBottom: '5px' }}>
              <strong>Failed:</strong> {result.failedCount}
            </div>
          )}
          {result.errors && result.errors.length > 0 && (
            <div style={{ marginTop: '10px', fontSize: '12px' }}>
              <strong>⚠️ Errors:</strong>
              <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                {result.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          <button
            onClick={() => {
              setResult(null);
              setError('');
            }}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      )}

      {!result && (
        <>
          {/* Program Selection */}
          <div style={{
            padding: '15px',
            marginBottom: '20px',
            backgroundColor: '#f0f7ff',
            border: '1px solid #6c9bcf',
            borderRadius: '4px'
          }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>
              Step 1: Select Program
            </label>
            <select
              value={selectedProgram}
              onChange={(e) => handleProgramChange(e.target.value)}
              disabled={programsLoading || loading || alumniLoading}
              style={{
                width: '100%',
                maxWidth: '300px',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: programsLoading ? 'not-allowed' : 'pointer'
              }}
            >
              <option value="">-- Select a Program --</option>
              {programs.map(prog => (
                <option key={prog.id} value={prog.name}>
                  {prog.name} ({prog.semesterCount} semesters)
                </option>
              ))}
            </select>
          </div>

          {/* Semester Selection */}
          {selectedProgram && (
            <div style={{
              padding: '15px',
              marginBottom: '20px',
              backgroundColor: '#f0f7ff',
              border: '1px solid #6c9bcf',
              borderRadius: '4px'
            }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>
                Step 2: Select Semester
              </label>
              <select
                value={selectedSemester}
                onChange={(e) => handleSemesterChange(parseInt(e.target.value) || '')}
                disabled={loading || alumniLoading}
                style={{
                  width: '100%',
                  maxWidth: '300px',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="">-- Select a Semester --</option>
                {semesters.map(sem => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Students List */}
          {selectedProgram && selectedSemester && (
            <div style={{
              padding: '15px',
              marginBottom: '20px',
              backgroundColor: '#f9f9f9',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0 }}>Step 3: Select Students ({selectedCount}/{students.length})</h3>
                {students.length > 0 && (
                  <button
                    onClick={handleSelectAllStudents}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#17a2b8',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    {students.every(s => selectedStudents[s.id]) ? '☐ Deselect All' : '☑ Select All'}
                  </button>
                )}
              </div>

              {students.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                  No students found in {selectedProgram} semester {selectedSemester}
                </div>
              ) : (
                <div style={{
                  maxHeight: '400px',
                  overflowY: 'auto',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}>
                  <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse',
                    fontSize: '13px'
                  }}>
                    <thead>
                      <tr style={{ backgroundColor: '#a21d1d', borderBottom: '2px solid #ddd' }}>
                        <th style={{ padding: '10px', textAlign: 'left' }}>
                          <input
                            type="checkbox"
                            checked={students.length > 0 && students.every(s => selectedStudents[s.id])}
                            onChange={handleSelectAllStudents}
                            disabled={loading || alumniLoading}
                          />
                        </th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Student ID</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Name</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Email</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>Add to Alumni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student, index) => (
                        <tr 
                          key={student.id}
                          style={{ 
                            borderBottom: '1px solid #eee',
                            backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9'
                          }}
                        >
                          <td style={{ padding: '10px' }}>
                            <input
                              type="checkbox"
                              checked={selectedStudents[student.id] || false}
                              onChange={() => handleStudentCheckboxChange(student.id)}
                              disabled={loading || alumniLoading}
                            />
                          </td>
                          <td style={{ padding: '10px' }}>{student.studentId}</td>
                          <td style={{ padding: '10px' }}>{student.fullName}</td>
                          <td style={{ padding: '10px' }}>{student.email}</td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>
                            <button
                              onClick={() => handleAddStudentToAlumni(student)}
                              disabled={loading || alumniLoading}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#ff9800',
                                color: 'white',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: alumniLoading ? 'not-allowed' : 'pointer',
                                fontSize: '12px',
                                opacity: alumniLoading ? 0.6 : 1
                              }}
                            >
                              {alumniLoading ? '⏳' : '➕'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {selectedProgram && selectedSemester && students.length > 0 && (
            <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: '1fr 1fr', marginBottom: '20px' }}>
              <button
                onClick={isNextSemesterValid() ? handleBulkUpdateSemester : handleBulkAddToAlumni}
                disabled={loading || alumniLoading || selectedCount === 0}
                style={{
                  padding: '12px',
                  backgroundColor: selectedCount === 0 ? '#ccc' : (isNextSemesterValid() ? '#28a745' : '#ff9800'),
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: (loading || alumniLoading || selectedCount === 0) ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  opacity: (loading || alumniLoading || selectedCount === 0) ? 0.6 : 1
                }}
                title={selectedCount === 0 ? 'Select at least one student' : ''}
              >
                {(loading || alumniLoading) ? '⏳ Processing...' : getIncrementButtonText()}
              </button>
              <button
                onClick={() => {
                  setSelectedProgram('');
                  setSelectedSemester('');
                  setStudents([]);
                  setSelectedStudents({});
                  setSemesters([]);
                  setError('');
                }}
                disabled={loading || alumniLoading}
                style={{
                  padding: '12px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                ↻ Reset
              </button>
            </div>
          )}

          {/* Info Box */}
          {!selectedProgram && (
            <div style={{
              padding: '15px',
              backgroundColor: '#fff3cd',
              border: '1px solid #ffc107',
              borderRadius: '4px',
              color: '#856404'
            }}>
              <strong>ℹ️ How to use:</strong>
              <ol style={{ margin: '10px 0', paddingLeft: '20px' }}>
                <li>Select a <strong>Program</strong> to see available semesters</li>
                <li>Select a <strong>Semester</strong> to see all students in that semester</li>
                <li>Review the student list - all are selected by default</li>
                <li><strong>Deselect</strong> any student you want to skip (e.g., failed students)</li>
                <li>Click <strong>"Add to Alumni"</strong> button for any student to manually move them to alumni</li>
                <li>Click <strong>"Increment"</strong> to advance selected students to the next semester</li>
                <li>When a student reaches their <strong>final semester</strong>, they will automatically be added to Alumni</li>
              </ol>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BulkSemesterUpdate;

