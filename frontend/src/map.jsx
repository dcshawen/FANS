import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useRef, useState } from 'react';
import { PMTiles, Protocol } from 'pmtiles';
import './map.css'


function MapComponent({ 
    center = [0, 0], 
    zoom = 1,
    width = '100%',
    height = '400px',
    maxBounds = [
    [-66.25, 43.38],  // Southwest corner [longitude, latitude]
    [-59.70, 47.64]   // Northeast corner [longitude, latitude]
],
    minZoom = 6, 
    maxZoom = 20,
    onMarkerClick = null //Callback for marker click
}) {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [userLocation, setUserLocation] = useState(null);
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [markers, setMarkers] = useState([]);
    const useMarkerRef = useRef({}); // Ref to store marker instances

    useEffect(() => {
        if (map.current) return; // Initialize map only once
        
        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: style,
            center: center,
            zoom: zoom,
            maxBounds: maxBounds,
            minZoom: minZoom,
            maxZoom: maxZoom
        });

        map.current.on('load', () => {
            map.current.setMaxBounds(maxBounds);
        });

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, [center, zoom, style, maxBounds, minZoom, maxZoom]);


    const handleCenter = () => {
        if (map.current) {
            map.current.flyTo({ center: center, zoom: zoom, duration: 1000 });
        }

    };

    return (
        <div style={{position: 'relative', width: width, height: height}}>
            <div 
                ref={mapContainer} 
                style={{ width: width, height: height }}
            />
            <button onClick={handleCenter}>Recenter Map</button>
        </div>
    );
}

export default MapComponent;