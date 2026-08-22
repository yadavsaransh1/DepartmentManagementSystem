import React, { useState, useEffect } from 'react';
import { apiFetch, API_BASE_URL } from '../utils/apiClient';
import '../styles/homePageManagement.css';
import AdminHomePageImages from '../components/AdminHomePageImages';
import AdminDepartmentLogo from '../components/AdminDepartmentLogo';
import AdminNotice from '../components/AdminNotice';
import { HOME_PAGE_ENDPOINTS } from '../config/api';

const HomePageManagement = () => {
  const [homePageContent, setHomePageContent] = useState(null);
  const [faculty, setFaculty] = useState([]);
  const [teachingAssistants, setTeachingAssistants] = useState([]);
  const [technicalStaff, setTechnicalStaff] = useState([]);
  const [nonTeachingEmployees, setNonTeachingEmployees] = useState([]);
  const [activeTab, setActiveTab] = useState('notice');
  const [showFacultyForm, setShowFacultyForm] = useState(false);
  const [showTeachingAssistantForm, setShowTeachingAssistantForm] = useState(false);
  const [showTechnicalStaffForm, setShowTechnicalStaffForm] = useState(false);
  const [showNonTeachingForm, setShowNonTeachingForm] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [editingTeachingAssistant, setEditingTeachingAssistant] = useState(null);
  const [editingTechnicalStaff, setEditingTechnicalStaff] = useState(null);
  const [editingNonTeaching, setEditingNonTeaching] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    departmentTitle: '',
    departmentDescription: '',
    departmentImage: '',
    deanName: '',
    deanDesignation: '',
    deanDescription: '',
    deanImage: '',
    hodName: '',
    hodDesignation: '',
    hodDescription: '',
    hodImage: ''
  });

  const [facultyFormData, setFacultyFormData] = useState({
    name: '',
    designation: '',
    description: '',
    image: ''
  });

  const [teachingAssistantFormData, setTeachingAssistantFormData] = useState({
    name: '',
    designation: '',
    description: '',
    qualification: '',
    image: ''
  });

  const [technicalStaffFormData, setTechnicalStaffFormData] = useState({
    name: '',
    designation: '',
    description: '',
    specialization: '',
    image: ''
  });

  const [nonTeachingFormData, setNonTeachingFormData] = useState({
    name: '',
    designation: '',
    description: '',
    department: '',
    image: ''
  });

  useEffect(() => {
    fetchHomePageContent();
    fetchFaculty();
    fetchTeachingAssistants();
    fetchTechnicalStaff();
    fetchNonTeachingEmployees();
  }, []);

  const fetchHomePageContent = async () => {
    try {
      const response = await fetch(HOME_PAGE_ENDPOINTS.CONTENT);
      if (response.ok) {
        const data = await response.json();
        setHomePageContent(data);
        setFormData(data || {});
      }
    } catch (error) {
      console.error('Error fetching home page content:', error);
      showMessage('Error loading home page content', 'error');
    }
  };

  const fetchFaculty = async () => {
    try {
      const response = await fetch(HOME_PAGE_ENDPOINTS.FACULTY);
      if (response.ok) {
        const data = await response.json();
        setFaculty(data);
      }
    } catch (error) {
      console.error('Error fetching faculty:', error);
      showMessage('Error loading faculty', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachingAssistants = async () => {
    try {
      const response = await fetch(HOME_PAGE_ENDPOINTS.TEACHING_ASSISTANT);
      if (response.ok) {
        const data = await response.json();
        setTeachingAssistants(data);
      }
    } catch (error) {
      console.error('Error fetching teaching assistants:', error);
      showMessage('Error loading teaching assistants', 'error');
    }
  };

  const fetchTechnicalStaff = async () => {
    try {
      const response = await fetch(HOME_PAGE_ENDPOINTS.TECHNICAL_STAFF);
      if (response.ok) {
        const data = await response.json();
        setTechnicalStaff(data);
      }
    } catch (error) {
      console.error('Error fetching technical staff:', error);
      showMessage('Error loading technical staff', 'error');
    }
  };

  const fetchNonTeachingEmployees = async () => {
    try {
      const response = await fetch(HOME_PAGE_ENDPOINTS.NON_TEACHING_EMPLOYEE);
      if (response.ok) {
        const data = await response.json();
        setNonTeachingEmployees(data);
      }
    } catch (error) {
      console.error('Error fetching non-teaching employees:', error);
      showMessage('Error loading non-teaching employees', 'error');
    }
  };

  const showMessage = (msg, type = 'success') => {
    setMessage({ text: msg, type });
    setTimeout(() => setMessage(''), 3000);
  };

  const handleImageUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (activeTab === 'faculty') {
          setFacultyFormData({ ...facultyFormData, image: reader.result });
        } else if (activeTab === 'teaching-assistant') {
          setTeachingAssistantFormData({ ...teachingAssistantFormData, image: reader.result });
        } else if (activeTab === 'technical-staff') {
          setTechnicalStaffFormData({ ...technicalStaffFormData, image: reader.result });
        } else if (activeTab === 'non-teaching') {
          setNonTeachingFormData({ ...nonTeachingFormData, image: reader.result });
        } else {
          setFormData({ ...formData, [fieldName]: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFacultyFormChange = (e) => {
    const { name, value } = e.target;
    setFacultyFormData({ ...facultyFormData, [name]: value });
  };

  const handleTeachingAssistantFormChange = (e) => {
    const { name, value } = e.target;
    setTeachingAssistantFormData({ ...teachingAssistantFormData, [name]: value });
  };

  const handleTechnicalStaffFormChange = (e) => {
    const { name, value } = e.target;
    setTechnicalStaffFormData({ ...technicalStaffFormData, [name]: value });
  };

  const handleNonTeachingFormChange = (e) => {
    const { name, value } = e.target;
    setNonTeachingFormData({ ...nonTeachingFormData, [name]: value });
  };

  const handleSaveContent = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(HOME_PAGE_ENDPOINTS.CONTENT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        setHomePageContent(data);
        showMessage('Home page content updated successfully!', 'success');
      } else {
        showMessage('Error saving content', 'error');
      }
    } catch (error) {
      console.error('Error saving content:', error);
      showMessage('Error saving content', 'error');
    }
  };

  const handleAddFaculty = async () => {
    if (!facultyFormData.name || !facultyFormData.designation) {
      showMessage('Please fill in name and designation', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const endpoint = editingFaculty
        ? `${API_BASE_URL}/api/home-page/faculty/${editingFaculty.id}`
        : `${API_BASE_URL}/api/home-page/faculty`;

      const method = editingFaculty ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(facultyFormData)
      });

      if (response.ok) {
        fetchFaculty();
        setFacultyFormData({ name: '', designation: '', description: '', image: '' });
        setEditingFaculty(null);
        setShowFacultyForm(false);
        showMessage(editingFaculty ? 'Faculty updated successfully!' : 'Faculty added successfully!', 'success');
      } else {
        showMessage('Error saving faculty', 'error');
      }
    } catch (error) {
      console.error('Error saving faculty:', error);
      showMessage('Error saving faculty', 'error');
    }
  };

  const handleEditFaculty = (member) => {
    setEditingFaculty(member);
    setFacultyFormData(member);
    setShowFacultyForm(true);
  };

  const handleDeleteFaculty = async (id) => {
    if (window.confirm('Are you sure you want to delete this faculty member?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/home-page/faculty/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          fetchFaculty();
          showMessage('Faculty deleted successfully!', 'success');
        } else {
          showMessage('Error deleting faculty', 'error');
        }
      } catch (error) {
        console.error('Error deleting faculty:', error);
        showMessage('Error deleting faculty', 'error');
      }
    }
  };

  const handleCancelFacultyForm = () => {
    setShowFacultyForm(false);
    setEditingFaculty(null);
    setFacultyFormData({ name: '', designation: '', description: '', image: '' });
  };

  // Teaching Assistant handlers
  const handleAddTeachingAssistant = async () => {
    if (!teachingAssistantFormData.name || !teachingAssistantFormData.designation) {
      showMessage('Please fill in name and designation', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const endpoint = editingTeachingAssistant
        ? `${API_BASE_URL}/api/home-page/teaching-assistant/${editingTeachingAssistant.id}`
        : `${API_BASE_URL}/api/home-page/teaching-assistant`;

      const method = editingTeachingAssistant ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(teachingAssistantFormData)
      });

      if (response.ok) {
        fetchTeachingAssistants();
        setTeachingAssistantFormData({ name: '', designation: '', description: '', qualification: '', image: '' });
        setEditingTeachingAssistant(null);
        setShowTeachingAssistantForm(false);
        showMessage(editingTeachingAssistant ? 'Teaching Assistant updated successfully!' : 'Teaching Assistant added successfully!', 'success');
      } else {
        showMessage('Error saving teaching assistant', 'error');
      }
    } catch (error) {
      console.error('Error saving teaching assistant:', error);
      showMessage('Error saving teaching assistant', 'error');
    }
  };

  const handleEditTeachingAssistant = (member) => {
    setEditingTeachingAssistant(member);
    setTeachingAssistantFormData(member);
    setShowTeachingAssistantForm(true);
  };

  const handleDeleteTeachingAssistant = async (id) => {
    if (window.confirm('Are you sure you want to delete this teaching assistant?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/home-page/teaching-assistant/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          fetchTeachingAssistants();
          showMessage('Teaching Assistant deleted successfully!', 'success');
        } else {
          showMessage('Error deleting teaching assistant', 'error');
        }
      } catch (error) {
        console.error('Error deleting teaching assistant:', error);
        showMessage('Error deleting teaching assistant', 'error');
      }
    }
  };

  const handleCancelTeachingAssistantForm = () => {
    setShowTeachingAssistantForm(false);
    setEditingTeachingAssistant(null);
    setTeachingAssistantFormData({ name: '', designation: '', description: '', qualification: '', image: '' });
  };

  // Technical Staff handlers
  const handleAddTechnicalStaff = async () => {
    if (!technicalStaffFormData.name || !technicalStaffFormData.designation) {
      showMessage('Please fill in name and designation', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const endpoint = editingTechnicalStaff
        ? `${API_BASE_URL}/api/home-page/technical-staff/${editingTechnicalStaff.id}`
        : `${API_BASE_URL}/api/home-page/technical-staff`;

      const method = editingTechnicalStaff ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(technicalStaffFormData)
      });

      if (response.ok) {
        fetchTechnicalStaff();
        setTechnicalStaffFormData({ name: '', designation: '', description: '', specialization: '', image: '' });
        setEditingTechnicalStaff(null);
        setShowTechnicalStaffForm(false);
        showMessage(editingTechnicalStaff ? 'Technical Staff updated successfully!' : 'Technical Staff added successfully!', 'success');
      } else {
        showMessage('Error saving technical staff', 'error');
      }
    } catch (error) {
      console.error('Error saving technical staff:', error);
      showMessage('Error saving technical staff', 'error');
    }
  };

  const handleEditTechnicalStaff = (member) => {
    setEditingTechnicalStaff(member);
    setTechnicalStaffFormData(member);
    setShowTechnicalStaffForm(true);
  };

  const handleDeleteTechnicalStaff = async (id) => {
    if (window.confirm('Are you sure you want to delete this technical staff member?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/home-page/technical-staff/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          fetchTechnicalStaff();
          showMessage('Technical Staff deleted successfully!', 'success');
        } else {
          showMessage('Error deleting technical staff', 'error');
        }
      } catch (error) {
        console.error('Error deleting technical staff:', error);
        showMessage('Error deleting technical staff', 'error');
      }
    }
  };

  const handleCancelTechnicalStaffForm = () => {
    setShowTechnicalStaffForm(false);
    setEditingTechnicalStaff(null);
    setTechnicalStaffFormData({ name: '', designation: '', description: '', specialization: '', image: '' });
  };

  // Non-Teaching Employees handlers
  const handleAddNonTeaching = async () => {
    if (!nonTeachingFormData.name || !nonTeachingFormData.designation) {
      showMessage('Please fill in name and designation', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const endpoint = editingNonTeaching
        ? `${API_BASE_URL}/api/home-page/non-teaching-employee/${editingNonTeaching.id}`
        : `${API_BASE_URL}/api/home-page/non-teaching-employee`;

      const method = editingNonTeaching ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(nonTeachingFormData)
      });

      if (response.ok) {
        fetchNonTeachingEmployees();
        setNonTeachingFormData({ name: '', designation: '', description: '', department: '', image: '' });
        setEditingNonTeaching(null);
        setShowNonTeachingForm(false);
        showMessage(editingNonTeaching ? 'Non-Teaching Employee updated successfully!' : 'Non-Teaching Employee added successfully!', 'success');
      } else {
        showMessage('Error saving non-teaching employee', 'error');
      }
    } catch (error) {
      console.error('Error saving non-teaching employee:', error);
      showMessage('Error saving non-teaching employee', 'error');
    }
  };

  const handleEditNonTeaching = (member) => {
    setEditingNonTeaching(member);
    setNonTeachingFormData(member);
    setShowNonTeachingForm(true);
  };

  const handleDeleteNonTeaching = async (id) => {
    if (window.confirm('Are you sure you want to delete this non-teaching employee?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/home-page/non-teaching-employee/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          fetchNonTeachingEmployees();
          showMessage('Non-Teaching Employee deleted successfully!', 'success');
        } else {
          showMessage('Error deleting non-teaching employee', 'error');
        }
      } catch (error) {
        console.error('Error deleting non-teaching employee:', error);
        showMessage('Error deleting non-teaching employee', 'error');
      }
    }
  };

  const handleCancelNonTeachingForm = () => {
    setShowNonTeachingForm(false);
    setEditingNonTeaching(null);
    setNonTeachingFormData({ name: '', designation: '', description: '', department: '', image: '' });
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="home-page-management">
      <h2>Home Page Management</h2>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'notice' ? 'active' : ''}`}
          onClick={() => setActiveTab('notice')}
        >
          Notice Board
        </button>
        <button
          className={`tab-btn ${activeTab === 'carousel' ? 'active' : ''}`}
          onClick={() => setActiveTab('carousel')}
        >
          Carousel Images
        </button>
        
        <button
          className={`tab-btn ${activeTab === 'department' ? 'active' : ''}`}
          onClick={() => setActiveTab('department')}
        >
          Department
        </button>
        <button
          className={`tab-btn ${activeTab === 'dean' ? 'active' : ''}`}
          onClick={() => setActiveTab('dean')}
        >
          Dean
        </button>
        <button
          className={`tab-btn ${activeTab === 'hod' ? 'active' : ''}`}
          onClick={() => setActiveTab('hod')}
        >
          HoD
        </button>
        <button
          className={`tab-btn ${activeTab === 'faculty' ? 'active' : ''}`}
          onClick={() => setActiveTab('faculty')}
        >
          Faculty
        </button>
        <button
          className={`tab-btn ${activeTab === 'teaching-assistant' ? 'active' : ''}`}
          onClick={() => setActiveTab('teaching-assistant')}
        >
          Teaching Assistants
        </button>
        <button
          className={`tab-btn ${activeTab === 'technical-staff' ? 'active' : ''}`}
          onClick={() => setActiveTab('technical-staff')}
        >
          Technical Staff
        </button>
        <button
          className={`tab-btn ${activeTab === 'non-teaching' ? 'active' : ''}`}
          onClick={() => setActiveTab('non-teaching')}
        >
          Non-Teaching Employees
        </button>
        <button
          className={`tab-btn ${activeTab === 'logo' ? 'active' : ''}`}
          onClick={() => setActiveTab('logo')}
        >
          Department Logo
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Department Tab */}
        {activeTab === 'department' && (
          <div className="form-container">
            <h3>Department Information</h3>
            <div className="form-group">
              <label>Department Title</label>
              <input
                type="text"
                name="departmentTitle"
                value={formData.departmentTitle || ''}
                onChange={handleFormChange}
                placeholder="Enter department title"
              />
            </div>

            <div className="form-group">
              <label>Department Description</label>
              <textarea
                name="departmentDescription"
                value={formData.departmentDescription || ''}
                onChange={handleFormChange}
                placeholder="Enter department description"
                rows={5}
              />
            </div>

            <div className="form-group">
              <label>Department Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'departmentImage')}
              />
              {formData.departmentImage && (
                <div className="image-preview">
                  <img src={formData.departmentImage} alt="Department" />
                </div>
              )}
            </div>

            <button className="save-btn" onClick={handleSaveContent}>Save Department</button>
          </div>
        )}

        {/* Dean Tab */}
        {activeTab === 'dean' && (
          <div className="form-container">
            <h3>Dean Information</h3>
            <div className="form-group">
              <label>Dean Name</label>
              <input
                type="text"
                name="deanName"
                value={formData.deanName || ''}
                onChange={handleFormChange}
                placeholder="Enter dean name"
              />
            </div>

            <div className="form-group">
              <label>Dean Designation</label>
              <input
                type="text"
                name="deanDesignation"
                value={formData.deanDesignation || ''}
                onChange={handleFormChange}
                placeholder="Enter dean designation"
              />
            </div>

            <div className="form-group">
              <label>Dean Description</label>
              <textarea
                name="deanDescription"
                value={formData.deanDescription || ''}
                onChange={handleFormChange}
                placeholder="Enter dean description"
                rows={4}
              />
            </div>

            <div className="form-group">
              <label>Dean Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'deanImage')}
              />
              {formData.deanImage && (
                <div className="image-preview">
                  <img src={formData.deanImage} alt="Dean" />
                </div>
              )}
            </div>

            <button className="save-btn" onClick={handleSaveContent}>Save Dean</button>
          </div>
        )}

        {/* HoD Tab */}
        {activeTab === 'hod' && (
          <div className="form-container">
            <h3>HoD Information</h3>
            <div className="form-group">
              <label>HoD Name</label>
              <input
                type="text"
                name="hodName"
                value={formData.hodName || ''}
                onChange={handleFormChange}
                placeholder="Enter HoD name"
              />
            </div>

            <div className="form-group">
              <label>HoD Designation</label>
              <input
                type="text"
                name="hodDesignation"
                value={formData.hodDesignation || ''}
                onChange={handleFormChange}
                placeholder="Enter HoD designation"
              />
            </div>

            <div className="form-group">
              <label>HoD Description</label>
              <textarea
                name="hodDescription"
                value={formData.hodDescription || ''}
                onChange={handleFormChange}
                placeholder="Enter HoD description"
                rows={4}
              />
            </div>

            <div className="form-group">
              <label>HoD Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'hodImage')}
              />
              {formData.hodImage && (
                <div className="image-preview">
                  <img src={formData.hodImage} alt="HoD" />
                </div>
              )}
            </div>

            <button className="save-btn" onClick={handleSaveContent}>Save HoD</button>
          </div>
        )}

        {/* Faculty Tab */}
        {activeTab === 'faculty' && (
          <div className="form-container">
            <h3>Manage Faculty</h3>

            {!showFacultyForm ? (
              <button className="add-btn" onClick={() => setShowFacultyForm(true)}>
                + Add Faculty Member
              </button>
            ) : (
              <div className="faculty-form">
                <h4>{editingFaculty ? 'Edit Faculty Member' : 'Add New Faculty Member'}</h4>

                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={facultyFormData.name || ''}
                    onChange={handleFacultyFormChange}
                    placeholder="Enter faculty name"
                  />
                </div>

                <div className="form-group">
                  <label>Designation</label>
                  <input
                    type="text"
                    name="designation"
                    value={facultyFormData.designation || ''}
                    onChange={handleFacultyFormChange}
                    placeholder="Enter designation"
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={facultyFormData.description || ''}
                    onChange={handleFacultyFormChange}
                    placeholder="Enter description"
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label>Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'image')}
                  />
                  {facultyFormData.image && (
                    <div className="image-preview">
                      <img src={facultyFormData.image} alt={facultyFormData.name} />
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button className="save-btn" onClick={handleAddFaculty}>
                    {editingFaculty ? 'Update Faculty' : 'Add Faculty'}
                  </button>
                  <button className="cancel-btn" onClick={handleCancelFacultyForm}>Cancel</button>
                </div>
              </div>
            )}

            {/* Faculty List */}
            <div className="faculty-list">
              <h4>Faculty Members ({faculty.length})</h4>
              {faculty.length === 0 ? (
                <p>No faculty members added yet.</p>
              ) : (
                faculty.map((member) => (
                  <div key={member.id} className="faculty-item">
                    {member.image && (
                      <img src={member.image} alt={member.name} className="faculty-thumbnail" />
                    )}
                    <div className="faculty-details">
                      <h5>{member.name}</h5>
                      <p className="designation">{member.designation}</p>
                      <p className="description">{member.description}</p>
                    </div>
                    <div className="faculty-actions">
                      <button className="edit-btn" onClick={() => handleEditFaculty(member)}>Edit</button>
                      <button className="delete-btn" onClick={() => handleDeleteFaculty(member.id)}>Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Teaching Assistants Tab */}
        {activeTab === 'teaching-assistant' && (
          <div className="form-container">
            <h3>Manage Teaching Assistants</h3>

            {!showTeachingAssistantForm ? (
              <button className="add-btn" onClick={() => setShowTeachingAssistantForm(true)}>
                + Add Teaching Assistant
              </button>
            ) : (
              <div className="faculty-form">
                <h4>{editingTeachingAssistant ? 'Edit Teaching Assistant' : 'Add New Teaching Assistant'}</h4>

                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={teachingAssistantFormData.name || ''}
                    onChange={handleTeachingAssistantFormChange}
                    placeholder="Enter name"
                  />
                </div>

                <div className="form-group">
                  <label>Designation</label>
                  <input
                    type="text"
                    name="designation"
                    value={teachingAssistantFormData.designation || ''}
                    onChange={handleTeachingAssistantFormChange}
                    placeholder="Enter designation"
                  />
                </div>

                <div className="form-group">
                  <label>Qualification</label>
                  <input
                    type="text"
                    name="qualification"
                    value={teachingAssistantFormData.qualification || ''}
                    onChange={handleTeachingAssistantFormChange}
                    placeholder="Enter qualification"
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={teachingAssistantFormData.description || ''}
                    onChange={handleTeachingAssistantFormChange}
                    placeholder="Enter description"
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label>Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'image')}
                  />
                  {teachingAssistantFormData.image && (
                    <div className="image-preview">
                      <img src={teachingAssistantFormData.image} alt={teachingAssistantFormData.name} />
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button className="save-btn" onClick={handleAddTeachingAssistant}>
                    {editingTeachingAssistant ? 'Update' : 'Add'}
                  </button>
                  <button className="cancel-btn" onClick={handleCancelTeachingAssistantForm}>Cancel</button>
                </div>
              </div>
            )}

            {/* Teaching Assistants List */}
            <div className="faculty-list">
              <h4>Teaching Assistants ({teachingAssistants.length})</h4>
              {teachingAssistants.length === 0 ? (
                <p>No teaching assistants added yet.</p>
              ) : (
                teachingAssistants.map((member) => (
                  <div key={member.id} className="faculty-item">
                    {member.image && (
                      <img src={member.image} alt={member.name} className="faculty-thumbnail" />
                    )}
                    <div className="faculty-details">
                      <h5>{member.name}</h5>
                      <p className="designation">{member.designation}</p>
                      {member.qualification && <p className="qualification">Qualification: {member.qualification}</p>}
                      <p className="description">{member.description}</p>
                    </div>
                    <div className="faculty-actions">
                      <button className="edit-btn" onClick={() => handleEditTeachingAssistant(member)}>Edit</button>
                      <button className="delete-btn" onClick={() => handleDeleteTeachingAssistant(member.id)}>Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Technical Staff Tab */}
        {activeTab === 'technical-staff' && (
          <div className="form-container">
            <h3>Manage Technical Staff</h3>

            {!showTechnicalStaffForm ? (
              <button className="add-btn" onClick={() => setShowTechnicalStaffForm(true)}>
                + Add Technical Staff
              </button>
            ) : (
              <div className="faculty-form">
                <h4>{editingTechnicalStaff ? 'Edit Technical Staff' : 'Add New Technical Staff'}</h4>

                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={technicalStaffFormData.name || ''}
                    onChange={handleTechnicalStaffFormChange}
                    placeholder="Enter name"
                  />
                </div>

                <div className="form-group">
                  <label>Designation</label>
                  <input
                    type="text"
                    name="designation"
                    value={technicalStaffFormData.designation || ''}
                    onChange={handleTechnicalStaffFormChange}
                    placeholder="Enter designation"
                  />
                </div>

                <div className="form-group">
                  <label>Specialization</label>
                  <input
                    type="text"
                    name="specialization"
                    value={technicalStaffFormData.specialization || ''}
                    onChange={handleTechnicalStaffFormChange}
                    placeholder="Enter specialization"
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={technicalStaffFormData.description || ''}
                    onChange={handleTechnicalStaffFormChange}
                    placeholder="Enter description"
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label>Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'image')}
                  />
                  {technicalStaffFormData.image && (
                    <div className="image-preview">
                      <img src={technicalStaffFormData.image} alt={technicalStaffFormData.name} />
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button className="save-btn" onClick={handleAddTechnicalStaff}>
                    {editingTechnicalStaff ? 'Update' : 'Add'}
                  </button>
                  <button className="cancel-btn" onClick={handleCancelTechnicalStaffForm}>Cancel</button>
                </div>
              </div>
            )}

            {/* Technical Staff List */}
            <div className="faculty-list">
              <h4>Technical Staff ({technicalStaff.length})</h4>
              {technicalStaff.length === 0 ? (
                <p>No technical staff added yet.</p>
              ) : (
                technicalStaff.map((member) => (
                  <div key={member.id} className="faculty-item">
                    {member.image && (
                      <img src={member.image} alt={member.name} className="faculty-thumbnail" />
                    )}
                    <div className="faculty-details">
                      <h5>{member.name}</h5>
                      <p className="designation">{member.designation}</p>
                      {member.specialization && <p className="qualification">Specialization: {member.specialization}</p>}
                      <p className="description">{member.description}</p>
                    </div>
                    <div className="faculty-actions">
                      <button className="edit-btn" onClick={() => handleEditTechnicalStaff(member)}>Edit</button>
                      <button className="delete-btn" onClick={() => handleDeleteTechnicalStaff(member.id)}>Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Non-Teaching Employees Tab */}
        {activeTab === 'non-teaching' && (
          <div className="form-container">
            <h3>Manage Non-Teaching Employees</h3>

            {!showNonTeachingForm ? (
              <button className="add-btn" onClick={() => setShowNonTeachingForm(true)}>
                + Add Non-Teaching Employee
              </button>
            ) : (
              <div className="faculty-form">
                <h4>{editingNonTeaching ? 'Edit Employee' : 'Add New Employee'}</h4>

                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={nonTeachingFormData.name || ''}
                    onChange={handleNonTeachingFormChange}
                    placeholder="Enter name"
                  />
                </div>

                <div className="form-group">
                  <label>Designation</label>
                  <input
                    type="text"
                    name="designation"
                    value={nonTeachingFormData.designation || ''}
                    onChange={handleNonTeachingFormChange}
                    placeholder="Enter designation"
                  />
                </div>

                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    name="department"
                    value={nonTeachingFormData.department || ''}
                    onChange={handleNonTeachingFormChange}
                    placeholder="Enter department"
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={nonTeachingFormData.description || ''}
                    onChange={handleNonTeachingFormChange}
                    placeholder="Enter description"
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label>Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'image')}
                  />
                  {nonTeachingFormData.image && (
                    <div className="image-preview">
                      <img src={nonTeachingFormData.image} alt={nonTeachingFormData.name} />
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button className="save-btn" onClick={handleAddNonTeaching}>
                    {editingNonTeaching ? 'Update' : 'Add'}
                  </button>
                  <button className="cancel-btn" onClick={handleCancelNonTeachingForm}>Cancel</button>
                </div>
              </div>
            )}

            {/* Non-Teaching Employees List */}
            <div className="faculty-list">
              <h4>Non-Teaching Employees ({nonTeachingEmployees.length})</h4>
              {nonTeachingEmployees.length === 0 ? (
                <p>No non-teaching employees added yet.</p>
              ) : (
                nonTeachingEmployees.map((member) => (
                  <div key={member.id} className="faculty-item">
                    {member.image && (
                      <img src={member.image} alt={member.name} className="faculty-thumbnail" />
                    )}
                    <div className="faculty-details">
                      <h5>{member.name}</h5>
                      <p className="designation">{member.designation}</p>
                      {member.department && <p className="qualification">Department: {member.department}</p>}
                      <p className="description">{member.description}</p>
                    </div>
                    <div className="faculty-actions">
                      <button className="edit-btn" onClick={() => handleEditNonTeaching(member)}>Edit</button>
                      <button className="delete-btn" onClick={() => handleDeleteNonTeaching(member.id)}>Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Department Logo Tab */}
        {activeTab === 'logo' && (
          <AdminDepartmentLogo />
        )}

        {/* Carousel Images Tab */}
        {activeTab === 'carousel' && (
          <AdminHomePageImages />
        )}

        {/* Notice Board Tab */}
        {activeTab === 'notice' && (
          <AdminNotice />
        )}
      </div>
    </div>
  );
};

export default HomePageManagement;

