import React, { useState } from 'react';
import './index.css';
import Landing from './components/Landing.jsx';
import QuizHub from './components/QuizHub.jsx';
import ActiveQuiz from './components/ActiveQuiz.jsx';

function App() {
  const [gameState, setGameState] = useState('landing'); // 'landing', 'aptitude', 'syllabus', 'quiz'
  const [quizData, setQuizData] = useState([]);

  const handleStartQuiz = (data) => {
    setQuizData(data);
    setGameState('quiz');
  };

  const handleBackToLanding = () => {
    setGameState('landing');
    setQuizData([]);
  };

  return (
    <div style={{minHeight: '100vh', display: 'flex', flexDirection: 'column'}}>
      {gameState === 'landing' && <Landing onNavigate={setGameState} />}
      
      {(gameState === 'aptitude' || gameState === 'syllabus') && (
        <QuizHub 
          mode={gameState} 
          onStartQuiz={handleStartQuiz} 
          onBack={handleBackToLanding} 
        />
      )}
      
      {gameState === 'quiz' && (
        <ActiveQuiz 
          quizData={quizData} 
          onQuit={handleBackToLanding} 
        />
      )}
    </div>
  );
}

export default App;
