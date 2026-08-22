import React, { useState } from 'react';
import api from '../services/api';

export const BulkStudentUpload = () => {
  const [uploadType, setUploadType] = useState('excel'); // 'csv' or 'excel'
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showTemplate, setShowTemplate] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    const validExtension = uploadType === 'excel' 
      ? file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
      : file.name.endsWith('.csv');

    if (!validExtension) {
      setError(`Invalid file type. Please select a ${uploadType === 'excel' ? '.xlsx or .xls' : '.csv'} file`);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const endpoint = uploadType === 'excel' 
        ? '/students/bulk-upload/excel'
        : '/students/bulk-upload/csv';
      
      const response = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setResult(response.data);
      setFile(null);
      document.querySelector('input[type="file"]').value = '';
      setError('');
    } catch (err) {
      setError('Upload failed: ' + (err.response?.data?.error || err.message));
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csv = 'FullName,Email,StudentID,ContactNo,Course,Semester,Password\nAhmed Ali,ahmed.ali@university.edu.pk,STU2024001,03001234567,BS Computer Science,1,Ahmed@123\nFatima Khan,fatima.khan@university.edu.pk,STU2024002,03002345678,BS Computer Science,1,Fatima@123\nHassan Khan,hassan.khan@university.edu.pk,STU2024003,03003456789,BS Business Administration,2,Hassan@123';
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', 'student_template.csv');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="bulk-upload-container" style={{padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '20px'}}>
      <h3>📊 Bulk Student Upload</h3>
      
      <div style={{marginBottom: '15px'}}>
        <label style={{marginRight: '15px', fontWeight: 'bold'}}>Select File Type:</label>
        <select 
          value={uploadType}  
          onChange={(e) => {
            setUploadType(e.target.value);
            setFile(null);
            setResult(null);
            setError('');
          }}
          style={{padding: '8px', border: '1px solid #ddd', borderRadius: '4px', minWidth: '150px'}}
        >
          <option value="excel">Excel (.xlsx)</option>
          <option value="csv">CSV (.csv)</option>
        </select>
      </div>

      <div style={{marginBottom: '15px'}}>
        <input
          type="file"
          accept={uploadType === 'excel' ? '.xlsx,.xls' : '.csv'}
          onChange={handleFileChange}
          style={{
            padding: '10px',
            border: '2px dashed #007bff',
            borderRadius: '4px',
            backgroundColor: '#f0f8ff',
            cursor: 'pointer',
            display: 'block',
            marginBottom: '10px'
          }}
        />
        <small style={{color: '#666'}}>
          Selected: {file ? file.name : 'No file selected'}
        </small>
      </div>

      <div style={{marginBottom: '15px'}}>
        <button
          onClick={handleUpload}
          disabled={loading || !file}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            marginRight: '10px'
          }}
        >
          {loading ? '⏳ Uploading...' : '✅ Upload Students'}
        </button>

        <button
          onClick={() => setShowTemplate(!showTemplate)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            marginRight: '10px'
          }}
        >
          {showTemplate ? '✕ Hide Template' : '📋 View Template'}
        </button>

        <button
          onClick={downloadTemplate}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          ⬇️ Download Template
        </button>
      </div>

      {showTemplate && (
        <div style={{
          backgroundColor: '#fff',
          padding: '15px',
          borderRadius: '4px',
          marginBottom: '15px',
          border: '1px solid #ddd'
        }}>
          <h5 style={{marginTop: 0}}>File Format:</h5>
          <p style={{fontSize: '12px', color: '#666', marginBottom: '10px'}}>
            Your {uploadType} file should have the following columns (in any order):
          </p>
          <table style={{width: '100%', fontSize: '12px', marginBottom: '15px', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{backgroundColor: '#f0f0f0', borderBottom: '1px solid #ddd'}}>
                <th style={{padding: '8px', textAlign: 'left'}}>Column Name</th>
                <th style={{padding: '8px', textAlign: 'left'}}>Required</th>
                <th style={{padding: '8px', textAlign: 'left'}}>Example</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{borderBottom: '1px solid #eee'}}>
                <td style={{padding: '8px'}}><strong>FullName</strong></td>
                <td style={{padding: '8px'}}>✓ Yes</td>
                <td style={{padding: '8px'}}>Ahmed Ali</td>
              </tr>
              <tr style={{borderBottom: '1px solid #eee'}}>
                <td style={{padding: '8px'}}><strong>Email</strong></td>
                <td style={{padding: '8px'}}>✓ Yes</td>
                <td style={{padding: '8px'}}>ahmed.ali@university.edu.pk</td>
              </tr>
              <tr style={{borderBottom: '1px solid #eee'}}>
                <td style={{padding: '8px'}}><strong>StudentID</strong></td>
                <td style={{padding: '8px'}}>✓ Yes</td>
                <td style={{padding: '8px'}}>STU2024001</td>
              </tr>
              <tr style={{borderBottom: '1px solid #eee'}}>
                <td style={{padding: '8px'}}><strong>ContactNo</strong></td>
                <td style={{padding: '8px'}}>✓ Yes</td>
                <td style={{padding: '8px'}}>03001234567</td>
              </tr>
              <tr style={{borderBottom: '1px solid #eee'}}>
                <td style={{padding: '8px'}}><strong>Course</strong></td>
                <td style={{padding: '8px'}}>✓ Yes</td>
                <td style={{padding: '8px'}}>BS Computer Science</td>
              </tr>
              <tr style={{borderBottom: '1px solid #eee'}}>
                <td style={{padding: '8px'}}><strong>Semester</strong></td>
                <td style={{padding: '8px'}}>✓ Yes</td>
                <td style={{padding: '8px'}}>1</td>
              </tr>
              <tr style={{borderBottom: '1px solid #eee'}}>
                <td style={{padding: '8px'}}><strong>Password</strong></td>
                <td style={{padding: '8px'}}>✓ Yes</td>
                <td style={{padding: '8px'}}>Ahmed@123</td>
              </tr>
            </tbody>
          </table>
          
          <h6 style={{margin: '10px 0 5px 0', color: '#333'}}>CSV Format Example:</h6>
          <code style={{
            backgroundColor: '#f5f5f5',
            padding: '10px',
            borderRadius: '3px',
            display: 'block',
            fontSize: '11px',
            overflowX: 'auto',
            marginBottom: '10px'
          }}>
            FullName,Email,StudentID,ContactNo,Course,Semester,Password<br/>
            Ahmed Ali,ahmed.ali@university.edu.pk,STU2024001,03001234567,BS Computer Science,1,Ahmed@123<br/>
            Fatima Khan,fatima.khan@university.edu.pk,STU2024002,03002345678,BS Computer Science,1,Fatima@123<br/>
            Hassan Khan,hassan.khan@university.edu.pk,STU2024003,03003456789,BS Business Administration,2,Hassan@123
          </code>
          
          <p style={{fontSize: '11px', color: '#666', marginTop: '10px', marginBottom: '5px'}}>
            <strong>Column Flexibility:</strong>
          </p>
          <ul style={{fontSize: '11px', color: '#666', marginTop: '5px', paddingLeft: '20px'}}>
            <li><strong>Column Order:</strong> Columns can be in any order - the system recognizes them by name</li>
            <li><strong>Extra Columns:</strong> Additional columns (beyond required fields) will be automatically added to student profile as custom fields</li>
            <li><strong>Required Fields:</strong> FullName, Email, StudentID, ContactNo, Course, Semester, Password must be present</li>
            <li><strong>Case Sensitivity:</strong> Column headers are case-insensitive (FullName, fullname, FULLNAME all work)</li>
            <li><strong>Email & StudentID:</strong> Must be unique across all students - duplicates will be rejected</li>
            <li><strong>Semester:</strong> Must be numeric (1, 2, 3, etc.)</li>
            <li><strong>Password:</strong> Each student gets their own password from the file</li>
            <li><strong>First Row:</strong> Must contain column headers</li>
          </ul>
        </div>
      )}

      {error && (
        <div style={{
          backgroundColor: '#fee',
          color: '#c33',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '15px',
          borderLeft: '4px solid #c33'
        }}>
          <strong>⚠️ Error:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{
          backgroundColor: '#f0f8ff',
          padding: '15px',
          borderRadius: '4px',
          marginBottom: '15px',
          border: '1px solid #0066cc'
        }}>
          <h5 style={{marginTop: 0, color: '#0066cc'}}>✅ Upload Complete</h5>
          <p><strong>Successful:</strong> {result.successCount} students</p>
          <p><strong>Failed:</strong> {result.failureCount} students</p>
          <p><strong>Total:</strong> {result.totalCount} records</p>
          
          {result.errors && result.errors.length > 0 && (
            <div style={{marginTop: '10px'}}>
              <h6 style={{color: '#c33', marginBottom: '8px'}}>Errors:</h6>
              <ul style={{
                maxHeight: '200px',
                overflowY: 'auto',
                backgroundColor: '#fff',
                padding: '10px',
                borderRadius: '3px',
                fontSize: '12px',
                margin: 0
              }}>
                {result.errors.map((error, index) => (
                  <li key={index} style={{color: '#c33', marginBottom: '5px'}}>
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BulkStudentUpload;
