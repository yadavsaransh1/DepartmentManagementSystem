import React, { useState, useEffect } from 'react';
import '../styles/adminNotice.css';
import { NOTICE_ENDPOINTS } from '../config/api';

const AdminNotice = () => {
  const [notices, setNotices] = useState([]);
  const [filteredNotices, setFilteredNotices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    tag: 'General'
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [searchTitle, setSearchTitle] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    fetchAllNotices();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [notices, searchTitle, filterStartDate, filterEndDate, filterTag]);

  const fetchAllNotices = async () => {
    try {
      setLoading(true);
      const response = await fetch(NOTICE_ENDPOINTS.ALL_NOTICES);
      if (response.ok) {
        const data = await response.json();
        setNotices(data);
      } else {
        setMessage('Error loading notices');
      }
    } catch (error) {
      console.error('Error fetching notices:', error);
      setMessage(`Error loading notices: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setMessage('');
    } else {
      setMessage('Please select a PDF file');
      setSelectedFile(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title) {
      setMessage('Please enter notice title');
      return;
    }

    if (!selectedFile) {
      setMessage('Please select a PDF file');
      return;
    }

    try {
      setUploading(true);
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('tag', formData.tag);
      submitData.append('file', selectedFile);

      const response = await fetch(NOTICE_ENDPOINTS.UPLOAD, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: submitData
      });

      if (response.ok) {
        setMessage('Notice uploaded successfully');
        setFormData({ title: '', tag: '' });
        setSelectedFile(null);
        setShowForm(false);
        fetchAllNotices();
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setMessage(`Error: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error uploading notice:', error);
      setMessage(`Error uploading notice: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (notice) => {
    setFormData({
      title: notice.title,
      tag: notice.tag || ''
    });
    setEditingId(notice.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      try {
        const response = await fetch(NOTICE_ENDPOINTS.DELETE(id), {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          setMessage('Notice deleted successfully');
          fetchAllNotices();
          setTimeout(() => setMessage(''), 3000);
        } else {
          setMessage('Error deleting notice');
        }
      } catch (error) {
        console.error('Error deleting notice:', error);
        setMessage(`Error deleting notice: ${error.message}`);
      }
    }
  };

  const handleDownload = async (notice) => {
    try {
      setDownloading(notice.id);
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
        setMessage('Notice downloaded successfully');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      setMessage(`Error downloading PDF: ${error.message}`);
    } finally {
      setDownloading(null);
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

    // Filter by date range
    if (filterStartDate) {
      const startDate = new Date(filterStartDate);
      startDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(notice => {
        const noticeDate = new Date(notice.createdAt);
        noticeDate.setHours(0, 0, 0, 0);
        return noticeDate >= startDate;
      });
    }

    if (filterEndDate) {
      const endDate = new Date(filterEndDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(notice => {
        const noticeDate = new Date(notice.createdAt);
        return noticeDate <= endDate;
      });
    }

    setFilteredNotices(filtered);
  };

  const handleClearFilters = () => {
    setSearchTitle('');
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterTag('');
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ title: '', tag: 'General' });
    setSelectedFile(null);
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    return date.toLocaleString('en-IN', { 
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="admin-loading">Loading...</div>;
  }

  return (
    <div className="admin-notice">
      <div className="admin-header">
        <h2>📌 Notice Board Management</h2>
        <button 
          className="add-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Close' : '+ Upload Notice'}
        </button>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit} className="notice-form">
            <div className="form-group">
              <label>Notice Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., PhD Viva Examination Announcement"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>PDF File *</label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="file-input"
              />
              {selectedFile && (
                <small className="file-info">
                  ✓ Selected: {selectedFile.name}
                </small>
              )}
            </div>

            <div className="form-group">
              <label>Tag</label>
              <input
                type="text"
                name="tag"
                value={formData.tag}
                onChange={handleInputChange}
                placeholder="e.g., Important, Urgent, General"
                className="form-input"
              />
              <small>Use tags like: Important, Urgent, Deadline, General, etc.</small>
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn-save"
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : '📤 Upload Notice'}
              </button>
              <button 
                type="button"
                className="btn-cancel"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="notices-list">
        <h3>All Notices ({filteredNotices.length})</h3>

        {notices.length > 0 && (
          <div className="filter-wrapper">
          <div className="filter-section">
            <div className="filter-group">
              <label>Search by Title</label>
              <input
                type="text"
                placeholder="Enter notice title..."
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

            <div className="filter-group">
              <label>From Date</label>
              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label>To Date</label>
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="filter-input"
              />
            </div>

            <button
              className="btn-clear-filters"
              onClick={handleClearFilters}
              disabled={!searchTitle && !filterStartDate && !filterEndDate && !filterTag}
            >
              Clear Filters
            </button>
          </div>
          </div>
        )}

        {filteredNotices.length === 0 ? (
          <p className="no-data">
            {notices.length === 0 ? 'No notices yet' : 'No notices match your filters'}
          </p>
        ) : (
          <table className="notices-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Tag</th>
                <th>Date & Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredNotices.map((notice) => (
                <tr key={notice.id}>
                  <td className="title-cell">{notice.title}</td>
                  <td>
                    {notice.tag ? (
                      <span className="tag">{notice.tag}</span>
                    ) : (
                      <span className="no-tag">-</span>
                    )}
                  </td>
                  <td className="date-cell">
                    {formatDateTime(notice.createdAt)}
                  </td>
                  <td className="actions-cell">
                    <button
                      className="btn-download"
                      onClick={() => handleDownload(notice)}
                      disabled={downloading === notice.id}
                      title="Download PDF"
                    >
                      {downloading === notice.id ? '⏳' : 'Download'}
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(notice.id)}
                      title="Delete"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminNotice;
