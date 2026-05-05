import React, { useState, useEffect } from 'react';
import { MapPin, Search, Navigation } from 'lucide-react';

function DropPoints() {
  const [searchQuery, setSearchQuery] = useState('');
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/droppoints')
      .then(res => res.json())
      .then(data => {
        setLocations(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching drop points:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container" style={{ padding: '2rem 2rem 6rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <span className="tag-badge">Location</span>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Find a Drop Point</h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          Locate the nearest official e-waste drop points. We have partnered with hundreds of locations across the country to make recycling easy for you.
        </p>
      </div>

      <div className="cards-grid" style={{ gridTemplateColumns: '1fr 2fr' }}>
        {/* Sidebar / List */}
        <div className="card" style={{ padding: '1.5rem', maxHeight: '600px', overflowY: 'auto' }}>
          <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search by city or zip code..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', 
                borderRadius: 'var(--border-radius)', border: '1px solid #ddd',
                fontFamily: 'inherit', fontSize: '0.9rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {loading ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading drop points...</p>
            ) : locations.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Tidak ada data drop point.</p>
            ) : locations.map(loc => (
              <div key={loc.id} style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '16px', transition: 'var(--transition)', cursor: 'pointer' }} className="hover-highlight">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h4 style={{ fontWeight: 600 }}>{loc.name}</h4>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>Buka</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{loc.address}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Jam Buka: {loc.operatingHours || '08:00 - 17:00'}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Navigation size={14}/> {loc.distance}</span>
                  <button className="pill-btn" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>Directions</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map Area */}
        <div className="card" style={{ padding: '0', overflow: 'hidden', minHeight: '400px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e5e3df' }}>
          {/* Placeholder Map Background */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.5, backgroundImage: 'radial-gradient(#ccc 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          
          <div style={{ textAlign: 'center', zIndex: 1, backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--border-radius)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
            <MapPin size={40} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
            <h3>Interactive Map</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Google Maps / Mapbox integration<br/>will be displayed here.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DropPoints;
