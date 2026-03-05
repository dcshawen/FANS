const API_BASE_URL = 'http://localhost:8000';
const BATCH_SIZE = 10;

export async function geocodeAddresses() {
  try {
    // Get all organizations from existing endpoint
    const response = await fetch(`${API_BASE_URL}/organizations`);
    const orgs = await response.json();

    // Filter only organizations missing coordinates and existing address data
    const ungeocoded = orgs.filter(org => 
      (!org.latitude || !org.longitude) && 
      org.street_address && 
      org.city // Postal code optional, Geocodio can make a good guess with just these fields
    );

    if (ungeocoded.length === 0) {
      console.log('✓ All addresses already geocoded!');
      return;
    }

    console.log(`Found ${ungeocoded.length} addresses to geocode...`);

    // Process in batches
    for (let i = 0; i < ungeocoded.length; i += BATCH_SIZE) {
      const batch = ungeocoded.slice(i, i + BATCH_SIZE);
      await geocodeBatch(batch);
    }

    console.log('✓ Geocoding complete!');
  } catch (error) {
    console.error('Geocoding error:', error);
  }
}

// Format: 2107 Brunswick St, Halifax, NS, B3K, Canada
async function geocodeBatch(addresses) {
  const queries = addresses.map(addr => 
    `${addr.street_address}, ${addr.city}, ${addr.postal_code || ''}, Canada`
  );

  try {
    // Using proxy to avoid CORS issues
    const response = await fetch(`${API_BASE_URL}/geocode/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(queries)
    });

    if (!response.ok) {
      throw new Error('HTTP error ' + response.status);
    }

    const data = await response.json();

    // Update backend with coordinates
    for (let i = 0; i < addresses.length; i++) {
      const addr = addresses[i];
      const result = data.results[i];

      if (result?.response?.results?.[0]?.location) {
        const { lat, lng } = result.response.results[0].location;

        await fetch(`${API_BASE_URL}/organizations/${addr.location_id}/geocode?lat=${lat}&lng=${lng}`, {
          method: 'PUT'
        });
        console.log(`✓ Geocoded: ${addr.street_address} → (${lat}, ${lng})`);
      } else {
        console.warn(`⚠️ No geocode result for: ${addr.street_address}`);
      }
    }
  } catch (error) {
    console.error('Geocoding error:', error.message);
  }
}


export async function geocodeSingleAddress(locationId, streetAddress, city, postalCode) {
  const query = `${streetAddress}, ${city}, ${postalCode || ''}, Canada`;

  try {
    // Calling proxy again to avoid CORS issues in frontend
    const response = await fetch(
      `${API_BASE_URL}/geocode/single?address=${encodeURIComponent(query)}`,
    );

    const data = await response.json();

    if (data.results && data.results[0]) {
      const { lat, lng } = data.results[0].location;

      await fetch(`${API_BASE_URL}/organizations/${locationId}/geocode?lat=${lat}&lng=${lng}`, {
        method: 'PUT'
      });

      return { lat, lng };
    }
    return null;
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
}