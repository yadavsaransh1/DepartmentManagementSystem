import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/dashboard.css';

export const StudentDetailsView = () => {
  const [students, setStudents] = useState([]);
  const [groupedStudents, setGroupedStudents] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedPrograms, setExpandedPrograms] = useState({});
  const [expandedShowMore, setExpandedShowMore] = useState({}); // Track which groups show all students
  const [availableFields, setAvailableFields] = useState({});
  const [showExportModal, setShowExportModal] = useState(false);
  
  // View filters - for filtering displayed students
  const [viewFilters, setViewFilters] = useState({
    gender: 'all', // 'all', 'male', 'female'
    state: 'all',
    caste: 'all',
    religion: 'all',
    district: 'all'
  });
  
  // Dynamic filter options
  const [filterOptions, setFilterOptions] = useState({
    states: [],
    castes: [],
    religions: [],
    districts: []
  });
  
  const [exportFilters, setExportFilters] = useState({
    selectAllFields: true,
    fields: {},
    filterByGender: 'all', // 'all', 'female', 'male'
    filterByCaste: 'all', // 'all', 'ST', 'SC', 'BC', 'General', 'OBC'
    combinedFilters: {
      femaleOnly: false,
      stOnly: false,
      scOnly: false,
      bcOnly: false,
      femaleST: false,
      femaleSC: false,
      femaleBC: false
    }
  });
  const [message, setMessage] = useState({ text: '', type: '' });

  const ITEMS_PER_PROGRAM = 4;

  // Standard fields that are always available
  const STANDARD_FIELDS = ['studentId', 'fullName', 'email', 'program', 'semester', 'department', 'enrollmentNumber', 'contactNo', 'attendancePercentage'];

  useEffect(() => {
    fetchAllStudents();
  }, []);

  const initializeExportFields = (studentsList) => {
    const fields = {};
    const customFieldsSet = new Set();

    // Add standard fields
    STANDARD_FIELDS.forEach(field => {
      fields[field] = true;
    });

    // Collect all custom fields from all students
    studentsList.forEach(student => {
      if (student.customFields) {
        try {
          const customFieldsObj = typeof student.customFields === 'string' 
            ? JSON.parse(student.customFields) 
            : student.customFields;
          Object.keys(customFieldsObj).forEach(key => {
            customFieldsSet.add(key);
          });
        } catch (e) {
          console.error('Error parsing customFields:', e);
        }
      }
    });

    // Add custom fields
    customFieldsSet.forEach(field => {
      fields[field] = true;
    });

    return fields;
  };

  const fetchAllStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/students');
      const studentsList = Array.isArray(response.data) ? response.data : [];
      setStudents(studentsList);
      
      // Initialize export fields with all available fields
      const fields = initializeExportFields(studentsList);
      setAvailableFields(['gender', 'caste', 'address']); // Common custom fields
      setExportFilters(prev => ({
        ...prev,
        fields: fields,
        selectAllFields: true
      }));
      
      // Extract filter options from students
      extractFilterOptions(studentsList);
      
      groupStudentsByProgramAndSemester(studentsList);
      setMessage({ text: '', type: '' });
    } catch (err) {
      console.error('Error fetching students:', err);
      setMessage({ text: 'Failed to load student details', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const extractFilterOptions = (studentsList) => {
    const states = new Set();
    const castes = new Set();
    const religions = new Set();
    const districts = new Set();

    studentsList.forEach(student => {
      const customFields = student.customFields ? 
        (typeof student.customFields === 'string' ? JSON.parse(student.customFields) : student.customFields) 
        : {};
      
      if (customFields.state) states.add(customFields.state);
      if (customFields.category) castes.add(customFields.category);
      if (customFields.religion) religions.add(customFields.religion);
      if (customFields.district) districts.add(customFields.district);
    });

    const sortedCastes = Array.from(castes).sort();
    
    setFilterOptions({
      states: Array.from(states).sort(),
      castes: sortedCastes,
      religions: Array.from(religions).sort(),
      districts: Array.from(districts).sort()
    });
    
    // Regenerate combined filters based on available castes
    const newCombinedFilters = {
      femaleOnly: false
    };
    
    // Add female[Caste] and [Caste]Only combinations for each available caste
    sortedCastes.forEach(caste => {
      newCombinedFilters[`female${caste}`] = false;
      newCombinedFilters[`${caste}Only`] = false;
    });
    
    setExportFilters(prev => ({
      ...prev,
      combinedFilters: newCombinedFilters
    }));
  };

  const applyViewFilters = (studentsList) => {
    return studentsList.filter(student => {
      const customFields = student.customFields ? 
        (typeof student.customFields === 'string' ? JSON.parse(student.customFields) : student.customFields) 
        : {};

      // Gender filter
      if (viewFilters.gender !== 'all') {
        if (customFields.gender?.toLowerCase() !== viewFilters.gender.toLowerCase()) {
          return false;
        }
      }

      // State filter
      if (viewFilters.state !== 'all') {
        if (customFields.state !== viewFilters.state) {
          return false;
        }
      }

      // Caste filter
      if (viewFilters.caste !== 'all') {
        if (customFields.caste !== viewFilters.caste) {
          return false;
        }
      }

      // Religion filter
      if (viewFilters.religion !== 'all') {
        if (customFields.religion !== viewFilters.religion) {
          return false;
        }
      }

      // District filter
      if (viewFilters.district !== 'all') {
        if (customFields.district !== viewFilters.district) {
          return false;
        }
      }

      return true;
    });
  };

  const groupStudentsByProgramAndSemester = (studentsList) => {
    // Apply view filters first
    const filteredStudents = applyViewFilters(studentsList);
    
    const grouped = {};
    
    filteredStudents.forEach(student => {
      const program = student.program || 'Unassigned';
      const semester = student.semester || 'N/A';
      const key = `${program}-Sem${semester}`;
      
      if (!grouped[key]) {
        grouped[key] = {
          program,
          semester,
          students: []
        };
      }
      grouped[key].students.push(student);
    });

    // Sort by program and semester
    const sorted = {};
    Object.keys(grouped)
      .sort()
      .forEach(key => {
        sorted[key] = grouped[key];
      });

    setGroupedStudents(sorted);
    
    // Initialize all programs as expanded by default
    const expandedByDefault = {};
    Object.keys(sorted).forEach(key => {
      expandedByDefault[key] = true;
    });
    setExpandedPrograms(expandedByDefault);
  };

  const handleViewFilterChange = (filterType, value) => {
    const newFilters = { ...viewFilters, [filterType]: value };
    setViewFilters(newFilters);
    // Re-group students with new filters
    groupStudentsByProgramAndSemester(students);
  };

  // Helper to regenerate groups when filters change
  useEffect(() => {
    if (students.length > 0) {
      groupStudentsByProgramAndSemester(students);
    }
  }, [viewFilters]);

  const toggleProgramExpansion = (key) => {
    setExpandedPrograms(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleExportFieldChange = (field) => {
    setExportFilters(prev => ({
      ...prev,
      fields: {
        ...prev.fields,
        [field]: !prev.fields[field]
      }
    }));
  };

  const handleSelectAllFields = () => {
    const newState = !exportFilters.selectAllFields;
    const allFields = {};
    Object.keys(exportFilters.fields).forEach(key => {
      allFields[key] = newState;
    });
    setExportFilters(prev => ({
      ...prev,
      selectAllFields: newState,
      fields: allFields
    }));
  };

  const handleFilterChange = (filterType, value) => {
    setExportFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleCombinedFilterChange = (filter) => {
    setExportFilters(prev => ({
      ...prev,
      combinedFilters: {
        ...prev.combinedFilters,
        [filter]: !prev.combinedFilters[filter]
      }
    }));
  };

  const applyExportFilters = () => {
    let filteredStudents = [...students];
    
    console.log('=== Export Filter Debug ===');
    console.log('Export Filters:', exportFilters);
    console.log('Total students before filtering:', filteredStudents.length);

    // Apply gender filter
    if (exportFilters.filterByGender !== 'all') {
      filteredStudents = filteredStudents.filter(student => {
        const customFields = student.customFields ? 
          (typeof student.customFields === 'string' ? JSON.parse(student.customFields) : student.customFields) 
          : {};
        return customFields.gender?.toLowerCase() === exportFilters.filterByGender.toLowerCase();
      });
      console.log('After gender filter:', filteredStudents.length);
    }

    // Apply category filter
    if (exportFilters.filterByCaste !== 'all') {
      console.log('Applying category filter:', exportFilters.filterByCaste);
      filteredStudents = filteredStudents.filter(student => {
        const customFields = student.customFields ? 
          (typeof student.customFields === 'string' ? JSON.parse(student.customFields) : student.customFields) 
          : {};
        const studentCategory = customFields.category;
        const matches = studentCategory === exportFilters.filterByCaste;
        console.log(`Student ${student.email}: category="${studentCategory}" vs filter="${exportFilters.filterByCaste}" -> ${matches}`);
        return matches;
      });
      console.log('After category filter:', filteredStudents.length);
    }

    // Apply combined filters - check all active combined filters dynamically
    const activeCombinedFilters = Object.entries(exportFilters.combinedFilters)
      .filter(([key, value]) => value === true)
      .map(([key]) => key);
    
    if (activeCombinedFilters.length > 0) {
      console.log('Applying combined filters:', activeCombinedFilters);
      filteredStudents = filteredStudents.filter(student => {
        const customFields = student.customFields ? 
          (typeof student.customFields === 'string' ? JSON.parse(student.customFields) : student.customFields) 
          : {};
        const gender = customFields.gender?.toLowerCase();
        const category = customFields.category;

        // Check if student matches ANY of the active combined filters
        return activeCombinedFilters.some(filterKey => {
          if (filterKey === 'femaleOnly') {
            return gender === 'female';
          }
          
          // Check for "female[Category]" patterns
          if (filterKey.startsWith('female')) {
            const categoryForFilter = filterKey.substring(6); // Remove 'female' prefix
            return gender === 'female' && category === categoryForFilter;
          }
          
          // Check for "[Category]Only" patterns
          if (filterKey.endsWith('Only')) {
            const categoryForFilter = filterKey.substring(0, filterKey.length - 4); // Remove 'Only' suffix
            return category === categoryForFilter;
          }
          
          return false;
        });
      });
      console.log('After combined filters:', filteredStudents.length);
    }

    console.log('Final filtered count:', filteredStudents.length);
    console.log('==========================');
    return filteredStudents;
  };

  const exportToCSV = () => {
    const filteredStudents = applyExportFilters();
    
    if (filteredStudents.length === 0) {
      setMessage({ text: 'No students match the selected filters', type: 'warning' });
      return;
    }

    const selectedFields = Object.keys(exportFilters.fields).filter(key => exportFilters.fields[key]);
    
    // Build CSV header
    const headers = selectedFields.map(field => {
      // Format field names for display
      return field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1').trim();
    });
    let csv = headers.join(',') + '\n';

    // Build CSV rows
    filteredStudents.forEach(student => {
      const customFields = student.customFields ? 
        (typeof student.customFields === 'string' ? JSON.parse(student.customFields) : student.customFields) 
        : {};
      
      const row = selectedFields.map(field => {
        let value = '';
        
        // Map field names correctly to StudentDTO properties
        if (field === 'studentId') value = student.studentId || '';
        else if (field === 'fullName') value = student.fullName || '';
        else if (field === 'email') value = student.email || '';
        else if (field === 'program') value = student.program || '';
        else if (field === 'semester') value = student.semester || '';
        else if (field === 'department') value = student.department || '';
        else if (field === 'enrollmentNumber') value = student.enrollmentNumber || '';
        else if (field === 'contactNo') value = student.contactNo || '';
        else if (field === 'attendancePercentage') value = student.attendancePercentage || '';
        else if (customFields.hasOwnProperty(field)) value = customFields[field] || '';
        
        // Escape quotes in CSV values
        return `"${(value + '').replace(/"/g, '""')}"`;
      });
      csv += row.join(',') + '\n';
    });

    // Download CSV
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', `student_details_${new Date().getTime()}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    setMessage({ text: `Exported ${filteredStudents.length} student records`, type: 'success' });
    setShowExportModal(false);
  };

  const exportToExcel = async () => {
    try {
      const filteredStudents = applyExportFilters();
      
      if (filteredStudents.length === 0) {
        setMessage({ text: 'No students match the selected filters', type: 'warning' });
        return;
      }

      // For now, just use CSV export (can be enhanced with proper Excel library)
      exportToCSV();
      
    } catch (err) {
      setMessage({ text: 'Failed to export to Excel', type: 'error' });
    }
  };

  const getStudentDetails = (student) => {
    const customFields = student.customFields ? 
      (typeof student.customFields === 'string' ? JSON.parse(student.customFields) : student.customFields) 
      : {};
    
    return {
      ...student,
      fullName: student.fullName || 'N/A',
      email: student.email || 'N/A',
      studentId: student.studentId || 'N/A',
      enrollmentNumber: student.enrollmentNumber || 'N/A',
      contactNo: student.contactNo || 'N/A',
      department: student.department || 'N/A',
      program: student.program || 'N/A',
      semester: student.semester || 'N/A',
      attendancePercentage: student.attendancePercentage || 'N/A',
      ...customFields
    };
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading student details...</div>;
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9f9f9', minHeight: '90vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>👥 Student Details by Program & Semester</h2>
        <button
          onClick={() => setShowExportModal(true)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px'
          }}
        >
          📥 Export Data
        </button>
      </div>

      {/* View Filters */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h4 style={{ marginTop: 0, marginBottom: '15px', color: '#333' }}>🔍 Filter Students</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          {/* Gender Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555', fontSize: '14px' }}>Gender</label>
            <select
              value={viewFilters.gender}
              onChange={(e) => handleViewFilterChange('gender', e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              <option value="all">All Genders</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>

          {/* State Filter */}
          {filterOptions.states.length > 0 && (
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555', fontSize: '14px' }}>State</label>
              <select
                value={viewFilters.state}
                onChange={(e) => handleViewFilterChange('state', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                <option value="all">All States</option>
                {filterOptions.states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
          )}

          {/* Caste Filter */}
          {filterOptions.castes.length > 0 && (
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555', fontSize: '14px' }}>Category/Caste</label>
              <select
                value={viewFilters.caste}
                onChange={(e) => handleViewFilterChange('caste', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                <option value="all">All Categories</option>
                {filterOptions.castes.map(caste => (
                  <option key={caste} value={caste}>{caste}</option>
                ))}
              </select>
            </div>
          )}

          {/* Religion Filter */}
          {filterOptions.religions.length > 0 && (
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555', fontSize: '14px' }}>Religion</label>
              <select
                value={viewFilters.religion}
                onChange={(e) => handleViewFilterChange('religion', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                <option value="all">All Religions</option>
                {filterOptions.religions.map(religion => (
                  <option key={religion} value={religion}>{religion}</option>
                ))}
              </select>
            </div>
          )}

          {/* District Filter */}
          {filterOptions.districts.length > 0 && (
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555', fontSize: '14px' }}>District</label>
              <select
                value={viewFilters.district}
                onChange={(e) => handleViewFilterChange('district', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                <option value="all">All Districts</option>
                {filterOptions.districts.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>
          )}

          {/* Clear Filters Button */}
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={() => {
                setViewFilters({
                  gender: 'all',
                  state: 'all',
                  caste: 'all',
                  religion: 'all',
                  district: 'all'
                });
              }}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#ff9800',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '13px'
              }}
            >
              🔄 Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div style={{
          padding: '12px',
          marginBottom: '15px',
          backgroundColor: message.type === 'success' ? '#d4edda' : message.type === 'warning' ? '#fff3cd' : '#f8d7da',
          color: message.type === 'success' ? '#155724' : message.type === 'warning' ? '#856404' : '#721c24',
          borderRadius: '4px',
          border: `1px solid ${message.type === 'success' ? '#c3e6cb' : message.type === 'warning' ? '#ffeaa7' : '#f5c6cb'}`
        }}>
          {message.text}
        </div>
      )}

      {/* Filter Summary */}
      <div style={{
        padding: '12px 15px',
        marginBottom: '15px',
        backgroundColor: '#e3f2fd',
        borderLeft: '4px solid #2196f3',
        borderRadius: '4px',
        fontSize: '14px',
        color: '#1565c0'
      }}>
        <strong>📊 Summary:</strong> Showing {Object.values(groupedStudents).reduce((sum, group) => sum + group.students.length, 0)} student(s) 
        {(viewFilters.gender !== 'all' || viewFilters.state !== 'all' || viewFilters.caste !== 'all' || viewFilters.religion !== 'all' || viewFilters.district !== 'all') && 
          ` (filtered from ${students.length} total)`}
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '30px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>Export Student Data</h2>
              <button
                onClick={() => setShowExportModal(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#999'
                }}
              >
                ✕
              </button>
            </div>

            {/* Fields Selection */}
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              <h4 style={{ marginTop: 0 }}>Select Fields to Export</h4>
              <label style={{ display: 'block', marginBottom: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={exportFilters.selectAllFields}
                  onChange={handleSelectAllFields}
                  style={{ marginRight: '8px' }}
                />
                <strong>Select All</strong>
              </label>
              
              {/* Standard Fields */}
              <div style={{ marginTop: '10px' }}>
                <h5 style={{ marginTop: 0, marginBottom: '8px', fontSize: '12px', color: '#666' }}>STANDARD FIELDS</h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {STANDARD_FIELDS.filter(field => exportFilters.fields.hasOwnProperty(field)).map(field => (
                    <label key={field} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={exportFilters.fields[field] || false}
                        onChange={() => handleExportFieldChange(field)}
                        style={{ marginRight: '8px' }}
                      />
                      {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Custom Fields */}
              {Object.keys(exportFilters.fields).filter(f => !STANDARD_FIELDS.includes(f)).length > 0 && (
                <div style={{ marginTop: '15px' }}>
                  <h5 style={{ marginTop: 0, marginBottom: '8px', fontSize: '12px', color: '#666' }}>ADDITIONAL FIELDS</h5>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {Object.keys(exportFilters.fields).filter(f => !STANDARD_FIELDS.includes(f)).map(field => (
                      <label key={field} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={exportFilters.fields[field] || false}
                          onChange={() => handleExportFieldChange(field)}
                          style={{ marginRight: '8px' }}
                        />
                        {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Gender Filter */}
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              <h4 style={{ marginTop: 0 }}>Filter by Gender</h4>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {['all', 'female', 'male'].map(option => (
                  <button
                    key={option}
                    onClick={() => handleFilterChange('filterByGender', option)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: exportFilters.filterByGender === option ? '#2196f3' : '#ddd',
                      color: exportFilters.filterByGender === option ? 'white' : '#333',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      textTransform: 'capitalize'
                    }}
                  >
                    {option === 'all' ? 'All' : option}
                  </button>
                ))}
              </div>
            </div>

            {/* Caste Filter - Dynamic from database */}
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              <h4 style={{ marginTop: 0 }}>Filter by Caste/Category</h4>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {['all', ...filterOptions.castes].map(option => (
                  <button
                    key={option}
                    onClick={() => handleFilterChange('filterByCaste', option)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: exportFilters.filterByCaste === option ? '#ff9800' : '#ddd',
                      color: exportFilters.filterByCaste === option ? 'white' : '#333',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    {option === 'all' ? 'All' : option}
                  </button>
                ))}
              </div>
            </div>

            {/* Combined Filters - Dynamic based on available castes */}
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              <h4 style={{ marginTop: 0 }}>Combined Filters</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {/* Female Only */}
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={exportFilters.combinedFilters.femaleOnly || false}
                    onChange={() => handleCombinedFilterChange('femaleOnly')}
                    style={{ marginRight: '8px' }}
                  />
                  Female Only
                </label>
                
                {/* Female & [Caste] combinations for available castes */}
                {filterOptions.castes && filterOptions.castes.map(caste => (
                  <label key={`female${caste}`} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={exportFilters.combinedFilters[`female${caste}`] || false}
                      onChange={() => handleCombinedFilterChange(`female${caste}`)}
                      style={{ marginRight: '8px' }}
                    />
                    Female & {caste}
                  </label>
                ))}
                
                {/* Single caste filters */}
                {filterOptions.castes && filterOptions.castes.map(caste => (
                  <label key={`${caste}Only`} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={exportFilters.combinedFilters[`${caste}Only`] || false}
                      onChange={() => handleCombinedFilterChange(`${caste}Only`)}
                      style={{ marginRight: '8px' }}
                    />
                    {caste} Only
                  </label>
                ))}
              </div>
            </div>

            {/* Export Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={exportToCSV}
                style={{
                  flex: 1,
                  padding: '10px 20px',
                  backgroundColor: '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                📥 Export as CSV
              </button>
              <button
                onClick={exportToExcel}
                style={{
                  flex: 1,
                  padding: '10px 20px',
                  backgroundColor: '#2196f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                📊 Export as Excel
              </button>
              <button
                onClick={() => setShowExportModal(false)}
                style={{
                  flex: 1,
                  padding: '10px 20px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Students List */}
      <div>
        <div className="global-container">
        {Object.keys(groupedStudents).length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'white', borderRadius: '4px' }}>
            No students found
          </div>
        ) : (
          Object.entries(groupedStudents).map(([key, group]) => (
            <div key={key} style={{ marginBottom: '20px' }}>
              {/* Program Header */}
              <button
                onClick={() => toggleProgramExpansion(key)}
                style={{
                  width: '100%',
                  padding: '15px',
                  backgroundColor: '#2c3e50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>📚 {group.program} - Semester {group.semester}</span>
                <span style={{ fontSize: '14px' }}>
                  ({expandedPrograms[key] ? '▼' : '▶'}) {group.students.length} students
                </span>
              </button>

              {/* Students Grid */}
              {expandedPrograms[key] && (
                <div style={{
                  backgroundColor: 'white',
                  borderRadiusBottom: '4px',
                  padding: '15px',
                  marginTop: '5px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    {group.students.slice(0, expandedShowMore[key] ? group.students.length : ITEMS_PER_PROGRAM).map(student => {
                      const details = getStudentDetails(student);
                      return (
                        <div
                          key={student.id}
                          style={{
                            padding: '15px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            backgroundColor: '#fafafa',
                            transition: 'box-shadow 0.3s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)'}
                          onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                        >
                          <div style={{ marginBottom: '8px' }}>
                            <strong style={{ color: '#2c3e50' }}>{details.fullName}</strong>
                          </div>
                          <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
                            <div><strong>ID:</strong> {details.studentId}</div>
                            <div><strong>Email:</strong> {details.email}</div>
                            <div><strong>Enrollment:</strong> {details.enrollmentNumber}</div>
                            <div><strong>Contact:</strong> {details.contactNo}</div>
                            <div><strong>Department:</strong> {details.department}</div>
                            <div><strong>Attendance:</strong> {details.attendancePercentage === 'N/A' ? 'N/A' : `${details.attendancePercentage}%`}</div>
                            {details.gender && <div><strong>Gender:</strong> {details.gender}</div>}
                            {details.caste && <div><strong>Caste:</strong> {details.caste}</div>}
                            {details.state && <div><strong>State:</strong> {details.state}</div>}
                            {details.religion && <div><strong>Religion:</strong> {details.religion}</div>}
                            {details.district && <div><strong>District:</strong> {details.district}</div>}
                            {details.address && <div><strong>Address:</strong> {details.address}</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Show More Button */}
                  {group.students.length > ITEMS_PER_PROGRAM && (
                    <div style={{ textAlign: 'center', marginTop: '15px' }}>
                      <button
                        onClick={() => {
                          setExpandedShowMore(prev => ({
                            ...prev,
                            [key]: !prev[key]
                          }));
                        }}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#2196f3',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        {expandedShowMore[key] ? 'Show Less' : `Show More (${group.students.length - ITEMS_PER_PROGRAM} more)`}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
    </div>
  );
};
