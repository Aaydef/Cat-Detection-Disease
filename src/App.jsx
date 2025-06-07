import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
// Pages
import Home from './pages/Home';
import DiseaseInfo from './pages/diseaseinfo';
import History from './pages/History';
import Register from './pages/Register';
import Login from './pages/Login';
import PublicHome from './pages/PublicHome';

// AuthContext
import { useAuth } from './context/AuthContext'; 

// Page Styles
import './App.css';
import './Login.css';
import './Register.css';

function App() {
  const { token } = useAuth();

  return (
    <Routes>
      {/* Public home di root */}
      <Route path="/" element={<PublicHome />} />

      {/* Disease Info bisa diakses publik */}
      <Route path="/diseaseinfo" element={<DiseaseInfo />} />

      {/* Login/Register */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Route private */}
      <Route
        path="/home"
        element={token ? <Home /> : <Navigate to="/login" replace />}
      />
      {token && (
        <>
          <Route path="/history" element={<History />} />
        </>
      )}
    </Routes>
  );
}


export default App;
