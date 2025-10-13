import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import HomePage from './pages/HomePage';
import HabitDetailPage from './pages/HabitDetailPage';
import AddEditHabitPage from './pages/AddEditHabitPage';
import SettingsPage from './pages/SettingsPage';
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <Router>
      <Helmet>
        <title>HabitGrid - Commit to yourself, one square at a time</title>
        <meta name="description" content="Track your habits with a beautiful GitHub-style contribution grid. Build streaks, visualize progress, and commit to yourself daily." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/habit/:id" element={<HabitDetailPage />} />
          <Route path="/add" element={<AddEditHabitPage />} />
          <Route path="/edit/:id" element={<AddEditHabitPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;