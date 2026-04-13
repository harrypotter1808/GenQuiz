import React, { useState, useEffect } from 'react';
import { Analytics } from './Analytics';
import { PdfExportButton } from './PdfExportButton';

const ActiveQuiz = ({ quizData, onQuit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  const [userAnswers, setUserAnswers] = useState([]);
  const [history, setHistory] = useState([]);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('genquiz_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch(e) {}
    }
  }, []);

  const saveHistory = (finalScore, total) => {
    const newRecord = { date: new Date().toISOString(), score: finalScore, total };
    const updatedHistory = [...history, newRecord];
    setHistory(updatedHistory);
    localStorage.setItem('genquiz_history', JSON.stringify(updatedHistory));
  };

  // Guard if data is empty
  if (!quizData || quizData.length === 0) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center' }}>
        <p>No questions available.</p>
        <button className="btn-secondary" onClick={onQuit}>Go Back</button>
      </div>
    );
  }

  const currentQ = quizData[currentIndex];
  const totalQuestions = quizData.length;
  const progressPercent = ((currentIndex + 1) / totalQuestions) * 100;

  const handleOptionClick = (index) => {
    if (showExplanation) return; // prevent multiple clicks
    
    setSelectedOption(index);
    setShowExplanation(true);
    
    // Update temp Answers array
    const newAnswers = [...userAnswers];
    newAnswers[currentIndex] = index;
    setUserAnswers(newAnswers);

    if (index === currentQ.ans) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      // Calculate final exact score again to be safe and save history
      let finalScore = 0;
      quizData.forEach((q, idx) => {
        if (userAnswers[idx] === q.ans) finalScore++;
      });
      saveHistory(finalScore, totalQuestions);
      setIsFinished(true);
    }
  };

  if (isFinished) {
    // Collect all sections present in the quizData
    const sectionsObj = {};
    quizData.forEach(q => {
      if (!sectionsObj[q.section]) sectionsObj[q.section] = true;
    });

    return (
      <div id="pdf-report-container" className="glass-panel animate-fade-in" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        <h2>Quiz Completed! 🎉</h2>
        <div style={{ fontSize: '4rem', fontWeight: 'bold', color: 'var(--accent)', margin: '1rem 0' }}>
          {score} / {totalQuestions}
        </div>
        <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
          You scored {Math.round((score / totalQuestions) * 100)}% on this assessment.
        </p>

        <Analytics 
          score={score} 
          total={totalQuestions} 
          sections={Object.keys(sectionsObj)} 
          userAnswers={userAnswers} 
          flatQuestions={quizData}
          history={history}
        />

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
          <button className="btn-primary" onClick={onQuit}>Return to Dashboard</button>
          <PdfExportButton targetId="pdf-report-container" filename="GenQuiz_Syllabus_Report" />
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Section: <span style={{ color: 'var(--accent)' }}>{currentQ.section}</span>
        </span>
        <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
          Question {currentIndex + 1} of {totalQuestions}
        </span>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '2rem' }}>
        <div style={{ height: '100%', background: 'var(--accent)', borderRadius: '4px', width: `${progressPercent}%`, transition: 'width 0.3s ease' }}></div>
      </div>

      <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', lineHeight: '1.4' }}>
        {currentQ.q}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        {currentQ.opts.map((opt, idx) => {
          
          let btnStyle = {
            width: '100%',
            textAlign: 'left',
            padding: '1rem',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            fontSize: '1rem',
            cursor: showExplanation ? 'default' : 'pointer',
            transition: 'all 0.2s',
          };

          if (showExplanation) {
            if (idx === currentQ.ans) {
              btnStyle.background = 'rgba(76, 175, 80, 0.2)';
              btnStyle.borderColor = 'var(--success)';
            } else if (idx === selectedOption) {
              btnStyle.background = 'rgba(255, 76, 76, 0.2)';
              btnStyle.borderColor = 'var(--error)';
            }
          }

          return (
            <button 
              key={idx} 
              style={btnStyle}
              onClick={() => handleOptionClick(idx)}
              onMouseEnter={(e) => {
                if (!showExplanation) e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              }}
              onMouseLeave={(e) => {
                if (!showExplanation) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {showExplanation && (
        <div className="animate-fade-in" style={{ padding: '1.5rem', background: 'rgba(11, 12, 16, 0.8)', borderLeft: '4px solid var(--accent)', borderRadius: '4px', marginBottom: '2rem' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#fff' }}>Explanation</h4>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{currentQ.exp}</p>
        </div>
      )}

      {showExplanation && (
        <div style={{ textAlign: 'right' }}>
          <button className="btn-primary animate-fade-in" onClick={handleNext}>
            {currentIndex < totalQuestions - 1 ? 'Next Question' : 'View Results'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ActiveQuiz;
