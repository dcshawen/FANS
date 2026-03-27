import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useRef, useState } from 'react';
import { PMTiles, Protocol } from 'pmtiles';
import DirectionsModal from './components/DirectionsModal';
import './map.css';

const API_BASE_URL = 'http://localhost:8000';
const GRAPH_HOPPER_API_KEY = import.meta.env.VITE_GRAPH_API_KEY; 

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
    const markersRef = useRef([]);
    const [mapLoaded, setMapLoaded] = useState(false);

    // Modal states
    const [showDirectionsModal, setShowDirectionsModal] = useState(false);
    const [currentRoute, setCurrentRoute] = useState(null);

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
                if (map.current) {
                    setupMapLayers();
                    setMapLoaded(true);
                }
            });

            map.current.on('error', (e) => {
                console.error('Map error:', e.error);
            });

            mapInitialized.current = true;
        };

        const setupMapLayers = () => {
            if (!map.current) return;
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

            // Resource marker source for labels
            if (!map.current.getSource('food-markers')) {
                map.current.addSource('food-markers', {
                    type: 'geojson',
                    data: { type: 'FeatureCollection', features: [] }
                });

                // Marker labels (names below pins)
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

        // Clear existing markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        const source = map.current.getSource('food-markers');
        if (!source) return;

        // Create pin markers for each organization
        organizations.forEach(org => {
            const marker = new maplibregl.Marker({ color: '#6A7F5F' })
                .setLngLat([org.longitude, org.latitude])
                .addTo(map.current);

            // Add click handler to the marker
            marker.getElement().addEventListener('click', () => {
                const markerData = {
                    location_id: org.location_id,
                    name: org.name,
                    description: org.description || '',
                    street_address: org.street_address || '',
                    city: org.city || '',
                    postal_code: org.postal_code || '',
                    latitude: org.latitude,
                    longitude: org.longitude,
                    contacts: org.contacts || [],
                    schedules: org.schedules || []
                };

                setSelectedMarker(markerData);

                if (onMarkerClick) {
                    onMarkerClick(markerData);
                }

                // Center on selected marker
                map.current.flyTo({
                    center: [org.longitude, org.latitude],
                    zoom: Math.max(map.current.getZoom(), 13),
                });
            });

            // Change cursor on hover
            marker.getElement().style.cursor = 'pointer';

            markersRef.current.push(marker);
        });

        // Add features for labels
        const features = organizations.map(org => ({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [org.longitude, org.latitude]
            }, 
            properties: {
                name: org.name
            }
        }));

        source.setData({
            type: 'FeatureCollection', 
            features: features
        });

        console.log(`Added ${organizations.length} markers to map.`);
        // Fit bounds to show all markers
        if (organizations.length > 1 && !userLocation) {
            const bounds = new maplibregl.LngLatBounds();
            organizations.forEach(org => bounds.extend([org.longitude, org.latitude]));
            map.current.fitBounds(bounds, { padding: 50, maxZoom: 12});
        }
    }, [organizations, mapLoaded]);
    
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

    const getRoute = async (startCoords, endCoords, routeName = '') => {
        const apiKey = import.meta.env.VITE_GRAPH_API_KEY;

        try {
            const url = `https://graphhopper.com/api/1/route?` +
                `point=${startCoords[1]},${startCoords[0]}&` +
                `point=${endCoords[1]},${endCoords[0]}&` +
                `key=${apiKey}&` +
                `locale=en&` +
                `points_encoded=false&` + 
                `instructions=true`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Route request failed');

            const data = await response.json();
            if (data.paths && data.paths.length > 0) {
                return data.paths[0]; // Returns the first or best route
            }
            throw new Error('No route found');
        } catch (error) {
            console.error('GraphHopper routing error:', error);
            alert('Could not find route. Please try again later.');
            return null;
        }
    };

    // Displays the route on the map
    const displayRoute = (routePath) => {
        if (!map.current || !routePath) return;

        // Remove any existing route
        if (map.current.getSource('route-line')) {
            map.current.getSource('route-line').setData({
                type: 'FeatureCollection',
                features: []
            });
        } else {
            // Add source and layer for route
            map.current.addSource('route-line', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] }
            });

            map.current.addLayer({
                id: 'route-line-layer',
                type: 'line',
                source: 'route-line',
                paint: {
                    'line-color': '#FFB88C',
                    'line-width': 4,
                    'line-opacity': 0.8
                }
            }, 
            'food-marker-layer' // Drawn under markers
            );
        }

        // Convert route points to GeoJSON
        const coords = routePath.points.coordinates;

        map.current.getSource('route-line').setData({
            type: 'FeatureCollection',
            features: [{
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: coords
                },
                properties: {
                    distance: routePath.distance,
                    time: routePath.time
                }
            }]
        });

        // Fit map bounds to route
        if (coords.length > 0) {
            const bounds = new maplibregl.LngLatBounds();
            coords.forEach(coord => bounds.extend(coord));
            map.current.fitBounds(bounds, { padding: 50 });
        }
    };

    const handleGetDirections = async (destination) => {
        if (!userLocation || !map.current) return;
        console.log('Getting directions from', userLocation, 'to', destination.name);

        const route = await getRoute(userLocation, [destination.longitude, destination.latitude]);
        if (route) {
            setCurrentRoute(route);
            displayRoute(route);

            // Distance and time
            const distanceKm = (route.distance / 1000).toFixed(2);
            const timeMin = Math.ceil(route.time / 60000);
            console.log(`Route: ${distanceKm} km, ${timeMin} min`);
            console.log('Route instructions:', route.instructions);
        }
    };

    // Clear the displayed route
    const clearRoute = () => {
        if (map.current && map.current.getSource('route-line')) {
            map.current.getSource('route-line').setData({
                type: 'FeatureCollection',
                features: []
            });
        }
        setCurrentRoute(null);
    }

    const closePopup = () => {
        setSelectedMarker(null);
        clearRoute();
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
                        onClick={async () => {
                            if (!userLocation) {
                                alert('Please enable location access to get directions');
                                return;
                            }
                            await handleGetDirections(selectedMarker);
                            setShowDirectionsModal(true);
                        }}
                    >
                        🗺️ Get Directions
                    </button>
                </div>
            )}

            <DirectionsModal
                show={showDirectionsModal}
                onClose={() => setShowDirectionsModal(false)}
                destination={selectedMarker}
                routeData={currentRoute}
            />
        </div>
    );
}

export default MapComponent;