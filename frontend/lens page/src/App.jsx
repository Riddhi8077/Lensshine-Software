import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import LensSelection from './pages/LensSelection';
import SingleVisionLens from './pages/SingleVisionLens';
import BifocalLens from './pages/BifocalLens';
import ProgressiveLens from './pages/ProgressiveLens';
import './App.css';

function App() {
  useEffect(() => {
    // Add smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth';
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 dark:bg-gradient-to-br dark:from-gray-900 dark:via-black dark:to-gray-900">
        <Routes>
          <Route path="/" element={<LensSelection />} />
          <Route path="/lens/single-vision" element={<SingleVisionLens />} />
          <Route path="/lens/bifocal" element={<BifocalLens />} />
          <Route path="/lens/progressive" element={<ProgressiveLens />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;