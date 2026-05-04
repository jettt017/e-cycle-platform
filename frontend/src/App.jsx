import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import DropPoints from './pages/DropPoints';
import Estimator from './pages/Estimator';
import Impact from './pages/Impact';
import Footer from './components/Footer';
import './index.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/drop-points" element={<DropPoints />} />
          <Route path="/estimator" element={<Estimator />} />
          <Route path="/impact" element={<Impact />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
