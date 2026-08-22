import React, { useState, useEffect } from 'react';
import api from '../services/api';
import * as XLSX from 'xlsx';
import '../styles/admin-teacher-details.css';

const TeacherCardWithPicture = ({ teacher, onViewDetails, fetchTeacherDetails }) => {
  const [profilePic, setProfilePic] = useState('');
  
  useEffect(() => {
    const loadPicture = async () => {
      try {
        const details = await fetchTeacherDetails(teacher.id);
        if (details?.profilePictureUrl) {
          setProfilePic(details.profilePictureUrl);
        }
      } catch (err) {
        console.log('Could not load profile picture for', teacher.fullName);
      }
    };
    loadPicture();
  }, [teacher.id]);

  return (
    <div key={teacher.id} className="teacher-card">
      {profilePic && (
        <div className="card-picture">
          <img src={profilePic} alt={teacher.fullName} className="card-image" />
        </div>
      )}
      <div className="card-header">
        <h4>{teacher.fullName}</h4>
        <span className="dept">{teacher.department || 'N/A'}</span>
      </div>
      <div className="card-body">
        <p className="email">{teacher.email}</p>
        <p className="id">ID: {teacher.teacherId || 'N/A'}</p>
      </div>
      <button
        onClick={() => onViewDetails(teacher)}
        className="btn btn-view"
      >
        View Details →
      </button>
    </div>
  );
};

