import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/apiClient';
import '../styles/performance.css';

export default function StudentPerformance() {
  const [performances, setPerformances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState('');
  const [userRole] = useState(localStorage.getItem('role'));

  const token = localStorage.getItem('token');
  const performanceLevels = ['EXCELLENT', 'GOOD', 'SATISFACTORY', 'NEEDS_IMPROVEMENT'];

  useEffect(() => {
    fetchPerformances();
  }, [filterLevel]);

  const fetchPerformances = async () => {
    try {
      setLoading(true);
      let url = `${API_BASE_URL}/api/student-performance`;
      if (filterLevel) {
        url = `${API_BASE_URL}/api/student-performance?level=${filterLevel}`;
      }
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPerformances(response.data);
    } catch (error) {
      console.error('Error fetching performances:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async (studentId) => {
    try {
      await axios.post(`${API_BASE_URL}/api/student-performance/${studentId}/calculate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPerformances();
      alert('Performance recalculated successfully');
    } catch (error) {
      console.error('Error recalculating performance:', error);
    }
  };

  const handleRecalculateAll = async () => {
    if (window.confirm('Recalculate all student performances?')) {
      try {
        await axios.post(`${API_BASE_URL}/api/performance/recalculate-all`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchPerformances();
        alert('All performances recalculated');
      } catch (error) {
        console.error('Error recalculating all:', error);
      }
    }
  };

  const getPerformanceColor = (level) => {
    const colors = {
      EXCELLENT: '#28a745',
      GOOD: '#17a2b8',
      SATISFACTORY: '#ffc107',
      NEEDS_IMPROVEMENT: '#dc3545'
    };
    return colors[level] || '#6c757d';
  };

  const getPerformanceEmoji = (level) => {
    const emojis = {
      EXCELLENT: '⭐⭐⭐⭐⭐',
      GOOD: '⭐⭐⭐⭐',
      SATISFACTORY: '⭐⭐⭐',
      NEEDS_IMPROVEMENT: '⭐'
    };
    return emojis[level] || '⭐';
  };

  return (
    <div className="performance-container">
      <div className="performance-header">
        <h2>📈 Student Performance Analytics</h2>
        {userRole === 'ADMIN' && (
          <button className="btn-primary" onClick={handleRecalculateAll}>
            🔄 Recalculate All
          </button>
        )}
      </div>

      <div className="filter-section">
        <select 
          value={filterLevel} 
          onChange={(e) => setFilterLevel(e.target.value)}
        >
          <option value="">All Levels</option>
          {performanceLevels.map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading performance data...</div>
      ) : (
        <div className="performance-grid">
          {performances.map(perf => (
            <div key={perf.id} className="performance-card">
              <div className="performance-header-card" style={{borderLeftColor: getPerformanceColor(perf.performanceLevel)}}>
                <h3>Student #{perf.studentId}</h3>
                <span className="performance-emoji">{getPerformanceEmoji(perf.performanceLevel)}</span>
              </div>

              <div className="gpa-display">
                <div className="gpa-value">
                  <span className="gpa-number">{perf.overallGpa?.toFixed(2) || 'N/A'}</span>
                  <span className="gpa-label">GPA</span>
                </div>
              </div>

              <div className="performance-level" style={{backgroundColor: getPerformanceColor(perf.performanceLevel)}}>
                {perf.performanceLevel}
              </div>

              {perf.strengths && (
                <div className="performance-detail">
                  <strong>💪 Strengths:</strong>
                  <p>{perf.strengths}</p>
                </div>
              )}

              {perf.weaknesses && (
                <div className="performance-detail">
                  <strong>⚠️ Weaknesses:</strong>
                  <p>{perf.weaknesses}</p>
                </div>
              )}

              {perf.recommendations && (
                <div className="performance-detail">
                  <strong>🎯 Recommendations:</strong>
                  <p>{perf.recommendations}</p>
                </div>
              )}

              {perf.lastEvaluationDate && (
                <small className="evaluation-date">
                  Last Evaluation: {new Date(perf.lastEvaluationDate).toLocaleDateString()}
                </small>
              )}

              {userRole === 'ADMIN' && (
                <button className="btn-small" onClick={() => handleRecalculate(perf.studentId)}>
                  🔄 Recalculate
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {performances.length === 0 && !loading && (
        <div className="empty-state">
          <p>No performance data available</p>
        </div>
      )}
    </div>
  );
}
