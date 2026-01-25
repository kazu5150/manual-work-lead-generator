import { GooglePlaceResult } from '@/types';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY!;
const PLACES_API_BASE = 'https://maps.googleapis.com/maps/api/place';

export async function searchPlaces(
  query: string,
  location: string
): Promise<GooglePlaceResult[]> {
  const searchQuery = `${query} ${location}`;

  // Text Search API
  const textSearchUrl = `${PLACES_API_BASE}/textsearch/json?query=${encodeURIComponent(
    searchQuery
  )}&key=${GOOGLE_PLACES_API_KEY}&language=ja`;

  const response = await fetch(textSearchUrl);
  const data = await response.json();

  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    throw new Error(`Google Places API error: ${data.status}`);
  }

  const places = data.results || [];

  // Get details for each place
  const detailedPlaces = await Promise.all(
    places.slice(0, 20).map(async (place: { place_id: string }) => {
      return getPlaceDetails(place.place_id);
    })
  );

  return detailedPlaces.filter(Boolean) as GooglePlaceResult[];
}

export async function getPlaceDetails(
  placeId: string
): Promise<GooglePlaceResult | null> {
  const detailsUrl = `${PLACES_API_BASE}/details/json?place_id=${placeId}&fields=place_id,name,formatted_address,formatted_phone_number,website,rating,types&key=${GOOGLE_PLACES_API_KEY}&language=ja`;

  const response = await fetch(detailsUrl);
  const data = await response.json();

  if (data.status !== 'OK') {
    console.error(`Failed to get details for ${placeId}: ${data.status}`);
    return null;
  }

  const result = data.result;
  return {
    place_id: result.place_id,
    name: result.name,
    formatted_address: result.formatted_address || '',
    formatted_phone_number: result.formatted_phone_number,
    website: result.website,
    rating: result.rating,
    types: result.types,
  };
}
