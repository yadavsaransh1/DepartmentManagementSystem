import React, { useMemo, useState, useEffect } from 'react';
import { apiFetch, API_BASE_URL } from '../utils/apiClient';

export const RoutineTimetable = ({ routines }) => {
  const [selectedSyllabus, setSelectedSyllabus] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState('');
  const [selectedPdfName, setSelectedPdfName] = useState('');

  useEffect(() => {
    // Fetch subjects to lookup subjectId by name
    const fetchSubjects = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/subjects`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setSubjects(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };
    fetchSubjects();
  }, []);

  // Helper function to convert 24-hour to 12-hour format
  const convertTo12Hour = (time24) => {
    if (!time24) return '';
    const [hours, mins] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 === 0 ? 12 : hours % 12;
    return `${String(hours12).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${period}`;
  };

  const fetchSyllabus = async (subjectId, program, semester) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/syllabus/subject/${subjectId}/program/${encodeURIComponent(program)}/semester/${encodeURIComponent(semester)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedSyllabus(data);
        setShowModal(true);
      } else {
        // Show modal with "No syllabus available" message
        setSelectedSyllabus(null);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error fetching syllabus:', error);
      setSelectedSyllabus(null);
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  const downloadSyllabus = async (syllabusId, fileName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/syllabus/${syllabusId}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const viewSyllabus = async (syllabusId, fileName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/syllabus/${syllabusId}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        setSelectedPdfUrl(blobUrl);
        setSelectedPdfName(fileName);
        setShowPdfModal(true);
      }
    } catch (error) {
      console.error('Error fetching PDF:', error);
    }
  };

  // Define time slots in 24-hour format, convert to 12-hour for display
  const timeSlotsDisplay = [
    '09:30-10:30 AM',
    '10:30-11:30 AM',
    '11:30-12:30 PM',
    '12:30-01:30 PM',
    '01:30-02:30 PM',
    '02:30-03:30 PM',
    '03:30-04:30 PM'
  ];

  const timeSlots = [
    '09:30-10:30',
    '10:30-11:30',
    '11:30-12:30',
    '12:30-13:30',
    '13:30-14:30',
    '14:30-15:30',
    '15:30-16:30'
  ];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  // Parse routine description to extract details
  const parseRoutineDescription = (description) => {
    if (!description) return {};
    
    const details = {};
    const lines = description.split('\n');
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.includes('Subject:')) {
        details.subject = trimmed.replace('Subject:', '').trim();
      } else if (trimmed.includes('Course:')) {
        details.course = trimmed.replace('Course:', '').trim();
      } else if (trimmed.includes('Semester:')) {
        details.semester = trimmed.replace('Semester:', '').trim();
      } else if (trimmed.includes('Day:')) {
        details.day = trimmed.replace('Day:', '').trim();
      } else if (trimmed.includes('Time:')) {
        let time = trimmed.replace('Time:', '').trim();
        // Normalize time format: "9:30 -10:30" -> "09:30-10:30"
        // Extract start time and normalize it
        const timeParts = time.split('-').map(t => t.trim());
        if (timeParts.length >= 1) {
          let startTime = timeParts[0];
          const [hours, mins] = startTime.split(':').map(Number);
          
          // If hour is less than 9, it's likely PM (13:00 onwards)
          // Convert to 24-hour format: 1:30 PM -> 13:30
          let normalizedHours = hours;
          if (hours < 9 && hours > 0) {
            normalizedHours = hours + 12;
          }
          
          const normalizedStart = `${String(normalizedHours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
          details.time = normalizedStart;
        }
      } else if (trimmed.includes('Room:')) {
        details.room = trimmed.replace('Room:', '').trim();
      }
    });
    
    return details;
  };

  // Build timetable data structure with multi-hour merging support
  const timetable = useMemo(() => {
    const table = {};
    const mergedCells = new Set(); // Track cells that are merged continuations
    
    // Initialize empty cells
    days.forEach(day => {
      table[day] = {};
      timeSlots.forEach(slot => {
        table[day][slot] = null;
      });
    });

    // Fill in routines
    routines.forEach((routine) => {
      const details = parseRoutineDescription(routine.description);
      const day = details.day ? details.day.trim() : null;
      
      // Helper to convert LocalTime or string to HH:mm format
      const normalizeTime = (timeValue) => {
        if (!timeValue) return null;
        
        // If it's already a string in HH:mm format, return it
        if (typeof timeValue === 'string' && timeValue.includes(':')) {
          return timeValue;
        }
        
        // If it's a LocalTime object like {hour: 13, minute: 30}
        if (typeof timeValue === 'object' && timeValue.hour !== undefined) {
          return `${String(timeValue.hour).padStart(2, '0')}:${String(timeValue.minute).padStart(2, '0')}`;
        }
        
        return null;
      };
      
      // Use startTime and endTime from routine object if available, fallback to parsed description
      let startTime = normalizeTime(routine.startTime) || normalizeTime(details.time);
      let endTime = normalizeTime(routine.endTime);
      
      if (day && startTime && table[day]) {
        // Find all time slots that fall within the start and end times
        const matchingSlots = [];
        
        // Parse time string to minutes for comparison
        const parseTimeString = (timeStr) => {
          if (typeof timeStr === 'string') {
            const [hours, mins] = timeStr.split(':').map(Number);
            return hours * 60 + mins; // Convert to minutes for easy comparison
          }
          return 0;
        };
        
        const startMinutes = parseTimeString(startTime);
        
        if (endTime) {
          const endMinutes = parseTimeString(endTime);
          
          // Find all slots that overlap with this time range  
          timeSlots.forEach(slot => {
            const [slotStart, slotEnd] = slot.split('-');
            const slotStartMinutes = parseTimeString(slotStart);
            
            // Check if slot overlaps with routine time range
            if (slotStartMinutes >= startMinutes && slotStartMinutes < endMinutes) {
              matchingSlots.push(slot);
            }
          });
        } else {
          // No end time - try to find a slot that matches the start time
          // First try exact match on slot start, then try any slot containing the start time
          let foundSlot = timeSlots.find(slot => slot.startsWith(startTime));
          
          if (!foundSlot) {
            // Fallback: find first slot that starts after or at this time
            foundSlot = timeSlots.find(slot => {
              const [slotStart] = slot.split('-');
              return slotStart === startTime;
            });
          }
          
          if (foundSlot) {
            matchingSlots.push(foundSlot);
          }
        }

        // Place routine in first slot with rowSpan, mark rest as merged
        if (matchingSlots.length > 0) {
          const firstSlot = matchingSlots[0];
          table[day][firstSlot] = {
            subject: details.subject || 'N/A',
            course: details.course || 'N/A',
            semester: details.semester || 'N/A',
            room: details.room || 'N/A',
            rowSpan: matchingSlots.length,
            duration: matchingSlots.length > 1 ? `(${matchingSlots.length}H)` : ''
          };
          
          // Mark continuation slots
          for (let i = 1; i < matchingSlots.length; i++) {
            const cellId = `${day}-${matchingSlots[i]}`;
            mergedCells.add(cellId);
          }
        }
      }
    });
    
    return { table, mergedCells };
  }, [routines]);

  return (
    <div className="routine-timetable-container" style={{ 
      marginTop: '20px', 
      overflowX: 'auto',
      WebkitOverflowScrolling: 'touch',
      width: '100%'
    }}>
      <table className="routine-table" style={{
        width: '100%',
        borderCollapse: 'collapse',
        backgroundColor: 'white',
        boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
        tableLayout: 'fixed',
        minWidth: window.innerWidth > 768 ? 'auto' : '800px'
      }}>
        <thead>
          <tr style={{ backgroundColor: '#2c3e50', color: 'white', height: window.innerWidth > 768 ? 'auto' : '60px' }}>
            <th style={{
              padding: window.innerWidth > 768 ? '15px 10px' : '12px 8px',
              textAlign: 'center',
              fontWeight: 'bold',
              width: window.innerWidth > 768 ? '120px' : '90px',
              borderRight: '2px solid #34495e',
              fontSize: window.innerWidth > 768 ? '13px' : '11px',
              height: '100%',
              verticalAlign: 'middle'
            }}>
              Day / Time
            </th>
            {timeSlotsDisplay.map((slotDisplay, idx) => (
              <th
                key={timeSlots[idx]}
                style={{
                  padding: window.innerWidth > 768 ? '15px 10px' : '10px 6px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  width: window.innerWidth > 768 ? '140px' : '110px',
                  borderRight: '1px solid #34495e',
                  backgroundColor: '#34495e',
                  fontSize: window.innerWidth > 768 ? '12px' : '10px',
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                  verticalAlign: 'middle',
                  overflow: 'visible',
                  textOverflow: 'clip',
                  height: '100%',
                  minHeight: window.innerWidth > 768 ? 'auto' : '60px'
                }}
                title={slotDisplay}
              >
                {slotDisplay}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map((day, dayIndex) => (
            <tr key={day} style={{
              backgroundColor: dayIndex % 2 === 0 ? '#f8f9fa' : 'white'
            }}>
              <td style={{
                padding: window.innerWidth > 768 ? '15px 10px' : '12px 8px',
                fontWeight: 'bold',
                color: '#2c3e50',
                backgroundColor: dayIndex % 2 === 0 ? '#e8f4f8' : '#f0f8fb',
                borderRight: '2px solid #bdc3c7',
                textAlign: 'center',
                width: window.innerWidth > 768 ? '120px' : '90px',
                fontSize: window.innerWidth > 768 ? '13px' : '11px',
                wordBreak: 'break-word',
                verticalAlign: 'middle',
                minHeight: window.innerWidth > 768 ? '100px' : '80px'
              }}>
                {day}
              </td>
              {timeSlots.map(slot => {
                // Skip this cell if it's part of a merged multi-hour cell
                const cellKey = `${day}-${slot}`;
                if (timetable.mergedCells.has(cellKey)) {
                  return null; // Don't render continuation cells
                }
                
                const routine = timetable.table[day][slot];
                const rowSpan = routine ? routine.rowSpan : 1;
                
                return (
                  <td
                    key={cellKey}
                    rowSpan={rowSpan}
                    style={{
                      padding: window.innerWidth > 768 ? '12px 8px' : '10px 6px',
                      minHeight: window.innerWidth > 768 ? `${100 * rowSpan}px` : `${120 * rowSpan}px`,
                      borderRight: '1px solid #ecf0f1',
                      borderBottom: '1px solid #ecf0f1',
                      backgroundColor: routine ? '#e8f5e9' : (dayIndex % 2 === 0 ? '#f8f9fa' : 'white'),
                      verticalAlign: 'top',
                      fontSize: window.innerWidth > 768 ? '11px' : '9px',
                      position: 'relative',
                      transition: 'background-color 0.2s',
                      width: window.innerWidth > 768 ? '140px' : '110px',
                      overflow: 'visible',
                      wordBreak: 'break-word',
                      whiteSpace: 'normal'
                    }}
                    onMouseEnter={(e) => {
                      if (routine && window.innerWidth > 768) {
                        e.currentTarget.style.backgroundColor = '#c8e6c9';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (routine) {
                        e.currentTarget.style.backgroundColor = '#e8f5e9';
                      }
                    }}
                  >
                    {routine ? (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: window.innerWidth > 768 ? '4px' : '2px',
                        height: '100%',
                        padding: window.innerWidth > 768 ? '4px' : '2px'
                      }}>
                        <div 
                          style={{
                            fontWeight: 'bold',
                            color: '#1b5e20',
                            fontSize: window.innerWidth > 768 ? '12px' : '10px',
                            wordBreak: 'break-word',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            transition: 'color 0.2s',
                            lineHeight: '1.3'
                          }}
                          onClick={() => {
                            const subject = subjects.find(s => s.subjectName === routine.subject);
                            if (subject) {
                              fetchSyllabus(subject.id, routine.course, routine.semester);
                            } else {
                              alert('Subject not found');
                            }
                          }}
                          onMouseEnter={(e) => {
                            if (window.innerWidth > 768) {
                              e.currentTarget.style.color = '#2e7d32';
                            }
                          }}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#1b5e20'}
                          title="Click to view syllabus"
                        >
                          {routine.subject} {routine.duration}
                        </div>
                        <div style={{
                          color: '#2e7d32',
                          fontSize: window.innerWidth > 768 ? '10px' : '10px',
                          lineHeight: '1.2'
                        }}>
                          <strong>Course:</strong> {routine.course}
                        </div>
                        <div style={{
                          color: '#2e7d32',
                          fontSize: window.innerWidth > 768 ? '10px' : '10px',
                          lineHeight: '1.2'
                        }}>
                          <strong>Sem:</strong> {routine.semester}
                        </div>
                        <div style={{
                          color: '#d84315',
                          fontSize: window.innerWidth > 768 ? '10px' : '10px',
                          fontWeight: 'bold',
                          borderTop: '1px solid #81c784',
                          paddingTop: '4px',
                          marginTop: '4px',
                          lineHeight: '1.2'
                        }}>
                          📍 {routine.room}
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        color: '#bdbdbd',
                        fontSize: window.innerWidth > 768 ? '10px' : '7px',
                        textAlign: 'center',
                        paddingTop: window.innerWidth > 768 ? '35px' : '20px'
                      }}>
                        --
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      
      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#e8f5e9',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#2e7d32',
        border: '1px solid #81c784'
      }}>
        <strong>📝 Note:</strong> Multi-hour classes with consecutive time slots automatically merge into a single cell. 
        The timetable displays routines based on day and time information, with cells expanding vertically for multi-hour classes.
      </div>

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

            {loading ? (
              <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>Loading syllabus...</p>
            ) : selectedSyllabus ? (
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
              <div style={{
                padding: '30px 20px',
                textAlign: 'center',
                backgroundColor: '#fff3cd',
                borderRadius: '6px',
                border: '1px solid #ffc107'
              }}>
                <p style={{ margin: '0', color: '#856404', fontSize: '16px', fontWeight: 'bold' }}>📚 No Syllabus Available</p>
                <p style={{ margin: '8px 0 0 0', color: '#856404', fontSize: '13px' }}>Syllabus document has not been uploaded for this subject yet.</p>
              </div>
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

export default RoutineTimetable;

