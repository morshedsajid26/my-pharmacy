/**
 * Device Geolocation & Google Maps Navigation Helpers
 * Facilitates device GPS retrieval, reverse geocoding to human-readable address,
 * and seamless one-click Google Maps navigation directions.
 */

/**
 * Request device GPS coordinates using HTML5 Geolocation API
 * @param {Object} options Geolocation options
 * @returns {Promise<{latitude: number, longitude: number, accuracy: number}>}
 */
export const getCurrentDevicePosition = (options = {}) => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      return reject(new Error("Geolocation is not supported by your device/browser"));
    }

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
      ...options,
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      (err) => {
        let msg = "Failed to access your device location.";
        switch (err.code) {
          case err.PERMISSION_DENIED:
            msg = "Location permission denied. Please allow location access in your browser settings.";
            break;
          case err.POSITION_UNAVAILABLE:
            msg = "Location unavailable. Please make sure your device GPS/Location service is enabled.";
            break;
          case err.TIMEOUT:
            msg = "Location request timed out. Please try again.";
            break;
          default:
            if (err.message) msg = err.message;
        }
        reject(new Error(msg));
      },
      defaultOptions
    );
  });
};

/**
 * Reverse geocode latitude and longitude into a readable street/area address
 * using OpenStreetMap Nominatim reverse geocoding API.
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {Promise<string>}
 */
export const reverseGeocode = async (latitude, longitude) => {
  try {
    const lat = Number(latitude).toFixed(6);
    const lon = Number(longitude).toFixed(6);
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
    
    const response = await fetch(url, {
      headers: {
        "Accept-Language": "en,bn",
        "User-Agent": "MyPharmacyApp/1.0",
      },
    });

    if (!response.ok) {
      throw new Error("Geocoding service unavailable");
    }

    const data = await response.json();
    if (!data || !data.address) {
      const fallback = `GPS Location (${lat}, ${lon})`;
      return {
        readable: fallback,
        houseNumber: "",
        road: "",
        area: "",
        city: "",
        postcode: "",
        fullDisplayName: "",
        toString() { return this.readable; },
        valueOf() { return this.readable; },
      };
    }

    const addr = data.address;
    const parts = [];

    // House / Building / Amenity
    const houseNo = addr.house_number || addr.house_name || "";
    const building = addr.building || addr.amenity || addr.shop || addr.office || "";
    const road = addr.road || addr.pedestrian || addr.street || addr.residential || addr.footway || "";

    const streetDetails = [houseNo, building, road].filter(Boolean).join(", ");
    if (streetDetails) parts.push(streetDetails);

    // Neighbourhood / Suburb / Thana / Quarter
    const area = addr.neighbourhood || addr.suburb || addr.quarter || addr.subdistrict || addr.residential || addr.village || "";
    if (area && !parts.includes(area)) parts.push(area);

    // City / Town / District
    const city = addr.city || addr.town || addr.municipality || addr.state_district || addr.county || "";
    if (city && !parts.includes(city)) parts.push(city);

    // Postal code
    if (addr.postcode) parts.push(addr.postcode);

    let formatted = parts.filter(Boolean).join(", ");
    
    // If formatted has only area/city and display_name has richer details, enrich it
    if (parts.length <= 2 && data.display_name) {
      const displayParts = data.display_name
        .split(", ")
        .filter((p) => p !== "Bangladesh" && !p.toLowerCase().includes("division"));
      if (displayParts.length > 2) {
        formatted = displayParts.slice(0, 4).join(", ");
      }
    }

    const readable = (formatted && formatted.length > 5)
      ? formatted
      : `GPS Location (${lat}, ${lon})`;

    return {
      readable,
      houseNumber: houseNo,
      road: road,
      area: area || city,
      city: city,
      postcode: addr.postcode || "",
      fullDisplayName: data.display_name || "",
      toString() { return this.readable; },
      valueOf() { return this.readable; },
    };
  } catch (error) {
    console.warn("Reverse geocode fallback:", error);
    const fallback = `GPS Location (${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)})`;
    return {
      readable: fallback,
      houseNumber: "",
      road: "",
      area: "",
      city: "",
      postcode: "",
      fullDisplayName: "",
      toString() { return this.readable; },
      valueOf() { return this.readable; },
    };
  }
};

/**
 * Combine readable address text with GPS coordinates into a persistent standard format
 * @param {string|object} text Readable address line or geo object
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {string} e.g. "Road 11, Banani, Dhaka [GPS: 23.793700, 90.404300]"
 */
export const formatAddressWithCoordinates = (text, latitude, longitude) => {
  const str = (typeof text === "object" && text !== null) ? (text.readable || String(text)) : String(text || "");
  const clean = str.replace(/\[GPS:[^\]]*\]/gi, "").trim();
  const lat = Number(latitude).toFixed(6);
  const lng = Number(longitude).toFixed(6);
  return `${clean} [GPS: ${lat}, ${lng}]`.trim();
};

