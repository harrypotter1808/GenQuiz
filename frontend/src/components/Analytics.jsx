import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function Analytics({ score, total, sections, userAnswers, flatQuestions, history }) {
  // Calculate section scores
  const sectionScores = {
    english: { correct: 0, total: 0 },
    logical: { correct: 0, total: 0 },
    quant: { correct: 0, total: 0 }
  };

  flatQuestions.forEach((q, idx) => {
    sectionScores[q.section].total++;
    if (userAnswers[idx] === q.ans) {
      sectionScores[q.section].correct++;
    }
  });

  const radarData = [
    { subject: 'English', A: (sectionScores.english.correct / sectionScores.english.total) * 100 || 0, fullMark: 100 },
    { subject: 'Logical', A: (sectionScores.logical.correct / sectionScores.logical.total) * 100 || 0, fullMark: 100 },
    { subject: 'Quant', A: (sectionScores.quant.correct / sectionScores.quant.total) * 100 || 0, fullMark: 100 },
  ];

  // Format history for Line Chart
  const historyData = history.map((entry, i) => ({
    name: `Quiz ${i + 1}`,
    score: Math.round((entry.score / entry.total) * 100)
  }));

  return (
    <div className="analytics-dashboard">
      <h3 style={{marginBottom: '1rem'}}>Performance Analytics</h3>
      
      <div className="charts-container" style={{display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center'}}>
        
        {/* Radar Chart for Current Quiz */}
        <div className="chart-box" style={{width: '300px', height: '300px'}}>
          <h4 style={{textAlign: 'center', color: 'var(--text-muted)'}}>Current Strengths</h4>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-main)', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Score %" dataKey="A" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.5} />
              <Tooltip contentStyle={{backgroundColor: 'var(--surface)', border: 'none', borderRadius: '8px'}} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart for History */}
        {historyData.length > 1 && (
          <div className="chart-box" style={{width: '100%', maxWidth: '400px', height: '300px'}}>
            <h4 style={{textAlign: 'center', color: 'var(--text-muted)'}}>Score Timeline (%)</h4>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData} margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{backgroundColor: 'var(--surface)', border: 'none', borderRadius: '8px'}} />
                <Line type="monotone" dataKey="score" stroke="var(--secondary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--secondary)' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
