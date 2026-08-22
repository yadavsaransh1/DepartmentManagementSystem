import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/admin-power.css';

export const AdminPower = () => {
  const [teachers, setTeachers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [Loading, setLoading] = useState(false);
  const [hods, setHods] = useState([]);
  const [tabView, setTabView] = useState('appoint'); // appoint, manage, database
  const [databaseTables, setDatabaseTables] = useState([]);
  const [selectedTables, setSelectedTables] = useState([]);
  const [colorSettings, setColorSettings] = useState({});
  const [selectedRole, setSelectedRole] = useState('ADMIN');
  const [showHoDPowerModal, setShowHoDPowerModal] = useState(false);
  const [selectedHoD, setSelectedHoD] = useState(null);
  const [hoDPowers, setHoDPowers] = useState({});

  // Teacher powers state - using new 8 tab-based permission names
  const [teacherPowers, setTeacherPowers] = useState({
    canAccessHomePage: false,
    canAccessStudentDetails: false,
    canAccessTeacherDetails: false,
    canAccessResults: false,
    canAccessStudentStatistics: false,
    canAccessProject: false,
    canAccessFeedback: false,
    canAccessAssignment: false,
    canAccessCommittee: false,
    isHoD: false
  });

  useEffect(() => {
    fetchTeachers();
    fetchHoDs();
    fetchDatabaseTables();
    fetchColorSettings('ADMIN');
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await api.get('/teachers');
      setTeachers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching teachers:', err);
      setTeachers([]);
    }
  };

  const fetchHoDs = async () => {
    try {
      // Get all teachers and filter those with isHoD=true
      const response = await api.get('/teachers');
      const allTeachers = Array.isArray(response.data) ? response.data : [];
      const hoDs = allTeachers.filter(t => t.isHoD === true);
      setHods(hoDs);
    } catch (err) {
      console.error('Error fetching HoDs:', err);
      setHods([]);
    }
  };

  const fetchDatabaseTables = async () => {
    try {
      const response = await api.get('/admin-power/database-tables');
      setDatabaseTables(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching database tables:', err);
    }
  };

  const fetchColorSettings = async (role) => {
    try {
      const response = await api.get(`/admin-power/color-settings?role=${encodeURIComponent(role)}`);
      setColorSettings(response.data);
    } catch (err) {
      console.error('Error fetching color settings:', err);
    }
  };

  const appointAsHoD = async (teacher) => {
    try {
      setLoading(true);
      
      // Call the admin power endpoint to appoint HoD
      const response = await api.post(`/admin-power/appoint-hod?email=${encodeURIComponent(teacher.email || teacher.id)}`);
      
      // alert('✅ Teacher appointed as HoD successfully');
      console.log('Appoint HoD response:', response.data);
      
      // Refresh both lists
      await Promise.all([fetchHoDs(), fetchTeachers()]);
    } catch (err) {
      console.error('Error appointing HoD:', err);
      ('❌ Error appointing HoD: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const removeHoDStatus = async (hod) => {
    try {
      setLoading(true);
      
      // Call the admin power endpoint to remove HoD status and revert role
      const response = await api.post(`/admin-power/remove-hod?email=${encodeURIComponent(hod.email || hod.id)}`);
      
      // alert('✅ HoD status removed successfully');
      console.log('Remove HoD response:', response.data);
      
      // Refresh both lists
      await Promise.all([fetchHoDs(), fetchTeachers()]);
    } catch (err) {
      console.error('Error removing HoD status:', err);
      alert('❌ Error removing HoD status: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const openHoDPowerModal = async (hod) => {
    try {
      // Fetch full teacher details to get current powers
      const response = await api.get(`/teachers/${hod.id}`);
      const teacher = response.data;
      
      // Initialize with new 8 tab-based permission names
      const initialPowers = {
        canAccessHomePage: false,
        canAccessStudentDetails: false,
        canAccessTeacherDetails: false,
        canAccessResults: false,
        canAccessStudentStatistics: false,
        canAccessProject: false,
        canAccessFeedback: false,
        canAccessAssignment: false,
        canAccessCommittee: false
      };
      
      // Try loading from new TeacherPower API endpoint first
      try {
        const powerResponse = await api.get(`/admin-power/teacher-powers?email=${encodeURIComponent(teacher.email)}`);
        if (powerResponse.data) {
          Object.assign(initialPowers, powerResponse.data);
        }
      } catch (e) {
        // Fallback to parsing adminPowers JSON from teacher object
        if (teacher.adminPowers) {
          try {
            const parsed = JSON.parse(teacher.adminPowers);
            Object.assign(initialPowers, parsed);
          } catch (parseErr) {
            console.error('Error parsing powers:', parseErr);
          }
        }
      }
      
      setSelectedHoD(teacher);
      setHoDPowers(initialPowers);
      setShowHoDPowerModal(true);
    } catch (err) {
      console.error('Error loading HoD powers:', err);
      alert('Error loading HoD powers');
    }
  };

  const saveHoDPowers = async () => {
    if (!selectedHoD) return;
    try {
      setLoading(true);
      
      // Prepare DTO with new 8 tab-based permission names
      const powerDTO = {
        canAccessHomePage: hoDPowers.canAccessHomePage === true,
        canAccessStudentDetails: hoDPowers.canAccessStudentDetails === true,
        canAccessTeacherDetails: hoDPowers.canAccessTeacherDetails === true,
        canAccessResults: hoDPowers.canAccessResults === true,
        canAccessStudentStatistics: hoDPowers.canAccessStudentStatistics === true,
        canAccessProject: hoDPowers.canAccessProject === true,
        canAccessFeedback: hoDPowers.canAccessFeedback === true,
        canAccessAssignment: hoDPowers.canAccessAssignment === true,
        canAccessCommittee: hoDPowers.canAccessCommittee === true,
        isHoD: true
      };
      
      console.log('Saving HoD powers:', powerDTO);
      
      // Call the backend endpoint with HoD email as query parameter
      const saveResponse = await api.post(`/admin-power/update-teacher-powers?email=${encodeURIComponent(selectedHoD.email)}`, powerDTO);
      
      console.log('HoD powers saved successfully, response:', saveResponse.data);
      
      // alert('✅ HoD powers updated successfully');
      setShowHoDPowerModal(false);
      alert('✅ HoD powers updated successfully');
      await fetchHoDs();
    } catch (err) {
      console.error('Error saving HoD powers:', err);
      alert('❌ Error saving HoD powers: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherSelect = async (teacher) => {
    setSelectedTeacher(teacher);
    try {
      // Initialize with new 8 tab-based permission names
      const normalizedPowers = {
        canAccessHomePage: false,
        canAccessStudentDetails: false,
        canAccessTeacherDetails: false,
        canAccessResults: false,
        canAccessStudentStatistics: false,
        canAccessProject: false,
        canAccessFeedback: false,
        canAccessAssignment: false,
        canAccessCommittee: false,
        isHoD: teacher.isHoD === true
      };

      // Fetch teacher powers from the dedicated API endpoint
      try {
        const powerResponse = await api.get(`/admin-power/teacher-powers?email=${encodeURIComponent(teacher.email)}`);
        if (powerResponse.data) {
          console.log('Fetched teacher powers from API:', powerResponse.data);
          Object.assign(normalizedPowers, powerResponse.data);
        }
      } catch (apiErr) {
        console.warn('Could not fetch powers from TeacherPower API, trying fallback method:', apiErr.message);
        
        // Fallback: Fetch the teacher's details directly using their ID
        const response = await api.get(`/teachers/${teacher.id}`);
        const teacherData = response.data;
        
        // If adminPowers exists in teacher object, parse it
        if (teacherData.adminPowers) {
          try {
            const parsedPowers = JSON.parse(teacherData.adminPowers);
            Object.assign(normalizedPowers, parsedPowers);
          } catch (e) {
            console.error('Error parsing admin powers JSON:', e);
          }
        }
      }

      setTeacherPowers(normalizedPowers);
      console.log('Loaded teacher powers:', normalizedPowers);
    } catch (err) {
      console.error('Error fetching teacher details:', err);
      setTeacherPowers({
        canAccessHomePage: false,
        canAccessStudentDetails: false,
        canAccessTeacherDetails: false,
        canAccessResults: false,
        canAccessStudentStatistics: false,
        canAccessProject: false,
        canAccessFeedback: false,
        canAccessAssignment: false,
        isHoD: teacher.isHoD === true
      });
    }
  };

  const updateTeacherPowers = async () => {
    if (!selectedTeacher) {
      alert('Please select a teacher first');
      return;
    }
    try {
      setLoading(true);
      
      // Prepare DTO with new 8 tab-based permission names
      const powerDTO = {
        canAccessHomePage: teacherPowers.canAccessHomePage === true,
        canAccessStudentDetails: teacherPowers.canAccessStudentDetails === true,
        canAccessTeacherDetails: teacherPowers.canAccessTeacherDetails === true,
        canAccessResults: teacherPowers.canAccessResults === true,
        canAccessStudentStatistics: teacherPowers.canAccessStudentStatistics === true,
        canAccessProject: teacherPowers.canAccessProject === true,
        canAccessFeedback: teacherPowers.canAccessFeedback === true,
        canAccessAssignment: teacherPowers.canAccessAssignment === true,
        canAccessCommittee: teacherPowers.canAccessCommittee === true,
        isHoD: teacherPowers.isHoD === true
      };

      console.log('Updating teacher powers with:', powerDTO);
      
      // Call the backend endpoint with email as query parameter
      const saveResponse = await api.post(`/admin-power/update-teacher-powers?email=${encodeURIComponent(selectedTeacher.email)}`, powerDTO);
      
      console.log('Teacher powers saved successfully, response:', saveResponse.data);
      
      // Update the local state directly with the response (fresh from backend)
      if (saveResponse.data) {
        setTeacherPowers(saveResponse.data);
      }
      
      // Also refresh the teacher list
      await fetchTeachers();
      
      // Show success message
      alert('✅ Teacher powers updated successfully');
    } catch (err) {
      console.error('Error updating teacher powers:', err);
      alert('❌ Error updating teacher powers: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleTableSelect = (tableName) => {
    setSelectedTables(prev => 
      prev.includes(tableName) 
        ? prev.filter(t => t !== tableName)
        : [...prev, tableName]
    );
  };

  const clearSelectedTablesData = async () => {
    if (selectedTables.length === 0) {
      alert('Please select at least one table');
      return;
    }
    if (!window.confirm(`Are you sure you want to clear data from ${selectedTables.length} table(s)? This action cannot be undone!`)) {
      return;
    }
    try {
      setLoading(true);
      await api.post('/admin-power/clear-table-data', { tables: selectedTables });
      // alert('✅ Selected table data cleared successfully');
      setSelectedTables([]);
    } catch (err) {
      console.error('Error clearing table data:', err);
      alert('❌ Error clearing table data: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const updateColorSettings = async () => {
    try {
      setLoading(true);
      await api.put(`/admin-power/color-settings?role=${encodeURIComponent(selectedRole)}`, colorSettings);
      // alert('✅ Color settings updated successfully for ' + selectedRole);
      await fetchColorSettings(selectedRole);
    } catch (err) {
      console.error('Error updating color settings:', err);
      alert('❌ Error updating color settings: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const filteredTeachers = teachers.filter(t => 
    t.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleHoDPowerChange = (power) => {
    setHoDPowers(prev => ({
      ...prev,
      [power]: !prev[power]
    }));
  };

  return (
    <div className="admin-power-container">
      <h2>Admin Power Management</h2>
      
      {/* Modal for assigning powers to HoD */}
      {showHoDPowerModal && selectedHoD && (
        <div className="modal-overlay" onClick={() => setShowHoDPowerModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Assign Powers to {selectedHoD.fullName}</h3>
              <button className="modal-close" onClick={() => setShowHoDPowerModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="powers-grid">
                {[
                  { key: 'canAccessHomePage', label: '🏠 Home Page' },
                  { key: 'canAccessStudentDetails', label: '👥 Student Details' },
                  { key: 'canAccessTeacherDetails', label: '👨‍🏫 Teacher Details' },
                  { key: 'canAccessResults', label: '📊 Result (Marks)' },
                  { key: 'canAccessStudentStatistics', label: '📈 Student Statistics' },
                  { key: 'canAccessProject', label: '📁 Project' },
                  { key: 'canAccessFeedback', label: '💬 Feedback' },
                  { key: 'canAccessAssignment', label: '📝 Assignment' },
                  { key: 'canAccessCommittee', label: '🏛️ Committee Access' }
                ].map(power => (
                  <label key={power.key} className="power-checkbox">
                    <input
                      type="checkbox"
                      checked={hoDPowers[power.key] || false}
                      onChange={() => setHoDPowers(prev => ({...prev, [power.key]: !prev[power.key]}))}
                    />
                    <span>{power.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowHoDPowerModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={saveHoDPowers} disabled={Loading}>
                {Loading ? 'Saving...' : '💾 Save Powers'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${tabView === 'appoint' ? 'active' : ''}`}
          onClick={() => setTabView('appoint')}
        >
          Appoint/Remove HoD
        </button>
        <button 
          className={`tab-btn ${tabView === 'manage' ? 'active' : ''}`}
          onClick={() => setTabView('manage')}
        >
          Manage Teacher Powers
        </button>
        <button 
          className={`tab-btn ${tabView === 'colors' ? 'active' : ''}`}
          onClick={() => setTabView('colors')}
        >
          Attendance Progress Colors
        </button>
        <button 
          className={`tab-btn ${tabView === 'database' ? 'active' : ''}`}
          onClick={() => setTabView('database')}
        >
          Database Management
        </button>
      </div>

      {/* TAB 1: Appoint/Remove HoD */}
      {/* Modal for assigning powers to HoD */}
      {showHoDPowerModal && selectedHoD && (
        <div className="modal-overlay" onClick={() => setShowHoDPowerModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Assign Powers to {selectedHoD.fullName}</h3>
              <button className="modal-close" onClick={() => setShowHoDPowerModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="powers-grid">
                {[
                  { key: 'canAccessHomePage', label: '🏠 Home Page' },
                  { key: 'canAccessStudentDetails', label: '👥 Student Details' },
                  { key: 'canAccessTeacherDetails', label: '👨‍🏫 Teacher Details' },
                  { key: 'canAccessResults', label: '📊 Result (Marks)' },
                  { key: 'canAccessStudentStatistics', label: '📈 Student Statistics' },
                  { key: 'canAccessProject', label: '📁 Project' },
                  { key: 'canAccessFeedback', label: '💬 Feedback' },
                  { key: 'canAccessAssignment', label: '📝 Assignment' },
                  { key: 'canAccessCommittee', label: '🏛️ Committee Access' }
                ].map(power => (
                  <label key={power.key} className="power-checkbox">
                    <input
                      type="checkbox"
                      checked={hoDPowers[power.key] || false}
                      onChange={() => handleHoDPowerChange(power.key)}
                    />
                    {power.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowHoDPowerModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={saveHoDPowers} disabled={Loading}>
                {Loading ? 'Saving...' : '💾 Save Powers'}
              </button>
            </div>
          </div>
        </div>
      )}

      {tabView === 'appoint' && (
        <div className="tab-content">
          <div className="section">
            <h3>Current HoDs</h3>
            {hods.length > 0 ? (
              <div className="hod-list">
                {hods.map(hod => (
                  <div key={hod.id} className="hod-card">
                    <div className="hod-info">
                      <h4>{hod.fullName || hod.teacherName || 'Unknown'}</h4>
                      <p>{hod.email || hod.teacherEmail}</p>
                    </div>
                    <div className="button-group">
                      <button 
                        className="btn-info"
                        onClick={() => openHoDPowerModal(hod)}
                        disabled={Loading}
                      >
                        🔧 Assign Powers
                      </button>
                      <button 
                        className="btn-danger"
                        onClick={() => removeHoDStatus(hod)}
                        disabled={Loading}
                      >
                        Remove as HoD
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No HoDs appointed yet</p>
            )}
          </div>

          <div className="section">
            <h3>Appoint New HoD</h3>
            <input
              type="text"
              placeholder="Search teachers by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <div className="teacher-list">
              {filteredTeachers.map(teacher => {
                // Check if teacher is in HoDs list
                const isHoD = hods.some(h => h.id === teacher.id);
                return (
                  <div key={teacher.id} className="teacher-item">
                    <div className="teacher-info">
                      <h4>{teacher.fullName || teacher.email}</h4>
                      <p>{teacher.email}</p>
                      <p className="department">{teacher.department}</p>
                    </div>
                    <button 
                      className={isHoD ? "btn-warning" : "btn-success"}
                      onClick={() => isHoD ? removeHoDStatus(teacher) : appointAsHoD(teacher)}
                      disabled={Loading}
                    >
                      {isHoD ? 'Already HoD' : 'Appoint as HoD'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Manage Teacher Powers  */}
      {tabView === 'manage' && (
        <div className="tab-content">
          <div className="section">
            <h3>Select Teacher</h3>
            <input
              type="text"
              placeholder="Search teachers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <div className="teacher-list">
              {filteredTeachers.map(teacher => (
                <div 
                  key={teacher.id} 
                  className={`teacher-item selectable ${selectedTeacher?.id === teacher.id ? 'selected' : ''}`}
                  onClick={() => handleTeacherSelect(teacher)}
                >
                  <div className="teacher-info">
                    <h4>{teacher.fullName || teacher.email}</h4>
                    <p>{teacher.email}</p>
                  </div>
                  {selectedTeacher?.id === teacher.id && <span className="selected-badge">✓ Selected</span>}
                </div>
              ))}
            </div>
          </div>

          {selectedTeacher && (
            <div className="section">
              <h3>Manage Powers for {selectedTeacher.fullName}</h3>
              <div className="powers-grid">
                <label className="power-checkbox">
                  <input
                    type="checkbox"
                    checked={teacherPowers.canAccessHomePage}
                    onChange={(e) => setTeacherPowers({...teacherPowers, canAccessHomePage: e.target.checked})}
                  />
                  <span>🏠 Home Page</span>
                </label>
                <label className="power-checkbox">
                  <input
                    type="checkbox"
                    checked={teacherPowers.canAccessStudentDetails}
                    onChange={(e) => setTeacherPowers({...teacherPowers, canAccessStudentDetails: e.target.checked})}
                  />
                  <span>👥 Student Details</span>
                </label>
                <label className="power-checkbox">
                  <input
                    type="checkbox"
                    checked={teacherPowers.canAccessTeacherDetails}
                    onChange={(e) => setTeacherPowers({...teacherPowers, canAccessTeacherDetails: e.target.checked})}
                  />
                  <span>👨‍🏫 Teacher Details</span>
                </label>
                <label className="power-checkbox">
                  <input
                    type="checkbox"
                    checked={teacherPowers.canAccessResults}
                    onChange={(e) => setTeacherPowers({...teacherPowers, canAccessResults: e.target.checked})}
                  />
                  <span>📊 Result (Marks)</span>
                </label>
                <label className="power-checkbox">
                  <input
                    type="checkbox"
                    checked={teacherPowers.canAccessStudentStatistics}
                    onChange={(e) => setTeacherPowers({...teacherPowers, canAccessStudentStatistics: e.target.checked})}
                  />
                  <span>📈 Student Statistics</span>
                </label>
                <label className="power-checkbox">
                  <input
                    type="checkbox"
                    checked={teacherPowers.canAccessProject}
                    onChange={(e) => setTeacherPowers({...teacherPowers, canAccessProject: e.target.checked})}
                  />
                  <span>📁 Project</span>
                </label>
                <label className="power-checkbox">
                  <input
                    type="checkbox"
                    checked={teacherPowers.canAccessFeedback}
                    onChange={(e) => setTeacherPowers({...teacherPowers, canAccessFeedback: e.target.checked})}
                  />
                  <span>💬 Feedback</span>
                </label>
                <label className="power-checkbox">
                  <input
                    type="checkbox"
                    checked={teacherPowers.canAccessAssignment}
                    onChange={(e) => setTeacherPowers({...teacherPowers, canAccessAssignment: e.target.checked})}
                  />
                  <span>📝 Assignment</span>
                </label>
                <label className="power-checkbox">
                  <input
                    type="checkbox"
                    checked={teacherPowers.canAccessCommittee}
                    onChange={(e) => setTeacherPowers({...teacherPowers, canAccessCommittee: e.target.checked})}
                  />
                  <span>🏛️ Committee Access</span>
                </label>
              </div>
              <button 
                className="btn-primary"
                onClick={updateTeacherPowers}
                disabled={Loading}
              >
                {Loading ? 'Updating...' : 'Update Powers'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Color Settings */}
      {tabView === 'colors' && (
        <div className="tab-content">
          <div className="section">
            <h3>Attendance Progress Bar Colors</h3>
            <div className="role-selector">
              <label>Select Role:</label>
              <select 
                value={selectedRole} 
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  fetchColorSettings(e.target.value);
                }}
              >
                <option value="ADMIN">Admin</option>
                <option value="TEACHER">Teacher</option>
                <option value="STUDENT">Student</option>
              </select>
            </div>

            {colorSettings && colorSettings.role && (
              <div className="color-settings">
                <div className="color-setting-group">
                  <label>Low Threshold (%):</label>
                  <input
                    type="number"
                    value={colorSettings.lowThreshold}
                    onChange={(e) => setColorSettings({...colorSettings, lowThreshold: parseInt(e.target.value)})}
                    min="0"
                    max="100"
                  />
                  <div className="color-preview" style={{backgroundColor: colorSettings.lowColor}}>
                    Color: {colorSettings.lowColor}
                  </div>
                  <input
                    type="color"
                    value={colorSettings.lowColor}
                    onChange={(e) => setColorSettings({...colorSettings, lowColor: e.target.value})}
                  />
                  <p>For attendance &lt; {colorSettings.lowThreshold}%</p>
                </div>

                <div className="color-setting-group">
                  <label>Medium Threshold (%):</label>
                  <input
                    type="number"
                    value={colorSettings.mediumThreshold}
                    onChange={(e) => setColorSettings({...colorSettings, mediumThreshold: parseInt(e.target.value)})}
                    min="0"
                    max="100"
                  />
                  <div className="color-preview" style={{backgroundColor: colorSettings.mediumColor}}>
                    Color: {colorSettings.mediumColor}
                  </div>
                  <input
                    type="color"
                    value={colorSettings.mediumColor}
                    onChange={(e) => setColorSettings({...colorSettings, mediumColor: e.target.value})}
                  />
                  <p>For attendance {colorSettings.lowThreshold}% - {colorSettings.mediumThreshold}%</p>
                </div>

                <div className="color-setting-group">
                  <label>High Color:</label>
                  <div className="color-preview" style={{backgroundColor: colorSettings.highColor}}>
                    Color: {colorSettings.highColor}
                  </div>
                  <input
                    type="color"
                    value={colorSettings.highColor}
                    onChange={(e) => setColorSettings({...colorSettings, highColor: e.target.value})}
                  />
                  <p>For attendance &gt; {colorSettings.mediumThreshold}%</p>
                </div>

                <button 
                  className="btn-primary"
                  onClick={updateColorSettings}
                  disabled={Loading}
                >
                  {Loading ? 'Updating...' : 'Save Color Settings'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Database Management */}
      {tabView === 'database' && (
        <div className="tab-content">
          <div className="section">
            <h3>Database Table Management</h3>
            <p className="warning">⚠️ Warning: Clearing table data will permanently delete all records. This action cannot be undone!</p>
            
            <div className="table-list">
              <h4>Select tables to clear data:</h4>
              {databaseTables.map(table => (
                <label key={table} className="table-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedTables.includes(table)}
                    onChange={() => handleTableSelect(table)}
                  />
                  <span className="table-name">{table}</span>
                </label>
              ))}
            </div>

            {selectedTables.length > 0 && (
              <div className="selected-summary">
                <p>Selected {selectedTables.length} table(s) for clearing</p>
                <button 
                  className="btn-danger-large"
                  onClick={clearSelectedTablesData}
                  disabled={Loading}
                >
                  {Loading ? 'Clearing...' : 'Clear Selected Tables'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPower;
