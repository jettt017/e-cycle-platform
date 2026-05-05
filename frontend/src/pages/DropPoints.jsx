import React, { useState, useEffect } from 'react';
import { MapPin, Search, Navigation } from 'lucide-react';

const DEFAULT_DROP_POINTS = [
  {
    id: 1,
    name: 'Eco Recycle Center',
    address: 'Jl. Sudirman No. 123',
    latitude: -6.2,
    longitude: 106.816666,
    operatingHours: '08:00 - 17:00'
  },
  {
    id: 2,
    name: 'Tech Waste Drop',
    address: 'Jl. Thamrin No. 45',
    latitude: -6.19,
    longitude: 106.82,
    operatingHours: '09:00 - 18:00'
  },
  {
    id: 3,
    name: 'E-Waste Bank Jaksel',
    address: 'Jl. Kemang Raya No. 10',
    latitude: -6.26,
    longitude: 106.81,
    operatingHours: '07:00 - 15:00'
  }
];

function DropPoints() {
  const [searchQuery, setSearchQuery] = useState('');
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [userCoords, setUserCoords] = useState(null);
  const [geoError, setGeoError] = useState('');
  const [locatingUser, setLocatingUser] = useState(false);
  const [nearbyOnly, setNearbyOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const envApiBaseUrl = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
    const apiBaseUrl = envApiBaseUrl.replace(/\/$/, '');

    fetch(`${apiBaseUrl}/api/droppoints`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setLocations(data);
          setSelectedLocation(data[0]);
        } else {
          setLocations(DEFAULT_DROP_POINTS);
          setSelectedLocation(DEFAULT_DROP_POINTS[0]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching drop points:", err);
        setLocations(DEFAULT_DROP_POINTS);
        setSelectedLocation(DEFAULT_DROP_POINTS[0]);
        setLoading(false);
      });
  }, []);

  const toRadians = (degree) => (degree * Math.PI) / 180;

  const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
    const earthRadiusKm = 6371;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Browser tidak mendukung geolocation.');
      return;
    }

    setLocatingUser(true);
    setGeoError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setNearbyOnly(true);
        setLocatingUser(false);
      },
      () => {
        setGeoError('Izin lokasi ditolak atau lokasi tidak tersedia.');
        setLocatingUser(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000
      }
    );
  };

  const filteredLocations = locations
  .map((loc) => {
    const hasCoordinates =
      typeof loc.latitude === 'number' && typeof loc.longitude === 'number';

    if (!userCoords || !hasCoordinates) {
      return { ...loc, computedDistanceKm: null };
    }

    const computedDistanceKm = calculateDistanceKm(
      userCoords.latitude,
      userCoords.longitude,
      loc.latitude,
      loc.longitude
    );

    return { ...loc, computedDistanceKm };
  })
  .filter((loc) => {
    const keyword = searchQuery.trim().toLowerCase();
    const matchesKeyword = !keyword || (
      loc.name?.toLowerCase().includes(keyword) ||
      loc.address?.toLowerCase().includes(keyword)
    );

    if (!matchesKeyword) {
      return false;
    }

    if (!nearbyOnly || !userCoords) {
      return true;
    }

    return typeof loc.computedDistanceKm === 'number';
  })
  .sort((a, b) => {
    const aDistance = typeof a.computedDistanceKm === 'number' ? a.computedDistanceKm : Number.MAX_SAFE_INTEGER;
    const bDistance = typeof b.computedDistanceKm === 'number' ? b.computedDistanceKm : Number.MAX_SAFE_INTEGER;
    return aDistance - bDistance;
  });

  useEffect(() => {
    if (!selectedLocation && filteredLocations.length > 0) {
      setSelectedLocation(filteredLocations[0]);
    }

    if (selectedLocation && !filteredLocations.some((loc) => loc.id === selectedLocation.id)) {
      setSelectedLocation(filteredLocations[0] || null);
    }
  }, [filteredLocations, selectedLocation]);

  const selectedMapQuery = selectedLocation
    ? encodeURIComponent(`${selectedLocation.name} ${selectedLocation.address}`)
    : '';

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
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <button
              className="pill-btn"
              style={{ padding: '0.5rem 0.9rem', fontSize: '0.8rem' }}
              onClick={getUserLocation}
              disabled={locatingUser}
              type="button"
            >
              {locatingUser ? 'Mencari lokasi...' : 'Gunakan Lokasi Saya'}
            </button>
            <button
              type="button"
              onClick={() => setNearbyOnly((value) => !value)}
              className="pill-btn"
              style={{
                padding: '0.5rem 0.9rem',
                fontSize: '0.8rem',
                backgroundColor: nearbyOnly ? 'var(--primary)' : 'transparent',
                color: nearbyOnly ? '#fff' : 'inherit'
              }}
              disabled={!userCoords}
            >
              {nearbyOnly ? 'Nearby Aktif' : 'Filter Nearby'}
            </button>
          </div>

          {geoError ? (
            <p style={{ color: '#c0392b', fontSize: '0.8rem', marginBottom: '0.8rem' }}>{geoError}</p>
          ) : null}

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
            ) : filteredLocations.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Tidak ada data drop point.</p>
            ) : filteredLocations.map(loc => (
              <div
                key={loc.id}
                onClick={() => setSelectedLocation(loc)}
                style={{
                  padding: '1rem',
                  border: selectedLocation?.id === loc.id ? '1px solid var(--primary)' : '1px solid #eee',
                  borderRadius: '16px',
                  transition: 'var(--transition)',
                  cursor: 'pointer',
                  backgroundColor: selectedLocation?.id === loc.id ? 'rgba(49, 196, 115, 0.07)' : 'transparent'
                }}
                className="hover-highlight"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h4 style={{ fontWeight: 600 }}>{loc.name}</h4>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>Buka</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{loc.address}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Jam Buka: {loc.operatingHours || '08:00 - 17:00'}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Navigation size={14}/>
                    {typeof loc.computedDistanceKm === 'number'
                      ? `${loc.computedDistanceKm.toFixed(1)} km`
                      : (loc.distance || '-')}
                  </span>
                  <a
                    className="pill-btn"
                    style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', textDecoration: 'none' }}
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${loc.name} ${loc.address}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Directions
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map Area */}
        <div className="card" style={{ padding: '0', overflow: 'hidden', minHeight: '400px', position: 'relative' }}>
          {loading ? (
            <div style={{ height: '100%', minHeight: '400px', display: 'grid', placeItems: 'center', color: 'var(--text-muted)' }}>
              Memuat peta...
            </div>
          ) : selectedLocation ? (
            <iframe
              title={`Map of ${selectedLocation.name}`}
              src={`https://www.google.com/maps?q=${selectedMapQuery}&output=embed`}
              style={{ width: '100%', height: '100%', minHeight: '400px', border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div style={{ height: '100%', minHeight: '400px', display: 'grid', placeItems: 'center', color: 'var(--text-muted)' }}>
              <div style={{ textAlign: 'center' }}>
                <MapPin size={34} color="var(--primary)" style={{ marginBottom: '0.7rem' }} />
                <p>Pilih drop point untuk melihat peta.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DropPoints;
