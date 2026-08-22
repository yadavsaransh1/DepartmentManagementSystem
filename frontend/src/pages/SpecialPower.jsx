import React, { useState, useEffect } from 'react';
import api from '../services/api';

export const SpecialPower = ({ onViewChange, teacherPowers }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [powers, setPowers] = useState(teacherPowers || {});
  const [loading, setLoading] = useState(!teacherPowers);

  useEffect(() => {
    if (!teacherPowers) {
      fetchTeacherPowers();
    }
  }, []);

  const fetchTeacherPowers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin-power/public/my-powers');
      if (response.data) {
        setPowers(response.data);
        console.log('Fetched teacher powers:', response.data);
      }
    } catch (error) {
      console.error('Error fetching teacher powers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePowerClick = (powerKey) => {
    // Map new permission names to admin interface views
    const viewMap = {
      canAccessHomePage: 'homePageManagement',          // 🏠 Home Page Management
      canAccessStudentDetails: 'studentDetails',  // 👥 Student Details View
      canAccessTeacherDetails: 'teacherDetails',  // 👨‍🏫 Admin Teacher Details
      canAccessResults: 'adminMarksManagement',           // 📊 Results & Marks management
      canAccessStudentStatistics: 'adminStudentStats', // 📈 Student Statistics
      canAccessProject: 'adminProject',         // 📁 Admin Project Management
      canAccessFeedback: 'adminTeacherPerformance',       // 💬 Teacher Feedback/Performance
      canAccessAssignment: 'adminAssignments',  // 📝 Assignment Management
      canAccessCommittee: 'adminCommittee'           // 🏛️ Committee Admin Access
    };

    const targetView = viewMap[powerKey] || 'homePageManagement';
    if (onViewChange) {
      onViewChange(targetView);
    }
  };

  const powerDescriptions = {
    canAccessHomePage: { label: '🏠 Home Page', description: 'Access home page administration' },
    canAccessStudentDetails: { label: '👥 Student Details', description: 'View and manage student records' },
    canAccessTeacherDetails: { label: '👨‍🏫 Teacher Details', description: 'Manage teacher information' },
    canAccessResults: { label: '📊 Result (Marks)', description: 'Manage examination results and marks' },
    canAccessStudentStatistics: { label: '📈 Student Statistics', description: 'View student performance statistics' },
    canAccessProject: { label: '📁 Project', description: 'Manage student projects' },
    canAccessFeedback: { label: '💬 Feedback', description: 'Manage student and teacher feedback' },
    canAccessAssignment: { label: '📝 Assignment', description: 'Create and manage assignments' },
    canAccessCommittee: { label: '🏛️ Committee Admin', description: 'Access the administrative committee management page' }
  };

  if (loading) {
    return (
      <div className="management-container">
        <p style={{ textAlign: 'center', color: '#666' }}>Loading...</p>
      </div>
    );
  }

  // Get list of active powers
  const activePowers = Object.entries(powers || {})
    .filter(([key, value]) => key.startsWith('canAccess') && value === true)
    .map(([key]) => key);

  return (
    <div className="management-container">
      <h1>⭐ Special Powers & Privileges</h1>

      {activePowers && activePowers.length > 0 ? (
        <>
          <div style={{
            marginTop: '20px',
            padding: '24px',
            background: 'linear-gradient(135deg, #f3e5f5 0%, #ede7f6 100%)',
            border: '2px solid #9c27b0',
            borderRadius: '12px',
            marginBottom: '30px',
            boxShadow: '0 4px 12px rgba(156, 39, 176, 0.15)'
          }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '17px', fontWeight: '800', color: '#6a1b9a', letterSpacing: '0.3px' }}>
              ✨ You have Special Administrative Powers
            </p>
            <p style={{ margin: '8px 0 0 0', fontSize: '15px', color: '#7b1fa2', fontWeight: '600', lineHeight: '1.6' }}>
              You have been granted <span style={{ fontWeight: '800', fontSize: '16px' }}>{activePowers.length}</span> special power{activePowers.length !== 1 ? 's' : ''} by the administrator
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px',
            marginTop: '20px'
          }}>
            {activePowers.map((powerId, index) => {
              const power = powerDescriptions[powerId] || { label: powerId, description: 'Special privilege' };
              const colors = ['#9c27b0', '#6c42d1', '#7c3aed', '#a855f7'];
              const bgColor = colors[index % colors.length];
              
              return (
                <button
                  key={powerId}
                  onClick={() => handlePowerClick(powerId)}
                  style={{
                    padding: '24px',
                    background: 'white',
                    border: `3px solid ${bgColor}`,
                    borderRadius: '14px',
                    boxShadow: `0 6px 20px ${bgColor}30`,
                    cursor: 'pointer',
                    transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    position: 'relative',
                    overflow: 'hidden',
                    textAlign: 'left',
                    fontFamily: 'inherit'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 12px 32px ${bgColor}50`;
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.borderColor = bgColor;
                    e.currentTarget.style.backgroundColor = `${bgColor}08`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = `0 6px 20px ${bgColor}30`;
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    marginBottom: '4px'
                  }}>
                    <span style={{ 
                      fontSize: '32px',
                      fontWeight: '800',
                      color: bgColor,
                      minWidth: '40px'
                    }}>
                      {power.label.split(' ')[0]}
                    </span>
                    <span style={{
                      display: 'inline-block',
                      background: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor}cc 100%)`,
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: '800',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase'
                    }}>
                      Power #{index + 1}
                    </span>
                  </div>
                  
                  <p style={{ 
                    margin: '0 0 8px 0', 
                    fontWeight: '800', 
                    color: bgColor,
                    fontSize: '16px',
                    letterSpacing: '0.2px'
                  }}>
                    {power.label}
                  </p>
                  
                  <p style={{ 
                    margin: '0', 
                    color: '#64748b', 
                    fontSize: '14px', 
                    lineHeight: '1.6',
                    fontWeight: '500'
                  }}>
                    {power.description}
                  </p>
                  
                  <div style={{
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: `2px solid ${bgColor}20`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: bgColor,
                    fontWeight: '700',
                    fontSize: '13px',
                    letterSpacing: '0.3px'
                  }}>
                    <span>→ Click to Access</span>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <div style={{
          marginTop: '30px',
          padding: '32px',
          background: 'linear-gradient(135deg, #e3f2fd 0%, #e1f5fe 100%)',
          border: '3px solid #2196f3',
          borderRadius: '12px',
          textAlign: 'center',
          maxWidth: '650px',
          margin: '30px auto',
          boxShadow: '0 6px 20px rgba(33, 150, 243, 0.2)'
        }}>
          <p style={{ fontSize: '22px', color: '#1565c0', fontWeight: '800', margin: '0 0 12px 0', letterSpacing: '0.3px' }}>
            👨‍🏫 You have no Special Powers
          </p>
          <p style={{ color: '#0d47a1', margin: '0', fontSize: '15px', lineHeight: '1.8', fontWeight: '600' }}>
            As a regular teacher, you don't have special administrative powers. 
            Special powers are granted to non-HoD teachers by administrators.
          </p>
        </div>
      )}

      <div style={{
        marginTop: '50px',
        padding: '28px',
        background: 'linear-gradient(135deg, #f0f4ff 0%, #f3e5f5 100%)',
        borderRadius: '12px',
        border: '2px solid #e2e8f0',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)'
      }}>
        <p style={{ margin: '0 0 16px 0', fontWeight: '800', fontSize: '15px', color: '#1e293b', letterSpacing: '0.3px' }}>
          ℹ️ About Special Powers
        </p>
        <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#475569', lineHeight: '1.8', fontWeight: '600' }}>
          Special Powers are administrative privileges granted by the system administrator to teachers, especially those 
          serving special roles in the Department. These powers allow them to perform administrative tasks that normally require 
          full admin access.
        </p>
        <p style={{ margin: '0', fontSize: '14px', color: '#475569', lineHeight: '1.8', fontWeight: '600' }}>
          <strong style={{ color: '#6b21a8' }}>Note:</strong> To request additional powers or if you believe powers should be assigned to you, 
          please contact your system administrator.
        </p>
      </div>
    </div>
  );
};

export default SpecialPower;
