import React, { useState, useEffect } from 'react';
import MarkAttendance from './MarkAttendance';
import AttendanceReport from './AttendanceReport';
import TeacherStudentAttendanceReport from './TeacherStudentAttendanceReport';
import DocumentUpload from './DocumentUpload';
import TeacherMyDocuments from '../components/TeacherMyDocuments';
import ChangePasswordModal from './ChangePasswordModal';
import EditTeacherProfile from './EditTeacherProfile';
import TeacherProfile from './TeacherProfile';
import TeacherCertificateDashboard from '../components/TeacherCertificateDashboard';
import RoutineTimetable from '../components/RoutineTimetable';
import NotificationCenter from '../components/NotificationCenter';
import TeacherAssignmentManagement from './TeacherAssignmentManagement';
import { TeacherViewFeedback } from './TeacherViewFeedback';
import { TeacherCommittee } from './TeacherCommittee';
import { AdminCommittee } from './AdminCommittee';
import { TeacherProject } from './TeacherProject';
import { PhiChat } from '../components/PhiChat';
import TeacherDetailsForm from '../components/TeacherDetailsForm';
import TeacherMarksManagement from './TeacherMarksManagement';
import HoDPower from './HoDPower';
import SpecialPower from './SpecialPower';
// Admin components for power-based access
import HomePageManagement from './HomePageManagement';
import { StudentDetailsView } from './StudentDetailsView';
import AdminTeacherDetails from '../components/AdminTeacherDetails';
import AdminMarksManagement from './AdminMarksManagement';
import AdminStudentAttendanceReport from './AdminStudentAttendanceReport';
import { AdminProject } from './AdminProject';
import { AdminTeacherFeedback } from './AdminTeacherFeedback';
import AssignmentManagement from './AssignmentManagement';
import api from '../services/api';
import '../styles/dashboard.css';

