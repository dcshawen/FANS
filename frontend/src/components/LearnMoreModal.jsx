import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Protocol } from 'pmtiles';

export default function LearnMoreModal({ show, onClose, organization }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const protocolInitialized = useRef(false);

  const { 
    name, 
    description, 
    street_address, 
    city, 
    postal_code, 
    latitude, 
    longitude, 
    contacts,
    tags
  } = organization || {};

  // Get website from contacts
  const contact = contacts && contacts.length > 0 ? contacts[0] : null;
  const websiteUrl = contact?.websit_url;

  // Format tags for display
  const displayTags = Array.isArray(tags)
    ? tags
        .map((tag) => (typeof tag === 'string' ? tag : tag?.tag))
        .filter(Boolean)
    : [];

  // Format website URL for display
  const formatWebsiteDisplay = (url) => {
    if (!url) return '';
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace(/^www\./, '');
    } catch {
      return url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    }
  };

  // Format address
  const formatAddress = () => {
    const parts = [street_address, city, postal_code].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Address not available';
  };

  // Initialize map when modal opens
  useEffect(() => {
    if (!show || !mapContainerRef.current || !latitude || !longitude) return;

    // Initialize PMTiles protocol
    if (!protocolInitialized.current) {
      const protocol = new Protocol();
      maplibregl.addProtocol('pmtiles', protocol.tile);
      protocolInitialized.current = true;
    }

    // Small delay to ensure modal is rendered
    const timer = setTimeout(async () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }

      // Load the same style as the main map
      let mapStyle;
      try {
        const response = await fetch('/styles/cbmt-style.json');
        if (response.ok) {
          mapStyle = await response.json();
        } else {
          throw new Error('Style not found');
        }
      } catch (error) {
        // Fallback to demo style
        mapStyle = 'https://demotiles.maplibre.org/style.json';
      }

      mapRef.current = new maplibregl.Map({
        container: mapContainerRef.current,
        style: mapStyle,
        center: [longitude, latitude],
        zoom: 15
      });

      // Add marker for the organization location
      new maplibregl.Marker({ color: '#6A7F5F' })
        .setLngLat([longitude, latitude])
        .addTo(mapRef.current);

      // Add navigation controls
      mapRef.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [show, latitude, longitude]);

  if (!show) return null;

  return (
    <div 
      className="modal show d-block" 
      tabIndex="-1" 
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div 
        className="modal-dialog modal-dialog-centered modal-lg" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          {/* Header */}
          <div className="modal-header" style={{ backgroundColor: '#6A7F5F' }}>
            <h5 className="modal-title text-white">
              <i className="bi bi-info-circle-fill me-2"></i>
              {name}
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={onClose}
            ></button>
          </div>

          {/* Body */}
          <div className="modal-body p-4">
            {/* Map Section */}
            {latitude && longitude ? (
              <div 
                ref={mapContainerRef}
                className="rounded-3 mb-4"
                style={{ 
                  height: '250px', 
                  width: '100%',
                  border: '2px solid #6A7F5F'
                }}
              />
            ) : (
              <div 
                className="rounded-3 mb-4 d-flex align-items-center justify-content-center bg-light"
                style={{ height: '250px', border: '2px solid #e0e0e0' }}
              >
                <p className="text-muted mb-0">
                  <i className="bi bi-geo-alt me-2"></i>
                  Location not available
                </p>
              </div>
            )}

            {/* Organization Details */}
            <div className="mb-3">
              <h6 className="fw-bold" style={{ color: '#6A7F5F' }}>
                <i className="bi bi-building me-2"></i>
                About
              </h6>
              <p className="text-secondary mb-0">
                {description || 'No description available for this organization.'}
              </p>
            </div>

            {/* Address */}
            <div className="mb-3">
              <h6 className="fw-bold" style={{ color: '#6A7F5F' }}>
                <i className="bi bi-geo-alt-fill me-2"></i>
                Address
              </h6>
              <p className="text-secondary mb-0">{formatAddress()}</p>
            </div>

            {/* Website */}
            {websiteUrl && (
              <div className="mb-3">
                <h6 className="fw-bold" style={{ color: '#6A7F5F' }}>
                  <i className="bi bi-globe me-2"></i>
                  Website
                </h6>
                <a 
                  href={websiteUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-decoration-none"
                  style={{ color: '#6A7F5F' }}
                >
                  {formatWebsiteDisplay(websiteUrl)}
                  <i className="bi bi-box-arrow-up-right ms-2 small"></i>
                </a>
              </div>
            )}

            {/* Tags */}
            {displayTags.length > 0 && (
              <div className="mt-3">
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
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn"
              style={{ backgroundColor: '#6A7F5F', color: 'white' }}
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
