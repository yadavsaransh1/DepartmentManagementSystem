import api from './api';

export const authService = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  register: (registrationData) => 
    api.post('/auth/register', registrationData),
};

export const studentService = {
  getProfile: () => 
    api.get('/students/profile'),
  
  getStudent: (studentId) => 
    api.get(`/students/${studentId}`),
  
  updateAttendance: (studentId) => 
    api.put(`/students/${studentId}/attendance`),

  getAllStudents: () =>
    api.get('/students'),

  deleteStudent: (studentId) =>
    api.delete(`/students/${studentId}`),
};

export const attendanceService = {
  markAttendance: (attendanceData) => 
    api.post('/attendance/mark', attendanceData),
  
  getStudentAttendance: (studentId, subjectId) => 
    api.get(`/attendance/student/${studentId}/subject/${subjectId}`),
  
  getAttendancePercentage: (studentId, subjectId) => 
    api.get('/attendance/percentage', {
      params: { studentId, subjectId }
    }),
  
  getTeacherRecords: (teacherId, subjectId, startDate, endDate) => 
    api.get(`/attendance/teacher/${teacherId}/subject/${subjectId}`, {
      params: { startDate, endDate }
    }),
};

export const teacherService = {
  getProfile: () => 
    api.get('/teachers/profile'),
  
  getTeacher: (teacherId) => 
    api.get(`/teachers/${teacherId}`),

  getAllTeachers: () =>
    api.get('/teachers'),

  deleteTeacher: (teacherId) =>
    api.delete(`/teachers/${teacherId}`),
};

export const documentService = {
  uploadDocument: (formData) => 
    api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  getPublicDocuments: () => 
    api.get('/documents/public'),

  getAllDocuments: () =>
    api.get('/documents'),
  
  getUserDocuments: () => 
    api.get('/documents/my-documents'),
  
  searchDocuments: (keyword) => 
    api.get('/documents/search', {
      params: { keyword }
    }),

  deleteDocument: (documentId) =>
    api.delete(`/documents/${documentId}`),
};

export const reportService = {
  generateAttendanceReport: (studentId, subjectId) => 
    api.post('/reports/attendance', null, {
      params: { studentId, subjectId }
    }),
  
  generateStudentReport: () => 
    api.post('/reports/student'),
  
  getReportsByType: (reportType) => 
    api.get(`/reports/type/${reportType}`),
  
  getMyReports: () => 
    api.get('/reports/my-reports'),
};
