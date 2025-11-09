import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('Loading...');
  const [buildTime, setBuildTime] = useState('');

  useEffect(() => {
    // Получаем данные с backend API
    fetch('/api/health')
      .then(response => response.json())
      .then(data => {
        setMessage(data.message);
        setBuildTime(data.buildTime);
      })
      .catch(() => {
        setMessage('Frontend is running! (Backend unavailable)');
      });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 DevOps CI/CD Playground</h1>
        <div className="status-card">
          <h2>System Status</h2>
          <p className="message">{message}</p>
          {buildTime && <p className="build-time">Built: {buildTime}</p>}
        </div>
        <div className="tech-stack">
          <h3>Technology Stack:</h3>
          <ul>
            <li>⚛️ React.js Frontend</li>
            <li>🟢 Node.js Backend</li>
            <li>🐳 Docker Containers</li>
            <li>🔄 GitHub Actions CI/CD</li>
            <li>☁️ Google Cloud Platform</li>
            <li>🏗️ Terraform Infrastructure</li>
          </ul>
        </div>
      </header>
    </div>
  );
}

export default App;