import React, { useState } from 'react';
import { AdminRegularAllocation } from './AdminRegularAllocation';
import { AdminPhDAllocation } from './AdminPhDAllocation';
import '../styles/dashboard.css';

export const AdminProject = () => {
  const [activeTab, setActiveTab] = useState('regular');

  return (
    <div style={{ padding: '20px' }}>
      <h1>📚 Project Management</h1>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        borderBottom: '2px solid #ddd',
        paddingBottom: '0'
      }}>
        <button
          onClick={() => setActiveTab('regular')}
          style={{
            padding: '12px 20px',
            backgroundColor: activeTab === 'regular' ? '#2196f3' : '#f0f0f0',
            color: activeTab === 'regular' ? 'white' : '#333',
            border: 'none',
            borderRadius: '4px 4px 0 0',
            cursor: 'pointer',
            fontWeight: 'bold',
            borderBottom: activeTab === 'regular' ? '3px solid #1976d2' : 'none'
          }}
        >
          👨‍🎓 Regular Student Supervisor
        </button>
        <button
          onClick={() => setActiveTab('phd')}
          style={{
            padding: '12px 20px',
            backgroundColor: activeTab === 'phd' ? '#9c27b0' : '#f0f0f0',
            color: activeTab === 'phd' ? 'white' : '#333',
            border: 'none',
            borderRadius: '4px 4px 0 0',
            cursor: 'pointer',
            fontWeight: 'bold',
            borderBottom: activeTab === 'phd' ? '3px solid #7b1fa2' : 'none'
          }}
        >
          🎓 PhD Student Guide
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ marginTop: '20px' }}>
        {activeTab === 'regular' && <AdminRegularAllocation />}
        {activeTab === 'phd' && <AdminPhDAllocation />}
      </div>
    </div>
  );
};
