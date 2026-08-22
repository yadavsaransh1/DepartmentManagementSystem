import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './AdminDocumentsView.css';

const AdminDocumentsView = () => {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filter states
  const [filterType, setFilterType] = useState('student'); // student or teacher
  const [programs, setPrograms] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Document categories
  const ACADEMIC_CATEGORIES = ['ACADEMIC', 'CERTIFICATE', 'RESULT', 'IDENTITY', 'ADMISSION', 'OTHER'];

  // Helper function to format category display
  const formatCategory = (doc) => {
    if (doc.category === 'OTHER' && doc.otherCategoryValue) {
      return `Other (${doc.otherCategoryValue})`;
    }
    return doc.category;
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch all documents (admin can see all)
      const docsResponse = await api.get('/documents/search');
      const docs = Array.isArray(docsResponse.data) ? docsResponse.data : docsResponse.data?.content || [];
      console.log('Documents fetched successfully:', docs.length);
      setDocuments(docs);

      // Fetch programs
      const programsResponse = await api.get('/programs');
      setPrograms(Array.isArray(programsResponse.data) ? programsResponse.data : []);

      // Fetch students
      const studentsResponse = await api.get('/students');
      const studentsData = Array.isArray(studentsResponse.data) ? studentsResponse.data : [];
      console.log('=== STUDENTS FETCHED IN ADMIN VIEW ===');
      console.log('Total students:', studentsData.length);
      console.log('Student mapping for dropdown:');
      studentsData.forEach((s, idx) => {
        if (idx < 15) {
          console.log(`${idx + 1}. Name: "${s.fullName}" | ID: ${s.id} | Email: ${s.email} | StudentID: ${s.studentId} | Program: ${s.program}`);
        }
      });
      if (studentsData.length === 0) console.warn('⚠️ NO STUDENTS FETCHED!');
      setStudents(studentsData);

      // Fetch teachers
      const teachersResponse = await api.get('/teachers');
      const teachersData = Array.isArray(teachersResponse.data) ? teachersResponse.data : [];
      console.log('=== TEACHERS FETCHED IN ADMIN VIEW ===');
      console.log('Total teachers:', teachersData.length);
      teachersData.slice(0, 3).forEach(t => {
        console.log(`Teacher: ${t.fullName} | ID: ${t.id} | Email: ${t.email}`);
      });
      if (teachersData.length === 0) console.warn('⚠️ NO TEACHERS FETCHED!');
      setTeachers(teachersData);
    } catch (err) {
      console.error('Error fetching data:', err);
      console.error('Error details:', err.response?.data || err.message);
      setError('Unable to load data. Please try again later.');
      setDocuments([]);
      setPrograms([]);
      setStudents([]);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [documents, filterType, selectedProgramId, selectedUserId, searchTerm]);

  // Fetch documents for selected user from backend
  const fetchDocumentsForUser = async (userEmail) => {
    try {
      const response = await api.get(`/documents/search?email=${encodeURIComponent(userEmail)}`);
      const docs = Array.isArray(response.data) ? response.data : response.data?.content || [];
      console.log(`Documents fetched for ${userEmail}:`, docs.length);
      setDocuments(docs);
      return docs;
    } catch (err) {
      console.error('Error fetching documents:', err);
      setDocuments([]);
      return [];
    }
  };

  // Filter students by selected program
  useEffect(() => {
    if (selectedProgramId && filterType === 'student') {
      const filtered = students.filter(student => {
        // Student.program is a String field storing the program name
        return student.program === selectedProgramId;
      });
      console.log('Filtered students for program', selectedProgramId, ':', filtered);
      setFilteredStudents(filtered);
      setSelectedUserId(''); // Reset user selection when program changes
    } else if (filterType === 'student') {
      setFilteredStudents([]);
      setSelectedUserId('');
    }
  }, [selectedProgramId, students, filterType]);

  const applyFilters = () => {
    let filtered = documents;

    console.log('=== APPLYING FILTERS ===');
    console.log('Total documents available:', documents.length);
    
    // Filter by academic categories only
    filtered = filtered.filter(doc => ACADEMIC_CATEGORIES.includes(doc.category));
    
    // Sort by most recent first (descending by createdAt)
    filtered = filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA; // Most recent first
    });

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.documentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    console.log('Final filtered documents:', filtered.length);
    setFilteredDocuments(filtered);
    setCurrentPage(1);
  };

  const handleFilterTypeChange = (type) => {
    setFilterType(type);
    setSelectedProgramId('');
    setSelectedUserId('');
    setFilteredStudents([]);
  };

  const handleProgramSelection = (e) => {
    setSelectedProgramId(e.target.value);
  };

  const handleUserSelection = (e) => {
    const selectedValue = e.target.value;
    console.log('=== USER SELECTION ===');
    console.log('Selected from dropdown:', selectedValue);
    console.log('Filter type:', filterType);
    
    // Show details of selected user
    const usersList = filterType === 'student' ? filteredStudents : teachers;
    const selectedUser = usersList.find(u => u.id && u.id.toString() === selectedValue);
    
    if (selectedUser) {
      console.log('Selected user details:', {
        fullName: selectedUser.fullName,
        id: selectedUser.id,
        email: selectedUser.email
      });
      
      // Fetch documents FOR this user from backend
      setSelectedUserId(selectedValue);
      fetchDocumentsForUser(selectedUser.email);
    } else {
      console.warn('Selected user not found in list!');
      setSelectedUserId('');
      setDocuments([]);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await api.delete(`/documents/${documentId}`);
      setSuccess('Document deleted successfully!');
      setDocuments(documents.filter(doc => doc.id !== documentId));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete document');
      console.error('Error deleting document:', err);
    }
  };

  const handleDownload = async (documentId, fileName) => {
    try {
      const response = await api.get(`/documents/${documentId}/download`, {
        responseType: 'blob'
      });
      // Use Content-Type from response headers to preserve file type
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

  // Pagination logic
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDocuments = filteredDocuments.slice(startIndex, endIndex);

  const currentUser = filterType === 'student'
    ? students.find(s => s.id && s.id.toString() === selectedUserId)
    : teachers.find(t => t.id && t.id.toString() === selectedUserId);
  // if (loading) {
  //   return <div className="admin-documents-container"><p>Loading...</p></div>;
  // }

  return (
    <div className="admin-documents-container">
      <h2>📋 View Document</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="filter-section">
        {/* Filter Type Selection */}
        <div className="filter-type-selector">
          <button
            className={`type-btn ${filterType === 'student' ? 'active' : ''}`}
            onClick={() => handleFilterTypeChange('student')}
          >
            👤 Student Documents
          </button>
          <button
            className={`type-btn ${filterType === 'teacher' ? 'active' : ''}`}
            onClick={() => handleFilterTypeChange('teacher')}
          >
            🎓 Teacher Documents
          </button>
        </div>

        {/* Program Selection - Only for Students */}
        {filterType === 'student' && (
          <div className="filter-group">
            <label htmlFor="program-select">Select Program:</label>
            <select
              id="program-select"
              value={selectedProgramId}
              onChange={handleProgramSelection}
              className="filter-select"
            >
              <option value="">-- Select a Program --</option>
              {programs.map(program => (
                <option key={program.id} value={program.name}>
                  {program.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* User Selection */}
        <div className="filter-group">
          <label htmlFor="user-select">
            Select {filterType === 'student' ? 'Student' : 'Teacher'}:
          </label>
          <select
            id="user-select"
            value={selectedUserId}
            onChange={handleUserSelection}
            disabled={filterType === 'student' && !selectedProgramId}
            className="filter-select"
          >
            <option value="">-- Select {filterType === 'student' ? 'a Student' : 'a Teacher'} --</option>
            {(filterType === 'student' ? filteredStudents : teachers).map(user => (
              <option key={user.id} value={user.id}>
                {filterType === 'student'
                  ? `${user.fullName} (${user.studentId})`
                  : `${user.fullName} (${user.designation})`
                }
              </option>
            ))}
          </select>
        </div>

        {/* Search Filter */}
        <div className="filter-row">
          <div className="filter-group flex-1">
            <label htmlFor="search-input">🔍 Search Academic Documents:</label>
            <input
              id="search-input"
              type="text"
              placeholder="Search by title, description..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="filter-input"
            />
          </div>
        </div>
      </div>

      {/* Results Summary */}
      {selectedUserId && currentUser && (
        <div className="results-summary">
          <h3>
            📜 Academic Documents for: <span className="user-name">{currentUser.fullName}</span>
          </h3>
          <p className="result-count">
            Showing {paginatedDocuments.length > 0 ? startIndex + 1 : 0} - {Math.min(endIndex, filteredDocuments.length)} of {filteredDocuments.length} document(s)
          </p>
        </div>
      )}

      {/* Documents Table */}
      {selectedUserId && filteredDocuments.length > 0 ? (
        <div className="documents-table-container">
          <table className="documents-table">
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Category</th>
                <th>Uploaded At</th>
                <th>Downloads</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDocuments.map(doc => (
                <tr key={doc.id}>
                  <td className="doc-name-col">
                    <div className="doc-name">
                      <div className="name-title">{doc.title || doc.documentName}</div>
                      {doc.description && <div className="name-desc">{doc.description}</div>}
                    </div>
                  </td>
                  <td>
                    <span className={`category-badge category-${doc.category?.toLowerCase()}`}>
                      {formatCategory(doc)}
                    </span>
                  </td>
                  <td>{formatDate(doc.createdAt)}</td>
                  <td className="center">{doc.downloadCount || 0}</td>
                  <td className="actions-col">
                    <button
                      className="btn btn-sm btn-download"
                      onClick={() => handleDownload(doc.id, doc.documentName)}
                      title="Download document"
                    >
                      Download
                    </button>
                    <button
                      className="btn btn-sm btn-delete"
                      onClick={() => handleDelete(doc.id)}
                      title="Delete document"
                    >
                       Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                ← Previous
              </button>
              <span className="page-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      ) : selectedUserId ? (
        <div className="no-documents">
          <p>No academic documents found for {currentUser?.fullName}.</p>
        </div>
      ) : (
        <div className="no-selection">
          <p>
            {filterType === 'student' && !selectedProgramId
              ? '👉 Select a program first to view students'
              : `👉 Select a ${filterType === 'student' ? 'student' : 'teacher'} to view their academic documents`
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminDocumentsView;
