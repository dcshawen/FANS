import { useState, useEffect } from 'react';
import DirectionsModal from './DirectionsModal';
import LearnMoreModal from './LearnMoreModal';

export default function ListCard({ organization }) {
  const { name, street_address, city, postal_code, schedules, contacts, tags } = organization;
  const [showHoursModal, setShowHoursModal] = useState(false);
  const [showDirectionsModal, setShowDirectionsModal] = useState(false);
  const [showLearnMoreModal, setShowLearnMoreModal] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [loadingDirections, setLoadingDirections] = useState(false);
  const [currentRoute, setCurrentRoute] = useState(null);

  // Get user location using geolocation API
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([longitude, latitude]);
        },
        (error) => console.error('Geolocation error:', error)
      );
    }
  }, []);

  // Get contact info from contacts
  const contact = contacts && contacts.length > 0 ? contacts[0] : null;
  const phoneNumber = contact?.phone_number;
  const websiteUrl = contact?.websit_url; // Note: API has typo "websit_url"
  const displayTags = Array.isArray(tags)
    ? tags
        .map((tag) => (typeof tag === 'string' ? tag : tag?.tag))
        .filter(Boolean)
    : [];

  // Format address
  const formatAddress = () => {
    const parts = [street_address, city, postal_code].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Address not available';
  };

  // Format website URL for display (show only domain)
  const formatWebsiteDisplay = (url) => {
    if (!url) return '';
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace(/^www\./, '');
    } catch {
      return url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    }
  };

  // Format time from 24h to 12h format
  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Order days of week
  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const sortedSchedules = schedules
    ? [...schedules].sort((a, b) => dayOrder.indexOf(a.day_of_week) - dayOrder.indexOf(b.day_of_week))
    : [];

  // Group schedules by day
  const groupedSchedules = sortedSchedules.reduce((acc, schedule) => {
    const day = schedule.day_of_week;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push({
      open: schedule.open_time,
      close: schedule.close_time
    });
    return acc;
  }, {});

  // Get directions using Modal
  const handleOpenDirections = async () => {
    if (!userLocation) {
      alert('Could not determine your location. Please enable location services and try again.');
      return;
    }

    setLoadingDirections(true);
    try {
      const apiKey = import.meta.env.VITE_GRAPH_API_KEY;
      const url = `https://graphhopper.com/api/1/route?` +
        `point=${userLocation[1]},${userLocation[0]}&` +
        `point=${organization.latitude},${organization.longitude}&` +
        `key=${apiKey}&` +
        `locale=en&` +
        `points_encoded=false&` +
        `instructions=true`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Route request failed');

      const data = await response.json();
      if (data.paths && data.paths.length > 0) {
        const route = data.paths[0];
        setCurrentRoute(route);
        setShowDirectionsModal(true);
      } else {
        alert('No route found');
      }
    } catch (error) {
        console.error('Error fetching directions:', error);
        alert('Could not find directions. Please try again.');
    } finally {
      setLoadingDirections(false);
    }
  };

  const handleCloseModal = () => {
    setShowDirectionsModal(false);
    setCurrentRoute(null);
  };

  return (
    <div className="card shadow rounded-3 overflow-hidden" style={{ border: '2px solid #6A7F5F' }}>
      {/* Green Header with Organization Name */}
      <div className="card-header py-2 text-center" style={{ backgroundColor: '#6A7F5F' }}>
        <h6 className="card-title fw-bold text-white mb-0">
          {name}
        </h6>
      </div>

      <div className="card-body p-4 bg-white">
        <div className="row justify-content-center">
          {/* Left Column - Tags, Address & Contact */}
          <div className="col-12 col-md-5 d-flex flex-column align-items-center align-items-md-start">
            {/* Tags */}
            {displayTags.length > 0 && (
              <div className="mb-3">
                {displayTags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="badge me-2 mb-1"
                    style={{ backgroundColor: '#6A7F5F' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            {/* Address */}
            <div className="mb-2">
              <div className="d-flex align-items-start">
                <i className="bi bi-geo-alt-fill me-2 small" style={{ color: '#6A7F5F' }}></i>
                <p className="mb-0 text-secondary small">
                  {formatAddress()}
                </p>
              </div>
            </div>

            {/* Contact Info */}
            {phoneNumber && (
              <div className="d-flex align-items-center mb-1">
                <i className="bi bi-telephone me-2 small" style={{ color: '#6A7F5F' }}></i>
                <a href={`tel:${phoneNumber}`} className="text-secondary text-decoration-none small">
                  {phoneNumber}
                </a>
              </div>
            )}
          </div>

          {/* Right Column - Action Buttons */}
          <div className="col-12 col-md-5 mt-3 mt-md-0 d-flex flex-column align-items-center align-items-md-start gap-2">
            <button 
              className="btn d-flex align-items-center gap-2"
              style={{ backgroundColor: '#6A7F5F', color: 'white', border: 'none', fontSize: '0.85rem', padding: '8px 16px', borderRadius: '6px' }}
              onClick={() => setShowHoursModal(true)}
            >
              <i className="bi bi-clock-fill"></i>
              View Hours
            </button>
            <button 
              className="btn d-flex align-items-center gap-2"
              style={{ backgroundColor: '#6A7F5F', color: 'white', border: 'none', fontSize: '0.85rem', padding: '8px 16px', borderRadius: '6px' }}
              onClick={() => setShowLearnMoreModal(true)}
            >
              <i className="bi bi-info-circle-fill"></i>
              Learn More
            </button>
            <button 
              className="btn d-flex align-items-center gap-2"
              style={{ backgroundColor: '#6A7F5F', color: 'white', border: 'none', fontSize: '0.85rem', padding: '8px 16px', borderRadius: '6px' }}
              onClick={handleOpenDirections}
              disabled={loadingDirections}
            >
              <i className="bi bi-signpost-2"></i>
              Get Directions
            </button>
            {websiteUrl && (
              <div className="d-flex align-items-center mt-1">
                <i className="bi bi-globe me-2 small" style={{ color: '#6A7F5F' }}></i>
                <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="text-secondary text-decoration-none small">
                  {formatWebsiteDisplay(websiteUrl)}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hours Modal */}
      {showHoursModal && (
        <div 
          className="modal show d-block" 
          tabIndex="-1" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowHoursModal(false)}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header" style={{ backgroundColor: '#6A7F5F' }}>
                <h5 className="modal-title text-white">
                  <i className="bi bi-clock-fill me-2"></i>
                  Hours - {name}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowHoursModal(false)}
                ></button>
              </div>
              <div className="modal-body p-4">
                {Object.keys(groupedSchedules).length > 0 ? (
                  <div className="d-flex flex-column gap-2">
                    {Object.entries(groupedSchedules).map(([day, times], index) => (
                      <div 
                        key={index} 
                        className="d-flex justify-content-between align-items-center py-2 px-3 rounded"
                        style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}
                      >
                        <span className="fw-medium" style={{ color: '#6A7F5F' }}>{day}</span>
                        <span className="text-muted">
                          {times.map((t, i) => (
                            <span key={i}>
                              {i > 0 && ' and '}
                              {formatTime(t.open)} - {formatTime(t.close)}
                            </span>
                          ))}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted mb-0">
                    Hours not available for this location.
                  </p>
                )}
              </div>
              <div className="modal-footer border-0">
                <button 
                  type="button" 
                  className="btn"
                  style={{ backgroundColor: '#6A7F5F', color: 'white' }}
                  onClick={() => setShowHoursModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <DirectionsModal
            show={showDirectionsModal}
            onClose={handleCloseModal}
            destination={organization}
            routeData={currentRoute}
          />
      <LearnMoreModal
            show={showLearnMoreModal}
            onClose={() => setShowLearnMoreModal(false)}
            organization={organization}
          />
    </div>
    
  );
}
