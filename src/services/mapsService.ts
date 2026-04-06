/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface GeocodingResponse {
  results: {
    formatted_address: string;
    address_components: {
      long_name: string;
      short_name: string;
      types: string[];
    }[];
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
  }[];
  status: string;
}

const getApiKey = () => {
  // Try both import.meta.env and process.env for maximum compatibility
  // Use 'as any' to bypass TypeScript linting for import.meta.env
  return ((import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY) || 
         (process.env?.VITE_GOOGLE_MAPS_API_KEY) || 
         '';
};

export const mapsService = {
  async reverseGeocode(lat: number, lng: number) {
    const apiKey = getApiKey();
    if (!apiKey) {
      console.warn('VITE_GOOGLE_MAPS_API_KEY is not set in environment variables');
      return null;
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`Geocoding API responded with status: ${response.status}`);
      }

      const data: GeocodingResponse = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        
        // Extract components
        let city = '';
        let state = '';
        let pincode = '';
        let locality = '';

        result.address_components.forEach(comp => {
          if (comp.types.includes('locality')) city = comp.long_name;
          if (comp.types.includes('administrative_area_level_1')) state = comp.long_name;
          if (comp.types.includes('postal_code')) pincode = comp.long_name;
          if (comp.types.includes('sublocality') || comp.types.includes('neighborhood') || comp.types.includes('sublocality_level_1')) {
            if (!locality) locality = comp.long_name;
          }
        });

        return {
          fullAddress: result.formatted_address,
          city,
          state,
          pincode,
          locality,
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng
        };
      } else if (data.status === 'REQUEST_DENIED') {
        console.error('Geocoding API request denied. Check if API key is valid and Geocoding API is enabled.');
      } else {
        console.warn(`Geocoding API returned status: ${data.status}`);
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  },

  getCurrentLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
      } else {
        // Use a longer timeout and high accuracy
        navigator.geolocation.getCurrentPosition(resolve, (error) => {
          console.error('Geolocation error code:', error.code, 'message:', error.message);
          reject(error);
        }, {
          enableHighAccuracy: true,
          timeout: 10000, // 10 seconds
          maximumAge: 60000 // 1 minute cache
        });
      }
    });
  }
};
