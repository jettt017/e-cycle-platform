import React, { useState, useEffect } from 'react';
import { MapPin, Search, Navigation, LocateFixed } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icon path issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// User location custom icon
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Helper component to center map dynamically
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 13);
  }, [center, map]);
  return null;
}

function DropPoints() {
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [mapCenter, setMapCenter] = useState([-6.2201, 106.8126]); // Default Jakarta
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Default fallback if backend fails or doesn't have coordinates
  const dummyLocations = [
    { id: 1, name: "E-Cycle Hub Jakarta", address: "Jl. Sudirman No. 45, Jakarta Pusat", defaultDistance: "2.5 km", status: "Open Now", lat: -6.2201, lng: 106.8126 },
    { id: 2, name: "EcoDrop Bandung", address: "Jl. Dago No. 112, Bandung", defaultDistance: "145 km", status: "Closed", lat: -6.8893, lng: 107.6105 },
    { id: 3, name: "TechRecycle Surabaya", address: "Jl. Pemuda No. 10, Surabaya", defaultDistance: "760 km", status: "Open Now", lat: -7.2656, lng: 112.7470 },
  ];

  useEffect(() => {
    fetch('http://localhost:5000/api/droppoints')
      .then(res => res.json())
      .then(data => {
        // Fallback to dummy locations if data is empty or missing lat/lng
        if (data && data.length > 0 && data[0].lat) {
          setLocations(data);
        } else {
          setLocations(dummyLocations); // Gunakan dummy jika db kosong/error
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching drop points:", err);
        setLocations(dummyLocations); // Fallback
        setLoading(false);
      });
  }, []);

  const handleDirections = (address) => {
    if (userLocation) {
      window.open(`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${encodeURIComponent(address)}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`, '_blank');
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
    const R = 6371; // radius of Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Dinamis menghitung jarak berdasarkan GPS user
  const locationsWithDistance = locations.map(loc => {
    if (userLocation && loc.lat && loc.lng) {
      const dist = calculateDistance(userLocation.lat, userLocation.lng, loc.lat, loc.lng);
      return { ...loc, distance: `${dist.toFixed(1)} km`, rawDist: dist };
    }
    return { ...loc, distance: loc.defaultDistance || 'N/A', rawDist: Infinity };
  }).sort((a, b) => a.rawDist - b.rawDist);

  const requestUserLocation = () => {
    if ("geolocation" in navigator) {
      setTracking(true);
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setMapCenter([latitude, longitude]);
        setTracking(false);
      }, (error) => {
        setTracking(false);
        alert("Gagal melacak lokasi. Pastikan izin GPS/Lokasi di browser sudah diaktifkan.");
      });
    } else {
      alert("Browser kamu tidak mendukung pelacakan lokasi.");
    }
  };

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
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
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
          
          <button 
            onClick={requestUserLocation}
            disabled={tracking}
            style={{ 
              width: '100%', padding: '0.8rem', marginBottom: '1.5rem',
              backgroundColor: userLocation ? 'var(--bg-color-alt)' : 'var(--primary)', 
              color: userLocation ? 'var(--primary)' : 'white', 
              border: userLocation ? '2px solid var(--primary)' : 'none',
              borderRadius: '12px', fontWeight: 600, cursor: tracking ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              transition: 'var(--transition)'
            }}
          >
            <LocateFixed size={18} /> {tracking ? 'Melacak...' : userLocation ? 'Lokasi GPS Aktif (Diperbarui)' : 'Gunakan Lokasi Saat Ini (GPS)'}
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {loading ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading drop points...</p>
            ) : locationsWithDistance.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Tidak ada data drop point.</p>
            ) : locationsWithDistance.map(loc => (
              <div 
                key={loc.id} 
                onClick={() => {
                  if(loc.lat && loc.lng) setMapCenter([loc.lat, loc.lng]);
                }}
                style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '16px', transition: 'var(--transition)', cursor: 'pointer' }} 
                className="hover-highlight"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h4 style={{ fontWeight: 600 }}>{loc.name}</h4>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>Buka</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{loc.address}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Jam Buka: {loc.operatingHours || '08:00 - 17:00'}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.2rem', color: userLocation ? 'var(--primary)' : 'inherit', fontWeight: userLocation ? 700 : 500 }}>
                    <Navigation size={14}/> {loc.distance}
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDirections(loc.address);
                    }} 
                    className="pill-btn" 
                    style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                  >
                    Directions
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map Area */}
        <div className="card" style={{ padding: '0', overflow: 'hidden', minHeight: '400px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e5e3df', borderRadius: '16px' }}>
          <MapContainer center={mapCenter} zoom={13} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Markers for Drop Points */}
            {locationsWithDistance.map(loc => {
              if(!loc.lat || !loc.lng) return null;
              return (
                <Marker key={loc.id} position={[loc.lat, loc.lng]}>
                  <Popup>
                    <strong>{loc.name}</strong><br/>
                    {loc.address}<br/>
                    <button onClick={() => handleDirections(loc.address)} className="pill-btn" style={{ padding: '0.2rem 0.5rem', marginTop: '0.5rem', fontSize: '0.7rem' }}>Get Directions</button>
                  </Popup>
                </Marker>
              );
            })}

            {/* Marker for User Location */}
            {userLocation && (
              <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                <Popup>
                  <strong>Lokasi Kamu</strong><br/>
                  Akurasi GPS
                </Popup>
              </Marker>
            )}

            <MapUpdater center={mapCenter} />
          </MapContainer>
        </div>
      </div>
    </div>
  );
}

export default DropPoints;