const AdminTeacherDetails = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [search, setSearch] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedFields, setSelectedFields] = useState({});

  const allFields = {
    basic: [
      { key: 'fullName', label: 'Full Name' },
      { key: 'email', label: 'Email' },
      { key: 'teacherId', label: 'Teacher ID' },
      { key: 'employeeId', label: 'Employee ID' },
      { key: 'department', label: 'Department' },
      { key: 'dateOfBirth', label: 'Date of Birth' }
    ],
    education: [
      { key: 'education', label: 'Education' },
      { key: 'certifications', label: 'Certifications' }
    ],
    professional: [
      { key: 'skillsAbilities', label: 'Skills & Abilities' },
      { key: 'workExperiences', label: 'Work Experience' },
      { key: 'booksAuthored', label: 'Books Authored' },
      { key: 'patents', label: 'Patents' },
      { key: 'projects', label: 'Projects' }
    ],
    publications: [
      { key: 'journalPublications', label: 'Journal Publications' },
      { key: 'bookChapters', label: 'Book Chapters' },
      { key: 'conferencePresentation', label: 'Conference Presentations' },
      { key: 'invitedTalk', label: 'Invited Talks' }
    ],
    responsibilities: [
      { key: 'administrativeResponsibilities', label: 'Administrative Responsibilities' },
      { key: 'academicContribution', label: 'Academic Contribution' }
    ]
  };

  useEffect(() => {
    fetchAllTeachers();
    // Initialize selected fields
    const initialSelection = {};
    Object.values(allFields).forEach(group => {
      group.forEach(field => {
        initialSelection[field.key] = true;
      });
    });
    setSelectedFields(initialSelection);
  }, []);

  const fetchAllTeachers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/teachers');
      const teachersData = Array.isArray(response.data) ? response.data : [];
      setTeachers(teachersData);
    } catch (err) {
      console.error('Error fetching teachers:', err);
      setError('Failed to load teachers: ' + (err.response?.data?.message || err.message));
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherDetails = async (teacherId) => {
    try {
      const response = await api.get(`/teacher-details/${teacherId}`);
      if (response.data && response.data.data) {
        const details = response.data.data;
        const parsedDetails = { ...details };
        
        // ResponseDTO returns already-parsed data (no need to parse JSON)
        // The fields are: education, certifications, workExperiences, etc. (not *Json)
        if (details.education) parsedDetails.education = details.education;
        if (details.certifications) parsedDetails.certifications = details.certifications;
        if (details.workExperiences) parsedDetails.workExperiences = details.workExperiences;
        if (details.journalPublications) parsedDetails.journalPublications = details.journalPublications;
        if (details.bookChapters) parsedDetails.bookChapters = details.bookChapters;
        if (details.conferencePresentation) parsedDetails.conferencePresentation = details.conferencePresentation;
        if (details.booksAuthored) parsedDetails.booksAuthored = details.booksAuthored;
        if (details.patents) parsedDetails.patents = details.patents;
        if (details.projects) parsedDetails.projects = details.projects;
        if (details.invitedTalk) parsedDetails.invitedTalk = details.invitedTalk;
        if (details.customFields) parsedDetails.customFields = details.customFields;
        
        // Binary data already comes as Base64 data URIs from ResponseDTO
        if (details.profilePictureBase64) {
          parsedDetails.profilePictureUrl = details.profilePictureBase64;
        }
        if (details.resumeBase64) {
          parsedDetails.resumeUrl = details.resumeBase64;
          parsedDetails.resumeData = details.resumeBase64;
          parsedDetails.resumeType = details.resumeType || 'application/pdf';
        }
        
        return parsedDetails;
      }
      return null;
    } catch (err) {
      console.log('No details found for teacher', teacherId);
      return null;
    }
  };

  const handleViewDetails = async (teacher) => {
    try {
      const details = await fetchTeacherDetails(teacher.id);
      setSelectedTeacher({
        ...teacher,
        details: details || {}
      });
    } catch (err) {
      console.error('Error fetching details:', err);
    }
  };

  const downloadResume = (teacherName, resumeUrl, resumeType) => {
    if (!resumeUrl) {
      setError('No resume available to download');
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = resumeUrl;
      
      // Determine file extension based on MIME type
      const extensionMap = {
        'application/pdf': 'pdf',
        'application/msword': 'doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx'
      };
      const extension = extensionMap[resumeType] || 'pdf';
      
      link.download = `${teacherName.replace(/\s+/g, '_')}_resume.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setMessage(`✓ Resume downloaded successfully!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Failed to download resume: ' + err.message);
    }
  };

  const getTeacherProfilePicture = async (teacher) => {
    try {
      const details = await fetchTeacherDetails(teacher.id);
      return details?.profilePictureUrl || null;
    } catch (err) {
      return null;
    }
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    teacher.email?.toLowerCase().includes(search.toLowerCase()) ||
    teacher.teacherId?.toLowerCase().includes(search.toLowerCase())
  );

  const formatValue = (value) => {
    if (!value) return 'N/A';
    if (Array.isArray(value)) {
      return value.length > 0 ? `${value.length} entries` : 'N/A';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value).substring(0, 100);
  };

  const exportToExcel = async () => {
    try {
      setMessage('');
      
      // Determine if we're exporting single teacher or all teachers
      const teachersToExport = selectedTeacher ? [selectedTeacher] : teachers;
      
      // Fetch details for teachers being exported
      const teachersDataWithDetails = await Promise.all(
        teachersToExport.map(async (teacher) => {
          // If it's selectedTeacher, it already has details
          if (selectedTeacher && teacher.id === selectedTeacher.id) {
            return teacher;
          }
          // Otherwise, fetch details
          const details = await fetchTeacherDetails(teacher.id);
          return { ...teacher, details: details || {} };
        })
      );

      const selectedTeachersData = teachersDataWithDetails.map(teacherData => {
        const row = {
          'Full Name': teacherData.fullName || '',
          'Email': teacherData.email || '',
          'Teacher ID': teacherData.teacherId || '',
          'Department': teacherData.department || '',
        };

        // Add selected detail fields
        Object.entries(selectedFields).forEach(([field, selected]) => {
          if (!selected) return;
          
          const detail = teacherData.details;
          if (!detail) return;

          switch(field) {
            case 'dateOfBirth':
              row['Date of Birth'] = detail.dateOfBirth || '';
              break;
            case 'skillsAbilities':
              row['Skills & Abilities'] = detail.skillsAbilities || '';
              break;
            case 'education':
              if (detail.education && detail.education.length > 0) {
                row['Education'] = detail.education.map(e => `${e.degree} (${e.institution}, ${e.year})`).join('; ');
              }
              break;
            case 'certifications':
              if (detail.certifications && detail.certifications.length > 0) {
                row['Certifications'] = detail.certifications.map(c => `${c.name} (${c.issuer}, ${c.year})`).join('; ');
              }
              break;
            case 'workExperiences':
              if (detail.workExperiences && detail.workExperiences.length > 0) {
                row['Work Experience'] = detail.workExperiences.map(w => `${w.position} at ${w.company} (${w.startYear}-${w.endYear || 'Present'})`).join('; ');
              }
              break;
            case 'journalPublications':
              if (detail.journalPublications && detail.journalPublications.length > 0) {
                row['Journal Publications'] = detail.journalPublications.length;
              }
              break;
            case 'bookChapters':
              if (detail.bookChapters && detail.bookChapters.length > 0) {
                row['Book Chapters'] = detail.bookChapters.length;
              }
              break;
            case 'conferencePresentation':
              if (detail.conferencePresentation && detail.conferencePresentation.length > 0) {
                row['Conferences'] = detail.conferencePresentation.length;
              }
              break;
            case 'booksAuthored':
              if (detail.booksAuthored && detail.booksAuthored.length > 0) {
                row['Books Authored'] = detail.booksAuthored.map(b => `${b.title} (${b.year})`).join('; ');
              }
              break;
            case 'patents':
              if (detail.patents && detail.patents.length > 0) {
                row['Patents'] = detail.patents.length;
              }
              break;
            case 'projects':
              if (detail.projects && detail.projects.length > 0) {
                row['Projects'] = detail.projects.map(p => `${p?.title || 'Untitled'} (${p?.year || 'N/A'})`).join('; ');
              }
              break;
            case 'invitedTalk':
              if (detail.invitedTalk && detail.invitedTalk.length > 0) {
                row['Invited Talks'] = detail.invitedTalk.length;
              }
              break;
            case 'administrativeResponsibilities':
              row['Administrative Responsibilities'] = detail.administrativeResponsibilities || '';
              break;
            case 'academicContribution':
              row['Academic Contribution'] = detail.academicContribution || '';
              break;
            default:
              break;
          }
        });

        return row;
      });

      const ws = XLSX.utils.json_to_sheet(selectedTeachersData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Teacher Details');

      // Auto-adjust column width
      const colWidths = [];
      Object.keys(selectedTeachersData[0] || {}).forEach(() => {
        colWidths.push({ wch: 25 });
      });
      ws['!cols'] = colWidths;

      // Generate filename based on single or multiple teachers
      const filename = selectedTeacher 
        ? `${selectedTeacher.fullName.replace(/\s+/g, '_')}_details.xlsx`
        : `teacher-details-${new Date().toISOString().split('T')[0]}.xlsx`;
      
      XLSX.writeFile(wb, filename);
      
      const exportMsg = selectedTeacher 
        ? `✓ Export successful! Downloaded ${selectedTeacher.fullName}'s details.`
        : '✓ Export successful! Downloaded all teacher details.';
      
      setMessage(exportMsg);
      setShowExportModal(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export: ' + err.message);
    }
  };

  const toggleFieldSelection = (fieldKey) => {
    setSelectedFields(prev => ({
      ...prev,
      [fieldKey]: !prev[fieldKey]
    }));
  };

  const toggleGroupSelection = (groupKey) => {
    const group = allFields[groupKey];
    const allSelected = group.every(field => selectedFields[field.key]);
    
    const newSelection = { ...selectedFields };
    group.forEach(field => {
      newSelection[field.key] = !allSelected;
    });
    setSelectedFields(newSelection);
  };

  return (
    <div className="admin-teacher-details">
      <div className="header-teacher">
        <h2>👨‍🏫 Teacher Details Management</h2>
        <p>View and manage complete teacher profile information</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <div className="controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search by name, email, or teacher ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <button onClick={() => setShowExportModal(true)} className="btn btn-export">
          📊 Export to Excel
        </button>
      </div>

      {showExportModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>📊 Select Fields to Export</h3>
              <button onClick={() => setShowExportModal(false)} className="close-btn">✕</button>
            </div>

            <div className="field-selection">
              {Object.entries(allFields).map(([groupKey, groupFields]) => (
                <div key={groupKey} className="field-group">
                  <div className="group-header">
                    <input
                      type="checkbox"
                      checked={groupFields.every(field => selectedFields[field.key])}
                      onChange={() => toggleGroupSelection(groupKey)}
                      className="group-checkbox"
                    />
                    <label className="group-label">
                      {groupKey.charAt(0).toUpperCase() + groupKey.slice(1).replace(/([A-Z])/g, ' $1')}
                    </label>
                  </div>
                  <div className="field-list">
                    {groupFields.map(field => (
                      <label key={field.key} className="field-item">
                        <input
                          type="checkbox"
                          checked={selectedFields[field.key] || false}
                          onChange={() => toggleFieldSelection(field.key)}
                          className="field-checkbox"
                        />
                        <span>{field.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-footer">
              <button onClick={() => setShowExportModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={exportToExcel} className="btn btn-primary">
                📥 Download Excel
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedTeacher ? (
        <div className="details-view">
          <button onClick={() => setSelectedTeacher(null)} className="btn-back">
            ← Back to List
          </button>

          <div className="teacher-details-card">
            <div className="details-header-section">
              <div className="teacher-basic-info">
                {selectedTeacher.details?.profilePictureUrl && (
                  <img
                    src={selectedTeacher.details.profilePictureUrl}
                    alt={selectedTeacher.fullName}
                    className="teacher-avatar"
                  />
                )}
                <div className="info-text">
                  <h3>{selectedTeacher.fullName}</h3>
                  <p className="email">{selectedTeacher.email}</p>
                  <p className="ids">
                    <span>ID: {selectedTeacher.teacherId || 'N/A'}</span>
                    <span>Emp: {selectedTeacher.employeeId || 'N/A'}</span>
                    {selectedTeacher.details?.dateOfBirth && (
                      <span> DOB: {selectedTeacher.details.dateOfBirth}</span>
                    )}
                  </p>
                </div>
              </div>
              {selectedTeacher.details?.resumeUrl && (
                <div className="resume-section">
                  <button 
                    onClick={() => downloadResume(selectedTeacher.fullName, selectedTeacher.details.resumeUrl, selectedTeacher.details.resumeType)}
                    className="btn btn-download-resume"
                  >
                    📄 Download Resume
                  </button>
                </div>
              )}
            </div>

            <div className="details-sections">
              {selectedTeacher.details?.education && selectedTeacher.details.education.length > 0 && (
                <div className="detail-section">
                  <h4>🎓 Education</h4>
                  {selectedTeacher.details.education.map((edu, idx) => (
                    <div key={idx} className="item-card">
                      <div className="item-header">
                        <h5>{edu.degree}</h5>
                        <span className="year">{edu.year}</span>
                      </div>
                      <p className="item-detail">{edu.institution}</p>
                    </div>
                  ))}
                </div>
              )}

              {selectedTeacher.details?.certifications && selectedTeacher.details.certifications.length > 0 && (
                <div className="detail-section">
                  <h4>🏅 Certifications</h4>
                  {selectedTeacher.details.certifications.map((cert, idx) => (
                    <div key={idx} className="item-card">
                      <div className="item-header">
                        <h5>{cert.name}</h5>
                        <span className="year">{cert.year}</span>
                      </div>
                      <p className="item-detail">{cert.issuer}</p>
                    </div>
                  ))}
                </div>
              )}

              {selectedTeacher.details?.skillsAbilities && (
                <div className="detail-section">
                  <h4>💡 Skills & Abilities</h4>
                  <p>{selectedTeacher.details.skillsAbilities}</p>
                </div>
              )}

              {selectedTeacher.details?.workExperiences && selectedTeacher.details.workExperiences.length > 0 && (
                <div className="detail-section">
                  <h4>💼 Work Experience</h4>
                  {selectedTeacher.details.workExperiences.map((exp, idx) => (
                    <div key={idx} className="item-card">
                      <div className="item-header">
                        <h5>{exp.position}</h5>
                        <span className="year">{exp.startYear}{exp.endYear ? ` - ${exp.endYear}` : ' - Present'}</span>
                      </div>
                      <p className="item-detail">{exp.company}</p>
                      {exp.description && <p className="item-description">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              )}

              {selectedTeacher.details?.booksAuthored && selectedTeacher.details.booksAuthored.length > 0 && (
                <div className="detail-section">
                  <h4>📖 Books Authored</h4>
                  {selectedTeacher.details.booksAuthored.map((book, idx) => (
                    <div key={idx} className="item-card">
                      <div className="item-header">
                        <h5>{book.title}</h5>
                        <span className="year">{book.year}</span>
                      </div>
                      <p className="item-detail">{book.publisher}</p>
                    </div>
                  ))}
                </div>
              )}

              {selectedTeacher.details?.patents && selectedTeacher.details.patents.length > 0 && (
                <div className="detail-section">
                  <h4>🔬 Patents</h4>
                  {selectedTeacher.details.patents.map((patent, idx) => (
                    <div key={idx} className="item-card">
                      <div className="item-header">
                        <h5>{patent.title}</h5>
                        <span className="year">{patent.year}</span>
                      </div>
                      <p className="item-detail">Appl #: {patent.applicationNumber} | Status: {patent.status}</p>
                    </div>
                  ))}
                </div>
              )}

              {selectedTeacher.details?.projects && selectedTeacher.details.projects.length > 0 && (
                <div className="detail-section">
                  <h4>🎯 Projects</h4>
                  {selectedTeacher.details.projects.map((proj, idx) => (
                    <div key={idx} className="item-card">
                      <div className="item-header">
                        <h5>{proj?.title || 'Untitled'}</h5>
                        <span className="year">{proj?.year || 'N/A'}</span>
                      </div>
                      {proj?.description && <p className="item-description">{proj.description}</p>}
                      {proj?.role && <p className="item-detail">Role: {proj.role}</p>}
                    </div>
                  ))}
                </div>
              )}

              {selectedTeacher.details?.journalPublications && selectedTeacher.details.journalPublications.length > 0 && (
                <div className="detail-section">
                  <h4>📰 Journal Publications</h4>
                  {selectedTeacher.details.journalPublications.map((pub, idx) => (
                    <div key={idx} className="item-card">
                      <div className="item-header">
                        <h5>{pub.title}</h5>
                        <span className="year">{pub.year}</span>
                      </div>
                      <p className="item-detail">{pub.journal} | Volume: {pub.volume}</p>
                    </div>
                  ))}
                </div>
              )}

              {selectedTeacher.details?.bookChapters && selectedTeacher.details.bookChapters.length > 0 && (
                <div className="detail-section">
                  <h4>📚 Book Chapters</h4>
                  {selectedTeacher.details.bookChapters.map((chapter, idx) => (
                    <div key={idx} className="item-card">
                      <div className="item-header">
                        <h5>{chapter.title}</h5>
                        <span className="year">{chapter.year}</span>
                      </div>
                      <p className="item-detail">{chapter.book} | Pages: {chapter.pageRange}</p>
                    </div>
                  ))}
                </div>
              )}

              {selectedTeacher.details?.conferencePresentation && selectedTeacher.details.conferencePresentation.length > 0 && (
                <div className="detail-section">
                  <h4>🎤 Conference Presentations</h4>
                  {selectedTeacher.details.conferencePresentation.map((conf, idx) => (
                    <div key={idx} className="item-card">
                      <div className="item-header">
                        <h5>{conf.title}</h5>
                        <span className="year">{conf.year}</span>
                      </div>
                      <p className="item-detail">{conf.conference} | Location: {conf.location}</p>
                    </div>
                  ))}
                </div>
              )}

              {selectedTeacher.details?.invitedTalk && selectedTeacher.details.invitedTalk.length > 0 && (
                <div className="detail-section">
                  <h4>🎓 Invited Talks as Resource Person</h4>
                  {selectedTeacher.details.invitedTalk.map((talk, idx) => (
                    <div key={idx} className="item-card">
                      <div className="item-header">
                        <h5>{talk.title}</h5>
                        <span className="year">{talk.year}</span>
                      </div>
                      <p className="item-detail">{talk.institution} | Topic: {talk.topic}</p>
                    </div>
                  ))}
                </div>
              )}

              {selectedTeacher.details?.administrativeResponsibilities && (
                <div className="detail-section">
                  <h4>👔 Administrative Responsibilities</h4>
                  <p>{selectedTeacher.details.administrativeResponsibilities}</p>
                </div>
              )}

              {selectedTeacher.details?.academicContribution && (
                <div className="detail-section">
                  <h4>🎓 Academic Contribution</h4>
                  <p>{selectedTeacher.details.academicContribution}</p>
                </div>
              )}

              {selectedTeacher.details?.customFields && Object.keys(selectedTeacher.details.customFields).length > 0 && (
                <div className="detail-section">
                  <h4>⚙️ Custom Fields</h4>
                  {Object.entries(selectedTeacher.details.customFields).map(([key, value]) => (
                    <div key={key} className="item-card">
                      <h5>{key}</h5>
                      <p>{value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="list-view">
          {loading ? (
            <p className="loading">Loading teachers...</p>
          ) : filteredTeachers.length === 0 ? (
            <p className="no-data">No teachers found</p>
          ) : (
            <div className="teachers-grid">
              {filteredTeachers.map(teacher => (
                <TeacherCardWithPicture 
                  key={teacher.id} 
                  teacher={teacher}
                  onViewDetails={handleViewDetails}
                  fetchTeacherDetails={fetchTeacherDetails}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminTeacherDetails;
