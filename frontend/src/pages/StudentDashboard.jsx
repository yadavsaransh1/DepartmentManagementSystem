import React, { useState, useEffect } from 'react';
import StudentProfile from './StudentProfile';
import StudentAttendance from './StudentAttendance';
import StudentDocuments from './StudentDocuments';
import StudentMyDocuments from '../components/StudentMyDocuments';
import StudentAttendanceReport from './StudentAttendanceReport';
import EditStudentProfile from './EditStudentProfile';
import StudentRoutineView from './StudentRoutineView';
import ChangePasswordModal from './ChangePasswordModal';
import NotificationCenter from '../components/NotificationCenter';
import StudentAssignments from './StudentAssignments';
import StudentMarksView from './StudentMarksView';
import { StudentProject } from './StudentProject';
import { StudentTeacherFeedback } from './StudentTeacherFeedback';
import { PhiChat } from '../components/PhiChat';
import api from '../services/api';
import '../styles/dashboard.css';

export const StudentDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [currentView, setCurrentView] = useState('profile');
  const [attendanceData, setAttendanceData] = useState(null);
  const [reportsData, setReportsData] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
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
    if (view === 'notifications') {
    setUnreadNotifications(0);
  }
  };

  // Fetch student's attendance
  useEffect(() => {
    if (currentView === 'attendance') {
      fetchAttendance();
    } else if (currentView === 'reports') {
      fetchReports();
    }
  }, [currentView]);

  // Fetch unread notifications on mount
  useEffect(() => {
    fetchUnreadNotifications();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      // Fetch student's own attendance records using the student-accessible endpoint
      const response = await api.get(`/attendance/my-records?studentId=${user.id}`);
      // Records are already filtered by the backend
      const studentAttendance = Array.isArray(response.data) ? response.data : [];
      
      // Calculate statistics
      const stats = {};
      studentAttendance.forEach(a => {
        const subject = a.subject?.name || 'Unknown';
        if (!stats[subject]) {
          stats[subject] = { present: 0, absent: 0, late: 0, total: 0 };
        }
        stats[subject].total++;
        if (a.status === 'PRESENT') stats[subject].present++;
        else if (a.status === 'ABSENT') stats[subject].absent++;
        else if (a.status === 'LATE') stats[subject].late++;
      });
      
      setAttendanceData(stats);
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setAttendanceData({});
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      // Fetch all reports - filter student-specific ones
      const response = await api.get('/reports');
      const studentReports = Array.isArray(response.data)
        ? response.data.filter(r => r.student?.id === user.id || r.studentId === user.id)
        : [];
      setReportsData(studentReports);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setReportsData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadNotifications = async () => {
    try {
      const identifier = user?.email ? user.email : user?.id;
      const response = await api.get(`/notifications/visible/${identifier}`);
      
      if (response.data) {
        const data = response.data;
    // ✅ FIX: Count unread using isRead
        const unread = data.filter(notif => !notif.isRead).length;
        setUnreadNotifications(unread);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const renderContent = () => {
    switch(currentView) {
      case 'profile':
        return (
          <div>
            <StudentProfile />
          </div>
        );
      case 'attendance':
        return <StudentAttendance />;
      case 'documents':
        return <StudentDocuments />;
      case 'myDocuments':
        return <StudentMyDocuments />;
      case 'routines':
        return <StudentRoutineView />;
      case 'notifications':
        return <NotificationCenter />;
      case 'reports':
        return <StudentAttendanceReport />;
      case 'submissions':
        return <StudentAssignments />;
      case 'performance':
        return <StudentMarksView />;
      case 'project':
        return <StudentProject />;
      case 'teacherFeedback':
        return <StudentTeacherFeedback />;
      default:
        return <StudentProfile />;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
            <h1 className="mobile-title">Department Management System</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginLeft: 'auto' }}>
              <button 
                className="menu-btn"
                onClick={() => setSidebarOpen(true)}
              >
                ☰
              </button>
            </div>
        </div>
        <nav>
          <span>Welcome, {user?.fullName}</span>

          <button className="desktop-logout-btn" onClick={handleLogout}>Logout</button>
        </nav>
      </div>
      <ChangePasswordModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} />
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
              className={`nav-btn ${currentView === 'profile' ? 'active' : ''}`}
              onClick={() => handleViewChange('profile')}
            >
              Profile
            </button>
            <button 
              className={`nav-btn ${currentView === 'attendance' ? 'active' : ''}`}
              onClick={() => handleViewChange('attendance')}
            >
              My Attendance
            </button>
            <button 
              className={`nav-btn ${currentView === 'myDocuments' ? 'active' : ''}`}
              onClick={() => handleViewChange('myDocuments')}
            >
              My Documents
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
              Class Routine
            </button>
            <button 
              className={`nav-btn ${currentView === 'notifications' ? 'active' : ''}`}
              onClick={() => handleViewChange('notifications')}
              style={{ position: 'relative' }}
            >
              Notifications
             </button>
            <button 
              className={`nav-btn ${currentView === 'reports' ? 'active' : ''}`}
              onClick={() => handleViewChange('reports')}
            >
              Reports
            </button>
            <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #ddd' }} />
            <div style={{ padding: '10px', fontSize: '12px', color: '#666', fontWeight: '600' }}>ADDITIONAL FEATURES</div>
            <button 
              className={`nav-btn ${currentView === 'submissions' ? 'active' : ''}`}
              onClick={() => handleViewChange('submissions')}
            >
              Assignments
            </button>
            <button 
              className={`nav-btn ${currentView === 'performance' ? 'active' : ''}`}
              onClick={() => handleViewChange('performance')}
            >
              My Performance
            </button>
            <button 
              className={`nav-btn ${currentView === 'project' ? 'active' : ''}`}
              onClick={() => handleViewChange('project')}
            >
              Project
            </button>
            <button 
              className={`nav-btn ${currentView === 'teacherFeedback' ? 'active' : ''}`}
              onClick={() => handleViewChange('teacherFeedback')}
            >
              Teacher Feedback
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
      {showEditProfile && (
        <EditStudentProfile 
          onClose={() => setShowEditProfile(false)}
          onSuccess={() => {
            setShowEditProfile(false);
            setCurrentView('profile');
          }}
        />
      )}
      {showPhiChat && (
        <PhiChat 
          userType="student" 
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
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
          zIndex: 9999,
          display: showPhiChat ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        title="Open Phi Student Assistant"
      >
        🎓
      </button>
    </div>
  );
};

export default StudentDashboard;
