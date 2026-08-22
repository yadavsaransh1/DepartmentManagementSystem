import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/viewAllNotices.css';
import { NOTICE_ENDPOINTS } from '../config/api';

const ViewAllNotices = () => {
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [filteredNotices, setFilteredNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [searchTitle, setSearchTitle] = useState('');
  const [filterTag, setFilterTag] = useState('');

  useEffect(() => {
    fetchNotices();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [notices, searchTitle, filterTag]);

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

  const applyFilters = () => {
    let filtered = notices;

    // Filter by title
    if (searchTitle.trim()) {
      filtered = filtered.filter(notice =>
        notice.title.toLowerCase().includes(searchTitle.toLowerCase())
      );
    }

    // Filter by tag
    if (filterTag) {
      filtered = filtered.filter(notice =>
        notice.tag && notice.tag.toLowerCase() === filterTag.toLowerCase()
      );
    }

    setFilteredNotices(filtered);
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

  const handleClearFilters = () => {
    setSearchTitle('');
    setFilterTag('');
  };

  if (loading) {
    return (
      <div className="view-all-notices-page">
        <div className="loading-message">Loading all notices...</div>
      </div>
    );
  }

  return (
    <div className="view-all-notices-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>📢 All Notices</h1>
        <div className="notices-count">Total: {filteredNotices.length}</div>
      </div>

      <div className="filters-container">
        <div className="filter-group">
          <label>Search by Title</label>
          <input
            type="text"
            placeholder="Search by title..."
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label>Filter by Tag</label>
          <input
            type="text"
            placeholder="e.g., Urgent, Important..."
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="filter-input"
          />
        </div>

        <button
          className="clear-filters-btn"
          onClick={handleClearFilters}
          disabled={!searchTitle && !filterTag}
        >
          Clear Filters
        </button>
      </div>

      {filteredNotices.length === 0 ? (
        <div className="no-results">
          {notices.length === 0 ? 'No notices available' : 'No notices match your filters'}
        </div>
      ) : (
        <div className="notices-grid">
          {filteredNotices.map((notice) => (
            <div key={notice.id} className="notice-card">
              <div className="notice-date">
                <div className="date-day">{formatDate(notice.createdAt).split(' ')[1]}</div>
                <div className="date-month">{formatDate(notice.createdAt).split(' ')[0]}</div>
              </div>

              <div className="card-content">
                <button
                  className="notice-title"
                  onClick={() => handleDownload(notice)}
                  disabled={downloadingId === notice.id}
                  title="Click to download PDF"
                >
                  {downloadingId === notice.id ? '⏳ Downloading...' : notice.title}
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
      )}
    </div>
  );
};

export default ViewAllNotices;
