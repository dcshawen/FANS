import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useRef, useState } from 'react';
import { PMTiles, Protocol } from 'pmtiles';
import './map.css';
import { set } from 'react-hook-form';

const API_BASE_URL = 'http://localhost:8000';

function MapComponent({ 
    center = [-63.5923, 44.6509],
    zoom = 8,
    width = '100%',
    height = '400px',
    maxBounds = [
        [-66.25, 43.38],
        [-59.70, 47.64]
    ],
    minZoom = 6, 
    maxZoom = 20,
    onMarkerClick = null
}) {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const mapInitialized = useRef(false);
    const [userLocation, setUserLocation] = useState(null);
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [organizations, setOrganizations] = useState([]);
    const userMarkerRef = useRef(false);
    const [mapLoaded, setMapLoaded] = useState(false);

    // Initialize PMTiles protocol FIRST
    useEffect(() => {
        console.log('Initializing PMTiles protocol...');
        let protocol = new Protocol();
        maplibregl.addProtocol('pmtiles', protocol.tile);
        console.log('PMTiles protocol registered successfully');

        return () => {
            try {
                maplibregl.removeProtocol('pmtiles');
            } catch (e) {
                console.warn('Could not remove pmtiles protocol');
            }
        };
    }, []);

    // Get organization data for map markers
    useEffect(() => {
        const fetchOrganizations = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/organizations`);
                if (!response.ok) {
                    throw new Error('Failed to fetch organizations');
                }
                // Only keep organizations with coords
                const data = await response.json();
                const geocoded = data.filter(org => 
                    org.latitude != null && 
                    org.longitude != null
                );
                console.log(`Collected ${geocoded.length} locations.`)
                setOrganizations(geocoded);
            } catch (error) {
                console.error('Error collecting locations: ', error);
            }
        };
        fetchOrganizations();
    }, [])

    // Get geolocation
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

    // Initialize map AFTER PMTiles is ready
    useEffect(() => {
        if (mapInitialized.current || !mapContainer.current) return;

        const loadStyle = async () => {
            try {
                const response = await fetch('/styles/cbmt-style.json');
                
                if (!response.ok) {
                    console.warn('Failed to load cbmt-style.json, using fallback');
                    throw new Error('Style not found');
                }
                
                const styleJson = await response.json();
                console.log('Style loaded, initializing map...');
                initializeMap(styleJson);
            } catch (error) {
                // Fallback style in case PMTiles fails
                console.error('Error loading style:', error);
                initializeMap('https://demotiles.maplibre.org/style.json');
            }
        };

        const initializeMap = (styleUrl) => {
            map.current = new maplibregl.Map({
                container: mapContainer.current,
                style: styleUrl,
                center: userLocation || center,
                zoom: zoom,
                maxBounds: maxBounds,
                minZoom: minZoom,
                maxZoom: maxZoom
            });

            map.current.on('load', () => {
                console.log('Map loaded, setting up layers...');
                setupMapLayers();
                setMapLoaded(true);
            });

            map.current.on('error', (e) => {
                console.error('Map error:', e.error);
            });

            mapInitialized.current = true;
        };

        const setupMapLayers = () => {
            // User location source and layer
            if (!map.current.getSource('user-location')) {
                map.current.addSource('user-location', {
                    type: 'geojson',
                    data: { type: 'FeatureCollection', features: [] }
                });

                map.current.addLayer({
                    id: 'user-location-layer',
                    type: 'circle',
                    source: 'user-location',
                    paint: {
                        'circle-radius': 10,
                        'circle-color': '#007AFF',
                        'circle-stroke-width': 3,
                        'circle-stroke-color': '#fff',
                        'circle-opacity': 0.8
                    }
                });
            }

            // Resource marker source and layers
            if (!map.current.getSource('food-markers')) {
                map.current.addSource('food-markers', {
                    type: 'geojson',
                    data: { type: 'FeatureCollection', features: [] }
                });

                // Marker circles
                map.current.addLayer({
                    id: 'food-marker-layer',
                    type: 'circle',
                    source: 'food-markers',
                    paint: {
                        'circle-radius': 8,
                        'circle-color': '#FFB88C',
                        'circle-stroke-width': 2,
                        'circle-stroke-color': '#fff'
                    }
                });

                // Marker layers
                map.current.addLayer({
                    id: 'food-marker-labels',
                    type: 'symbol',
                    source: 'food-markers',
                    layout: {
                        'text-field': ['get', 'name'],
                        'text-size': 11,
                        'text-offset': [0, 1.5],
                        'text-anchor': 'top',
                        'text-max-width': 10
                    },
                    paint: {
                        'text-color': '#3A3F47',
                        'text-halo-color': '#fff',
                        'text-halo-width': 2
                    }
                });

                // Click handling
                map.current.on('click', 'food-marker-layer', (e) => {
                    const feature = e.features[0];
                    const props = feature.properties;

                    // Parse JSON strings to objects if needed
                    const markerData = {
                        ...props,
                        // Parse stringified JSON fields
                        schedules: typeof props.schedules === 'string'
                        ? JSON.parse(props.schedules)
                        : props.schedules
                    };


                    setSelectedMarker(markerData);

                    if (onMarkerClick) {
                        onMarkerClick(markerData);
                    }

                    // Center on selected marker
                    map.current.flyTo({
                        center: feature.geometry.coordinates,
                        zoom: Math.max(map.current.getZoom(), 13),
                    });
                });

                // Cursor change on hover
                map.current.on('mouseenter', 'food-marker-layer', () => {
                    map.current.getCanvas().style.cursor = 'pointer';
                });

                map.current.on('mouseleave', 'food-marker-layer', () => {
                    map.current.getCanvas().style.cursor = '';
                });
            }
        };

        loadStyle();

        return () => {
            if (map.current && mapInitialized.current) {
                map.current.remove();
                map.current = null;
                mapInitialized.current = false;
            }
        };
    }, []);

    // Update user location marker
    useEffect(() => {
        if (!userLocation || !map.current || !mapLoaded) return;

        map.current.getSource('user-location')?.setData({
            type: 'FeatureCollection',
            features: [{
                type: 'Feature',
                geometry: { type: 'Point', coordinates: userLocation },
                properties: { title: 'Your Location', accuracy: 100 }
            }]
        });

        if (!userMarkerRef.current) {
            map.current.flyTo({
                center: userLocation,
                zoom: 12,
                duration: 1500
            });
            userMarkerRef.current = true;
        }
    }, [userLocation, mapLoaded]);

    // Add markers from database once loaded
    useEffect(() => {
        if (!mapLoaded || organizations.length === 0) return;

        const source = map.current.getSource('food-markers');
        if (!source) return;

        const features = organizations.map(org => ({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [org.longitude, org.latitude]
        }, 
        properties: {
            location_id: org.location_id,
                name: org.name,
                description: org.description || '',
                street_address: org.street_address || '',
                city: org.city || '',
                postal_code: org.postal_code || '',
                latitude: org.latitude,
                longitude: org.longitude,
                // Include related data
                contacts: JSON.stringify(org.contacts || []),
                schedules: JSON.stringify(org.schedules || [])
        }

    }));

    source.setData({
        type: 'FeatureCollection', 
        features: features
    });

    console.log(`Added ${features.length} markers to map.`)
    // Fit bounds to show all markers
    if (features.length > 1 && !userLocation) {
        const bounds = new maplibregl.LngLatBounds();
        features.forEach(f => bounds.extend(f.geometry.coordinates));
        map.current.fitBounds(bounds, { padding: 50, maxZoom: 12});
    }
}, [organizations, mapLoaded])
    
    // Recenter map
    const handleCenter = () => {
        if (map.current && userLocation) {
            map.current.flyTo({
                center: userLocation,
                zoom: 14,
                duration: 1000
            });
        }
    };

    const closePopup = () => {
        setSelectedMarker(null);
    }

    return (
        <div style={{ position: 'relative', width, height }}>
            <div
                ref={mapContainer}
                style={{ width, height }}
            />
            {/* Recenter button */}
            <button
                className="map-recenter-btn"
                title="Return to your location"
                onClick={handleCenter}
            >
                📍 My Location
            </button>

            {/* Selected Marker Popup handle */}
            {selectedMarker && (
                <div className="map-popup">
                    <button className="popup-close" onClick={closePopup}>×</button>
                    
                    <h3>{selectedMarker.name}</h3>
                    {selectedMarker.description && (
                        <p className="popup-description">{selectedMarker.description}</p>
                    )}
                    <div className="popup-details">
                        <p>
                            <strong>📍</strong> {selectedMarker.street_address}, {selectedMarker.city} {selectedMarker.postal_code}
                        </p>  
                        {/* Display schedules if available */}
                        {selectedMarker.schedules && selectedMarker.schedules.length > 0 && (
                            <div className="popup-schedules">
                                <strong>🕐 Hours:</strong>
                                {selectedMarker.schedules.map((schedule, idx) => (
                                    <p key={idx}>
                                        {schedule.day_of_week}: {schedule.open_time} - {schedule.close_time}
                                    </p>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Directions button logic to be implemented later */}
                    <button
                        className="popup-directions-btn"
                        onClick={() => {
                            console.log('Get directions from', userLocation, 'to', selectedMarker.name);
                        }}
                    >
                        🗺️ Get Directions
                    </button>
                </div>
            )}
        </div>
    );
}

export default MapComponent;