import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/apiClient';
import '../styles/TeacherCertificateDashboard.css';

const TeacherCertificateDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [formData, setFormData] = useState({
    certificateName: '',
    issuer: '',
    issuedDate: '',
    expiryDate: '',
    file: null,
    description: ''
  });

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/certificates/teacher/${user.email}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCertificates(data);
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        setMessage('File size exceeds 20MB limit');
        setMessageType('error');
        return;
      }
      setFormData(prev => ({
        ...prev,
        file: file
      }));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!formData.certificateName || !formData.issuer || !formData.issuedDate || !formData.file) {
      setMessage('Please fill all required fields');
      setMessageType('error');
      return;
    }

    setLoading(true);
    const uploadFormData = new FormData();
    uploadFormData.append('file', formData.file);
    uploadFormData.append('teacherEmail', user.email);
    uploadFormData.append('certificateName', formData.certificateName);
    uploadFormData.append('issuer', formData.issuer);
    uploadFormData.append('issuedDate', formData.issuedDate);
    uploadFormData.append('expiryDate', formData.expiryDate);
    uploadFormData.append('description', formData.description);

    try {
      const response = await fetch(`${API_BASE_URL}/api/certificates/upload`, {
        method: 'POST',
        body: uploadFormData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const newCert = await response.json();
        setCertificates(prev => [newCert, ...prev]);
        resetForm();
        setMessage('Certificate uploaded successfully');
        setMessageType('success');
      } else {
        setMessage('Failed to upload certificate');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('Error uploading certificate');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (certificateId) => {
    const cert = certificates.find(c => c.id === certificateId);
    if (!cert) return;

    const updatedData = {
      certificateName: cert.certificateName,
      issuer: cert.issuer,
      issuedDate: cert.issuedDate,
      expiryDate: cert.expiryDate,
      description: cert.description
    };

    setLoading(true);
    try {
      const params = new URLSearchParams(updatedData);
      const response = await fetch(
        `${API_BASE_URL}/api/certificates/${certificateId}?${params.toString()}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.ok) {
        setMessage('Certificate updated successfully');
        setMessageType('success');
        setEditingId(null);
        fetchCertificates();
      }
    } catch (error) {
      console.error('Update error:', error);
      setMessage('Error updating certificate');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (certificateId, fileName) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/certificates/${certificateId}/download`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const handleDelete = async (certificateId) => {
    if (!window.confirm('Are you sure you want to delete this certificate?')) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/certificates/${certificateId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.ok) {
        setCertificates(prev => prev.filter(c => c.id !== certificateId));
        setMessage('Certificate deleted successfully');
        setMessageType('success');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setMessage('Error deleting certificate');
      setMessageType('error');
    }
  };

  const resetForm = () => {
    setFormData({
      certificateName: '',
      issuer: '',
      issuedDate: '',
      expiryDate: '',
      file: null,
      description: ''
    });
    setShowUploadForm(false);
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="certificate-dashboard">
      <div className="certificate-header">
        <h2>My Certificates</h2>
        <button 
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="btn-add-cert"
        >
          {showUploadForm ? 'Cancel' : '+ Add Certificate'}
        </button>
      </div>

      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      {showUploadForm && (
        <div className="cert-form-container">
          <h3>Upload New Certificate</h3>
          <form onSubmit={handleUpload} className="cert-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="certificateName">Certificate Name *</label>
                <input
                  type="text"
                  id="certificateName"
                  name="certificateName"
                  value={formData.certificateName}
                  onChange={handleInputChange}
                  placeholder="e.g., AWS Certified Solutions Architect"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="issuer">Issuing Organization *</label>
                <input
                  type="text"
                  id="issuer"
                  name="issuer"
                  value={formData.issuer}
                  onChange={handleInputChange}
                  placeholder="e.g., Amazon Web Services"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="issuedDate">Date Issued *</label>
                <input
                  type="date"
                  id="issuedDate"
                  name="issuedDate"
                  value={formData.issuedDate}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="expiryDate">Expiry Date</label>
                <input
                  type="date"
                  id="expiryDate"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="file">Certificate File (PDF) *</label>
              <input
                type="file"
                id="file"
                accept=".pdf"
                onChange={handleFileChange}
                disabled={loading}
              />
              {formData.file && <p className="file-name">Selected: {formData.file.name}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Additional details about this certificate"
                rows="3"
                disabled={loading}
              />
            </div>

            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? 'Uploading...' : 'Upload Certificate'}
            </button>
          </form>
        </div>
      )}

      <div className="certificates-list">
        {certificates.length === 0 ? (
          <p className="no-certs">No certificates uploaded yet. Click "Add Certificate" to get started.</p>
        ) : (
          <div className="certs-grid">
            {certificates.map(cert => (
              <div key={cert.id} className="cert-card">
                <div className="cert-top">
                  <h4>{cert.certificateName}</h4>
                  <span className="cert-issuer">{cert.issuer}</span>
                </div>

                <div className="cert-dates">
                  <p><strong>Issued:</strong> {cert.issuedDate}</p>
                  {cert.expiryDate && <p><strong>Expires:</strong> {cert.expiryDate}</p>}
                </div>

                {cert.description && (
                  <p className="cert-description">{cert.description}</p>
                )}

                <div className="cert-meta">
                  <p><strong>File:</strong> {cert.fileName}</p>
                  <p><strong>Size:</strong> {(cert.fileSize / 1024).toFixed(2)} KB</p>
                  <p><strong>Downloads:</strong> {cert.downloadCount}</p>
                  <p><strong>Uploaded:</strong> {cert.createdAt}</p>
                </div>

                <div className="cert-actions">
                  <button 
                    onClick={() => handleDownload(cert.id, cert.fileName)}
                    className="btn-action btn-download"
                  >
                    Download
                  </button>
                  <button 
                    onClick={() => handleDelete(cert.id)}
                    className="btn-action btn-delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherCertificateDashboard;

