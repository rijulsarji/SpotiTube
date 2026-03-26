import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ResultPage from './pages/ResultPage';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import { config } from './utils/config';

function TrackVisits() {

  useEffect(() => {
    // Track visit on mount
    fetch(`${config.API_BASE_URL}/spotitube/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'page_visit' })
    }).catch(console.error);
  }, []); // Run once on initial load

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <TrackVisits />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/analytics" element={<AnalyticsDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
