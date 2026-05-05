import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Recycle, Phone } from "lucide-react";

function Navbar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="nav-logo">
          <Recycle size={28} color="var(--primary)" />
          <span>E-Cycle</span>
        </Link>
        <div className="nav-links">
          <Link to="/" className={isActive("/") ? "nav-link active" : "nav-link"}>Home</Link>
          <Link to="/drop-points" className={isActive("/drop-points") ? "nav-link active" : "nav-link"}>Drop Points</Link>
          <Link to="/estimator" className={isActive("/estimator") ? "nav-link active" : "nav-link"}>Estimator</Link>
          <Link to="/pickup" className={isActive("/pickup") ? "nav-link active" : "nav-link"}>Pickup</Link>
          <Link to="/impact" className={isActive("/impact") ? "nav-link active" : "nav-link"}>Our Impact</Link>
        </div>
        <div className="nav-actions">
          <a href="https://api.whatsapp.com/qr/XY5PSWPK2EZLD1?autoload=1&app_absent=0" target="_blank" rel="noopener noreferrer" className="icon-btn">
            <Phone size={18} />
          </a>
          <Link to="/pickup" className="pill-btn outline">
            Schedule Pickup
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
