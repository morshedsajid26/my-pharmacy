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
    const addUnique = (val) => {
      if (!val || typeof val !== "string") return;
      const clean = val.trim();
      if (!clean) return;
      const lower = clean.toLowerCase();
      // Skip broad country/division labels
      if (lower === "bangladesh" || lower.includes("division") || lower.includes("বিভাগ")) return;
      // Avoid exact or substring duplicates
      const alreadyIncluded = parts.some(
        (existing) =>
          existing.toLowerCase() === lower ||
          existing.toLowerCase().includes(lower) ||
          lower.includes(existing.toLowerCase())
      );
      if (!alreadyIncluded) {
        parts.push(clean);
      }
    };

    // 1. Specific POI / House / Building / Road
    const houseNo = addr.house_number || addr.house_name || "";
    const building = addr.building || addr.shop || addr.amenity || addr.office || addr.commercial || "";
    let road = addr.road || addr.pedestrian || addr.street || addr.footway || addr.path || "";

    // If Nominatim didn't return a road/street name, try Photon reverse geocoder to snap to nearest street
    if (!road) {
      try {
        const photonRes = await fetch(
          `https://photon.komoot.io/reverse?lon=${lon}&lat=${lat}&limit=3`
        );
        if (photonRes.ok) {
          const photonData = await photonRes.json();
          const features = photonData?.features || [];
          for (const f of features) {
            const p = f?.properties || {};
            if (p.street) {
              road = p.street;
              break;
            }
            if (p.name && (p.osm_key === "highway" || p.type === "street")) {
              road = p.name;
              break;
            }
          }
        }
      } catch (_) {
        // Ignore Photon fallback error silently
      }
    }

    if (data.name) addUnique(data.name);
    if (houseNo) addUnique(houseNo);
    if (building) addUnique(building);
    if (road) addUnique(road);

    // 2. Section / Block / Neighbourhood / Village (Gram)
    const sectionOrVill = [
      addr.neighbourhood,
      addr.quarter,
      addr.residential,
      addr.hamlet,
      addr.village,
      addr.isolated_dwelling,
      addr.locality,
    ];
    sectionOrVill.forEach(addUnique);

    // 3. Area / Suburb / Thana / Upazila / Municipality
    const areaOrUpazila = [
      addr.suburb,
      addr.borough,
      addr.city_district,
      addr.subdistrict,
      addr.town,
      addr.municipality,
      addr.county,
    ];
    areaOrUpazila.forEach(addUnique);

    // 4. City / Zila (District)
    const cityOrZila = [addr.city, addr.state_district];
    cityOrZila.forEach(addUnique);

    // 5. Fallback enrichment from display_name if road/section/village was missed
    if (parts.length <= 3 && data.display_name) {
      const displayParts = data.display_name
        .split(",")
        .map((p) => p.trim())
        .filter((p) => {
          const l = p.toLowerCase();
          return (
            p &&
            l !== "bangladesh" &&
            !l.includes("division") &&
            !l.includes("বিভাগ") &&
            !/^\d{4}$/.test(p)
          );
        });
      displayParts.forEach(addUnique);
    }

    // 6. Postal code at the end
    if (addr.postcode) addUnique(addr.postcode);

    const formatted = parts.filter(Boolean).join(", ");
    const primaryArea =
      addr.neighbourhood ||
      addr.quarter ||
      addr.village ||
      addr.suburb ||
      addr.subdistrict ||
      addr.county ||
      "";
    const primaryCity = addr.city || addr.town || addr.state_district || addr.county || "";

    const readable = (formatted && formatted.length > 5)
      ? formatted
      : `GPS Location (${lat}, ${lon})`;

    return {
      readable,
      houseNumber: houseNo,
      road: road,
      area: primaryArea || primaryCity,
      city: primaryCity,
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

/**
 * Calculate great-circle distance in kilometers between two GPS coordinates using the Haversine formula.
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number|null} Distance in km, or null if coordinates are invalid
 */
export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const nLat1 = Number(lat1);
  const nLon1 = Number(lon1);
  const nLat2 = Number(lat2);
  const nLon2 = Number(lon2);

  if (
    lat1 === null || lat1 === undefined || lat1 === "" ||
    lon1 === null || lon1 === undefined || lon1 === "" ||
    lat2 === null || lat2 === undefined || lat2 === "" ||
    lon2 === null || lon2 === undefined || lon2 === "" ||
    Number.isNaN(nLat1) || Number.isNaN(nLon1) || Number.isNaN(nLat2) || Number.isNaN(nLon2)
  ) {
    return null;
  }

  const R = 6371; // Earth radius in km
  const dLat = ((nLat2 - nLat1) * Math.PI) / 180;
  const dLon = ((nLon2 - nLon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((nLat1 * Math.PI) / 180) *
      Math.cos((nLat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};



