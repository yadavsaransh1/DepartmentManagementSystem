import React, { useState, useEffect } from 'react';
import api from '../services/api';

export const StudentDocuments = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Academic categories that should NOT appear in Study Material
  // These are STRICTLY administrative/academic documents
  const ACADEMIC_CATEGORIES = ['ACADEMIC', 'CERTIFICATE', 'RESULT', 'IDENTITY', 'ADMISSION'];
  
  // Study Material categories (teacher-uploaded materials) - SHOULD appear here
  // Note: 'OTHER' appears in BOTH tabs since it's flexible for any uploader
  // It will appear in "My Documents" tab too, but that's OK for flexibility
  const STUDY_MATERIAL_CATEGORIES = ['LECTURE_NOTES', 'ASSIGNMENT', 'SYLLABUS', 'EXAM_PAPER', 'REFERENCE', 'OTHER'];

  // Helper function to format category display
  const formatCategory = (doc) => {
    if (doc.category === 'OTHER' && doc.otherCategoryValue) {
      return `Other (${doc.otherCategoryValue})`;
    }
    return doc.category;
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError('');
      // Now calling /study-materials endpoint instead of /documents
      // Backend handles all access control and filtering
      const response = await api.get('/study-materials');
      const docsList = Array.isArray(response.data) ? response.data : [];
      
      // Sort by most recent first (descending by createdAt)
      let sorted = docsList.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA; // Most recent first
      });
      
      setDocuments(sorted);
      console.log('Study Materials fetched from /study-materials:', sorted);
    } catch (err) {
      console.error('Error fetching study materials:', err);
      setError('Failed to load study materials: ' + (err.response?.data?.error || err.message));
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents
    .filter(doc => !filterCategory || doc.category === filterCategory || (doc.category && doc.category.includes(filterCategory)))
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA; // Most recent first
    });

  const categories = [...new Set(documents.map(d => d.category).filter(Boolean))];

  return (
    <div className="management-container">
      <h1>Learning Materials</h1>
      
      {error && <div className="error" style={{padding: '12px', marginBottom: '15px', backgroundColor: '#fee', color: '#c33', borderRadius: '4px'}}>{error}</div>}

      {documents.length > 0 && (
        <div style={{marginBottom: '20px'}}>
          <label style={{marginRight: '10px', fontWeight: 'bold'}}>Filter by Category:</label>
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{padding: '8px', border: '1px solid #ddd', borderRadius: '4px', minWidth: '200px'}}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      )}

      <div className="list-container">
        {loading ? (
          <p>Loading study material...</p>
        ) : filteredDocuments.length === 0 ? (
          <p style={{color: '#666', marginTop: '20px'}}>
            {documents.length === 0 
              ? 'No study material has been uploaded by teachers or administrators yet.' 
              : 'No study material matches the selected category.'}
          </p>
        ) : (
          <table className='studyM-table' style={{width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
            <thead>
              <tr style={{backgroundColor: '#0051a3', borderBottom: '2px solid #dee2e6'}}>
                <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Title</th>
                <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Category</th>
                <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Uploaded By</th>
                <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Upload Date</th>
                <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map(doc => (
                <tr key={doc.id} style={{borderBottom: '1px solid #dee2e6'}}>
                  <td style={{padding: '12px'}}>
                    <strong>{doc.title || doc.documentName}</strong>
                    {doc.description && (
                      <p style={{fontSize: '12px', color: '#666', margin: '5px 0 0 0'}}>
                        {doc.description}
                      </p>
                    )}
                  </td>
                  <td style={{padding: '12px'}}>
                    <span style={{
                      backgroundColor: doc.category === 'ROUTINE' ? '#fff3cd' : '#e3f2fd',
                      color: doc.category === 'ROUTINE' ? '#856404' : '#1976d2',
                      padding: '4px 8px',
                      borderRadius: '3px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      border: doc.category === 'ROUTINE' ? '1px solid #ffc107' : 'none'
                    }}>
                      {doc.category === 'ROUTINE' ? ' ROUTINE' : formatCategory(doc)}
                    </span>
                  </td>
                  <td style={{padding: '12px'}}>{doc.uploadedByEmail || doc.uploadedByName || 'Unknown'}</td>
                  <td style={{padding: '12px'}}>{new Date(doc.createdAt || doc.uploadmentDate).toLocaleDateString()}</td>
                  <td style={{padding: '12px'}}>
                    <button 
                      onClick={() => window.open(`/api/study-materials/${doc.id}/download`, '_blank')}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      📥 Download
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

export default StudentDocuments;
