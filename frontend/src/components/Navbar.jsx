import React from 'react';
import { Link } from 'react-router-dom';
import { Recycle, Phone } from 'lucide-react';

function Navbar() {
  return (
    <nav className="navbar container">
      <Link to="/" className="nav-logo">
        <Recycle size={28} color="var(--primary)" />
        <span>E-Cycle</span>
      </Link>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/drop-points">Drop Points</Link>
        <Link to="/estimator">Estimator</Link>
        <Link to="/impact">Our Impact</Link>
      </div>
      <div className="nav-actions">
        <button className="icon-btn">
          <Phone size={18} />
        </button>
        <Link to="/drop-points" className="pill-btn outline">Recycle Now</Link>
      </div>
    </nav>
  );
}

export default Navbar;
