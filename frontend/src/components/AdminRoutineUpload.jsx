import React, { useState } from 'react';
import { apiGet, apiPost, apiDelete, apiFetch } from '../utils/apiClient';
import '../styles/AdminRoutineUpload.css';

const AdminRoutineUpload = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [uploadType, setUploadType] = useState('syllabus'); // 'syllabus' or 'excel'
  const [formData, setFormData] = useState({
    file: null,
    subjectId: '',
    program: '',
    semester: '',
    description: ''
  });
  const [allSubjects, setAllSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [programsList, setProgramsList] = useState([]);
  const [semestersList, setSemestersList] = useState([]);
  const [excelFile, setExcelFile] = useState(null);
  const [routines, setRoutines] = useState([]);
  const [syllabi, setSyllabi] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState('');
  const [selectedPdfName, setSelectedPdfName] = useState('');

  React.useEffect(() => {
    fetchSubjects();
    fetchSyllabi();
  }, []);

  React.useEffect(() => {
    // Update semesters when program changes
    if (formData.program) {
      const semesters = [...new Set(
        allSubjects
          .filter(s => (s.programName || s.course) === formData.program)
          .map(s => String(s.semester))
          .filter(Boolean)
      )].sort((a, b) => parseInt(a) - parseInt(b));
      setSemestersList(semesters);
      setFormData(prev => ({ ...prev, semester: '', subjectId: '' }));
    } else {
      setSemestersList([]);
    }
  }, [formData.program, allSubjects]);

  React.useEffect(() => {
    // Update subjects when program and semester change
    if (formData.program && formData.semester) {
      const subjects = allSubjects.filter(s => 
        (s.programName || s.course) === formData.program && 
        String(s.semester) === formData.semester
      );
      setFilteredSubjects(subjects);
      setFormData(prev => ({ ...prev, subjectId: '' }));
    } else {
      setFilteredSubjects([]);
    }
  }, [formData.program, formData.semester, allSubjects]);

  const fetchSubjects = async () => {
    try {
      const response = await apiFetch('/api/subjects', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAllSubjects(Array.isArray(data) ? data : []);
        // Extract unique programs
        const programs = [...new Set(data.map(s => s.programName || s.course).filter(Boolean))];
        setProgramsList(programs.sort());
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchSyllabi = async () => {
    try {
      const response = await apiFetch('/api/syllabus/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSyllabi(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching syllabi:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        setMessage('File size exceeds 50MB limit');
        setMessageType('error');
        return;
      }
      setFormData(prev => ({
        ...prev,
        file: file
      }));
    }
  };

  const handleExcelFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        setMessage('File size exceeds 50MB limit');
        setMessageType('error');
        return;
      }
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        setMessage('Please select a valid Excel file (.xlsx or .xls)');
        setMessageType('error');
        return;
      }
      setExcelFile(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!formData.file) {
      setMessage('Please select a file');
      setMessageType('error');
      return;
    }

    if (!formData.subjectId) {
      setMessage('Please select a subject');
      setMessageType('error');
      return;
    }

    if (!formData.program) {
      setMessage('Please select a program');
      setMessageType('error');
      return;
    }

    setLoading(true);
    const uploadFormData = new FormData();
    uploadFormData.append('file', formData.file);
    uploadFormData.append('subjectId', formData.subjectId);
    uploadFormData.append('program', formData.program);
    uploadFormData.append('semester', formData.semester);
    uploadFormData.append('description', formData.description);

    try {
      const response = await apiFetch('/api/syllabus/upload', {
        method: 'POST',
        body: uploadFormData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const newSyllabus = await response.json();
        setMessage('Syllabus uploaded successfully');
        setMessageType('success');
        setFormData({
          file: null,
          subjectId: '',
          program: '',
          semester: '',
          description: ''
        });
        document.getElementById('syllabusFile').value = '';
        fetchSyllabi(); // Refresh the syllabi list
      } else {
        try {
          const errorData = await response.json();
          setMessage(`Error: ${errorData.message || 'Failed to upload syllabus'}`);
        } catch {
          setMessage(`Upload failed with status ${response.status}`);
        }
        setMessageType('error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('Error uploading routine');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleExcelUpload = async (e) => {
    e.preventDefault();
    
    if (!excelFile) {
      setMessage('Please select an Excel file');
      setMessageType('error');
      return;
    }

    // Validate file size
    if (excelFile.size === 0) {
      setMessage('Selected file is empty. Please choose a valid Excel file.');
      setMessageType('error');
      return;
    }

    setLoading(true);
    const uploadFormData = new FormData();
    uploadFormData.append('file', excelFile);

    try {
      const token = localStorage.getItem('token');
      console.log('Uploading Excel file:', excelFile.name, 'Size:', excelFile.size, 'Token:', token ? 'Present' : 'Missing');
      
      const fetchOptions = {
        method: 'POST',
        body: uploadFormData
      };
      
      if (token) {
        fetchOptions.headers = {
          'Authorization': `Bearer ${token}`
        };
      }
      
      const response = await apiFetch('/api/routines/upload-excel', fetchOptions);

      if (response.ok) {
        const result = await response.json();
        setMessage(`Success: ${result.message}`);
        setMessageType('success');
        setExcelFile(null);
        // Reset file input
        const excelInput = document.getElementById('excelFile');
        if (excelInput) excelInput.value = '';
        // Refresh routines
        // You can add a fetch to refresh routines list here if needed
      } else {
        let errorMessage = `Upload failed with status ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          console.error('Server error response:', errorData);
        } catch (parseError) {
          console.error('Could not parse error response:', parseError);
          const textError = await response.text();
          console.error('Raw response:', textError);
        }
        setMessage(`Error: ${errorMessage}`);
        setMessageType('error');
      }
    } catch (error) {
      console.error('Excel upload error:', error);
      setMessage('Error uploading Excel file: ' + error.message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (routineId, fileName) => {
    try {
      const response = await apiFetch(`/api/routines/${routineId}/download`, {
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

  const handleDelete = async (routineId) => {
    if (!window.confirm('Are you sure you want to delete this routine?')) return;

    try {
      const response = await apiFetch(`/api/routines/${routineId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setRoutines(prev => prev.filter(r => r.id !== routineId));
        setMessage('Routine deleted successfully');
        setMessageType('success');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setMessage('Error deleting routine');
      setMessageType('error');
    }
  };

  const downloadExcelTemplate = () => {
    // Create sample Excel data as CSV (can be opened in Excel)
    const templateData = [
      ['TeacherName', 'Email', 'Subject', 'Course', 'Semester', 'Day', 'StartTime', 'Room', 'EndTime', 'Notes'],
      ['Prof. Kumar', 'prof.kumar@university.com', 'Database Management', 'BCA', '6', 'Monday', '09:30', 'A101', '10:30', 'Single 1-hour class'],
      ['Prof. Singh', 'prof.singh@university.com', 'Lab: Python Programming', 'BCA', '6', 'Monday', '14:00', 'LAB1', '16:00', 'Multi-hour class (2 hours total)'],
      ['Prof. Sharma', 'prof.sharma@university.com', 'Data Structures', 'BCA', '6', 'Tuesday', '0930', 'A102', '10-30', 'Format: 0930 and 10-30 also work'],
      ['Prof. Patel', 'prof.patel@university.com', 'Web Development', 'MCA', '2', 'Wednesday', '09.30', 'A201', '11.00', 'Format: 09.30 and 11.00 also work'],
    ];

    // Convert to CSV format
    const csvContent = templateData
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'Routine_Template_Sample.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setMessage('Excel template downloaded! Open in Excel and save as .xlsx format');
    setMessageType('success');
  };

  const handleViewSyllabus = (syllabusId, fileName) => {
    // Create a blob URL for viewing without downloading
    apiFetch(`/api/syllabus/${syllabusId}/download`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(response => response.blob())
    .then(blob => {
      const blobUrl = URL.createObjectURL(blob);
      setSelectedPdfUrl(blobUrl);
      setSelectedPdfName(fileName);
      setShowPdfModal(true);
    })
    .catch(error => {
      console.error('Error fetching PDF:', error);
      setMessage('Error loading PDF');
      setMessageType('error');
    });
  };

  const handleDownloadSyllabus = async (syllabusId, fileName) => {
    try {
      const response = await apiFetch(`/api/syllabus/${syllabusId}/download`, {
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
      setMessage('Error downloading syllabus');
      setMessageType('error');
    }
  };

  const handleDeleteSyllabus = async (syllabusId) => {
    if (!window.confirm('Are you sure you want to delete this syllabus?')) return;

    try {
      const response = await apiFetch(`/api/syllabus/${syllabusId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setSyllabi(prev => prev.filter(s => s.id !== syllabusId));
        setMessage('Syllabus deleted successfully');
        setMessageType('success');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Delete error:', error);
      setMessage('Error deleting syllabus');
      setMessageType('error');
    }
  };

  return (
    <div className="admin-routine-container">
      <h2>Upload Routine / Curriculum</h2>
      
      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      {/* Upload Type Tabs */}
      <div className="upload-type-tabs">
        <button
          className={`tab-btn ${uploadType === 'syllabus' ? 'active' : ''}`}
          onClick={() => { setUploadType('syllabus'); setMessage(''); }}
          disabled={loading}
        >
          📚 Upload Syllabus
        </button>
        <button
          className={`tab-btn ${uploadType === 'excel' ? 'active' : ''}`}
          onClick={() => { setUploadType('excel'); setMessage(''); }}
          disabled={loading}
        >
          📊 Upload Routine (Excel)
        </button>
      </div>

      {/* Syllabus Upload Form */}
      {uploadType === 'syllabus' && (
        <form onSubmit={handleUpload} className="routine-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="program">Program *</label>
              <select
                id="program"
                value={formData.program}
                onChange={(e) => setFormData(prev => ({ ...prev, program: e.target.value }))}
                disabled={loading}
                required
              >
                <option value="">-- Select Program --</option>
                {programsList.map(prog => (
                  <option key={prog} value={prog}>{prog}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="semester">Semester {!formData.program && '(Select Program first)'} *</label>
              <select
                id="semester"
                value={formData.semester}
                onChange={(e) => setFormData(prev => ({ ...prev, semester: e.target.value }))}
                disabled={!formData.program || loading}
                required
              >
                <option value="">-- Select Semester --</option>
                {semestersList.map(sem => (
                  <option key={sem} value={sem}>{sem}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="subjectId">Subject {!formData.semester && '(Select Semester first)'} *</label>
            <select
              id="subjectId"
              value={formData.subjectId}
              onChange={(e) => setFormData(prev => ({ ...prev, subjectId: e.target.value }))}
              disabled={!formData.semester || loading}
              required
            >
              <option value="">-- Select Subject --</option>
              {filteredSubjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.subjectName} ({subject.subjectCode})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="syllabusFile">Select PDF Syllabus File *</label>
            <input
              type="file"
              id="syllabusFile"
              accept=".pdf"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  if (file.size > 50 * 1024 * 1024) {
                    setMessage('File size exceeds 50MB limit');
                    setMessageType('error');
                    return;
                  }
                  setFormData(prev => ({ ...prev, file }));
                }
              }}
              disabled={loading}
              required
            />
            {formData.file && <p className="file-name">Selected: {formData.file.name}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description (Optional)</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Add any additional notes about this syllabus"
              rows="3"
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-upload">
            {loading ? 'Uploading...' : 'Upload Syllabus'}
          </button>
        </form>
      )}

      {/* Excel Upload Form */}
      {uploadType === 'excel' && (
        <form onSubmit={handleExcelUpload} className="routine-form excel-form">
          <div className="excel-info">
            <h4>📋 Excel Format Requirements</h4>
            <p>Your Excel file should have the following columns (in order):</p>
            <ul>
              <li><strong>Column A:</strong> Teacher Name (e.g., "Dr. John Smith")</li>
              <li><strong>Column B:</strong> Email (e.g., "john@university.com")</li>
              <li><strong>Column C:</strong> Subject (e.g., "Data Structures" or "Database Management")</li>
              <li><strong>Column D:</strong> Course (e.g., "BCS" or "BCA")</li>
              <li><strong>Column E:</strong> Semester (e.g., "1" or "6")</li>
              <li><strong>Column F:</strong> Day (e.g., "Monday", "Tuesday", etc.)</li>
              <li><strong>Column G:</strong> Start Time (e.g., "09:30" or "9:30" or "0930")</li>
              <li><strong>Column H:</strong> Room (e.g., "Lab-101")</li>
              <li><strong>Column I:</strong> End Time (e.g., "10:30" or "10.30") - REQUIRED. If left empty, defaults to 1 hour after start time</li>
              <li><strong>Column J:</strong> Notes (optional)</li>
            </ul>
            <div className="excel-tips">
              <h5>💡 Tips for Successful Import:</h5>
              <ul>
                <li><strong>Multi-Hour Classes (IMPORTANT!):</strong> Use a SINGLE row with Start Time and End Time. For a 2-hour class from 14:00-16:00, use: StartTime="14:00", EndTime="16:00". They will automatically merge into one tall cell in the timetable.</li>
                <li><strong>Single-Hour Classes:</strong> Use StartTime="09:30" and EndTime="10:30" (1-hour duration). EndTime can be left empty to default to 1 hour after start.</li>
                <li><strong>Time Flexibility:</strong> Times support 5 formats: 09:30, 9:30, 0930, 09-30, 09.30</li>
                <li><strong>Teacher Email:</strong> Must exist in the system before uploading</li>
                <li><strong>Validation:</strong> End time must be after start time; hour must be 0-23 (24-hour format); minutes must be 0-59</li>
              </ul>
            </div>
            <p className="note">⚠️ Make sure teacher email exists in the system before uploading.</p>
          </div>

          <div className="form-group">
            <label htmlFor="excelFile">Select Excel File (.xlsx or .xls) *</label>
            <div className="file-input-wrapper">
              <input
                type="file"
                id="excelFile"
                accept=".xlsx,.xls"
                onChange={handleExcelFileChange}
                disabled={loading}
              />
              <button 
                type="button" 
                className="btn-download-template"
                onClick={downloadExcelTemplate}
                disabled={loading}
                title="Download sample Excel template"
              >
                📥 Download Template
              </button>
            </div>
            {excelFile && <p className="file-name">Selected: {excelFile.name}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn-upload">
            {loading ? 'Processing Excel...' : 'Upload & Import Routines'}
          </button>
        </form>
      )}

      <div className="routines-section">
        <h3>{uploadType === 'syllabus' ? '📚 Uploaded Syllabus' : 'Uploaded Routines'}</h3>
        {(uploadType === 'syllabus' ? syllabi : routines).length === 0 ? (
          <p className="no-data">No {uploadType === 'syllabus' ? 'syllabus' : 'routines'} uploaded yet</p>
        ) : (
          <div className="routines-grid">
            {uploadType === 'syllabus' ? (
              // Syllabus List
              syllabi.map(syllabus => (
                <div key={syllabus.id} className="routine-card">
                  <div className="routine-header">
                    <h4>📄 {syllabus.subjectName}</h4>
                    <span className="semester-badge">{syllabus.program} - Sem {syllabus.semester}</span>
                  </div>
                  <p className="routine-meta">
                    <strong>Course Code:</strong> {syllabus.subjectCode}
                  </p>
                  <p className="routine-meta">
                    <strong>File:</strong> {syllabus.fileName}
                  </p>
                  <p className="routine-meta">
                    <strong>File Size:</strong> {(syllabus.fileSize / 1024).toFixed(2)} KB
                  </p>
                  <p className="routine-meta">
                    <strong>Uploaded By:</strong> {syllabus.uploadedByName}
                  </p>
                  <p className="routine-meta">
                    <strong>Uploaded:</strong> {new Date(syllabus.uploadedAt).toLocaleDateString()}
                  </p>
                  {syllabus.description && (
                    <p className="routine-description">{syllabus.description}</p>
                  )}
                  <div className="routine-actions">
                    <button 
                      onClick={() => handleDownloadSyllabus(syllabus.id, syllabus.fileName)}
                      className="btn-action btn-download"
                      title="Download PDF"
                    >
                       Download
                    </button>
                    <button 
                      onClick={() => handleDeleteSyllabus(syllabus.id)}
                      className="btn-action btn-delete"
                      title="Delete syllabus"
                    >
                       Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              // Routines List
              routines.map(routine => (
                <div key={routine.id} className="routine-card">
                  <div className="routine-header">
                    <h4>{routine.fileName}</h4>
                    <span className="semester-badge">{routine.semester}</span>
                  </div>
                  <p className="routine-meta">
                    <strong>Academic Year:</strong> {routine.academicYear}
                  </p>
                  {routine.description && (
                    <p className="routine-description">{routine.description}</p>
                  )}
                  <p className="routine-meta">
                    <strong>File Size:</strong> {(routine.fileSize / 1024).toFixed(2)} KB
                  </p>
                  <p className="routine-meta">
                    <strong>Downloads:</strong> {routine.downloadCount}
                  </p>
                  <p className="routine-meta">
                    <strong>Uploaded:</strong> {routine.createdAt}
                  </p>
                  <div className="routine-actions">
                    <button 
                      onClick={() => handleDownload(routine.id, routine.fileName)}
                      className="btn-action btn-download"
                    >
                      Download
                    </button>
                    <button 
                      onClick={() => handleDelete(routine.id)}
                      className="btn-action btn-delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

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

export default AdminRoutineUpload;
