import React, { useState, useEffect } from 'react';
import api from '../services/api';

export const HoDPower = ({ onViewChange, teacherPowers }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [powers, setPowers] = useState(teacherPowers || {});
  const [loading, setLoading] = useState(!teacherPowers);

  useEffect(() => {
    if (!teacherPowers) {
      fetchHoDStatus();
    }
  }, []);

  const fetchHoDStatus = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin-power/public/my-powers');
      if (response.data) {
        setPowers(response.data);
        console.log('Fetched HoD powers:', response.data);
      }
    } catch (error) {
      console.error('Error fetching HoD powers:', error);
    } finally {
      setLoading(false);
    }
  };

  const hodPowerActions = [
    { key: 'canAccessHomePage', label: '🏠 Home Page', icon: '🏠', action: () => onViewChange && onViewChange('homePageManagement') },
    { key: 'canAccessStudentDetails', label: '👥 Student Details', icon: '👥', action: () => onViewChange && onViewChange('studentDetails') },
    { key: 'canAccessTeacherDetails', label: '👨‍🏫 Teacher Details', icon: '👨‍🏫', action: () => onViewChange && onViewChange('teacherDetails') },
    { key: 'canAccessResults', label: '📊 Result (Marks)', icon: '📊', action: () => onViewChange && onViewChange('adminMarksManagement') },
    { key: 'canAccessStudentStatistics', label: '📈 Student Statistics', icon: '📈', action: () => onViewChange && onViewChange('adminStudentStats') },
    { key: 'canAccessProject', label: '📁 Project', icon: '📁', action: () => onViewChange && onViewChange('adminProject') },
    { key: 'canAccessFeedback', label: '💬 Feedback', icon: '💬', action: () => onViewChange && onViewChange('adminTeacherPerformance') },
    { key: 'canAccessAssignment', label: '📝 Assignment', icon: '📝', action: () => onViewChange && onViewChange('adminAssignments') },
    { key: 'canAccessCommittee', label: '🏛️ Committee', icon: '🏛️', action: () => onViewChange && onViewChange('adminCommittee') },
  ];

  if (loading) {
    return (
      <div className="hod-power-container">
        <p style={{ textAlign: 'center', color: '#666' }}>Loading...</p>
      </div>
    );
  }

  const isHoD = powers?.isHoD === true;
  
  if (!isHoD) {
    return (
      <div className="hod-power-container">
        <h1>👑 HoD Power Management</h1>
        <div style={{
          marginTop: '20px',
          padding: '30px',
          backgroundColor: '#f0f8ff',
          border: '2px solid #64b5f6',
          borderRadius: '8px',
          textAlign: 'center',
          maxWidth: '600px',
          margin: '20px auto'
        }}>
          <p style={{ fontSize: '18px', color: '#1565c0', fontWeight: 'bold', margin: '0 0 10px 0' }}>
            👑 You are not a Head of Department
          </p>
          <p style={{ color: '#666', margin: 0 }}>
            To access HoD powers, an administrator must first appoint you as Head of Department.
          </p>
        </div>
      </div>
    );
  }

  const enabledPowers = hodPowerActions.filter(p => powers[p.key] === true);

  return (
    <div className="hod-power-container">
      <h1>👑 HoD Administrative Powers</h1>
      
      <div style={{
        marginTop: '20px',
        padding: '24px',
        background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
        border: '3px solid #4caf50',
        borderRadius: '12px',
        marginBottom: '30px',
        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)'
      }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '17px', fontWeight: '800', color: '#2e7d32', letterSpacing: '0.3px' }}>
          ✅ You have Head of Department privileges
        </p>
        <p style={{ margin: '8px 0 0 0', fontSize: '15px', color: '#558b2f', fontWeight: '600' }}>
          <span style={{ fontWeight: '800', fontSize: '16px' }}>{enabledPowers.length}</span> administrative power{enabledPowers.length !== 1 ? 's are' : ' is'} active. Click on any power to use it.
        </p>
      </div>

      {enabledPowers.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px',
          marginTop: '20px'
        }}>
          {enabledPowers.map((power, idx) => (
            <button
              key={power.key}
              onClick={power.action}
              style={{
                padding: '24px',
                backgroundColor: '#ffffff',
                border: '3px solid #4caf50',
                borderRadius: '14px',
                cursor: 'pointer',
                transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: '600',
                color: '#2e7d32',
                boxShadow: '0 6px 20px rgba(76, 175, 80, 0.15)',
                gap: '12px',
                position: 'relative',
                overflow: 'hidden',
                fontFamily: 'inherit'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(76, 175, 80, 0.35)';
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.backgroundColor = '#f1f8f4';
                e.currentTarget.style.borderColor = '#4caf50';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.15)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.backgroundColor = '#ffffff';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                <span style={{ fontSize: '32px' }}>{power.icon}</span>
                <span style={{
                  display: 'inline-block',
                  background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: '800',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase'
                }}>
                  Power #{idx + 1}
                </span>
              </div>
              
              <span style={{ fontSize: '16px', fontWeight: '800', color: '#4caf50', letterSpacing: '0.2px' }}>
                {power.label}
              </span>
              
              <div style={{
                marginTop: '8px',
                paddingTop: '12px',
                borderTop: '2px solid #c8e6c920',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#4caf50',
                fontWeight: '700',
                fontSize: '13px',
                letterSpacing: '0.3px'
              }}>
                <span>→ Click to Access</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div style={{
          marginTop: '30px',
          padding: '32px',
          background: 'linear-gradient(135deg, #fff3cd 0%, #fffacd 100%)',
          border: '3px solid #ffc107',
          borderRadius: '12px',
          textAlign: 'center',
          maxWidth: '650px',
          margin: '30px auto',
          boxShadow: '0 6px 20px rgba(255, 193, 7, 0.2)'
        }}>
          <p style={{ fontSize: '22px', color: '#f57f17', fontWeight: '800', margin: '0 0 12px 0', letterSpacing: '0.3px' }}>
            ℹ️ No HoD Powers Assigned
          </p>
          <p style={{ color: '#856404', margin: '0', fontSize: '15px', lineHeight: '1.8', fontWeight: '600' }}>
            You are a Head of Department but no specific powers have been assigned yet. Please contact your administrator.
          </p>
        </div>
      )}

      <div style={{
        marginTop: '50px',
        padding: '28px',
        background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
        borderRadius: '12px',
        border: '2px solid #e2e8f0',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)'
      }}>
        <p style={{ margin: '0 0 16px 0', fontWeight: '800', fontSize: '15px', color: '#1e293b', letterSpacing: '0.3px' }}>
          ℹ️ About HoD Powers
        </p>
        <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#475569', lineHeight: '1.8', fontWeight: '600' }}>
          HoD Powers are administrative privileges automatically granted to all Heads of Department. These powers allow you to manage academic and administrative tasks for your department.
        </p>
        <p style={{ margin: '0', fontSize: '14px', color: '#475569', lineHeight: '1.8', fontWeight: '600' }}>
          <strong style={{ color: '#047857' }}>Note:</strong> If you require additional assistance or permissions, please contact your system administrator.
        </p>
      </div>
    </div>
  );
};

export default HoDPower;
