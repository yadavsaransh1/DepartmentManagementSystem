import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DocumentUpload from './DocumentUpload';
import StudentManagement from './StudentManagement';
import TeacherManagement from './TeacherManagement';
import SubjectManagement from './SubjectManagement';
import AdminAttendanceReport from './AdminAttendanceReport';
import AdminStudentAttendanceReport from './AdminStudentAttendanceReport';
import AdminRoutineUpload from '../components/AdminRoutineUpload';
import AdminRoutineManagement from './AdminRoutineManagement';
import AdminDocumentsView from '../components/AdminDocumentsView';
import NotificationCenter from '../components/NotificationCenter';
import AssignmentManagement from './AssignmentManagement';
import BulkSemesterUpdate from './BulkSemesterUpdate';
import AlumniManagement from './AlumniManagement';
import { AdminCommittee } from './AdminCommittee';
import { AdminProject } from './AdminProject';
import { FileLocationManagement } from './FileLocationManagement';
import { StudentDetailsView } from './StudentDetailsView';
import { AdminTeacherFeedback } from './AdminTeacherFeedback';
import AcademicDocumentUpload from './AcademicDocumentUpload';
import AdminMarksManagement from './AdminMarksManagement';
import ChangePasswordModal from './ChangePasswordModal';
import { PhiChat } from '../components/PhiChat';
import AdminTeacherDetails from '../components/AdminTeacherDetails';
import AdminPasswordReset from './AdminPasswordReset';
import AdminPower from './AdminPower';
import HomePageManagement from './HomePageManagement';
import '../styles/dashboard.css';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [currentView, setCurrentView] = useState('homePageManagement');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPhiChat, setShowPhiChat] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/'; // Redirect to home page
  };

  // Close sidebar on view change (for mobile)
  const handleViewChange = (view) => {
    setCurrentView(view);
    setSidebarOpen(false);
  };

  const renderContent = () => {
    switch(currentView) {
      case 'students':
        return <StudentManagement />;
      case 'teachers':
        return <TeacherManagement />;
      case 'subjects':
        return <SubjectManagement />;
      case 'attendance':
        return <AdminAttendanceReport />;
      case 'studentStats':
        return <AdminStudentAttendanceReport />;
      case 'documents':
        return <DocumentUpload />;
      case 'routines':
        return <AdminRoutineUpload />;
      case 'routineManagement':
        return <AdminRoutineManagement />;
      case 'notifications':
        return <NotificationCenter />;
      case 'assignments':
        return <AssignmentManagement />;
      case 'adminMarksManagement':
        return <AdminMarksManagement />;
      case 'alumni':
        return <AlumniManagement />;
      case 'committee':
        return <AdminCommittee />;
      case 'project':
        return <AdminProject />;
      case 'fileLocation':
        return <FileLocationManagement />;
      case 'studentDetails':
        return <StudentDetailsView />;
      case 'teacherDetails':
        return <AdminTeacherDetails />;
      case 'teacherPerformance':
        return <AdminTeacherFeedback />;
      case 'bulkSemesterUpdate':
        return <BulkSemesterUpdate />;
      case 'academicDocumentUpload':
        return <AcademicDocumentUpload />;
      case 'documentsView':
        return <AdminDocumentsView />;
      case 'passwordReset':
        return <AdminPasswordReset />;
      case 'adminPower':
        return <AdminPower />;
      case 'homePageManagement':
        return <HomePageManagement />;
      default:
        return <StudentManagement />;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <h1 className="mobile-title">Department Management System</h1>
            <button 
              className="menu-btn"
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>

        </div>
        <nav>
          <span>Welcome, {user?.fullName}</span>
          <button className="desktop-logout-btn" onClick={handleLogout}>Logout</button>
        </nav>
      </div>
      {sidebarOpen && (
        <div 
          className="overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className="dashboard">
        <div className={`sidebar ${sidebarOpen ? 'open' : 'mobile-hidden'}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', gap: '10px' }}>
            <button 
              className="close-btn"
              onClick={() => setSidebarOpen(false)}
              style={{ marginBottom: 0, float: 'none' }}
            >
              ✕
            </button>
            <button 
              className="mobile-logout-btn"
              onClick={handleLogout}
              style={{ backgroundColor: '#dc3545', color: 'white', cursor: 'pointer', border: 'none', padding: '8px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', flex: 1 }}
            >
              Logout
            </button>
          </div>
          <nav>
            <button 
              className={`nav-btn ${currentView === 'homePageManagement' ? 'active' : ''}`}
              onClick={() => handleViewChange('homePageManagement')}
            >
               Home Page
            </button>
            <button 
              className={`nav-btn ${currentView === 'students' ? 'active' : ''}`}
              onClick={() => handleViewChange('students')}
            >
              Students
            </button>
            <button 
              className={`nav-btn ${currentView === 'teachers' ? 'active' : ''}`}
              onClick={() => handleViewChange('teachers')}
            >
              Teachers
            </button>
            <button 
              className={`nav-btn ${currentView === 'subjects' ? 'active' : ''}`}
              onClick={() => handleViewChange('subjects')}
            >
              Courses
            </button>
            <button 
              className={`nav-btn ${currentView === 'attendance' ? 'active' : ''}`}
              onClick={() => handleViewChange('attendance')}
            >
              Attendance
            </button>
            <button 
              className={`nav-btn ${currentView === 'studentStats' ? 'active' : ''}`}
              onClick={() => handleViewChange('studentStats')}
            >
              Student Statistics
            </button>
            <button 
              className={`nav-btn ${currentView === 'documents' ? 'active' : ''}`}
              onClick={() => handleViewChange('documents')}
            >
              Study Material
            </button>
            <button 
              className={`nav-btn ${currentView === 'routines' ? 'active' : ''}`}
              onClick={() => handleViewChange('routines')}
            >
              Routines & Syllabus
            </button>
            <button 
              className={`nav-btn ${currentView === 'routineManagement' ? 'active' : ''}`}
              onClick={() => handleViewChange('routineManagement')}
            >
              Manage Routines
            </button>
            <button 
              className={`nav-btn ${currentView === 'notifications' ? 'active' : ''}`}
              onClick={() => handleViewChange('notifications')}
            >
              Notifications
            </button>
            <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #ddd' }} />
            <div style={{ padding: '10px', fontSize: '12px', color: '#666', fontWeight: '600' }}>ACADEMIC OPERATIONS</div>
            <button 
              className={`nav-btn ${currentView === 'academicDocumentUpload' ? 'active' : ''}`}
              onClick={() => handleViewChange('academicDocumentUpload')}
            >
               Document Upload
            </button>
            <button 
              className={`nav-btn ${currentView === 'documentsView' ? 'active' : ''}`}
              onClick={() => handleViewChange('documentsView')}
            >
               View Documents
            </button>
            <button 
              className={`nav-btn ${currentView === 'bulkSemesterUpdate' ? 'active' : ''}`}
              onClick={() => handleViewChange('bulkSemesterUpdate')}
            >
               Bulk Semester Update
            </button>
            <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #ddd' }} />
            <div style={{ padding: '10px', fontSize: '12px', color: '#666', fontWeight: '600' }}>ADDITIONAL FEATURES</div>
            <button 
              className={`nav-btn ${currentView === 'assignments' ? 'active' : ''}`}
              onClick={() => handleViewChange('assignments')}
            >
              Assignments
            </button>
            <button 
              className={`nav-btn ${currentView === 'adminMarksManagement' ? 'active' : ''}`}
              onClick={() => handleViewChange('adminMarksManagement')}
            >
              Marks
            </button>
            <button 
              className={`nav-btn ${currentView === 'alumni' ? 'active' : ''}`}
              onClick={() => handleViewChange('alumni')}
            >
              Alumni
            </button>
            <button 
              className={`nav-btn ${currentView === 'committee' ? 'active' : ''}`}
              onClick={() => handleViewChange('committee')}
            >
              Committee
            </button>
            <button 
              className={`nav-btn ${currentView === 'project' ? 'active' : ''}`}
              onClick={() => handleViewChange('project')}
            >
              Project
            </button>
            <button 
              className={`nav-btn ${currentView === 'fileLocation' ? 'active' : ''}`}
              onClick={() => handleViewChange('fileLocation')}
            >
              File Location
            </button>
            <button 
              className={`nav-btn ${currentView === 'studentDetails' ? 'active' : ''}`}
              onClick={() => handleViewChange('studentDetails')}
            >
              Student Details
            </button>
            <button 
              className={`nav-btn ${currentView === 'teacherDetails' ? 'active' : ''}`}
              onClick={() => handleViewChange('teacherDetails')}
            >
              Teacher Details
            </button>
            <button 
              className={`nav-btn ${currentView === 'teacherPerformance' ? 'active' : ''}`}
              onClick={() => handleViewChange('teacherPerformance')}
            >
              Feedback
            </button>
            <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #ddd' }} />
            <div style={{ padding: '10px', fontSize: '12px', color: '#666', fontWeight: '600' }}>ADMINISTRATION</div>
            <button 
              className={`nav-btn ${currentView === 'adminPower' ? 'active' : ''}`}
              onClick={() => handleViewChange('adminPower')}
            >
              ⚙️ Admin Power
            </button>
            <button 
              className={`nav-btn ${currentView === 'passwordReset' ? 'active' : ''}`}
              onClick={() => handleViewChange('passwordReset')}
            >
              🔑 Password Reset
            </button>
          </nav>
        </div>
        <div className="main-content">
          {renderContent()}
          <footer className="footer" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 100px 15px 15px', borderTop: '1px solid #ddd', backgroundColor: '#f8f9fa', gap: '20px'}}>
            <div style={{textAlign: 'left', flex: 0, whiteSpace: 'nowrap'}}>
              <p style={{margin: 0, fontSize: '13px', fontWeight: '500'}}>Dr. Rahul Chandra Kushwaha</p>
              <p style={{margin: '5px 0 0 0', fontSize: '13px', fontWeight: '500'}}>Dr. Rupam Kumar Sharma</p>
            </div>
            <div style={{textAlign: 'center', flex: 0, whiteSpace: 'nowrap'}}>
              <p style={{margin: 0, fontSize: '13px', fontWeight: '500'}}>Mr. Mainong Jenbum Singpho</p>
            </div>
            <div style={{textAlign: 'center', flex: 1, minWidth: 0}}>
              <p style={{margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#333'}}>© Saransh Yadav</p>
            </div>
            <div style={{textAlign: 'center', flex: 0, whiteSpace: 'nowrap'}}>
              <p style={{margin: 0, fontSize: '13px', fontWeight: '500'}}>Ms. Priyanka Yadav</p>
            </div>
            <div style={{textAlign: 'right', flex: 0, whiteSpace: 'nowrap'}}>
              <p style={{margin: 0, fontSize: '13px', fontWeight: '500'}}>Dr. Bomken Kamdak</p>
              <p style={{margin: '5px 0 0 0', fontSize: '13px', fontWeight: '500'}}>Dr. Bhaskar Jyoti Chutia</p>
            </div>
          </footer>
        </div>
      </div>
      {showPasswordModal && <ChangePasswordModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} />}
      {showPhiChat && (
        <PhiChat 
          userType="admin" 
          userInfo={user}
          onClose={() => setShowPhiChat(false)}
        />
      )}
      <button
        onClick={() => setShowPhiChat(!showPhiChat)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#FF9800',
          color: 'white',
          border: 'none',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)',
          zIndex: 9999,
          display: showPhiChat ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        title="Open Phi Admin Assistant"
      >
        ⚙️
      </button>
    </div>
  );
};

export default AdminDashboard;
