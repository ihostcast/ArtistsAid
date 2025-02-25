import axios from 'axios';
import { services } from '../../config/services';

const GEOCODING_API = 'https://maps.googleapis.com/maps/api/geocode/json';
const PLACES_API = 'https://maps.googleapis.com/maps/api/place';

export const geocodeAddress = async (address: string) => {
  try {
    const response = await axios.get(GEOCODING_API, {
      params: {
        address,
        key: services.google.mapsApiKey
      }
    });
    
    if (response.data.results.length === 0) {
      throw new Error('No results found');
    }
    
    return response.data.results[0].geometry.location;
  } catch (error) {
    throw new Error('Error geocoding address');
  }
};

export const searchPlaces = async (query: string, location: { lat: number, lng: number }, radius: number = 5000) => {
  try {
    const response = await axios.get(`${PLACES_API}/textsearch/json`, {
      params: {
        query,
        location: `${location.lat},${location.lng}`,
        radius,
        key: services.google.mapsApiKey
      }
    });
    
    return response.data.results;
  } catch (error) {
    throw new Error('Error searching places');
  }
};
