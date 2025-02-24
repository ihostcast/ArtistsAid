const { Client } = require('@googlemaps/google-maps-services-js');
const config = require('../config/constants.json');

class GoogleMapsService {
    constructor() {
        this.client = new Client({});
        this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
    }

    async geocode(address) {
        try {
            const response = await this.client.geocode({
                params: {
                    address,
                    key: this.apiKey
                }
            });

            if (response.data.status === 'OK') {
                return {
                    success: true,
                    data: response.data.results[0],
                    location: response.data.results[0].geometry.location
                };
            }

            return {
                success: false,
                error: `Geocoding failed with status: ${response.data.status}`
            };
        } catch (error) {
            console.error('Geocoding error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async reverseGeocode(lat, lng) {
        try {
            const response = await this.client.reverseGeocode({
                params: {
                    latlng: { lat, lng },
                    key: this.apiKey
                }
            });

            if (response.data.status === 'OK') {
                return {
                    success: true,
                    data: response.data.results[0],
                    address: response.data.results[0].formatted_address
                };
            }

            return {
                success: false,
                error: `Reverse geocoding failed with status: ${response.data.status}`
            };
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getPlaceDetails(placeId) {
        try {
            const response = await this.client.placeDetails({
                params: {
                    place_id: placeId,
                    key: this.apiKey
                }
            });

            if (response.data.status === 'OK') {
                return {
                    success: true,
                    data: response.data.result
                };
            }

            return {
                success: false,
                error: `Place details failed with status: ${response.data.status}`
            };
        } catch (error) {
            console.error('Place details error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async searchNearby(location, radius, type) {
        try {
            const response = await this.client.placesNearby({
                params: {
                    location,
                    radius,
                    type,
                    key: this.apiKey
                }
            });

            if (response.data.status === 'OK') {
                return {
                    success: true,
                    data: response.data.results
                };
            }

            return {
                success: false,
                error: `Nearby search failed with status: ${response.data.status}`
            };
        } catch (error) {
            console.error('Nearby search error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getDistanceMatrix(origins, destinations, mode = 'driving') {
        try {
            const response = await this.client.distancematrix({
                params: {
                    origins,
                    destinations,
                    mode,
                    key: this.apiKey
                }
            });

            if (response.data.status === 'OK') {
                return {
                    success: true,
                    data: response.data
                };
            }

            return {
                success: false,
                error: `Distance matrix failed with status: ${response.data.status}`
            };
        } catch (error) {
            console.error('Distance matrix error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = new GoogleMapsService();
