import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AcademicDocumentUpload = () => {
  const [uploadType, setUploadType] = useState('student'); // 'student' or 'teacher'
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('ACADEMIC');
  const [otherCategoryValue, setOtherCategoryValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const documentCategories = [
    { value: 'ACADEMIC', label: '📚 Academic Document' },
    { value: 'ADMISSION', label: '📋 Admission Document' },
    { value: 'CERTIFICATE', label: '🏆 Certificate' },
    { value: 'RESULT', label: '📊 Result/Transcript' },
    { value: 'IDENTITY', label: '🆔 Identity Proof' },
    { value: 'OTHER', label: '📄 Other' }
  ];

  // Fetch programs, students, and teachers on mount
  useEffect(() => {
    fetchPrograms();
    fetchStudents();
    fetchTeachers();
  }, []);

  // Filter students based on selected program and semester
  useEffect(() => {
    if (uploadType === 'student' && selectedProgram && selectedSemester) {
      const filtered = students.filter(student => 
        student.program === selectedProgram && 
        student.semester === parseInt(selectedSemester)
      );
      setFilteredStudents(filtered);
      setSelectedStudent('');
    } else {
      setFilteredStudents([]);
    }
  }, [selectedProgram, selectedSemester, students, uploadType]);

  // Generate semester options based on selected program
  useEffect(() => {
    if (selectedProgram) {
      const program = programs.find(p => p.name === selectedProgram || p.id === selectedProgram);
      if (program) {
        const semesterCount = program.semesterCount || 8;
        const sems = [];
        for (let i = 1; i <= semesterCount; i++) {
          sems.push(i);
        }
        setSemesters(sems);
        setSelectedSemester('');
      }
    } else {
      setSemesters([]);
      setSelectedSemester('');
    }
  }, [selectedProgram, programs]);

  const fetchPrograms = async () => {
    try {
      const response = await api.get('/programs');
      setPrograms(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching programs:', err);
      setPrograms([]);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students');
      const studentsData = Array.isArray(response.data) ? response.data : [];
      console.log('=== STUDENTS FETCHED ===');
      console.log('Total students:', studentsData.length);
      studentsData.slice(0, 3).forEach(s => {
        console.log(`Student: ${s.fullName}`, {
          id: s.id,
          userId: s.userId,
          email: s.user?.email || s.email,
          studentId: s.studentId,
          program: s.program,
          semester: s.semester
        });
      });
      setStudents(studentsData);
    } catch (err) {
      console.error('Error fetching students:', err);
      setStudents([]);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await api.get('/teachers');
      const teachersData = Array.isArray(response.data) ? response.data : [];
      console.log('=== TEACHERS FETCHED ===');
      console.log('Total teachers:', teachersData.length);
      teachersData.slice(0, 3).forEach(t => {
        console.log(`Teacher: ${t.fullName}`, {
          id: t.id,
          userId: t.userId,
          email: t.user?.email || t.email,
          designation: t.designation
        });
      });
      setTeachers(teachersData);
    } catch (err) {
      console.error('Error fetching teachers:', err);
      setTeachers([]);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    const selectedId = uploadType === 'student' ? selectedStudent : selectedTeacher;
    
    if (!selectedId || !file || !title) {
      setError(`Please select a ${uploadType}, enter title, and choose a file`);
      return;
    }

    if (selectedId.trim() === '') {
      setError(`${uploadType.charAt(0).toUpperCase() + uploadType.slice(1)} email is empty. Please select a valid ${uploadType}.`);
      return;
    }

    console.log('=== DOCUMENT UPLOAD ===');
    console.log('Upload Type:', uploadType);
    console.log('Selected User Email:', selectedId);
    console.log('Email is valid:', selectedId.includes('@'));
    console.log('Title:', title);
    console.log('Category:', category);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);
    formData.append('otherCategoryValue', otherCategoryValue);
    formData.append('description', description);
    formData.append('file', file);
    formData.append('visibility', 'PRIVATE');
    formData.append('allowedUserEmails', selectedId);
    
    console.log('FormData entries:');
    for (let [key, value] of formData.entries()) {
      if (key !== 'file') {
        console.log(`  ${key}: [${value}]`);
      }
    }

    setLoading(true);
    try {
      setError('');
      setSuccess('');
      
      const response = await api.post('/documents/upload', formData);

      if (response.status === 200 || response.status === 201) {
        console.log('Upload successful, response:', response.data);
        setSuccess(`Document "${title}" uploaded successfully!`);
        setTitle('');
        setDescription('');
        setFile(null);
        setOtherCategoryValue('');
        setSelectedStudent('');
        setSelectedTeacher('');
        setSelectedProgram('');
        setSelectedSemester('');
        
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Error uploading document:', err);
      setError('Failed to upload document: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="management-container">
      <h1>Upload Document</h1>
      
      <div style={{marginBottom: '30px', padding: '20px', backgroundColor: '#f0f8ff', borderRadius: '8px', border: '1px solid #b3d9ff'}}>
        <h3 style={{marginTop: 0, marginBottom: '15px', color: '#1976d2'}}>Upload for:</h3>
        <div style={{display: 'flex', gap: '15px'}}>
          <label style={{display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px'}}>
            <input 
              type="radio" 
              name="uploadType" 
              value="student" 
              checked={uploadType === 'student'}
              onChange={(e) => {
                setUploadType(e.target.value);
                setSelectedStudent('');
                setSelectedTeacher('');
                setSelectedProgram('');
                setSelectedSemester('');
              }}
            />
            <span style={{fontWeight: 'bold'}}>👨‍🎓 Student Document</span>
          </label>
          <label style={{display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px'}}>
            <input 
              type="radio" 
              name="uploadType" 
              value="teacher" 
              checked={uploadType === 'teacher'}
              onChange={(e) => {
                setUploadType(e.target.value);
                setSelectedStudent('');
                setSelectedTeacher('');
                setSelectedProgram('');
                setSelectedSemester('');
              }}
            />
            <span style={{fontWeight: 'bold'}}>👨‍🏫 Teacher Document</span>
          </label>
        </div>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fee',
          color: '#c33',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '15px',
          borderLeft: '4px solid #c33'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          backgroundColor: '#efe',
          color: '#3c3',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '15px',
          borderLeft: '4px solid #3c3'
        }}>
          ✓ {success}
        </div>
      )}

      <form onSubmit={handleUpload} style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        maxWidth: '800px'
      }}>
        <div style={{display: 'grid', gap: '15px'}}>
          
          {/* Selection for Student - Program, Semester, Student */}
          {uploadType === 'student' && (
            <>
              <div>
                <label style={{fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#333'}}>
                  Select Program *
                </label>
                <select
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    backgroundColor: '#fff'
                  }}
                >
                  <option value="">-- Select a Program --</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.name || program.id}>
                      {program.name || program.programName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#333'}}>
                  Select Semester *
                </label>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  disabled={!selectedProgram}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    backgroundColor: selectedProgram ? '#fff' : '#f5f5f5',
                    cursor: selectedProgram ? 'pointer' : 'not-allowed',
                    opacity: selectedProgram ? 1 : 0.6
                  }}
                >
                  <option value="">-- Select a Semester --</option>
                  {semesters.map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#333'}}>
                  Select Student *
                </label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  disabled={!selectedProgram || !selectedSemester}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    backgroundColor: (selectedProgram && selectedSemester) ? '#fff' : '#f5f5f5',
                    cursor: (selectedProgram && selectedSemester) ? 'pointer' : 'not-allowed',
                    opacity: (selectedProgram && selectedSemester) ? 1 : 0.6
                  }}
                >
                  <option value="">-- Select a Student --</option>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <option key={student.id} value={student.email || ''}>
                        {student.fullName} ({student.studentId})
                        {student.fullName} ({student.studentId})
                      </option>
                    ))
                  ) : (
                    <option disabled>No students found for this program and semester</option>
                  )}
                </select>
              </div>
            </>
          )}

          {/* Selection for Teacher */}
          {uploadType === 'teacher' && (
            <div>
              <label style={{fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#333'}}>
                Select Teacher *
              </label>
              <select
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: '#fff'
                }}
              >
                <option value="">-- Select a Teacher --</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.email || ''}>
                    {teacher.fullName} ({teacher.designation})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title */}
          <div>
            <label style={{fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#333'}}>
              Document Title *
            </label>
            <input
              type="text"
              placeholder="e.g., Admission Certificate, Academic Record"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#333'}}>
              Description (Optional)
            </label>
            <textarea
              placeholder="Add any additional details about this document"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Category */}
          <div>
            <label style={{fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#333'}}>
              Category
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                if (e.target.value !== 'OTHER') {
                  setOtherCategoryValue('');
                }
              }}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: '#fff'
              }}
            >
              {documentCategories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Other Category Input */}
          {category === 'OTHER' && (
            <div>
              <label style={{fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#333'}}>
                Please Specify *
              </label>
              <input
                type="text"
                placeholder="e.g., Medical Certificate, Leave Application"
                value={otherCategoryValue}
                onChange={(e) => setOtherCategoryValue(e.target.value)}
                required={category === 'OTHER'}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: category === 'OTHER' && !otherCategoryValue ? '2px solid #d32f2f' : '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: '#fff'
                }}
              />
            </div>
          )}

          {/* File Upload */}
          <div>
            <label style={{fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#333'}}>
              Choose File *
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              required
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
              style={{
                width: '100%',
                padding: '10px',
                border: '2px dashed #667eea',
                borderRadius: '4px',
                backgroundColor: '#f0f8ff',
                cursor: 'pointer'
              }}
            />
            {file && (
              <small style={{color: '#666', marginTop: '5px', display: 'block'}}>
                ✓ File selected: {file.name}
              </small>
            )}
            <small style={{color: '#999', display: 'block', marginTop: '8px'}}>
              Supported formats: PDF, DOC, DOCX, JPG, PNG, XLS, XLSX (Max 10MB)
            </small>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? '⏳ Uploading...' : 'Upload Document'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AcademicDocumentUpload;
