import React, { useState } from 'react';

const QuizHub = ({ mode, onStartQuiz, onBack }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [count, setCount] = useState(5);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleGenerate = async () => {
    if (mode === 'syllabus' && !file) {
      setError('Please upload a syllabus file first (.pdf, .jpg, .png).');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      if (mode === 'syllabus') {
        formData.append('file', file);
      }
      
      const sectionsArray = mode === 'aptitude' ? ['english', 'logical', 'quant'] : ['english'];
      formData.append('sections', JSON.stringify(sectionsArray));
      formData.append('count_per_section', count);
      formData.append('difficulty', difficulty);

      const res = await fetch('http://localhost:8000/api/generate-quiz', {
        method: 'POST',
        // Omit Content-Type to let the browser automatically attach multipart/form-data boundary
        body: formData
      });
      
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      
      let allQuestions = [];
      Object.keys(data).forEach(section => {
        allQuestions = allQuestions.concat(data[section]);
      });
      
      setLoading(false);
      onStartQuiz(allQuestions);
    } catch (err) {
      console.error(err);
      setError('Failed to generate quiz. Is the backend running?');
      setLoading(false);
    }
  };

  return (
    <div className="app-container animate-fade-in" style={{ maxWidth: '800px' }}>
      <button className="btn-secondary" style={{ marginBottom: '2rem' }} onClick={onBack}>
        &larr; Back
      </button>
      
      <div className="glass-panel">
        <h2>{mode === 'syllabus' ? 'Generate from Syllabus' : 'Aptitude Test Generation'}</h2>
        
        {mode === 'syllabus' && (
          <div style={{
            border: '2px dashed rgba(102, 252, 241, 0.4)',
            padding: '2rem',
            textAlign: 'center',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            background: 'rgba(255, 255, 255, 0.02)'
          }}>
            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Upload your syllabus in PDF or Image format</p>
            <input 
              type="file" 
              accept=".pdf,image/png,image/jpeg"
              onChange={handleFileChange}
              style={{ background: 'transparent', border: 'none', padding: 0 }}
            />
            {file && <p style={{ color: 'var(--accent)', marginTop: '1rem', fontSize: '0.9rem' }}>Attached: {file.name}</p>}
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Difficulty</label>
            <select 
              value={difficulty} 
              onChange={e => setDifficulty(e.target.value)} 
              style={{ width: '100%', padding: '0.8rem', background: 'rgba(11,12,16,0.5)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Questions per section</label>
            <input 
              type="number" 
              value={count} 
              onChange={e => setCount(parseInt(e.target.value))}
              min="1" max="10"
              style={{ padding: '0.8rem', marginBottom: 0 }}
            />
          </div>
        </div>

        {error && <p style={{ color: 'var(--error)', marginBottom: '1rem' }}>{error}</p>}

        <button className="btn-primary" onClick={handleGenerate} disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Analyzing Syllabus...' : 'Generate Quiz'}
        </button>
      </div>
    </div>
  );
};

export default QuizHub;
