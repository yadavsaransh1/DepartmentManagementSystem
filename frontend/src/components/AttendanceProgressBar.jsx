import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/progress-bar.css';

export const AttendanceProgressBar = ({ percentage, role = 'ADMIN' }) => {
  const [colors, setColors] = useState({
    lowColor: '#e74c3c',
    mediumColor: '#f39c12',
    highColor: '#27ae60',
    lowThreshold: 40,
    mediumThreshold: 75
  });

  useEffect(() => {
    // Only fetch color settings for ADMIN role
    // STUDENT and TEACHER use default colors
    if (role === 'ADMIN') {
      fetchColorSettings();
    }
  }, [role]);

  const fetchColorSettings = async () => {
    try {
      const response = await api.get(`/admin-power/color-settings?role=${encodeURIComponent(role)}`);
      if (response.data) {
        setColors({
          lowColor: response.data.lowColor || '#e74c3c',
          mediumColor: response.data.mediumColor || '#f39c12',
          highColor: response.data.highColor || '#27ae60',
          lowThreshold: response.data.lowThreshold || 40,
          mediumThreshold: response.data.mediumThreshold || 75
        });
      }
    } catch (err) {
      // Silently fail and use default colors
      // Color settings endpoint may not exist for non-ADMIN roles
    }
  };

  const getColor = (percent) => {
    if (percent < colors.lowThreshold) {
      return colors.lowColor;
    } else if (percent < colors.mediumThreshold) {
      return colors.mediumColor;
    } else {
      return colors.highColor;
    }
  };

  const getStatus = (percent) => {
    if (percent < colors.lowThreshold) {
      return 'Low';
    } else if (percent < colors.mediumThreshold) {
      return 'Medium';
    } else {
      return 'Good';
    }
  };

  const progressColor = getColor(percentage);
  const status = getStatus(percentage);

  return (
    <div className="attendance-progress-container">
      <div className="progress-info">
        <span className="progress-label">Overall Attendance</span>
        <span className="progress-percentage">{percentage}%</span>
      </div>
      <div className="progress-bar-wrapper">
        <div 
          className="progress-bar" 
          style={{
            width: `${percentage}%`,
            backgroundColor: progressColor,
            boxShadow: `0 2px 4px ${progressColor}99`
          }}
        >
          <span className="progress-text">{percentage}%</span>
        </div>
      </div>
      <div className="progress-status" style={{ color: progressColor }}>
        Status: {status}
      </div>
    </div>
  );
};

export default AttendanceProgressBar;
