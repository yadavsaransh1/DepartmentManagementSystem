import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/noticeBoard.css';
import { NOTICE_ENDPOINTS } from '../config/api';

const NoticeBoard = () => {
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const response = await fetch(NOTICE_ENDPOINTS.ALL_NOTICES);
      if (response.ok) {
        const data = await response.json();
        // Filter active notices and sort by most recent
        const activeNotices = data.filter(n => n.isActive).sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setNotices(activeNotices);
      }
    } catch (error) {
      console.error('Error fetching notices:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateTime) => {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  const formatTime = (dateTime) => {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleDownload = async (notice) => {
    try {
      setDownloadingId(notice.id);
      const response = await fetch(NOTICE_ENDPOINTS.DOWNLOAD(notice.id));
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = notice.fileName || 'notice.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error downloading PDF');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleViewAll = () => {
    navigate('/all-notices', { state: { notices } });
  };

  if (loading) {
    return <div className="notice-board-loading">Loading notices...</div>;
  }

  if (notices.length === 0) {
    return null; // Don't show section if no notices
  }

  // Show only top 3 notices
  const displayedNotices = notices.slice(0, 6);

  return (
    <div className="notice-board-section">
      <div className="notice-board-header">
        <div className="header-left">
          <h2>📢 Department Notice Board</h2>
          <p className="subtitle"></p>
        </div>
        {notices.length > 6 && (
          <button className="view-all-btn" onClick={handleViewAll}>
            VIEW ALL →
          </button>
        )}
      </div>

      <div className="notices-container">
        {displayedNotices.map((notice) => (
          <div key={notice.id} className="notice-card">
            <div className="notice-date">
              <div className="date-day">{formatDate(notice.createdAt).split(' ')[1]}</div>
              <div className="date-month">{formatDate(notice.createdAt).split(' ')[0]}</div>
            </div>

            <div className="notice-content">
              <button
                className="notice-title-btn"
                onClick={() => handleDownload(notice)}
                disabled={downloadingId === notice.id}
                title="Click to download PDF"
              >
                {downloadingId === notice.id ? '⏳...' : notice.title}
              </button>

              <div className="notice-meta">
                {notice.tag && (
                  <span className={`notice-tag tag-${notice.tag.toLowerCase().replace(' ', '-')}`}>
                    {notice.tag}
                  </span>
                )}
                <span className="notice-time">
                  {formatTime(notice.createdAt)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NoticeBoard;