/**
 * Parse an address string to detect if GPS coordinates are embedded,
 * and construct direct Google Maps directions URL for navigation.
 * @param {string} rawAddress 
 * @returns {{
 *   raw: string,
 *   cleanAddress: string,
 *   hasCoordinates: boolean,
 *   latitude: number|null,
 *   longitude: number|null,
 *   directionsUrl: string,
 *   viewUrl: string
 * }}
 */
export const parseLocationFromAddress = (rawAddress = "") => {
  if (!rawAddress || typeof rawAddress !== "string") {
    return {
      raw: "",
      cleanAddress: "No address specified",
      hasCoordinates: false,
      latitude: null,
      longitude: null,
      directionsUrl: "https://www.google.com/maps",
      viewUrl: "https://www.google.com/maps",
    };
  }

  const str = rawAddress.trim();

  // Match pattern: [GPS: 23.123456, 90.123456] or GPS: 23.123, 90.123
  const gpsRegex = /\[?GPS:\s*([-+]?[0-9]*\.?[0-9]+)\s*,\s*([-+]?[0-9]*\.?[0-9]+)\]?/i;
  const match = str.match(gpsRegex);

  if (match) {
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);
    const cleanAddress = str.replace(match[0], "").replace(/,\s*$/, "").trim();

    return {
      raw: str,
      cleanAddress: cleanAddress || `GPS Location (${lat.toFixed(6)}, ${lng.toFixed(6)})`,
      hasCoordinates: true,
      latitude: lat,
      longitude: lng,
      // Google Maps direction endpoint sets destination to exact GPS pin
      directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      viewUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
    };
  }

  // Fallback: Check if string is purely "lat, lng" coordinates
  const pureCoordsRegex = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;
  if (pureCoordsRegex.test(str)) {
    const [cLat, cLng] = str.split(",").map((s) => parseFloat(s.trim()));
    return {
      raw: str,
      cleanAddress: `GPS Location (${cLat.toFixed(6)}, ${cLng.toFixed(6)})`,
      hasCoordinates: true,
      latitude: cLat,
      longitude: cLng,
      directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${cLat},${cLng}`,
      viewUrl: `https://www.google.com/maps/search/?api=1&query=${cLat},${cLng}`,
    };
  }

  // Plain address text without explicit GPS coordinates
  const encoded = encodeURIComponent(str);
  return {
    raw: str,
    cleanAddress: str,
    hasCoordinates: false,
    latitude: null,
    longitude: null,
    // Google Maps direction endpoint sets destination to address query
    directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encoded}`,
    viewUrl: `https://www.google.com/maps/search/?api=1&query=${encoded}`,
  };
};

/**
 * Normalizes an address string for comparison (removes GPS tags, punctuation, case-insensitive)
 * @param {string} addr 
 * @returns {string}
 */
export const normalizeAddressKey = (addr = "") => {
  const parsed = parseLocationFromAddress(addr);
  return parsed.cleanAddress
    .toLowerCase()
    .replace(/[,\-_.\/#]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

/**
 * Checks if two addresses refer to the exact same delivery spot
 * (either by identical address text or by close GPS proximity)
 * @param {string} addr1 
 * @param {string} addr2 
 * @returns {boolean}
 */
export const isSameLocation = (addr1, addr2) => {
  if (!addr1 || !addr2) return false;
  if (addr1.trim() === addr2.trim()) return true;

  const key1 = normalizeAddressKey(addr1);
  const key2 = normalizeAddressKey(addr2);
  if (key1 === key2) return true;

  const p1 = parseLocationFromAddress(addr1);
  const p2 = parseLocationFromAddress(addr2);

  // If both have GPS coordinates, check if they are within ~200 meters (~0.002 degrees)
  if (p1.hasCoordinates && p2.hasCoordinates) {
    const latDiff = Math.abs(p1.latitude - p2.latitude);
    const lngDiff = Math.abs(p1.longitude - p2.longitude);
    if (latDiff < 0.0025 && lngDiff < 0.0025) {
      return true;
    }
  }

  return false;
};

/**
 * Deduplicate an array of address strings, ensuring no two identical
 * or GPS-duplicate locations are listed twice.
 * @param {string[]} addressList 
 * @returns {string[]}
 */
export const deduplicateAddresses = (addressList = []) => {
  if (!Array.isArray(addressList)) return [];

  const result = [];
  for (const item of addressList) {
    if (!item || typeof item !== "string" || !item.trim()) continue;
    const trimmed = item.trim();

    // Check if an existing item in result is already the same location
    const existingIdx = result.findIndex((existing) => isSameLocation(existing, trimmed));

    if (existingIdx === -1) {
      result.push(trimmed);
    } else {
      // If the incoming item has GPS coordinates and the existing does not, upgrade it
      const existingParsed = parseLocationFromAddress(result[existingIdx]);
      const incomingParsed = parseLocationFromAddress(trimmed);
      if (!existingParsed.hasCoordinates && incomingParsed.hasCoordinates) {
        result[existingIdx] = trimmed;
      }
    }
  }
  return result;
};


