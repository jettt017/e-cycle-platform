import React from 'react';
import { Link } from 'react-router-dom';
import { Recycle, Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-react';

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-brand">
          <Link to="/" className="nav-logo" style={{ color: 'white', marginBottom: '1rem', display: 'inline-flex' }}>
            <Recycle size={28} color="var(--primary)" />
            <span>E-Cycle</span>
          </Link>
          <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '300px' }}>
            Transforming e-waste into a sustainable future. Find drop points, estimate value, and make an impact today.
          </p>
          <div className="social-links">
            <a href="#" className="social-icon"><Facebook size={18} /></a>
            <a href="#" className="social-icon"><Twitter size={18} /></a>
            <a href="#" className="social-icon"><Instagram size={18} /></a>
            <a href="#" className="social-icon"><Linkedin size={18} /></a>
          </div>
        </div>

        <div className="footer-links-col">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/drop-points">Drop Points</Link></li>
            <li><Link to="/estimator">Valuation Estimator</Link></li>
            <li><Link to="/impact">Our Impact</Link></li>
          </ul>
        </div>

        <div className="footer-links-col">
          <h4>Legal</h4>
          <ul>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#">Cookie Policy</a></li>
            <li><a href="#">FAQ</a></li>
          </ul>
        </div>

        <div className="footer-contact">
          <h4>Contact Us</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#aaa', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <MapPin size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
              <span>Jl. Rungkut Madya, Gn. Anyar, Kec. Gn. Anyar, Surabaya, Jawa Timur 60294<br/>Surabaya timur</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Phone size={18} color="var(--primary)" />
              <span>+62 811-2233-4455</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={18} color="var(--primary)" />
              <span>hello@ecycle.id</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom container">
        <p>&copy; {new Date().getFullYear()} E-Cycle Indonesia. All rights reserved.</p>
        <p>Built with ❤️ for a greener planet.</p>
      </div>
    </footer>
  );
}

export default Footer;
