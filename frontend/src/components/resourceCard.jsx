import { useState } from 'react';
import DirectionsModal from './DirectionsModal';
import { useLocation } from 'react-router-dom';

export default function ResourceCard({ organization }) {
  const { name, street_address, city, postal_code, schedules, contacts, tags } = organization;

  // Get contact info from contacts
  const contact = contacts && contacts.length > 0 ? contacts[0] : null;
  const phoneNumber = contact?.phone_number;
  const websiteUrl = contact?.websit_url; // Note: API has typo "websit_url"

  // Format address
  const formatAddress = () => {
    const parts = [street_address, city, postal_code].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Address not available';
  };

  // Format website URL for display
  const formatWebsiteDisplay = (url) => {
    if (!url) return '';
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
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

  return (
    <>
    <div className="card shadow rounded-3 overflow-hidden" style={{ border: '2px solid #6A7F5F' }}>
      {/* Green Header with Organization Name */}
      <div className="card-header py-2 text-center" style={{ backgroundColor: '#6A7F5F' }}>
        <h6 className="card-title fw-bold text-white mb-0">
          {name}
        </h6>
      </div>

      <div className="card-body p-4 bg-white">
        <div className="row">
          {/* Left Column - Tags, Address & Contact */}
          <div className="col-12 col-md-6 d-flex flex-column align-items-center align-items-md-start ps-md-5">
            {/* Placeholder Tags */}
            <div className="mb-3">
              <span className="badge me-2 mb-1" style={{ backgroundColor: '#6A7F5F' }}>
                Hot Meals
              </span>
              <span className="badge me-2 mb-1" style={{ backgroundColor: '#6A7F5F' }}>
                Lunch Service
              </span>
              <span className="badge me-2 mb-1" style={{ backgroundColor: '#6A7F5F' }}>
                Community
              </span>
            </div>
            {/* Tags */}
            {tags && tags.length > 0 && (
              <div className="mb-3">
                {tags.map((tag, index) => (
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
            {(phoneNumber || websiteUrl) && (
              <div>
                {phoneNumber && (
                  <div className="d-flex align-items-center mb-1">
                    <i className="bi bi-telephone me-2 small" style={{ color: '#6A7F5F' }}></i>
                    <a href={`tel:${phoneNumber}`} className="text-secondary text-decoration-none small">
                      {phoneNumber}
                    </a>
                  </div>
                )}
                {websiteUrl && (
                  <div className="d-flex align-items-center">
                    <i className="bi bi-globe me-2 small" style={{ color: '#6A7F5F' }}></i>
                    <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="text-secondary text-decoration-none small text-truncate" style={{ maxWidth: '150px' }}>
                      {formatWebsiteDisplay(websiteUrl)}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Hours */}
          <div className="col-12 col-md-6 mt-3 mt-md-0">
            <div className="d-flex align-items-center mb-2">
              <i className="bi bi-clock-fill me-2 small" style={{ color: '#6A7F5F' }}></i>
              <span className="fw-semibold small" style={{ color: '#3A3F47' }}>Hours</span>
            </div>
            {Object.keys(groupedSchedules).length > 0 ? (
              <div className="ps-4">
                {Object.entries(groupedSchedules).map(([day, times], index) => (
                  <div key={index} className="d-flex" style={{ fontSize: '0.8rem', gap: '0.5rem' }}>
                    <span className="text-secondary" style={{ minWidth: '70px' }}>{day}</span>
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
              <p className="mb-0 ps-4 text-muted small">
                Hours not available
              </p>
            )}
          </div>
        </div>
        
        {/* Get Directions Button - Centered at bottom of card */}
        <div className="d-flex justify-content-center mt-3">
          <button 
            className="btn btn-sm d-flex align-items-center justify-content-center gap-1"
            style={{ backgroundColor: '#6A7F5F', color: 'white', border: 'none', fontSize: '0.75rem', padding: '4px 10px' }}
            onClick={() => alert('Directions feature coming soon!')}
          >
            <i className="bi bi-signpost-2"></i>
            Get Directions
          </button>
        </div>
      </div>
    </div>

    {/* Directions Modal */}

  </>
  );
}
