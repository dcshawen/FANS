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

export { getRoute };