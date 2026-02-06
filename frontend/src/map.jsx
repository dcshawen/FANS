import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useRef } from 'react';

function MapComponent({ 
    center = [0, 0], 
    zoom = 1, 
    style = 'https://demotiles.maplibre.org/globe.json',
    width = '100%',
    height = '400px'
}) {
    const mapContainer = useRef(null);
    const map = useRef(null);

    useEffect(() => {
        if (map.current) return; // Initialize map only once
        
        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: style,
            center: center,
            zoom: zoom
        });

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, [center, zoom, style]);

    return (
        <div 
            ref={mapContainer} 
            style={{ width: width, height: height }}
        />
    );
}

export default MapComponent;