export const TeacherDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [currentView, setCurrentView] = useState('myDetails');
  const [attendanceStats, setAttendanceStats] = useState({});
  const [teacherSubjects, setTeacherSubjects] = useState([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [teacherProfile, setTeacherProfile] = useState({});
  const [routine, setRoutine] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showPhiChat, setShowPhiChat] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isHoD, setIsHoD] = useState(false);
  const [hasAdminPowers, setHasAdminPowers] = useState(false);
  const [teacherPowers, setTeacherPowers] = useState({
    canAccessHomePage: false,
    canAccessStudentDetails: false,
    canAccessTeacherDetails: false,
    canAccessResults: false,
    canAccessStudentStatistics: false,
    canAccessProject: false,
    canAccessFeedback: false,
    canAccessAssignment: false,
    canAccessCommittee: false,
    isHoD: false
  });

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

  const mergeCommitteePowers = (basePowers, teacherEmail, committees) => {
    const merged = { ...basePowers };
    if (Array.isArray(committees)) {
      committees.forEach((committee) => {
        if (committee.members && Array.isArray(committee.members)) {
          committee.members.forEach((member) => {
            const memberEmail = member.teacherEmail || (member.teacher && member.teacher.email);
            const powerList = Array.isArray(member.powers) ? member.powers : [];
            if (memberEmail && memberEmail === teacherEmail && powerList.length > 0) {
              powerList.forEach((power) => {
                if (merged.hasOwnProperty(power)) {
                  merged[power] = true;
                }
              });
            }
          });
        }
      });
    }
    return merged;
  };

  // Fetch teacher subjects and attendance statistics on mount
  useEffect(() => {
    fetchTeacherProfile();
    fetchTeacherSubjects();
    if (currentView === 'reports') {
      fetchAttendanceStats();
    }
    if (currentView === 'routine') {
      fetchRoutine();
    }
  }, [currentView]);

  const fetchTeacherProfile = async () => {
    try {
      const response = await api.get('/teachers/profile');
      setTeacherProfile(response.data);
      localStorage.setItem('userProfile', JSON.stringify(response.data));
      
      // Set HoD and admin powers status
      setIsHoD(response.data.isHoD || false);
      
      // Fetch the new 8 tab-based teacher powers
      try {
        const powerResponse = await api.get('/admin-power/public/my-powers');
        if (powerResponse.data) {
          let powers = powerResponse.data;
          console.log('Teacher powers:', powers);

          let committeeData = [];
          try {
            const committeeResponse = await api.get('/committees/my-committees');
            if (Array.isArray(committeeResponse.data)) {
              committeeData = committeeResponse.data;
            }
          } catch (err) {
            console.warn('Could not fetch committee powers:', err.message);
          }

          const mergedPowers = mergeCommitteePowers(
            powers,
            response.data.email || response.data.teacherEmail,
            committeeData
          );

          setTeacherPowers(mergedPowers);

          const hasPowers = Object.values(mergedPowers).some(
            (val) => val === true
          );
          setHasAdminPowers(hasPowers);
        }
      } catch (err) {
        console.warn('Could not fetch new teacher powers, falling back to legacy check:', err.message);
        
        // Fallback: Check if teacher has any admin powers from legacy adminPowers field
        if (!response.data.isHoD && response.data.adminPowers) {
          try {
            const powers = JSON.parse(response.data.adminPowers);
            let mergedPowers = mergeCommitteePowers(
              {
                canAccessHomePage: powers.canAccessHomePage || false,
                canAccessStudentDetails: powers.canAccessStudentDetails || false,
                canAccessTeacherDetails: powers.canAccessTeacherDetails || false,
                canAccessResults: powers.canAccessResults || false,
                canAccessStudentStatistics: powers.canAccessStudentStatistics || false,
                canAccessProject: powers.canAccessProject || false,
                canAccessFeedback: powers.canAccessFeedback || false,
                canAccessAssignment: powers.canAccessAssignment || false,
                canAccessCommittee: powers.canAccessCommittee || false,
                isHoD: false
              },
              response.data.email || response.data.teacherEmail,
              await (async () => {
                try {
                  const committeeResponse = await api.get('/committees/my-committees');
                  return Array.isArray(committeeResponse.data) ? committeeResponse.data : [];
                } catch (e) {
                  console.warn('Could not fetch committee powers in fallback:', e.message);
                  return [];
                }
              })()
            );
            setTeacherPowers(mergedPowers);
            const hasPowers = Object.values(mergedPowers).some((val) => val === true);
            setHasAdminPowers(hasPowers);
          } catch (e) {
            console.error('Error parsing admin powers:', e);
            setHasAdminPowers(false);
          }
        } else {
          setHasAdminPowers(false);
        }
      }
    } catch (err) {
      console.error('Error fetching teacher profile:', err);
    }
  };

  const fetchTeacherSubjects = async () => {
    try {
      const teacherIdentifier = user.email;
      const response = await api.get(`/subjects/teacher/${teacherIdentifier}`);
      const subjects = Array.isArray(response.data) ? response.data : [];
      setTeacherSubjects(subjects);
      console.log('Teacher subjects fetched:', subjects);
    } catch (err) {
      console.error('Error fetching teacher subjects:', err);
      setTeacherSubjects([]);
    }
  };

  const fetchRoutine = async () => {
    try {
      // Fetch routine from API for the current teacher using email as primary key
      const teacherIdentifier = user.email;
      console.log('Fetching routines for teacher:', teacherIdentifier);
      
      if (!teacherIdentifier) {
        console.warn('No teacher identifier available (id or email)');
        setRoutine([]);
        return;
      }
      
      const response = await api.get(`/routines/teacher/${teacherIdentifier}`);
      const routines = Array.isArray(response.data) ? response.data : [];
      console.log('Teacher routines fetched from API:', routines.length, 'routines');
      setRoutine(routines);
    } catch (err) {
      console.error('Error fetching routine from API:', err);
      // Fallback: Create a routine from subjects if API fails
      const routine_data = teacherSubjects.map((subject, index) => ({
        id: index + 1,
        subjectName: subject.subjectName,
        day: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][index % 5],
        time: `${9 + (index % 3)}:00 AM - ${10 + (index % 3)}:30 AM`,
        classroom: `Room ${201 + index}`,
        semester: subject.semester,
        course: subject.course
      }));
      setRoutine(routine_data);
    }
  };

  const fetchAttendanceStats = async () => {
    try {
      const response = await api.get('/attendance');
      const records = Array.isArray(response.data) ? response.data : [];
      
      // Group by subject and calculate stats
      const stats = {};
      records.forEach(record => {
        const subject = record.subject || 'Unknown';
        if (!stats[subject]) {
          stats[subject] = { present: 0, absent: 0, late: 0, total: 0 };
        }
        stats[subject].total++;
        if (record.status === 'PRESENT') stats[subject].present++;
        else if (record.status === 'ABSENT') stats[subject].absent++;
        else if (record.status === 'LATE') stats[subject].late++;
      });
      
      setAttendanceStats(stats);
    } catch (err) {
      console.error('Error fetching attendance stats:', err);
      setAttendanceStats({});
    }
  };

  const fetchUnreadNotifications = async () => {
    try {
      const identifier = user?.email ? user.email : user?.id;
      const response = await api.get(`/notifications/visible/${identifier}`);
      if (response.data) {
        const data = response.data;
        const unread = data.filter(notif => {
          const notifTime = new Date(notif.createdAt).getTime();
          const now = new Date().getTime();
          return (now - notifTime) < 24 * 60 * 60 * 1000;
        }).length;
        setUnreadNotifications(unread);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchUnreadNotifications();
    const interval = setInterval(fetchUnreadNotifications, 30000);
    return () => clearInterval(interval);
  }, [user.email]);

  const renderContent = () => {
    switch(currentView) {
      case 'myDetails':
        return <TeacherDetailsForm />;
      case 'attendance':
        return <MarkAttendance />;
      case 'reports':
        return <AttendanceReport />;
      case 'studentStats':
        return <TeacherStudentAttendanceReport />;
      case 'documents':
        return <DocumentUpload />;
      case 'myDocuments':
        return <TeacherMyDocuments />;
      case 'profile':
        return <TeacherProfile />;
      case 'routine':
        return (
          <div className="management-container">
            <h1> Class Schedule (Timetable)</h1>
            {routine && routine.length > 0 ? (
              <div style={{ marginTop: '20px' }}>
                <RoutineTimetable routines={routine} />
              </div>
            ) : (
              <p style={{
                marginTop: '20px',
                padding: '20px',
                backgroundColor: '#f0f0f0',
                borderRadius: '4px',
                color: '#666'
              }}>
                📋 No routine available yet. Routines will be uploaded by the admin.
              </p>
            )}
          </div>
        );
      case 'certificates':
        return <TeacherCertificateDashboard />;
      case 'notifications':
        return <NotificationCenter />;
      case 'subjects':
        return (
          <div className="management-container">
            <h1>My Subjects</h1>
            {teacherSubjects.length > 0 ? (
              <div className="list-container">
                <table style={{width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
                  <thead>
                    <tr style={{backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6'}}>
                      <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Code</th>
                      <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Name</th>
                      <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Semester</th>
                      <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Course</th>
                      <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Credits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teacherSubjects.map(subject => (
                      <tr key={subject.id} style={{borderBottom: '1px solid #dee2e6'}}>
                        <td style={{padding: '12px'}}>{subject.subjectCode}</td>
                        <td style={{padding: '12px'}}>{subject.subjectName}</td>
                        <td style={{padding: '12px'}}>{subject.semester ? `Sem ${subject.semester}` : 'N/A'}</td>
                        <td style={{padding: '12px'}}>{subject.course || 'N/A'}</td>
                        <td style={{padding: '12px'}}>{subject.credits || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{marginTop: '20px', color: '#666'}}>
                No subjects assigned yet.
              </p>
            )}
          </div>
        );
      case 'assignments':
        return <TeacherAssignmentManagement />;
      case 'marks':
        return <TeacherMarksManagement />;
      case 'teacherPerformance':
        return <TeacherViewFeedback />;
      case 'project':
        return <TeacherProject />;
      case 'committee':
        return <TeacherCommittee />;
      case 'adminCommittee':
        return <AdminCommittee />;
      // Admin-level views accessed via Special Powers
      case 'homePageManagement':
        return <HomePageManagement />;
      case 'studentDetails':
        return <StudentDetailsView />;
      case 'teacherDetails':
        return <AdminTeacherDetails />;
      case 'adminMarksManagement':
        return <AdminMarksManagement />;
      case 'adminStudentStats':
        return <AdminStudentAttendanceReport />;
      case 'adminProject':
        return <AdminProject />;
      case 'adminTeacherPerformance':
        return <AdminTeacherFeedback />;
      case 'adminAssignments':
        return <AssignmentManagement />;
      case 'hodPower':
        return <HoDPower onViewChange={handleViewChange} teacherPowers={teacherPowers} />;
      case 'specialPower':
        return <SpecialPower onViewChange={handleViewChange} teacherPowers={teacherPowers} />;
      default:
        return <TeacherDetailsForm />;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
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
      {showPasswordModal && <ChangePasswordModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} />}
      {showEditProfile && <EditTeacherProfile onClose={() => { setShowEditProfile(false); fetchTeacherProfile(); }} />}
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
              className={`nav-btn ${currentView === 'myDetails' ? 'active' : ''}`}
              onClick={() => handleViewChange('myDetails')}
            >
              My Details
            </button>
            <button 
              className={`nav-btn ${currentView === 'attendance' ? 'active' : ''}`}
              onClick={() => handleViewChange('attendance')}
            >
              Mark Attendance
            </button>
            <button 
              className={`nav-btn ${currentView === 'reports' ? 'active' : ''}`}
              onClick={() => handleViewChange('reports')}
            >
              Attendance Reports
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
              className={`nav-btn ${currentView === 'myDocuments' ? 'active' : ''}`}
              onClick={() => handleViewChange('myDocuments')}
            >
              My Documents
            </button>
            <button 
              className={`nav-btn ${currentView === 'certificates' ? 'active' : ''}`}
              onClick={() => handleViewChange('certificates')}
            >
              Certificates
            </button>
            <button 
              className={`nav-btn ${currentView === 'notifications' ? 'active' : ''}`}
              onClick={() => handleViewChange('notifications')}
              style={{ position: 'relative' }}
            >
              Notifications
            </button>
            <button 
              className={`nav-btn ${currentView === 'profile' ? 'active' : ''}`}
              onClick={() => handleViewChange('profile')}
            >
              My Profile
            </button>
            <button 
              className={`nav-btn ${currentView === 'routine' ? 'active' : ''}`}
              onClick={() => handleViewChange('routine')}
            >
              Teaching Routine
            </button>
            <button 
              className={`nav-btn ${currentView === 'committee' ? 'active' : ''}`}
              onClick={() => handleViewChange('committee')}
            >
              Committee
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
              className={`nav-btn ${currentView === 'marks' ? 'active' : ''}`}
              onClick={() => handleViewChange('marks')}
            >
              Marks
            </button>
            <button 
              className={`nav-btn ${currentView === 'project' ? 'active' : ''}`}
              onClick={() => handleViewChange('project')}
            >
              Project
            </button>
            <button 
              className={`nav-btn ${currentView === 'teacherPerformance' ? 'active' : ''}`}
              onClick={() => handleViewChange('teacherPerformance')}
            >
              Feedback
            </button>
            {(isHoD || hasAdminPowers) && (
              <>
                <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #ddd' }} />
                <div style={{ padding: '10px', fontSize: '12px', color: '#666', fontWeight: '600' }}>
                  {isHoD ? ' HoD POWER' : ' SPECIAL ROLES'}
                </div>
              </>
            )}
            {isHoD && (
              <button 
                className={`nav-btn ${currentView === 'hodPower' ? 'active' : ''}`}
                onClick={() => handleViewChange('hodPower')}
              >
                👑 HoD Power
              </button>
            )}
            {!isHoD && hasAdminPowers && (
              <button 
                className={`nav-btn ${currentView === 'specialPower' ? 'active' : ''}`}
                onClick={() => handleViewChange('specialPower')}
              >
                ⭐ Special Roles
              </button>
            )}
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
      {showPhiChat && (
        <PhiChat 
          userType="teacher" 
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
          backgroundColor: '#2196F3',
          color: 'white',
          border: 'none',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
          zIndex: 9999,
          display: showPhiChat ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        title="Open Phi Teacher Assistant"
      >
        👨‍🏫
      </button>
    </div>
  );
};

export default TeacherDashboard;
