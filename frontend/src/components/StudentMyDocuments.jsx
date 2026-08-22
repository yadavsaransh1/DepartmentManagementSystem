import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './StudentMyDocuments.css';

const StudentMyDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Helper function to format category display
  const formatCategory = (doc) => {
    if (doc.category === 'OTHER' && doc.otherCategoryValue) {
      return `Other (${doc.otherCategoryValue})`;
    }
    return doc.category;
  };

  useEffect(() => {
    fetchMyDocuments();
  }, []);

  const fetchMyDocuments = async () => {
    try {
      setLoading(true);
      setError('');
      // Fetch documents accessible to the logged-in student
      // Backend now returns only academic documents (NO study materials)
      const response = await api.get('/documents');
      const docs = Array.isArray(response.data) ? response.data : response.data?.content || [];
      console.log('Student My Documents fetched:', docs);
      setDocuments(docs);
      filterDocuments(docs, '');
    } catch (err) {
      console.error('Error fetching documents:', err);
      console.error('Error details:', err.response?.data || err.message);
      setError('Unable to load documents. Please try again later.');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = (docs, search) => {
    let filtered = docs;
    
    // Sort by most recent first (descending by createdAt)
    filtered = filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA; // Most recent first
    });

    if (search) {
      filtered = filtered.filter(doc =>
        doc.documentName?.toLowerCase().includes(search.toLowerCase()) ||
        doc.title?.toLowerCase().includes(search.toLowerCase()) ||
        doc.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredDocuments(filtered);
  };

  const handleSearchChange = (e) => {
    const search = e.target.value;
    setSearchTerm(search);
    filterDocuments(documents, search);
  };

  const handleDownload = async (documentId, fileName) => {
    try {
      const response = await api.get(`/documents/${documentId}/download`, {
        responseType: 'blob'
      });
      const contentType = response.headers['content-type'] || 'application/octet-stream';
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download document');
      console.error('Error downloading document:', err);
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await api.delete(`/documents/${documentId}`);
      setSuccess('Document deleted successfully!');
      const updatedDocs = documents.filter(doc => doc.id !== documentId);
      setDocuments(updatedDocs);
      filterDocuments(updatedDocs, searchTerm);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete document');
      console.error('Error deleting document:', err);
    }
  };

  // const formatFileSize = (bytes) => {
  //   if (!bytes) return '0 B';
  //   const k = 1024;
  //   const sizes = ['B', 'KB', 'MB', 'GB'];
  //   const i = Math.floor(Math.log(bytes) / Math.log(k));
  //   return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  // };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="my-documents-container"><p>Loading documents...</p></div>;
  }

  return (
    <div className="my-documents-container">
      <h2>📄 My Documents</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="documents-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
      </div>

      {filteredDocuments.length === 0 ? (
        <div className="no-documents">
          <p>No documents found. Check back later for uploaded documents!</p>
        </div>
      ) : (
        <div className="documents-grid">
          {filteredDocuments.map(doc => (
            <div key={doc.id} className="document-card">
              <div className="doc-header">
                <h4>{doc.title || doc.documentName}</h4>
                <span className={`category-badge category-${doc.category?.toLowerCase()}`}>
                  {formatCategory(doc)}
                </span>
              </div>

              {doc.description && (
                <p className="doc-description">{doc.description}</p>
              )}

              <div className="doc-meta">
                <div className="meta-item">
                  <span className="meta-label">Uploaded:</span>
                  <span className="meta-value">{formatDate(doc.createdAt)}</span>
                </div>
                {/* <div className="meta-item">
                  <span className="meta-label">Size:</span>
                  <span className="meta-value">{doc.fileSize ? formatFileSize(doc.fileSize) : 'N/A'}</span>
                </div> */}
                <div className="meta-item">
                  <span className="meta-label">Downloads:</span>
                  <span className="meta-value">{doc.downloadCount || 0}</span>
                </div>
              </div>

              <div className="doc-actions">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleDownload(doc.id, doc.documentName)}
                  title="Download this document"
                >
                   Download
                </button>
                {/* Delete button can be enabled if users need to delete their received documents */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentMyDocuments;
