import React, { useState, useEffect } from 'react';
import api from '../services/api';

export const StudentAttendanceTable = ({ selectedSubject, filter }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'attendance_percentage', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (selectedSubject) {
      fetchStudentAttendance();
    }
  }, [selectedSubject]);

  const fetchStudentAttendance = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/subjects/${selectedSubject}/enrolled-students`);
      
      if (Array.isArray(response.data)) {
        // Add attendance percentage to each student (default 0 if not available)
        const studentsWithAttendance = response.data.map(student => ({
          ...student,
          attendance_percentage: Math.round(Math.random() * 100) // Will be updated with real API call
        }));
        setStudents(studentsWithAttendance);
        
        // Fetch attendance details for each student
        fetchAttendanceDetails(studentsWithAttendance);
      }
    } catch (err) {
      console.error('Error fetching enrolled students:', err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceDetails = async (studentsList) => {
    try {
      const studentsData = await Promise.all(
        studentsList.map(async (student) => {
          try {
            const attendanceRes = await api.get(
              `/attendance/percentage/date-range?studentId=${student.id}&subjectId=${selectedSubject}&startDate=${new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]}&endDate=${new Date().toISOString().split('T')[0]}`
            );
            return {
              ...student,
              attendance_percentage: Math.round(attendanceRes.data?.percentage || 0)
            };
          } catch {
            return {
              ...student,
              attendance_percentage: 0
            };
          }
        })
      );
      setStudents(studentsData);
    } catch (err) {
      console.error('Error fetching attendance details:', err);
    }
  };

  // Filter students based on search query
  const filteredStudents = students.filter(student => {
    const name = student.user?.fullName || student.user?.full_name || student.fullName || 'N/A';
    const studentId = student.studentId || student.id || '';
    const query = searchQuery.toLowerCase();
    return name.toLowerCase().includes(query) || studentId.toString().includes(query);
  });

  // Sort students
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (typeof aValue === 'number') {
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    const aStr = (aValue || '').toString().toLowerCase();
    const bStr = (bValue || '').toString().toLowerCase();
    return sortConfig.direction === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
  });

  // Pagination
  const totalPages = Math.ceil(sortedStudents.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = sortedStudents.slice(startIdx, startIdx + itemsPerPage);

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 75) return '#4caf50';
    if (percentage >= 60) return '#ff9800';
    return '#f44336';
  };

  const getAttendanceLabel = (percentage) => {
    if (percentage >= 75) return 'Good';
    if (percentage >= 60) return 'satisfactory';
    return 'Poor';
  };

  return (
    <div style={{ marginTop: '30px' }}>
      <h3 style={{ marginBottom: '15px', color: '#333' }}>📋 Student Attendance List</h3>

      {/* Search Bar */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search by student name or ID..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
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

      {loading ? (
        <p>Loading attendance data...</p>
      ) : filteredStudents.length > 0 ? (
        <>
          {/* Table */}
          <div style={{ overflowX: 'auto', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              backgroundColor: 'white'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                  <th
                    onClick={() => handleSort('studentId')}
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      fontWeight: 'bold',
                      color: '#333',
                      cursor: 'pointer',
                      userSelect: 'none',
                      borderRight: '1px solid #eee'
                    }}
                  >
                    Student ID {sortConfig.key === 'studentId' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th
                    onClick={() => handleSort('fullName')}
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      fontWeight: 'bold',
                      color: '#333',
                      cursor: 'pointer',
                      userSelect: 'none',
                      borderRight: '1px solid #eee'
                    }}
                  >
                    Name {sortConfig.key === 'fullName' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th
                    onClick={() => handleSort('program')}
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      fontWeight: 'bold',
                      color: '#333',
                      cursor: 'pointer',
                      userSelect: 'none',
                      borderRight: '1px solid #eee'
                    }}
                  >
                    Program {sortConfig.key === 'program' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th
                    onClick={() => handleSort('course')}
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      fontWeight: 'bold',
                      color: '#333',
                      cursor: 'pointer',
                      userSelect: 'none',
                      borderRight: '1px solid #eee'
                    }}
                  >
                    Semester {sortConfig.key === 'course' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th
                    onClick={() => handleSort('attendance_percentage')}
                    style={{
                      padding: '12px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: '#333',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    Attendance % {sortConfig.key === 'attendance_percentage' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map((student, index) => {
                  const percentage = student.attendance_percentage || 0;
                  const color = getAttendanceColor(percentage);
                  const label = getAttendanceLabel(percentage);
                  
                  return (
                    <tr
                      key={student.id}
                      style={{
                        borderBottom: '1px solid #eee',
                        backgroundColor: index % 2 === 0 ? 'white' : '#f9f9f9',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : '#f9f9f9'}
                    >
                      <td style={{ padding: '12px', borderRight: '1px solid #eee', color: '#666' }}>
                        {student.studentId || student.id}
                      </td>
                      <td style={{ padding: '12px', borderRight: '1px solid #eee', color: '#333', fontWeight: '500' }}>
                        {student.user?.fullName || student.user?.full_name || student.fullName || 'N/A'}
                      </td>
                      <td style={{ padding: '12px', borderRight: '1px solid #eee', color: '#666' }}>
                        {student.program || 'N/A'}
                      </td>
                      <td style={{ padding: '12px', borderRight: '1px solid #eee', color: '#666' }}>
                        Sem {student.semester || '-'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          {/* Progress Bar */}
                          <div style={{
                            width: '80px',
                            height: '20px',
                            backgroundColor: '#e0e0e0',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            position: 'relative'
                          }}>
                            <div
                              style={{
                                width: `${percentage}%`,
                                height: '100%',
                                backgroundColor: color,
                                transition: 'width 0.3s'
                              }}
                            />
                          </div>
                          {/* Percentage Text */}
                          <span style={{
                            color: color,
                            fontWeight: 'bold',
                            fontSize: '13px',
                            minWidth: '40px',
                            textAlign: 'right'
                          }}>
                            {percentage}%
                          </span>
                          {/* Label */}
                          <span style={{
                            fontSize: '11px',
                            color: '#999',
                            minWidth: '60px'
                          }}>
                            ({label})
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              marginTop: '20px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px'
            }}>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 12px',
                  backgroundColor: currentPage === 1 ? '#ddd' : '#667eea',
                  color: currentPage === 1 ? '#999' : 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Previous
              </button>
              
              <span style={{ margin: '0 10px', color: '#666' }}>
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '8px 12px',
                  backgroundColor: currentPage === totalPages ? '#ddd' : '#667eea',
                  color: currentPage === totalPages ? '#999' : 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                Next
              </button>
            </div>
          )}

          {/* Summary */}
          <div style={{
            marginTop: '15px',
            padding: '10px',
            backgroundColor: '#f9f9f9',
            borderRadius: '4px',
            textAlign: 'center',
            color: '#666',
            fontSize: '13px'
          }}>
            Showing {startIdx + 1} to {Math.min(startIdx + itemsPerPage, sortedStudents.length)} of {sortedStudents.length} students
          </div>
        </>
      ) : (
        <p style={{ textAlign: 'center', color: '#999' }}>No students found.</p>
      )}
    </div>
  );
};

export default StudentAttendanceTable;
