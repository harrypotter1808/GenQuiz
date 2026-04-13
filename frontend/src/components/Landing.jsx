import React from 'react';

const Landing = ({ onNavigate }) => {
  return (
    <div className="app-container animate-fade-in" style={{ textAlign: 'center', marginTop: '10vh' }}>
      <h1>Welcome to <span style={{ color: 'var(--accent)' }}>GenQuiz</span></h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '3rem', color: 'var(--text-secondary)' }}>
        AI-powered placement preparation and syllabus-based testing.
      </p>
      
      <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <div className="glass-panel" style={{ flex: '1 1 300px', maxWidth: '400px' }}>
          <h3>📚 Syllabus Quiz</h3>
          <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Paste any syllabus and let our AI engine generate a targeted assessment for you instantly.
          </p>
          <button className="btn-primary" onClick={() => onNavigate('syllabus')}>
            Start Syllabus Quiz
          </button>
        </div>

        <div className="glass-panel" style={{ flex: '1 1 300px', maxWidth: '400px' }}>
          <h3>🧠 Aptitude Hub</h3>
          <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Test your skills across English, Logical Reasoning, and Quantitative aptitude. 
          </p>
          <button className="btn-secondary" onClick={() => onNavigate('aptitude')}>
            Enter Aptitude Hub
          </button>
        </div>
      </div>
    </div>
  );
};

export default Landing;
