import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './components/Home';
import { GenerationLoading } from './components/GenerationLoading';
import { EnhancedStoryViewer } from './components/EnhancedStoryViewer';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/generate" element={<GenerationLoading />} />
        <Route path="/story" element={<EnhancedStoryViewer />} />
        <Route path="/library" element={<div>Library Coming Soon</div>} />
      </Routes>
    </Router>
  );
}

export default App;
