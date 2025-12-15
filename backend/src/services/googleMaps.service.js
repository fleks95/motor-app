const axios = require('axios');

class GoogleMapsParser {
  /**
   * Parse Google Maps URL to extract waypoints
   * Supports various Google Maps URL formats:
   * - Shared links (https://maps.app.goo.gl/...)
   * - Direct links (https://www.google.com/maps/dir/...)
   * - Place links (https://www.google.com/maps/place/...)
   */
  async parseUrl(url) {
    try {
      // Handle shortened goo.gl links by following redirects
      if (url.includes('maps.app.goo.gl') || url.includes('goo.gl')) {
        url = await this.followRedirect(url);
      }

      const waypoints = [];

      // Pattern 1: /dir/ URLs with multiple locations
      if (url.includes('/dir/')) {
        waypoints.push(...this.parseDirUrl(url));
      }
      // Pattern 2: /place/ URLs with single location
      else if (url.includes('/place/')) {
        waypoints.push(...this.parsePlaceUrl(url));
      }
      // Pattern 3: /@lat,lng URLs
      else if (url.includes('/@')) {
        waypoints.push(...this.parseCoordinateUrl(url));
      }

      if (waypoints.length === 0) {
        throw new Error('No valid waypoints found in URL');
      }

      return waypoints;
    } catch (error) {
      throw new Error(`Failed to parse Google Maps URL: ${error.message}`);
    }
  }

  /**
   * Parse /dir/ URLs (directions with multiple waypoints)
   * Format: /dir/Location1/Location2/Location3/@lat,lng,zoom/data=...
   */
  parseDirUrl(url) {
    const waypoints = [];

    // Extract the /dir/ portion - capture everything between /dir/ and /@
    const dirMatch = url.match(/\/dir\/(.+?)\/@/);
    if (!dirMatch) return waypoints;

    // Split locations by /
    const locations = dirMatch[1].split('/').filter(Boolean);

    // Extract coordinates from !1d (longitude) and !2d (latitude) patterns in data param
    // These are the actual waypoint coordinates
    const latMatches = url.matchAll(/!2d(-?\d+\.\d+)/g);
    const lngMatches = url.matchAll(/!1d(-?\d+\.\d+)/g);
    const lats = Array.from(latMatches).map((m) => parseFloat(m[1]));
    const lngs = Array.from(lngMatches).map((m) => parseFloat(m[1]));

    // Create waypoints by matching locations with their coordinates
    // The !1d/!2d pairs correspond to each location in order
    for (let i = 0; i < locations.length; i++) {
      if (i < lats.length && i < lngs.length) {
        waypoints.push({
          latitude: lats[i],
          longitude: lngs[i],
          name: decodeURIComponent(locations[i]).replace(/\+/g, ' '),
        });
      } else {
        // Fallback: location without coordinates
        waypoints.push({
          name: decodeURIComponent(locations[i]).replace(/\+/g, ' '),
          needs_geocoding: true,
        });
      }
    }

    return waypoints;
  }

  /**
   * Parse /place/ URLs (single location)
   * Format: /place/Location+Name/@lat,lng,zoom/data=...
   */
  parsePlaceUrl(url) {
    const waypoints = [];

    // Extract place name
    const placeMatch = url.match(/\/place\/([^/@]+)/);
    const placeName = placeMatch
      ? decodeURIComponent(placeMatch[1]).replace(/\+/g, ' ')
      : 'Location';

    // Extract coordinates
    const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordMatch) {
      waypoints.push({
        latitude: parseFloat(coordMatch[1]),
        longitude: parseFloat(coordMatch[2]),
        name: placeName,
      });
    } else {
      waypoints.push({
        name: placeName,
        needs_geocoding: true,
      });
    }

    return waypoints;
  }

  /**
   * Parse URLs with coordinates only
   * Format: /@lat,lng,zoom
   */
  parseCoordinateUrl(url) {
    const waypoints = [];
    const coordMatches = url.matchAll(/@(-?\d+\.\d+),(-?\d+\.\d+)/g);

    for (const [, lat, lng] of coordMatches) {
      waypoints.push({
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        name: `Location (${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)})`,
      });
    }

    return waypoints;
  }

  /**
   * Follow URL redirects to get the final Google Maps URL
   */
  async followRedirect(shortUrl) {
    try {
      const response = await axios.get(shortUrl, {
        maxRedirects: 5,
        validateStatus: () => true, // Don't throw on any status
      });

      // The final URL is in the response
      const finalUrl = response.request.res.responseUrl || shortUrl;
      return finalUrl;
    } catch (error) {
      // If redirect fails, return original URL
      return shortUrl;
    }
  }

  /**
   * Extract data parameter and decode it (advanced - for future use)
   * Google Maps encodes route data in the !data parameter
   */
  parseDataParameter(url) {
    const dataMatch = url.match(/!data=([^&]+)/);
    if (!dataMatch) return null;

    // This is complex encoding - would need reverse engineering
    // For now, we'll rely on the simpler parsing methods above
    return null;
  }

  /**
   * Validate that we have at least 2 waypoints for a route
   */
  validateWaypoints(waypoints) {
    if (waypoints.length < 2) {
      throw new Error('A route must have at least 2 waypoints (start and end)');
    }

    // Check if all waypoints have coordinates or need geocoding
    const needsGeocoding = waypoints.some((wp) => wp.needs_geocoding);
    if (needsGeocoding) {
      const locationNames = waypoints.map((wp) => wp.name).join(', ');
      throw new Error(
        `The Google Maps URL doesn't contain GPS coordinates. Found locations: ${locationNames}. ` +
          `Please open the route in Google Maps, wait for it to fully load with the map visible, ` +
          `then copy the URL again. The URL should contain coordinates like "/@44.7866,20.4489,13z"`
      );
    }

    return true;
  }
}

module.exports = new GoogleMapsParser();
