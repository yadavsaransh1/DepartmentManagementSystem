import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AddMarksModal = ({ onClose, onMarksAdded, type = 'TEACHER' }) => {
  const [programs, setPrograms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [semesters, setSemesters] = useState([]);

  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');

  const [totalMarks, setTotalMarks] = useState('');
  const [obtainedMarks, setObtainedMarks] = useState('');
  const [grade, setGrade] = useState('');
  const [status, setStatus] = useState('Pass');
  const [comments, setComments] = useState('');
  const [examType, setExamType] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [allTeacherSubjects, setAllTeacherSubjects] = useState([]);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      console.log('[AddMarksModal] Fetching programs. User:', user);
      
      // Check if user is ADMIN
      if (user.role === 'ADMIN') {
        console.log('[AddMarksModal] Admin user detected, fetching all programs');
        const response = await api.get('/subjects/unique-programs');
        const allPrograms = Array.isArray(response.data) ? response.data : [];
        console.log('[AddMarksModal] All programs:', allPrograms);
        setPrograms(allPrograms.sort());
        setAllTeacherSubjects([]);  // Clear teacher subjects for admin
      } else {
        // For TEACHER/HOD: fetch teacher subjects which works for TEACHER and HOD
        const teacherIdentifier = user.email;
        console.log('[AddMarksModal] Teacher identifier:', teacherIdentifier);
        
        const response = await api.get(`/subjects/teacher/${teacherIdentifier}`);
        const teacherSubjects = Array.isArray(response.data) ? response.data : [];
        console.log('[AddMarksModal] Teacher subjects:', teacherSubjects);
        setAllTeacherSubjects(teacherSubjects);
        
        // Extract unique programs from teacher's subjects
        const uniquePrograms = [...new Set(teacherSubjects.map(s => s.course).filter(Boolean))];
        console.log('[AddMarksModal] Unique programs:', uniquePrograms);
        setPrograms(uniquePrograms.sort());
      }
    } catch (error) {
      console.error('[AddMarksModal] Error fetching programs:', error);
      setErrorMsg('Failed to load programs');
    }
  };

  const fetchSemestersForProgram = async (program) => {
    if (!program) return;
    try {
      console.log('[AddMarksModal] Fetching semesters for program:', program);
      
      if (user.role === 'ADMIN' || allTeacherSubjects.length === 0) {
        // Admin: Use dedicated API endpoint to get semesters for this program
        console.log('[AddMarksModal] [ADMIN] Calling /subjects/semesters-by-program/{program}');
        try {
          const response = await api.get(`/subjects/semesters-by-program/${program}`);
          const semesterList = Array.isArray(response.data) ? response.data : [];
          console.log('[AddMarksModal] [ADMIN] Semesters from API:', semesterList);
          setSemesters(semesterList.sort((a, b) => parseInt(a) - parseInt(b)));
        } catch (err) {
          console.error('[AddMarksModal] [ADMIN] Error fetching semesters:', err);
          setSemesters([]);
        }
      } else {
        // For TEACHER and HOD: get unique semesters from teacher's subjects for this program
        const programSemesters = [...new Set(allTeacherSubjects
          .filter(s => s.course === program)
          .map(s => s.semester)
          .filter(Boolean)
        )];
        console.log('[AddMarksModal] [TEACHER] Semesters for program', program, ':', programSemesters);
        setSemesters(programSemesters.sort((a, b) => parseInt(a) - parseInt(b)));
      }
    } catch (error) {
      console.error('[AddMarksModal] Error fetching semesters:', error);
    }
  };

  const fetchSubjectsForProgram = async (program, semester) => {
    if (!program || !semester) return;
    try {
      console.log('[AddMarksModal] Fetching subjects for program:', program, 'semester:', semester);
      
      if (user.role === 'ADMIN' || allTeacherSubjects.length === 0) {
        // Admin: fetch subjects for this program and semester from API
        console.log('[AddMarksModal] [ADMIN] Calling /subjects/program/{program}/semester/{semester}');
        const response = await api.get(`/subjects/program/${program}/semester/${semester}`);
        const subjectList = Array.isArray(response.data) ? response.data : [];
        console.log('[AddMarksModal] [ADMIN] Subjects from API:', subjectList.length, subjectList);
        setSubjects(subjectList);
      } else {
        // For TEACHER and HOD: filter teacher's subjects by semester and course
        const filtered = allTeacherSubjects.filter(s => s.semester == semester && s.course === program);
        console.log('[AddMarksModal] [TEACHER] Subjects for program', program, 'semester', semester, ':', filtered);
        setSubjects(filtered);
      }
    } catch (error) {
      console.error('[AddMarksModal] Error fetching subjects:', error);
      setSubjects([]);
    }
  };

  const fetchStudentsForSubject = async (subjectId) => {
    if (!subjectId) {
      console.log('[AddMarksModal] No subject ID, clearing students');
      setStudents([]);
      return;
    }
    try {
      const selectedSubject = subjects.find(s => s.id == subjectId);
      console.log('[AddMarksModal] Selected subject:', selectedSubject);
      if (!selectedSubject) {
        console.log('[AddMarksModal] Subject not found in list');
        setStudents([]);
        return;
      }

      // Fetch all students
      const response = await api.get('/students');
      const allStudents = Array.isArray(response.data) ? response.data : [];
      console.log('[AddMarksModal] Total students fetched:', allStudents.length);
      if (allStudents.length > 0) {
        console.log('[AddMarksModal] Sample student structure:', allStudents[0]);
      }
      
      let filterCriteria = {};
      if (user.role === 'ADMIN' || allTeacherSubjects.length === 0) {
        // Admin: filter by program name AND semester
        filterCriteria = { program: selectedProgram, semester: selectedSemester };
        console.log('[AddMarksModal] [ADMIN] Filtering students by program:', selectedProgram, 'semester:', selectedSemester);
      } else {
        // Teacher: filter by subject's course and semester
        filterCriteria = { course: selectedSubject.course, semester: selectedSubject.semester };
        console.log('[AddMarksModal] [TEACHER] Filtering students by course:', selectedSubject.course, 'semester:', selectedSubject.semester);
      }
      
      // Filter students with flexible matching
      const filteredStudents = allStudents.filter(s => {
        let matches = false;
        
        if (user.role === 'ADMIN' || allTeacherSubjects.length === 0) {
          // Admin: match program AND semester
          const programMatch = 
            s.program?.name === filterCriteria.program || 
            s.program === filterCriteria.program ||
            s.programName === filterCriteria.program;
          const semesterMatch = s.semester == filterCriteria.semester || s.semester === parseInt(filterCriteria.semester);
          matches = programMatch && semesterMatch;
        } else {
          // Teacher: match course and semester
          const courseMatch = s.course === filterCriteria.course;
          const semesterMatch = s.semester == filterCriteria.semester;
          matches = courseMatch && semesterMatch;
        }
        
        if (matches) {
          console.log('[AddMarksModal] Matched student:', s.id, s.fullName || s.studentName, 'program:', s.program, 'semester:', s.semester);
        }
        return matches;
      });
      
      console.log('[AddMarksModal] Filtered students count:', filteredStudents.length);
      setStudents(filteredStudents);
    } catch (error) {
      console.error('[AddMarksModal] Error fetching students for subject:', error);
      setErrorMsg('Failed to load students for selected subject');
      setStudents([]);
    }
  };

  const handleProgramChange = (val) => {
    setSelectedProgram(val);
    setSelectedSemester('');
    setSelectedSubject('');
    setSelectedStudent('');
    setStudents([]);
    setSemesters([]);
    setSubjects([]);
    fetchSemestersForProgram(val);
  };

  const handleSemesterChange = (val) => {
    setSelectedSemester(val);
    setSelectedSubject('');
    setSelectedStudent('');
    setStudents([]);
    if (selectedProgram) {
      fetchSubjectsForProgram(selectedProgram, val);
    }
  };

  const handleSubjectChange = (val) => {
    setSelectedSubject(val);
    setSelectedStudent('');
    if (val) {
      fetchStudentsForSubject(val);
    } else {
      setStudents([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setErrorMsg('');
      if (!selectedStudent || !selectedSubject || !totalMarks || obtainedMarks === '') {
        setErrorMsg('Please fill in all required fields');
        return;
      }

      const totalMarksNum = parseFloat(totalMarks);
      const obtainedMarksNum = parseFloat(obtainedMarks);

      // Prepare payload based on role
      let endpoint = '';
      let payload = {};

      if (type === 'ADMIN') {
        // For admin marks, use the /marks/admin endpoint
        console.log('[AddMarksModal] Admin marks submission');
        
        // Get the selected subject object to extract programId
        const selectedSubjectObj = subjects.find(s => s.id == selectedSubject);
        console.log('[AddMarksModal] Selected subject object:', selectedSubjectObj);
        
        // Extract program ID from subject (assuming subject has programId field)
        const programId = selectedSubjectObj?.programId || selectedSubjectObj?.program?.id;
        console.log('[AddMarksModal] Program ID extracted:', programId);
        
        if (!programId) {
          setErrorMsg('Could not determine program ID. Please select a subject and try again.');
          return;
        }
        
        payload = {
          studentId: selectedStudent,
          programId: programId,
          courseId: selectedSubject,  // Include subject/course
          semesterName: selectedSemester || '1',
          obtainedSemesterMarks: obtainedMarksNum,
          semesterMarks: totalMarksNum,
          totalMarks: totalMarksNum,  // Include total marks
          examType: examType,  // Include exam type
          grade: grade || '',  // Include grade
          comments: comments,
          passingStatus: status || 'PASS'
        };
        endpoint = '/marks/admin';
      } else {
        // For teacher marks, use the /marks/teacher-submission endpoint
        console.log('[AddMarksModal] Teacher marks submission');
        
        payload = {
          studentId: selectedStudent,
          courseId: selectedSubject,
          sessionalMarks: totalMarksNum,      // Total marks available for sessional
          obtainedSessionalMarks: obtainedMarksNum,  // Marks obtained in sessional
          examType: examType,                 // Use what user entered
          grade: grade || '',                 // Include user-entered grade
          comments: comments,
          status: status                      // Include status
        };
        endpoint = '/marks/teacher-submission';
      }

      console.log('[AddMarksModal] Submitting marks to:', endpoint);
      console.log('[AddMarksModal] Payload:', payload);
      const response = await api.post(endpoint, payload);
      console.log('[AddMarksModal] Marks submitted successfully:', response.data);
      alert('Marks added successfully!');
      onMarksAdded();
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to add marks');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '12px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>+ Add Marks</h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>

        {errorMsg && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>{errorMsg}</div>}

        <form onSubmit={handleSubmit}>
          {/* Program */}
          <div style={{ marginBottom: '15px' }}>
            <label>Program *</label>
            <select 
              value={selectedProgram}
              onChange={(e) => handleProgramChange(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
              required
            >
              <option>Select Program</option>
              {programs.map(prog => <option key={prog}>{prog}</option>)}
            </select>
          </div>

          {/* Semester */}
          <div style={{ marginBottom: '15px' }}>
            <label>Semester *</label>
            <select 
              value={selectedSemester}
              onChange={(e) => handleSemesterChange(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
              required
              disabled={!selectedProgram}
            >
              <option>Select Semester</option>
              {semesters.map(sem => <option key={sem}>{sem}</option>)}
            </select>
          </div>

          {/* Subject */}
          <div style={{ marginBottom: '15px' }}>
            <label>Subject *</label>
            <select 
              value={selectedSubject}
              onChange={(e) => handleSubjectChange(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
              required
            >
              <option>Select Subject</option>
              {subjects.map(subj => (
                <option key={subj.id} value={subj.id}>{subj.subjectName}</option>
              ))}
            </select>
          </div>

          {/* Student */}
          <div style={{ marginBottom: '15px' }}>
            <label>Student *</label>
            <select 
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
              required
            >
              <option>Select Student</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.fullName} ({student.studentId})
                </option>
              ))}
            </select>
          </div>

          {/* Exam Type */}
          <div style={{ marginBottom: '15px' }}>
            <label>Exam Type</label>
            <input 
              type="text"
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
              placeholder="e.g., Midterm, Final, Quiz, Assignment"
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>

          {/* Total Marks */}
          <div style={{ marginBottom: '15px' }}>
            <label>Total Marks *</label>
            <input 
              type="number"
              value={totalMarks}
              onChange={(e) => setTotalMarks(e.target.value)}
              placeholder="Max marks"
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
              required
            />
          </div>

          {/* Obtained Marks */}
          <div style={{ marginBottom: '15px' }}>
            <label>Obtained Marks *</label>
            <input 
              type="number"
              value={obtainedMarks}
              onChange={(e) => setObtainedMarks(e.target.value)}
              placeholder="Student's marks"
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
              required
            />
          </div>

          {/* Grade */}
          <div style={{ marginBottom: '15px' }}>
            <label>Grade</label>
            <input 
              type="text"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="e.g., A, B, C"
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>

          {/* Status */}
          <div style={{ marginBottom: '15px' }}>
            <label>Status</label>
            <select 
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option>Pass</option>
              <option>Fail</option>
            </select>
          </div>

          {/* Comments */}
          <div style={{ marginBottom: '20px' }}>
            <label>Comments</label>
            <textarea 
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add any comments or observations"
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', minHeight: '80px' }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button 
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                background: '#ff3737',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button 
              type="submit"
              style={{
                padding: '10px 20px',
                borderRadius: '4px',
                border: 'none',
                background: '#3b82f6',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Add Marks
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMarksModal;
