import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/dashboard.css';

export const StudentRoutineView = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [routines, setRoutines] = useState([]);
  const [filteredRoutines, setFilteredRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [studentData, setStudentData] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSyllabus, setSelectedSyllabus] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState('');
  const [selectedPdfName, setSelectedPdfName] = useState('');

  useEffect(() => {
    fetchStudentData();
    fetchStudentRoutines();
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/subjects');
      setSubjects(Array.isArray(response.data) ? response.data : []);
      console.log('All subjects:', response.data);
    } catch (err) {
      console.error('Error fetching subjects:', err);
    }
  };

  const fetchStudentData = async () => {
    try {
      const response = await api.get(`/students/profile`);
      setStudentData(response.data);
    } catch (err) {
      console.error('Error fetching student data:', err);
    }
  };

  const fetchStudentRoutines = async () => {
    try {
      setLoading(true);
      const response = await api.get('/routines/all');
      const allRoutines = Array.isArray(response.data) ? response.data : [];
      setRoutines(allRoutines);
      console.log('All routines from API:', allRoutines);
      
      // For now, show all routines without filtering
      // Filter will be applied after studentData is loaded
      setFilteredRoutines(allRoutines);
      setError('');
    } catch (err) {
      console.error('Error fetching routines:', err);
      setError('Failed to load routine data');
    } finally {
      setLoading(false);
    }
  };

  // When studentData loads, re-filter routines
  useEffect(() => {
    if (studentData && studentData.program && routines.length > 0) {
      console.log('Student data loaded, re-filtering routines:', studentData);
      const program = studentData.program || studentData.course;
      const semester = studentData.semester;
      
      const filtered = routines.filter(routine => {
        const description = routine.description || '';
        const hasCourse = description.includes(`Course: ${program}`) || 
                         routine.course === program;
        const hasSemester = description.includes(`Semester: ${semester}`) || 
                           routine.semester === `Semester ${semester}`;
        return hasCourse && hasSemester;
      });
      
      console.log('Filtered routines by program/semester:', filtered);
      setFilteredRoutines(filtered);
    }
  }, [studentData, routines]);

  const fetchSyllabus = async (subjectId, program, semester) => {
    try {
      console.log('Fetching syllabus with:', { subjectId, program, semester });
      const response = await api.get(`/syllabus/subject/${subjectId}/program/${encodeURIComponent(program)}/semester/${encodeURIComponent(semester)}`);
      console.log('Syllabus response:', response.data);
      if (response.data && response.data.id) {
        setSelectedSyllabus(response.data);
        setShowModal(true);
      } else {
        setSelectedSyllabus(null);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error fetching syllabus:', error);
      setSelectedSyllabus(null);
      setShowModal(true);
    }
  };

  const viewSyllabus = async (syllabusId, fileName) => {
    try {
      const response = await api.get(`/syllabus/${syllabusId}/download`, {
        responseType: 'blob'
      });
      if (response.data.size > 0) {
        const blobUrl = URL.createObjectURL(response.data);
        setSelectedPdfUrl(blobUrl);
        setSelectedPdfName(fileName);
        setShowPdfModal(true);
      } else {
        setError('PDF file is empty');
      }
    } catch (error) {
      console.error('Error fetching PDF:', error);
      setError('Failed to load syllabus PDF');
    }
  };

  const downloadSyllabus = async (syllabusId, fileName) => {
    try {
      const response = await api.get(`/syllabus/${syllabusId}/download`, {
        responseType: 'blob'
      });
      if (response.data.size > 0) {
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName || 'syllabus.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        setError('Downloaded file is empty');
      }
    } catch (error) {
      console.error('Download error:', error);
      setError('Failed to download syllabus');
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading routines...</div>;
  }

  const extractField = (description, fieldName) => {
    return (description || '').split('\n').find(line => line.startsWith(fieldName + ':'))?.replace(fieldName + ': ', '') || 'N/A';
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const extractDynamicTimes = () => {
    // Always return fixed 1-hour intervals throughout the day
    // This ensures all time slots appear, even if no class is scheduled
    const defaultTimes = [
      '09:30-10:30',
      '10:30-11:30',
      '11:30-12:30',
      '12:30-13:30', // 12:30 PM - 1:30 PM (lunch time)
      '13:30-14:30',
      '14:30-15:30',
      '15:30-16:30'
    ];
    
    return defaultTimes;
  };

  const times = extractDynamicTimes();

  // Convert 24-hour time range to 12-hour format
  const convertTo12Hour = (timeRange) => {
    const [startTime, endTime] = timeRange.split('-');
    const [startHour, startMin] = startTime.split(':');
    const [endHour, endMin] = endTime.split(':');
    
    let startHourNum = parseInt(startHour);
    let endHourNum = parseInt(endHour);
    
    const startAmpm = startHourNum >= 12 ? '' : '';
    const endAmpm = endHourNum >= 12 ? '' : '';
    
    if (startHourNum > 12) startHourNum = startHourNum - 12;
    else if (startHourNum === 0) startHourNum = 12;
    
    if (endHourNum > 12) endHourNum = endHourNum - 12;
    else if (endHourNum === 0) endHourNum = 12;
    
    return `${startHourNum}:${startMin} ${startAmpm} - ${endHourNum}:${endMin} ${endAmpm}`;
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1> Class Routine</h1>
      
      {error && (
        <div style={{
          padding: '12px',
          marginBottom: '15px',
          borderRadius: '4px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}

      {filteredRoutines.length === 0 ? (
        <p style={{ fontSize: '16px', color: '#666' }}>
          No routines available for your course and semester yet.
        </p>
      ) : (
        <>
          {/* Reset renderedCells for this render cycle */}
          {(() => {
            const getTimetableCell = (day, timeRange) => {
              const startTime = timeRange.split('-')[0];

              const routine = filteredRoutines.find(r => {
                const routineDay = extractField(r.description, 'Day');
                let routineStartTime;

                if (r.startTime) {
                  routineStartTime = r.startTime;
                } else {
                  const timeStr = extractField(r.description, 'Time');
                  routineStartTime = timeStr?.split('-')[0];
                }

                return routineDay === day && routineStartTime === startTime;
              });

              if (!routine) return null;

              const teacher = extractField(routine.description, 'Teacher');
              const subject = extractField(routine.description, 'Subject');
              const room = extractField(routine.description, 'Room');
              const subjectId = routine.subjectId || routine.courseId;

              return { 
                teacher, 
                subject, 
                room,
                subjectId
              };
            };

            return (
          <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              minWidth: '900px'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#2c3e50', color: 'white' }}>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', borderRight: '1px solid #bbb', minWidth: '100px' }}>Day</th>
                  {times.map(time => (
                    <th key={time} style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', borderRight: '1px solid #bbb', minWidth: '150px' }}>
                      {convertTo12Hour(time)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.map(day => {
                  console.log(`Processing day: ${day}`);
                  return (
                  <tr key={day} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ 
                      padding: '12px', 
                      textAlign: 'center', 
                      fontWeight: 'bold', 
                      backgroundColor: '#f8f9fa',
                      borderRight: '1px solid #bbb'
                    }}>
                      {day}
                    </td>
                    {times.map(time => {
                      const cell = getTimetableCell(day, time);
                      console.log(`${day} - ${time}: `, cell);

                      if (cell?.skipped) {
                        return null;
                      }

                      if (!cell) {
                        return (
                          <td key={`${day}-${time}`} style={{
                            padding: '10px',
                            textAlign: 'center',
                            borderRight: '1px solid #ddd',
                            minWidth: '150px',
                            height: '80px',
                            verticalAlign: 'top',
                            backgroundColor: 'white',
                            border: '1px solid #ddd'
                          }}>
                            <span style={{ color: '#ccc' }}>—</span>
                          </td>
                        );
                      }

                      let bgColor = '#e3f2fd';
                      let borderColor = '#1976d2';

                      return (
                        <td 
                          key={`${day}-${time}`} 
                          style={{
                            padding: '10px',
                            textAlign: 'center',
                            borderRight: '1px solid #ddd',
                            minWidth: '150px',
                            height: '80px',
                            verticalAlign: 'top',
                            backgroundColor: bgColor,
                            border: `2px solid ${borderColor}`
                          }}
                        >
                          <div>
                            <div style={{
                              fontWeight: 'bold',
                              color: '#1976d2',
                              fontSize: '13px',
                              marginBottom: '4px',
                              cursor: 'pointer',
                              textDecoration: 'underline',
                              transition: 'color 0.2s',
                              wordBreak: 'break-word',
                              whiteSpace: 'normal',
                              lineHeight: '1.2'
                            }}
                            onClick={() => {
                              const startTime = time.split('-')[0];
                              const routine = filteredRoutines.find(r => {
                                const routineDay = extractField(r.description, 'Day');
                                let routineStartTime;
                                if (r.startTime) {
                                  routineStartTime = r.startTime;
                                } else {
                                  const timeStr = extractField(r.description, 'Time');
                                  routineStartTime = timeStr?.split('-')[0];
                                }
                                return routineDay === day && routineStartTime === startTime;
                              });
                              console.log('Clicked routine:', routine);
                              if (routine) {
                                const subjectName = cell.subject;
                                const subject = subjects.find(s => s.subjectName === subjectName);
                                console.log('Found subject:', subject);
                                if (subject) {
                                  fetchSyllabus(subject.id, routine.course || studentData.program, routine.semester || studentData.semester);
                                } else {
                                  alert('Subject not found in database');
                                }
                              }
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#1565c0'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#1976d2'}
                            title="Click to view syllabus"
                            >
                              {cell.subject}
                            </div>
                            <div style={{ fontSize: '12px', color: '#555', marginBottom: '2px', fontWeight: '500' }}>
                              {cell.teacher}
                            </div>
                            <div style={{ fontSize: '11px', color: '#777' }}>
                              🚪 {cell.room}
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
            );
          })()}
        </>
      )}

      {/* Syllabus Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#333' }}>📚 Syllabus</h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#999'
                }}
              >
                ✕
              </button>
            </div>

            {selectedSyllabus ? (
              <div>
                <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                  <p style={{ margin: '5px 0' }}><strong>Subject:</strong> {selectedSyllabus.subjectName} ({selectedSyllabus.subjectCode})</p>
                  <p style={{ margin: '5px 0' }}><strong>Program:</strong> {selectedSyllabus.program}</p>
                  <p style={{ margin: '5px 0' }}><strong>Semester:</strong> {selectedSyllabus.semester}</p>
                  <p style={{ margin: '5px 0' }}><strong>Uploaded By:</strong> {selectedSyllabus.uploadedByName}</p>
                  <p style={{ margin: '5px 0' }}><strong>File:</strong> {selectedSyllabus.fileName}</p>
                  {selectedSyllabus.description && (
                    <p style={{ margin: '5px 0' }}><strong>Description:</strong> {selectedSyllabus.description}</p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => viewSyllabus(selectedSyllabus.id, selectedSyllabus.fileName)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: '#17a2b8',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    View
                  </button>
                  <button
                    onClick={() => downloadSyllabus(selectedSyllabus.id, selectedSyllabus.fileName)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: '#4caf50',
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
              </div>
            ) : (
              <p style={{ color: '#999', textAlign: 'center' }}>No syllabus available for this subject</p>
            )}
          </div>
        </div>
      )}

      {/* PDF Viewer Modal */}
      {showPdfModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '900px',
            height: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '15px 20px',
              borderBottom: '1px solid #e0e0e0',
              backgroundColor: '#f5f5f5'
            }}>
              <h3 style={{ margin: 0, color: '#333' }}>📄 {selectedPdfName}</h3>
              <button
                onClick={() => setShowPdfModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '28px',
                  cursor: 'pointer',
                  color: '#999',
                  padding: '0',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>
            <iframe
              src={selectedPdfUrl}
              style={{
                flex: 1,
                border: 'none',
                borderRadius: '0 0 8px 8px'
              }}
              title="PDF Viewer"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentRoutineView;
