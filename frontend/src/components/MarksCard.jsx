import React from 'react';

const MarksCard = ({ mark, type = 'TEACHER' }) => {
  const getGradeColor = (grade) => {
    if (!grade) return '#999';
    const gradeStr = grade.toString().toUpperCase();
    if (gradeStr.includes('A+') || gradeStr.includes('A')) return '#10b981';
    if (gradeStr.includes('B')) return '#f59e0b';
    if (gradeStr.includes('C')) return '#ef4444';
    return '#666';
  };

  const getPercentageColor = (percentage) => {
    if (!percentage) return '#999';
    const pct = parseFloat(percentage);
    if (pct >= 80) return '#10b981';
    if (pct >= 60) return '#f59e0b';
    if (pct >= 40) return '#ef4444';
    return '#666';
  };

  const calculatePercentage = () => {
    if (mark.marks && mark.totalMarks) {
      return ((parseFloat(mark.marks) / parseFloat(mark.totalMarks)) * 100).toFixed(2);
    }
    return mark.percentage ? parseFloat(mark.percentage).toFixed(2) : 'N/A';
  };

  const createdDate = mark.createdAt ? new Date(mark.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : 'N/A';

  const percentage = calculatePercentage();

  return (
    <div
      style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '15px',
        border: '1px solid #ddd',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        borderLeft: `4px solid ${getGradeColor(mark.grade)}`
      }}
    >
      {/* Header Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
        <div>
          <h4 style={{ margin: '0 0 5px 0', color: '#333', fontSize: '16px' }}>
            📚 {mark.courseName || 'Subject'}
          </h4>
          <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
            Exam Type: <strong>{mark.examTypeDescription || mark.examType || 'N/A'}</strong>
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: getGradeColor(mark.grade) }}>
            {mark.grade || 'N/A'}
          </div>
          <div style={{ fontSize: '12px', color: '#999' }}>Grade</div>
        </div>
      </div>

      {/* Marks Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '15px' }}>
        <div style={{ background: '#f0f4ff', padding: '12px', borderRadius: '6px' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Total Marks</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
            {mark.totalMarks || 100}
          </div>
        </div>

        <div style={{ background: '#f0f4ff', padding: '12px', borderRadius: '6px' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Obtained Marks</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#3b82f6' }}>
            {mark.marks || 0}
          </div>
        </div>

        <div style={{ background: '#f0f4ff', padding: '12px', borderRadius: '6px' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Percentage</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: getPercentageColor(percentage) }}>
            {percentage}%
          </div>
        </div>

        {type === 'ADMIN' && (
          <div style={{ background: '#f0f4ff', padding: '12px', borderRadius: '6px' }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Status</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
              {mark.passingStatus || 'PASS'}
            </div>
          </div>
        )}

        <div style={{ background: '#f0f4ff', padding: '12px', borderRadius: '6px' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Entered On</div>
          <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#333' }}>
            {createdDate}
          </div>
        </div>
      </div>

      {/* Comments */}
      {mark.comments && (
        <div style={{ background: '#fffbea', padding: '12px', borderRadius: '6px', borderLeft: '3px solid #f59e0b' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '5px' }}>💬 Comments</div>
          <div style={{ fontSize: '13px', color: '#333', lineHeight: '1.4' }}>
            {mark.comments}
          </div>
        </div>
      )}
    </div>
  );
};

export default MarksCard;
