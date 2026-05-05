import React, { useState } from 'react';
import { Calculator, CheckCircle2 } from 'lucide-react';
import smartphoneImage from '../assets/smartphone.svg';
import laptopImage from '../assets/laptop.svg';
import tvImage from '../assets/tv-monitor.svg';

function Estimator() {
  const [device, setDevice] = useState('');
  const [brand, setBrand] = useState('');
  const [condition, setCondition] = useState('');
  const [estimatedValue, setEstimatedValue] = useState(null);

  const deviceOptions = [
    {
      label: 'Smartphone',
      image: smartphoneImage,
      alt: 'Smartphone illustration',
    },
    {
      label: 'Laptop',
      image: laptopImage,
      alt: 'Laptop illustration',
    },
    {
      label: 'Other (TV/Monitor)',
      image: tvImage,
      alt: 'TV monitor illustration',
    },
  ];

  const handleEstimate = (e) => {
    e.preventDefault();
    if (!device || !brand || !condition) {
      alert("Please fill all fields!");
      return;
    }
    // Dummy logic for estimation
    const baseValue = device === 'Smartphone' ? 50 : device === 'Laptop' ? 150 : 30;
    const conditionMultiplier = condition === 'Working Perfectly' ? 1 : condition === 'Minor Damage' ? 0.6 : 0.2;
    const finalValue = Math.floor(baseValue * conditionMultiplier * 15000); // converting to roughly IDR
    
    setEstimatedValue(finalValue);
  };

  return (
    <div className="container" style={{ padding: '2rem 2rem 6rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <span className="tag-badge">AI Driven</span>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>E-Waste Estimator</h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          Find out how much your old electronics are worth. We provide transparent pricing based on real-time market data to ensure you get a fair deal.
        </p>
      </div>

      <div className="cards-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
        {/* Form Area */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calculator size={20} color="var(--primary)" /> Device Details
          </h3>
          <form onSubmit={handleEstimate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Device Type */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>1. What type of device is it?</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {deviceOptions.map((option) => (
                  <div 
                    key={option.label} 
                    onClick={() => setDevice(option.label)}
                    style={{ 
                      padding: '0.85rem 0.5rem 1rem', textAlign: 'center', border: `2px solid ${device === option.label ? 'var(--primary)' : '#eee'}`, 
                      borderRadius: '12px', cursor: 'pointer', transition: 'var(--transition)',
                      backgroundColor: device === option.label ? 'rgba(46, 211, 113, 0.05)' : 'transparent'
                    }}
                  >
                    <img
                      src={option.image}
                      alt={option.alt}
                      style={{
                        width: '56px',
                        height: '56px',
                        objectFit: 'cover',
                        borderRadius: '16px',
                        display: 'block',
                        margin: '0 auto 0.65rem',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.08)'
                      }}
                    />
                    <span style={{fontSize:'0.8rem', fontWeight: 600}}>{option.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Brand */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>2. What brand is it?</label>
              <select 
                value={brand} onChange={(e) => setBrand(e.target.value)}
                style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #ddd', fontFamily: 'inherit', fontSize: '0.95rem' }}
              >
                <option value="">Select Brand</option>
                <option value="Apple">Apple</option>
                <option value="Samsung">Samsung</option>
                <option value="Asus/Lenovo/HP">Asus / Lenovo / HP</option>
                <option value="Other">Other Brands</option>
              </select>
            </div>

            {/* Condition */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>3. What is its condition?</label>
              <select 
                value={condition} onChange={(e) => setCondition(e.target.value)}
                style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #ddd', fontFamily: 'inherit', fontSize: '0.95rem' }}
              >
                <option value="">Select Condition</option>
                <option value="Working Perfectly">Working Perfectly (Normal)</option>
                <option value="Minor Damage">Minor Damage (Scratches/Dents)</option>
                <option value="Broken/Dead">Broken / Dead (Cannot turn on)</option>
              </select>
            </div>

            <button type="submit" className="pill-btn" style={{ marginTop: '1rem', width: '100%' }}>Calculate Value</button>
          </form>
        </div>

        {/* Result Area */}
        <div className="card highlight" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          {estimatedValue !== null ? (
            <div style={{ animation: 'fadeIn 0.5s ease' }}>
              <CheckCircle2 size={48} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Estimated Value</h3>
              <h2 style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.5rem', letterSpacing: '-1px' }}>
                Rp {estimatedValue.toLocaleString('id-ID')}
              </h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                *This is an estimated value. Final price will be determined after physical inspection at our drop point.
              </p>
              <button className="pill-btn" style={{ width: '100%' }}>Schedule Drop-off Now</button>
            </div>
          ) : (
            <div>
              <Calculator size={48} color="#ccc" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ color: 'var(--text-muted)' }}>Your estimate will appear here</h3>
              <p style={{ color: '#999', fontSize: '0.9rem', marginTop: '0.5rem', maxWidth: '250px' }}>
                Fill out the details on the left to see how much your old device is worth.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Estimator;
