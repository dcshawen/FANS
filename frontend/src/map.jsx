import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useRef, useState } from 'react';
import { PMTiles, Protocol } from 'pmtiles';
import './map.css';

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
    maxZoom = 15,
    onMarkerClick = null
}) {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const mapInitialized = useRef(false);
    const [userLocation, setUserLocation] = useState(null);
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [markers, setMarkers] = useState([]);
    const userMarkerRef = useRef(false);

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
            });

            map.current.on('error', (e) => {
                console.error('Map error:', e.error);
            });

            mapInitialized.current = true;
        };

        const setupMapLayers = () => {
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

            if (!map.current.getSource('food-markers')) {
                map.current.addSource('food-markers', {
                    type: 'geojson',
                    data: { type: 'FeatureCollection', features: [] }
                });

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

                map.current.addLayer({
                    id: 'food-marker-labels',
                    type: 'symbol',
                    source: 'food-markers',
                    layout: {
                        'text-field': ['get', 'name'],
                        'text-size': 12,
                        'text-offset': [0, 1.5],
                        'text-anchor': 'top'
                    },
                    paint: {
                        'text-color': '#3A3F47',
                        'text-halo-color': '#fff',
                        'text-halo-width': 1
                    }
                });

                map.current.on('click', 'food-marker-layer', (e) => {
                    const feature = e.features[0];
                    setSelectedMarker(feature.properties);
                    if (onMarkerClick) {
                        onMarkerClick(feature.properties);
                    }
                });

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
        if (!userLocation || !map.current || !map.current.isStyleLoaded()) return;

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
                zoom: 10,
                duration: 1500
            });
            userMarkerRef.current = true;
        }
    }, [userLocation]);

    // Add markers from database
    const addMarkers = (organizationData) => {
        if (!map.current || !map.current.isStyleLoaded()) return;

        const features = organizationData.map(org => ({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [org.longitude, org.latitude]
            },
            properties: {
                location_id: org.location_id,
                name: org.name,
                description: org.description,
                street_address: org.street_address,
                city: org.city,
                postal_code: org.postal_code,
                phone: org.phone_number,
                website: org.website_url,
                hours: org.hours,
                food_offerings: org.food_offerings
            }
        }));

        map.current.getSource('food-markers')?.setData({
            type: 'FeatureCollection',
            features: features
        });

        setMarkers(organizationData);
    };

    // Recenter map
    const handleCenter = () => {
        if (map.current && userLocation) {
            map.current.flyTo({
                center: userLocation,
                zoom: 10,
                duration: 1000
            });
        }
    };

    return (
        <div style={{ position: 'relative', width, height }}>
            <div
                ref={mapContainer}
                style={{ width, height }}
            />
            <button
                className="map-recenter-btn"
                title="Return to your location"
                onClick={handleCenter}
            >
                📍 My Location
            </button>

            {selectedMarker && (
                <div className="map-popup">
                    <button
                        className="popup-close"
                        onClick={() => setSelectedMarker(null)}
                    >
                        ×
                    </button>
                    <h3>{selectedMarker.name}</h3>
                    <p className="popup-description">{selectedMarker.description}</p>
                    <div className="popup-details">
                        <p><strong>📍</strong> {selectedMarker.street_address}, {selectedMarker.city} {selectedMarker.postal_code}</p>
                        <p><strong>📞</strong> <a href={`tel:${selectedMarker.phone}`}>{selectedMarker.phone}</a></p>
                        {selectedMarker.website && (
                            <p><strong>🌐</strong> <a href={selectedMarker.website} target="_blank" rel="noopener noreferrer">Visit Website</a></p>
                        )}
                    </div>
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