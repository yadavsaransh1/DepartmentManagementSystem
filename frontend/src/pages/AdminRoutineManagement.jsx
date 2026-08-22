import React, { useState, useEffect } from 'react';
import api from '../services/api';
import RoutineTimetable from '../components/RoutineTimetable';
import '../styles/dashboard.css';

export const AdminRoutineManagement = () => {
  const [routines, setRoutines] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [selectedRoutineIds, setSelectedRoutineIds] = useState(new Set());
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [editFormData, setEditFormData] = useState({
    course: '',
    semester: '',
    academicYear: '',
    description: '',
    subject: '',
    day: '',
    time: '',
    room: '',
    teacherId: ''
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    fetchTeachers();
    fetchAllRoutines();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await api.get('/teachers');
      setTeachers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching teachers:', err);
    }
  };

  const fetchAllRoutines = async () => {
    try {
      setLoading(true);
      const response = await api.get('/routines/all');
      setRoutines(Array.isArray(response.data) ? response.data : []);
      setSelectedRoutineIds(new Set());
      setSelectAllChecked(false);
    } catch (err) {
      console.error('Error fetching routines:', err);
      setRoutines([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherRoutines = async (teacherId) => {
    if (!teacherId) {
      fetchAllRoutines();
      return;
    }
    try {
      setLoading(true);
      const response = await api.get(`/routines/teacher/${teacherId}`);
      setRoutines(Array.isArray(response.data) ? response.data : []);
      setSelectedRoutineIds(new Set());
      setSelectAllChecked(false);
    } catch (err) {
      console.error('Error fetching teacher routines:', err);
      setRoutines([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherChange = (e) => {
    const teacherId = e.target.value;
    setSelectedTeacherId(teacherId);
    fetchTeacherRoutines(teacherId);
  };

  const handleSelectRoutine = (routineId) => {
    const newSelected = new Set(selectedRoutineIds);
    if (newSelected.has(routineId)) {
      newSelected.delete(routineId);
    } else {
      newSelected.add(routineId);
    }
    setSelectedRoutineIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectAllChecked) {
      setSelectedRoutineIds(new Set());
      setSelectAllChecked(false);
    } else {
      const allIds = new Set(filteredRoutines.map(r => r.id));
      setSelectedRoutineIds(allIds);
      setSelectAllChecked(true);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRoutineIds.size === 0) {
      setMessage('Please select at least one routine to delete');
      setMessageType('error');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedRoutineIds.size} routine(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      let deletedCount = 0;
      let failedCount = 0;

      for (const routineId of selectedRoutineIds) {
        try {
          await api.delete(`/routines/${routineId}`);
          deletedCount++;
        } catch (err) {
          failedCount++;
          console.error(`Error deleting routine ${routineId}:`, err);
        }
      }

      setMessage(`Successfully deleted ${deletedCount} routine(s)${failedCount > 0 ? ` (${failedCount} failed)` : ''}`);
      setMessageType('success');
      setSelectedRoutineIds(new Set());
      setSelectAllChecked(false);

      if (selectedTeacherId) {
        fetchTeacherRoutines(selectedTeacherId);
      } else {
        fetchAllRoutines();
      }
    } catch (err) {
      setMessage('Error deleting routines: ' + (err.response?.data?.message || err.message));
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (routine) => {
    setEditingId(routine.id);
    
    // Parse description field to extract individual values
    let subject = '', day = '', time = '', room = '';
    if (routine.description) {
      const lines = routine.description.split('\n');
      lines.forEach(line => {
        if (line.startsWith('Subject:')) subject = line.replace('Subject: ', '').trim();
        if (line.startsWith('Day:')) day = line.replace('Day: ', '').trim();
        if (line.startsWith('Time:')) time = line.replace('Time: ', '').trim();
        if (line.startsWith('Room:')) room = line.replace('Room: ', '').trim();
      });
    }
    
    setEditFormData({
      course: routine.course || '',
      semester: routine.semester || '',
      academicYear: routine.academicYear || '',
      description: routine.description || '',
      subject: subject,
      day: day,
      time: time,
      room: room,
      teacherId: routine.teacher?.id || ''
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveEdit = async () => {
    try {
      // Reconstruct description from individual fields
      let description = editFormData.description;
      if (editFormData.subject || editFormData.day || editFormData.time || editFormData.room) {
        description = '';
        if (editFormData.subject) description += `Subject: ${editFormData.subject}\n`;
        if (editFormData.day) description += `Day: ${editFormData.day}\n`;
        if (editFormData.time) description += `Time: ${editFormData.time}\n`;
        if (editFormData.room) description += `Room: ${editFormData.room}`;
      }
      
      const response = await api.put(`/routines/${editingId}`, null, {
        params: {
          course: editFormData.course,
          semester: editFormData.semester,
          academicYear: editFormData.academicYear,
          description: description,
          teacherId: editFormData.teacherId
        }
      });
      if (response.status === 200) {
        setMessage('Routine updated successfully!');
        setMessageType('success');
        setEditingId(null);
        if (selectedTeacherId) {
          fetchTeacherRoutines(selectedTeacherId);
        } else {
          fetchAllRoutines();
        }
      }
    } catch (err) {
      setMessage('Error updating routine: ' + (err.response?.data?.message || err.message));
      setMessageType('error');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleDeleteRoutine = async (routineId) => {
    if (window.confirm('Are you sure you want to delete this routine?')) {
      try {
        const response = await api.delete(`/routines/${routineId}`);
        if (response.status === 200) {
          setMessage('Routine deleted successfully!');
          setMessageType('success');
          if (selectedTeacherId) {
            fetchTeacherRoutines(selectedTeacherId);
          } else {
            fetchAllRoutines();
          }
        }
      } catch (err) {
        setMessage('Error deleting routine: ' + (err.response?.data?.message || err.message));
        setMessageType('error');
      }
    }
  };

  const filteredRoutines = selectedTeacherId ? routines : routines;

  // Helper function to extract course/program from description
  const extractCourseFromDescription = (description) => {
    if (!description) return 'Unknown Program';
    const lines = description.split('\n');
    for (let line of lines) {
      if (line.includes('Course:')) {
        return line.replace('Course:', '').trim() || 'Unknown Program';
      }
    }
    return 'Unknown Program';
  };

  // Helper function to extract semester from description
  const extractSemesterFromDescription = (description) => {
    if (!description) return 'Unknown Semester';
    const lines = description.split('\n');
    for (let line of lines) {
      if (line.includes('Semester:')) {
        return line.replace('Semester:', '').trim() || 'Unknown Semester';
      }
    }
    return 'Unknown Semester';
  };

  // Group routines by PROGRAM (course) first, then by semester - Extract from description
  const groupedRoutines = {};
  filteredRoutines.forEach(routine => {
    // Extract program and semester from description field (where Excel upload stores it)
    let program = routine.course || extractCourseFromDescription(routine.description) || 'Unknown Program';
    let semester = routine.semester || extractSemesterFromDescription(routine.description) || 'Unknown Semester';
    
    // First level: Group by Program
    if (!groupedRoutines[program]) {
      groupedRoutines[program] = {};
    }
    
    // Second level: Group by Semester within Program
    const semesterKey = semester;
    if (!groupedRoutines[program][semesterKey]) {
      groupedRoutines[program][semesterKey] = [];
    }
    groupedRoutines[program][semesterKey].push(routine);
  });

  return (
    <div style={{ padding: '20px' }}>
      <h1>Routine Management</h1>

      {message && (
        <div style={{
          padding: '12px',
          marginBottom: '15px',
          borderRadius: '4px',
          backgroundColor: messageType === 'success' ? '#d4edda' : '#f8d7da',
          color: messageType === 'success' ? '#155724' : '#721c24',
          border: `1px solid ${messageType === 'success' ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message}
        </div>
      )}

      {editingId && (
        <div style={{
          backgroundColor: '#f0f7ff',
          border: '2px solid #007bff',
          borderRadius: '4px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginTop: 0, color: '#007bff' }}>✏️ Edit Routine</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Course/Program</label>
              <input
                type="text"
                name="course"
                value={editFormData.course}
                onChange={handleEditChange}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Semester</label>
              <input
                type="text"
                name="semester"
                value={editFormData.semester}
                onChange={handleEditChange}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Academic Year</label>
              <input
                type="text"
                name="academicYear"
                value={editFormData.academicYear}
                onChange={handleEditChange}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Subject</label>
              <input
                type="text"
                name="subject"
                value={editFormData.subject}
                onChange={handleEditChange}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Day</label>
              <input
                type="text"
                name="day"
                value={editFormData.day}
                onChange={handleEditChange}
                placeholder="e.g., Monday"
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Time</label>
              <input
                type="text"
                name="time"
                value={editFormData.time}
                onChange={handleEditChange}
                placeholder="e.g., 09:00 AM - 11:00 AM"
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Room</label>
              <input
                type="text"
                name="room"
                value={editFormData.room}
                onChange={handleEditChange}
                placeholder="e.g., Room 101"
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Teacher</label>
              <select
                name="teacherId"
                value={editFormData.teacherId}
                onChange={handleEditChange}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
              >
                <option value="">Select Teacher</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>{teacher.fullName} ({teacher.email})</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleSaveEdit}
              style={{
                padding: '10px 20px',
                backgroundColor: '#28a745',
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
              onClick={handleCancelEdit}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
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
      )}

      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center' }}>
        <div>
          <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Filter by Teacher:</label>
          <select
            value={selectedTeacherId}
            onChange={handleTeacherChange}
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              minWidth: '250px'
            }}
          >
            <option value="">All Teachers</option>
            {teachers.map(teacher => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.fullName} ({teacher.email})
              </option>
            ))}
          </select>
        </div>
        
        {selectedRoutineIds.size > 0 && (
          <button
            onClick={handleBulkDelete}
            style={{
              padding: '8px 15px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🗑️ Delete {selectedRoutineIds.size} Selected
          </button>
        )}
      </div>

      {loading ? (
        <p>Loading routines...</p>
      ) : filteredRoutines.length === 0 ? (
        <p>No routines found.</p>
      ) : (
        <div>
          {/* Timetable View - Separated by Program then Batch */}
          <div style={{ marginBottom: '40px' }}>
            <h2> Visual Timetable View (By Program & Semester)</h2>
            {Object.entries(groupedRoutines).length === 0 ? (
              <p style={{ fontSize: '14px', color: '#666' }}>No routines to display</p>
            ) : (
              Object.entries(groupedRoutines).map(([program, semesterGroups]) => (
                <div key={program} style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f0f7ff', borderRadius: '8px', border: '3px solid #007bff' }}>
                  <h2 style={{ marginTop: '0px', marginBottom: '20px', color: '#004085', fontSize: '18px', fontWeight: 'bold' }}>
                    🎓 {program} Program
                  </h2>
                  {Object.entries(semesterGroups).map(([semester, batchRoutines]) => (
                    <div key={semester} style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #dee2e6' }}>
                      <h3 style={{ marginTop: '0px', marginBottom: '15px', color: '#333', fontSize: '15px', fontWeight: 'bold', borderBottom: '2px solid #28a745', paddingBottom: '8px' }}>
                        📚 {semester}
                      </h3>
                      <RoutineTimetable routines={batchRoutines} />
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>

          {/* Detailed Routine List - Separated by Program then Semester */}
          <div style={{ marginTop: '40px' }}>
            <h2>📋 Detailed Routine List</h2>
            {Object.entries(groupedRoutines).map(([program, semesterGroups]) => (
              <div key={program} style={{ marginBottom: '30px', backgroundColor: '#f0f7ff', padding: '20px', borderRadius: '8px', border: '3px solid #007bff' }}>
                <h2 style={{ marginTop: '0', color: '#004085', fontSize: '18px', fontWeight: 'bold' }}>🎓 {program} Program</h2>
                {Object.entries(semesterGroups).map(([semester, groupRoutines]) => (
                  <div key={semester} style={{ marginBottom: '20px', backgroundColor: 'white', padding: '15px', borderRadius: '6px', border: '1px solid #dee2e6' }}>
                    <h3 style={{ marginTop: '0', marginBottom: '15px', color: '#333', fontSize: '14px', fontWeight: 'bold', borderBottom: '2px solid #28a745', paddingBottom: '8px' }}>
                      📚 {semester}
                    </h3>
                    <div style={{ overflowX: 'auto' }}>
                      <table className='dt-routine-table' style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        backgroundColor: 'white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                            <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', width: '40px' }}>
                              <input
                                type="checkbox"
                                checked={groupRoutines.every(r => selectedRoutineIds.has(r.id)) && groupRoutines.length > 0}
                                onChange={(e) => {
                                  const newSelected = new Set(selectedRoutineIds);
                                  if (e.target.checked) {
                                    groupRoutines.forEach(r => newSelected.add(r.id));
                                  } else {
                                    groupRoutines.forEach(r => newSelected.delete(r.id));
                                  }
                                  setSelectedRoutineIds(newSelected);
                                }}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                              />
                            </th>
                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Teacher</th>
                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Subject</th>
                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Schedule</th>
                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Room</th>
                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Academic Year</th>
                            <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupRoutines.map(routine => (
                            <tr key={routine.id} style={{ borderBottom: '1px solid #dee2e6', backgroundColor: selectedRoutineIds.has(routine.id) ? '#e8f4f8' : 'white' }}>
                              <td style={{ padding: '12px', textAlign: 'center' }}>
                                <input
                                  type="checkbox"
                                  checked={selectedRoutineIds.has(routine.id)}
                                  onChange={() => handleSelectRoutine(routine.id)}
                                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                              </td>
                              <td style={{ padding: '12px', fontWeight: '500', color: '#1976d2' }}>
                                {routine.teacher ? `${routine.teacher.fullName}` : (routine.description || '').split('\n').find(line => line.startsWith('Teacher:'))?.replace('Teacher: ', '') || 'N/A'}
                              </td>
                              <td style={{ padding: '12px' }}>
                                {(routine.description || '').split('\n').find(line => line.startsWith('Subject:'))?.replace('Subject: ', '') || 'N/A'}
                              </td>
                              <td style={{ padding: '12px', fontSize: '12px' }}>
                                <div>
                                  {(routine.description || '').split('\n').find(line => line.startsWith('Day:'))?.replace('Day: ', '') || 'N/A'}
                                </div>
                                <div style={{ color: '#666' }}>
                                  {(routine.description || '').split('\n').find(line => line.startsWith('Time:'))?.replace('Time: ', '') || ''}
                                </div>
                              </td>
                              <td style={{ padding: '12px' }}>
                                {(routine.description || '').split('\n').find(line => line.startsWith('Room:'))?.replace('Room: ', '') || 'N/A'}
                              </td>
                              <td style={{ padding: '12px' }}>
                                {routine.academicYear || 'N/A'}
                              </td>
                              <td style={{ padding: '12px', textAlign: 'center' }}>
                                {/* <button
                                  onClick={() => handleEditClick(routine)}
                                  style={{
                                    padding: '6px 10px',
                                    marginRight: '5px',
                                    backgroundColor: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                  }}
                                >
                                  Edit
                                </button> */}
                                <button
                                  onClick={() => handleDeleteRoutine(routine.id)}
                                  style={{
                                    padding: '6px 10px',
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                  }}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRoutineManagement;
