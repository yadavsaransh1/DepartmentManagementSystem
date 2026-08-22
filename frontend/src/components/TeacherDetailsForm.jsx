import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/teacher-details-cv.css';

const TeacherDetailsForm = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    profilePicture: null,
    profilePictureUrl: '',
    resume: null,
    resumeUrl: '',
    dateOfBirth: '',
    education: [{ degree: '', institution: '', year: '' }],
    certifications: [{ name: '', issuer: '', year: '', certificateFile: '', certificateFileName: '' }],
    skillsAbilities: '',
    booksAuthored: [{ title: '', publisher: '', year: '' }],
    patents: [{ title: '', applicationNumber: '', year: '', status: '' }],
    projects: [{ title: '', description: '', year: '', role: '' }],
    workExperiences: [{ position: '', company: '', startYear: '', endYear: '', description: '' }],
    journalPublications: [{ title: '', journal: '', year: '', volume: '' }],
    bookChapters: [{ title: '', book: '', year: '', pageRange: '' }],
    conferencePresentation: [{ title: '', conference: '', year: '', location: '' }],
    invitedTalk: [{ title: '', institution: '', year: '', topic: '' }],
    administrativeResponsibilities: '',
    academicContribution: '',
    customFields: {}
  });

  const [customFieldKey, setCustomFieldKey] = useState('');
  const [customFieldValue, setCustomFieldValue] = useState('');

  useEffect(() => {
    if (user && user.email) {
      fetchTeacherDetails();
    } else {
      console.warn('User email not found, unable to fetch details');
      setLoading(false);
    }
  }, []);

  const fetchTeacherDetails = async () => {
    try {
      setLoading(true);
      const teacherEmail = user?.email;
      
      if (!teacherEmail) {
        console.warn('No teacher email available');
        setLoading(false);
        return;
      }

      console.log('Fetching teacher details for email:', teacherEmail);
      
      // Timeout after 10 seconds
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const response = await Promise.race([
        api.get(`/teacher-details/${teacherEmail}`),
        timeoutPromise
      ]);

      if (response.data && response.data.data) {
        const details = response.data.data;
        const parsedData = { ...formData };
        
        // Use the already-parsed objects from ResponseDTO (no need to parse JSON)
        if (details.education) parsedData.education = details.education;
        if (details.certifications) parsedData.certifications = details.certifications;
        if (details.workExperiences) parsedData.workExperiences = details.workExperiences;
        if (details.journalPublications) parsedData.journalPublications = details.journalPublications;
        if (details.bookChapters) parsedData.bookChapters = details.bookChapters;
        if (details.conferencePresentation) parsedData.conferencePresentation = details.conferencePresentation;
        if (details.booksAuthored) parsedData.booksAuthored = details.booksAuthored;
        if (details.patents) parsedData.patents = details.patents;
        if (details.projects) parsedData.projects = details.projects;
        if (details.invitedTalk) parsedData.invitedTalk = details.invitedTalk;
        if (details.customFields) parsedData.customFields = details.customFields;
        
        // Load simple text fields
        parsedData.dateOfBirth = details.dateOfBirth || '';
        parsedData.skillsAbilities = details.skillsAbilities || '';
        parsedData.administrativeResponsibilities = details.administrativeResponsibilities || '';
        parsedData.academicContribution = details.academicContribution || '';
        
        // Load binary data - now as Base64 data URIs
        if (details.profilePictureBase64) {
          parsedData.profilePictureUrl = details.profilePictureBase64;
        }
        if (details.resumeBase64) {
          parsedData.resumeUrl = details.resumeBase64;
        }
        
        setFormData(parsedData);
        console.log('Teacher details loaded successfully', parsedData);
      }
    } catch (err) {
      console.log('No existing details found - starting fresh with empty form', err?.message);
      setError('');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          [fieldName]: file,
          [`${fieldName}Url`]: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadResume = () => {
    if (!formData.resumeUrl) {
      alert('No resume uploaded yet');
      return;
    }

    try {
      // Create a link element and trigger download
      const link = document.createElement('a');
      link.href = formData.resumeUrl;
      link.download = `${user?.fullName || 'resume'}_resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading resume:', err);
      alert('Failed to download resume');
    }
  };

  const handleArrayFieldChange = (index, fieldName, value, arrayName) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) =>
        i === index ? { ...item, [fieldName]: value } : item
      )
    }));
  };

  const addArrayItem = (arrayName) => {
    const templates = {
      education: { degree: '', institution: '', year: '' },
      certifications: { name: '', issuer: '', year: '', certificateFile: '', certificateFileName: '' },
      booksAuthored: { title: '', publisher: '', year: '' },
      patents: { title: '', applicationNumber: '', year: '', status: '' },
      projects: { title: '', description: '', year: '', role: '' },
      workExperiences: { position: '', company: '', startYear: '', endYear: '', description: '' },
      journalPublications: { title: '', journal: '', year: '', volume: '' },
      bookChapters: { title: '', book: '', year: '', pageRange: '' },
      conferencePresentation: { title: '', conference: '', year: '', location: '' },
      invitedTalk: { title: '', institution: '', year: '', topic: '' }
    };
    setFormData(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], templates[arrayName]]
    }));
  };

  const removeArrayItem = (index, arrayName) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index)
    }));
  };

  const addCustomField = () => {
    if (customFieldKey.trim()) {
      setFormData(prev => ({
        ...prev,
        customFields: { ...prev.customFields, [customFieldKey]: customFieldValue }
      }));
      setCustomFieldKey('');
      setCustomFieldValue('');
    }
  };

  const removeCustomField = (key) => {
    setFormData(prev => ({
      ...prev,
      customFields: Object.fromEntries(
        Object.entries(prev.customFields).filter(([k]) => k !== key)
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setMessage('');
      setLoading(true);

      const submitData = {
        teacherEmail: user.email,
        dateOfBirth: formData.dateOfBirth,
        profilePictureBase64: formData.profilePictureUrl || '',
        profilePictureType: formData.profilePicture?.type || 'image/jpeg',
        resumeBase64: formData.resumeUrl || '',
        resumeType: formData.resume?.type || 'application/pdf',
        education: formData.education,
        certifications: formData.certifications,
        skillsAbilities: formData.skillsAbilities,
        workExperiences: formData.workExperiences,
        journalPublications: formData.journalPublications,
        bookChapters: formData.bookChapters,
        conferencePresentation: formData.conferencePresentation,
        booksAuthored: formData.booksAuthored,
        patents: formData.patents,
        projects: formData.projects,
        invitedTalk: formData.invitedTalk,
        administrativeResponsibilities: formData.administrativeResponsibilities,
        academicContribution: formData.academicContribution,
        customFields: formData.customFields
      };

      console.log('Submitting teacher details:', submitData);
      console.log('Teacher ID being sent:', user.id, 'User object:', user);

      const response = await api.post(`/teacher-details/save`, submitData);

      console.log('Save response:', response.data);
      setMessage('✅ Profile saved successfully! Your details are now available in the admin panel.');
      
      // Reload to verify save
      setTimeout(() => {
        fetchTeacherDetails();
      }, 1000);
      
      setTimeout(() => setMessage(''), 6000);
    } catch (err) {
      console.error('Save error:', err);
      console.error('Error response data:', err.response?.data);
      setError('❌ Failed to save profile: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const renderArrayField = (arrayName, title, icon, fields) => (
    <div className="cv-section">
      <div className="section-title">
        <span className="section-icon">{icon}</span>
        <h3>{title}</h3>
      </div>
      <div className="section-content">
        {formData[arrayName].map((item, index) => (
          <div key={index} className="cv-entry">
            {fields.map(field => (
              <div key={field.key} className="entry-field">
                {field.type === 'file' ? (
                  <label className="file-input-label">
                    {item[`${field.key}Name`] ? `✓ ${item[`${field.key}Name`]}` : field.label}
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          handleArrayFieldChange(index, `${field.key}Name`, file.name, arrayName);
                        }
                      }}
                      hidden
                    />
                  </label>
                ) : (
                  <input
                    type={field.type || 'text'}
                    placeholder={field.label}
                    value={item[field.key] || ''}
                    onChange={(e) => handleArrayFieldChange(index, field.key, e.target.value, arrayName)}
                    className="entry-input"
                  />
                )}
              </div>
            ))}
            {formData[arrayName].length > 1 && (
              <button
                type="button"
                onClick={() => removeArrayItem(index, arrayName)}
                className="remove-entry"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={() => addArrayItem(arrayName)} className="add-entry-btn">
          + Add {title}
        </button>
      </div>
    </div>
  );

  if (loading) {
    return <div className="cv-container"><p style={{ textAlign: 'center', padding: '40px' }}>Loading your profile...</p></div>;
  }

  return (
    <div className="cv-container">
      <form onSubmit={handleSubmit} className="cv-form">
        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        <div className="cv-header-section">
          <div className="profile-picture-area">
            <div className="picture-container">
              {formData.profilePictureUrl ? (
                <img src={formData.profilePictureUrl} alt="Profile" className="profile-pic" />
              ) : (
                <div className="picture-placeholder">📷</div>
              )}
            </div>
            <label className="pic-upload-label">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'profilePicture')}
                hidden
              />
              Change Photo
            </label>
          </div>

          <div className="header-info">
            <h1>{user?.fullName || 'Your Name'}</h1>
            <p className="header-contact">
              <span>📧 {user?.email || 'email@example.com'}</span>
              {user?.teacherId && <span>| ID: {user.teacherId}</span>}
            </p>

            <div className="resume-section">
              <label className="resume-upload-label">
                {formData.resumeUrl ? '📄 Resume Uploaded - Change' : '📄 Upload Resume/CV'}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileUpload(e, 'resume')}
                  hidden
                />
              </label>
              {formData.resumeUrl && (
                <button type="button" onClick={handleDownloadResume} className="download-resume-btn">
                  ⬇️ Download Resume
                </button>
              )}
            </div>

            <div className="dob-field">
              <label>Date of Birth:</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className="dob-input"
              />
            </div>
          </div>
        </div>

        <div className="cv-content">
          {/* Education & Certifications */}
          {renderArrayField(
            'education',
            'Education',
            '🎓',
            [
              { key: 'degree', label: 'Degree (e.g., B.Tech, M.Tech, PhD)', type: 'text' },
              { key: 'institution', label: 'Institution/University', type: 'text' },
              { key: 'year', label: 'Year', type: 'number' }
            ]
          )}

          {renderArrayField(
            'certifications',
            'Certifications',
            '🏅',
            [
              { key: 'name', label: 'Certification Name', type: 'text' },
              { key: 'issuer', label: 'Issuing Organization', type: 'text' },
              { key: 'year', label: 'Year', type: 'number' },
              { key: 'certificateFile', label: 'Certificate (PDF)', type: 'file' }
            ]
          )}

          {/* Skills & Responsibilities */}
          <div className="cv-section">
            <div className="section-title">
              <span className="section-icon">💡</span>
              <h3>Skills & Abilities</h3>
            </div>
            <textarea
              name="skillsAbilities"
              placeholder="List your skills in programming languages, tools, software, domains, etc. Separate items with commas or line breaks."
              value={formData.skillsAbilities}
              onChange={handleInputChange}
              className="textarea-field"
              rows="4"
            />
          </div>

          {/* Work Experience */}
          {renderArrayField(
            'workExperiences',
            'Work Experience',
            '💼',
            [
              { key: 'position', label: 'Position/Designation', type: 'text' },
              { key: 'company', label: 'Company/Organization', type: 'text' },
              { key: 'startYear', label: 'Start Year', type: 'number' },
              { key: 'endYear', label: 'End Year (Leave blank if current)', type: 'number' },
              { key: 'description', label: 'Role & Responsibilities', type: 'text' }
            ]
          )}

          {/* Publications */}
          {renderArrayField(
            'journalPublications',
            'Journal Publications',
            '📰',
            [
              { key: 'title', label: 'Paper Title', type: 'text' },
              { key: 'journal', label: 'Journal Name', type: 'text' },
              { key: 'year', label: 'Year', type: 'number' },
              { key: 'volume', label: 'Volume/Issue', type: 'text' }
            ]
          )}

          {renderArrayField(
            'bookChapters',
            'Book Chapters',
            '📖',
            [
              { key: 'title', label: 'Chapter Title', type: 'text' },
              { key: 'book', label: 'Book Name', type: 'text' },
              { key: 'year', label: 'Year', type: 'number' },
              { key: 'pageRange', label: 'Page Range', type: 'text' }
            ]
          )}

          {renderArrayField(
            'conferencePresentation',
            'Conference Presentations',
            '🎤',
            [
              { key: 'title', label: 'Presentation Title', type: 'text' },
              { key: 'conference', label: 'Conference Name', type: 'text' },
              { key: 'year', label: 'Year', type: 'number' },
              { key: 'location', label: 'Location', type: 'text' }
            ]
          )}

          {/* Books & Patents */}
          {renderArrayField(
            'booksAuthored',
            'Books Authored',
            '📕',
            [
              { key: 'title', label: 'Book Title', type: 'text' },
              { key: 'publisher', label: 'Publisher', type: 'text' },
              { key: 'year', label: 'Year', type: 'number' }
            ]
          )}

          {renderArrayField(
            'patents',
            'Patents',
            '🔬',
            [
              { key: 'title', label: 'Patent Title', type: 'text' },
              { key: 'applicationNumber', label: 'Application Number', type: 'text' },
              { key: 'year', label: 'Year', type: 'number' },
              { key: 'status', label: 'Status (Filed/Granted/Published)', type: 'text' }
            ]
          )}

          {/* Projects & Talks */}
          {renderArrayField(
            'projects',
            'Projects',
            '🚀',
            [
              { key: 'title', label: 'Project Title', type: 'text' },
              { key: 'description', label: 'Description', type: 'text' },
              { key: 'year', label: 'Year', type: 'number' },
              { key: 'role', label: 'Your Role', type: 'text' }
            ]
          )}

          {renderArrayField(
            'invitedTalk',
            'Invited Talks as Resource Person',
            '👨‍🏫',
            [
              { key: 'title', label: 'Talk Title', type: 'text' },
              { key: 'institution', label: 'Institution/Organization', type: 'text' },
              { key: 'year', label: 'Year', type: 'number' },
              { key: 'topic', label: 'Topic', type: 'text' }
            ]
          )}

          {/* Administrative Responsibilities */}
          <div className="cv-section">
            <div className="section-title">
              <span className="section-icon">👔</span>
              <h3>Administrative Responsibilities</h3>
            </div>
            <textarea
              name="administrativeResponsibilities"
              placeholder="List committee memberships, administrative roles, coordination responsibilities, etc."
              value={formData.administrativeResponsibilities}
              onChange={handleInputChange}
              className="textarea-field"
              rows="4"
            />
          </div>

          {/* Academic Contribution */}
          <div className="cv-section">
            <div className="section-title">
              <span className="section-icon">🎓</span>
              <h3>Academic Contribution</h3>
            </div>
            <textarea
              name="academicContribution"
              placeholder="Describe your academic contributions, research areas, courses developed, mentoring, etc."
              value={formData.academicContribution}
              onChange={handleInputChange}
              className="textarea-field"
              rows="4"
            />
          </div>

          {/* Custom Fields */}
          <div className="cv-section">
            <div className="section-title">
              <span className="section-icon">⚙️</span>
              <h3>Custom Fields</h3>
            </div>
            <div className="custom-fields-container">
              {Object.entries(formData.customFields).map(([key, value]) => (
                <div key={key} className="custom-field-item">
                  <div>
                    <strong>{key}:</strong> {value}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCustomField(key)}
                    className="remove-custom"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <div className="add-custom-field">
                <input
                  type="text"
                  placeholder="Field name"
                  value={customFieldKey}
                  onChange={(e) => setCustomFieldKey(e.target.value)}
                  className="custom-key-input"
                />
                <input
                  type="text"
                  placeholder="Field value"
                  value={customFieldValue}
                  onChange={(e) => setCustomFieldValue(e.target.value)}
                  className="custom-value-input"
                />
                <button
                  type="button"
                  onClick={addCustomField}
                  className="add-custom-btn"
                >
                  + Add Field
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="save-btn" disabled={loading}>
            {loading ? '💾 Saving...' : '💾 Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeacherDetailsForm;
