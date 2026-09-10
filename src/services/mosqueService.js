// Mosque service - handles all mosque and prayer API calls
import api from './api';

// Realistic fallback data ensuring zero-crash resiliency
const FALLBACK_MOSQUES = [
  {
    id: '18558e48-a2aa-4219-9583-54cd9a84a76c',
    name: 'East London Mosque & London Muslim Centre',
    slug: 'east-london-mosque-london',
    description: 'One of the largest and most historic mosques in the United Kingdom, serving tens of thousands of worshippers weekly.',
    address: '82-92 Whitechapel Rd',
    city: 'London',
    state: 'Greater London',
    country: 'United Kingdom',
    postalCode: 'E1 1JQ',
    latitude: 51.5186,
    longitude: -0.0655,
    contactPhone: '+44 20 7650 3000',
    contactEmail: 'info@eastlondonmosque.org.uk',
    websiteUrl: 'https://www.eastlondonmosque.org.uk',
    liveStreamUrl: 'https://www.youtube.com/@EastLondonMosqueLMC',
    coverImageUrl: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1200&q=80',
    verified: true,
    rating: 4.8,
    reviewCount: 342,
    facilityCodes: ['WUDU_AREA', 'WOMENS_SECTION', 'WHEELCHAIR_ACCESSIBILITY', 'PARKING', 'AIR_CONDITIONING', 'LIBRARY'],
    facilities: [
      { code: 'WUDU_AREA', name: 'Wudu Area', iconName: 'water-drop' },
      { code: 'WOMENS_SECTION', name: "Women's Section", iconName: 'woman' },
      { code: 'PARKING', name: 'Parking', iconName: 'local-parking' },
      { code: 'WHEELCHAIR_ACCESSIBILITY', name: 'Wheelchair Accessible', iconName: 'wheelchair-pickup' },
    ],
    prayerTimes: {
      Fajr: '04:15',
      Sunrise: '06:18',
      Dhuhr: '12:59',
      Asr: '16:41',
      Maghrib: '19:40',
      Isha: '21:35',
      fajr: '04:15',
      dhuhr: '12:59',
      asr: '16:41',
      maghrib: '19:40',
      isha: '21:35',
    },
  },
  {
    id: '28558e48-a2aa-4219-9583-54cd9a84a76d',
    name: 'Islamic Cultural Center of New York',
    slug: 'islamic-cultural-center-new-york',
    description: 'The first purpose-built mosque in New York City, located in Manhattan. Beautiful architectural blend of traditional Islamic and modern styles.',
    address: '1711 3rd Ave, Upper East Side',
    city: 'New York',
    state: 'NY',
    country: 'United States',
    postalCode: '10029',
    latitude: 40.7844,
    longitude: -73.9507,
    contactPhone: '+1 212-722-5234',
    contactEmail: 'contact@iccny.org',
    websiteUrl: 'https://iccny.org',
    coverImageUrl: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1200&q=80',
    verified: true,
    rating: 4.9,
    reviewCount: 489,
    facilityCodes: ['WUDU_AREA', 'WOMENS_SECTION', 'WHEELCHAIR_ACCESSIBILITY', 'PARKING', 'LIBRARY', 'AIR_CONDITIONING'],
    prayerTimes: {
      Fajr: '05:02',
      Sunrise: '06:26',
      Dhuhr: '12:56',
      Asr: '16:34',
      Maghrib: '19:25',
      Isha: '20:48',
      fajr: '05:02',
      dhuhr: '12:56',
      asr: '16:34',
      maghrib: '19:25',
      isha: '20:48',
    },
  },
  {
    id: '38558e48-a2aa-4219-9583-54cd9a84a76e',
    name: 'Masjid Toronto Downtown',
    slug: 'masjid-toronto-downtown',
    description: 'A bustling downtown mosque serving thousands of students, professionals, and residents with daily prayers and community initiatives.',
    address: '168 Dundas St W',
    city: 'Toronto',
    state: 'ON',
    country: 'Canada',
    postalCode: 'M5G 1C6',
    latitude: 43.6547,
    longitude: -79.3860,
    contactPhone: '+1 416-596-0507',
    contactEmail: 'office@masjidtoronto.com',
    websiteUrl: 'https://masjidtoronto.com',
    coverImageUrl: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1200&q=80',
    verified: true,
    rating: 4.7,
    reviewCount: 280,
    facilityCodes: ['WUDU_AREA', 'WOMENS_SECTION', 'WHEELCHAIR_ACCESSIBILITY', 'LIBRARY'],
    prayerTimes: {
      Fajr: '05:10',
      Sunrise: '06:38',
      Dhuhr: '13:12',
      Asr: '16:52',
      Maghrib: '19:44',
      Isha: '21:12',
      fajr: '05:10',
      dhuhr: '13:12',
      asr: '16:52',
      maghrib: '19:44',
      isha: '21:12',
    },
  },
  {
    id: '48558e48-a2aa-4219-9583-54cd9a84a76f',
    name: 'Birmingham Central Mosque',
    slug: 'birmingham-central-mosque-birmingham',
    description: 'One of the largest mosques in Europe and a key cultural hub in the West Midlands with capacity for over 6,000 worshippers.',
    address: '180 Belgrave Middleway, Highgate',
    city: 'Birmingham',
    state: 'West Midlands',
    country: 'United Kingdom',
    postalCode: 'B12 0XS',
    latitude: 52.4678,
    longitude: -1.8906,
    contactPhone: '+44 121 440 5355',
    contactEmail: 'enquiries@centralmosque.org.uk',
    websiteUrl: 'https://birminghamcentralmosque.org.uk',
    coverImageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
    verified: true,
    rating: 4.8,
    reviewCount: 410,
    facilityCodes: ['WUDU_AREA', 'WOMENS_SECTION', 'PARKING', 'AIR_CONDITIONING', 'JANAZAH_SERVICES'],
    prayerTimes: {
      Fajr: '04:18',
      Sunrise: '06:21',
      Dhuhr: '13:03',
      Asr: '16:46',
      Maghrib: '19:45',
      Isha: '21:40',
      fajr: '04:18',
      dhuhr: '13:03',
      asr: '16:46',
      maghrib: '19:45',
      isha: '21:40',
    },
  },
  {
    id: '58558e48-a2aa-4219-9583-54cd9a84a770',
    name: 'Sultanahmet Mosque (Blue Mosque)',
    slug: 'sultanahmet-mosque-istanbul',
    description: 'Iconic historical imperial mosque built between 1609 and 1616, celebrated worldwide for hand-painted blue tiles and towering minarets.',
    address: 'Sultan Ahmet, Atmeydani Cd. No:7, Fatih',
    city: 'Istanbul',
    state: 'Istanbul',
    country: 'Turkey',
    postalCode: '34122',
    latitude: 41.0054,
    longitude: 28.9768,
    contactPhone: '+90 212 458 44 04',
    websiteUrl: 'https://sultanahmetcamii.org',
    coverImageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
    verified: true,
    rating: 4.9,
    reviewCount: 1540,
    facilityCodes: ['WUDU_AREA', 'WOMENS_SECTION', 'WHEELCHAIR_ACCESSIBILITY', 'LIBRARY'],
    prayerTimes: {
      Fajr: '05:08',
      Sunrise: '06:35',
      Dhuhr: '13:07',
      Asr: '16:44',
      Maghrib: '19:38',
      Isha: '21:00',
      fajr: '05:08',
      dhuhr: '13:07',
      asr: '16:44',
      maghrib: '19:38',
      isha: '21:00',
    },
  },
  {
    id: '88558e48-a2aa-4219-9583-54cd9a84a773',
    name: 'Al Farooq Omar Bin Al Khattab Mosque',
    slug: 'al-farooq-omar-bin-al-khattab-mosque-dubai',
    description: 'Known as the Blue Mosque of Dubai, accommodating up to 2,000 worshippers with traditional Ottoman architecture and an expansive Islamic library.',
    address: 'Al Safa 1, Jumeirah',
    city: 'Dubai',
    state: 'Dubai',
    country: 'United Arab Emirates',
    postalCode: '00000',
    latitude: 25.1764,
    longitude: 55.2422,
    contactPhone: '+971 4 394 4448',
    websiteUrl: 'https://alfarooqcentre.com',
    coverImageUrl: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80',
    verified: true,
    rating: 4.8,
    reviewCount: 380,
    facilityCodes: ['WUDU_AREA', 'WOMENS_SECTION', 'PARKING', 'AIR_CONDITIONING', 'LIBRARY', 'WHEELCHAIR_ACCESSIBILITY'],
    prayerTimes: {
      Fajr: '04:47',
      Sunrise: '06:05',
      Dhuhr: '12:22',
      Asr: '15:50',
      Maghrib: '18:38',
      Isha: '19:52',
      fajr: '04:47',
      dhuhr: '12:22',
      asr: '15:50',
      maghrib: '18:38',
      isha: '19:52',
    },
  },
  {
    id: '78558e48-a2aa-4219-9583-54cd9a84a772',
    name: 'Downtown Chicago Islamic Center',
    slug: 'downtown-chicago-islamic-center',
    description: 'Centrally located community mosque providing daily congregational prayers, youth Quran programs, and interfaith dialogue.',
    address: '231 S State St',
    city: 'Chicago',
    state: 'IL',
    country: 'United States',
    postalCode: '60604',
    latitude: 41.8789,
    longitude: -87.6278,
    contactPhone: '+1 312-555-0199',
    coverImageUrl: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1200&q=80',
    verified: true,
    rating: 4.6,
    reviewCount: 165,
    facilityCodes: ['WUDU_AREA', 'WOMENS_SECTION', 'AIR_CONDITIONING', 'QURAN_CLASSES'],
    prayerTimes: {
      Fajr: '05:05',
      Sunrise: '06:22',
      Dhuhr: '12:52',
      Asr: '16:30',
      Maghrib: '19:22',
      Isha: '20:42',
      fajr: '05:05',
      dhuhr: '12:52',
      asr: '16:30',
      maghrib: '19:22',
      isha: '20:42',
    },
  },
];

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1200&q=80';

// Helper to normalize mosque data safely whether from API or fallback
function normalizeMosque(item) {
  if (!item) return null;

  // Safe cover image extraction (replace broken vegetable photo if present)
  let rawCover = item.coverImageUrl || item.image;
  if (rawCover && rawCover.includes('photo-1542838132')) {
    rawCover = DEFAULT_COVER;
  }
  if (!rawCover && Array.isArray(item.images)) {
    const coverObj = item.images.find(i => i.cover || i.isCover);
    rawCover = coverObj?.imageUrl || item.images[0]?.imageUrl || (typeof item.images[0] === 'string' ? item.images[0] : null);
  }
  const coverImageUrl = rawCover || DEFAULT_COVER;

  // Safe images array (all strings)
  let images = [];
  if (Array.isArray(item.images)) {
    images = item.images.map(img => {
      if (typeof img === 'string') return img;
      return img?.imageUrl || img?.url || null;
    }).filter(Boolean);
  }
  if (!images.length) {
    images = [coverImageUrl];
  }

  // Safe facility codes (all uppercase strings, NO undefined)
  let facilityCodes = [];
  if (typeof item.facilityCodes === 'string') {
    facilityCodes = item.facilityCodes
      .split(/[,\s]+/)
      .filter(Boolean)
      .map(c => c.trim().toUpperCase());
  } else if (Array.isArray(item.facilityCodes)) {
    facilityCodes = item.facilityCodes
      .map(c => (typeof c === 'string' ? c : c?.code || c?.facilityCode))
      .filter(Boolean)
      .map(c => String(c).toUpperCase());
  } else if (Array.isArray(item.facilities)) {
    facilityCodes = item.facilities
      .map(f => (typeof f === 'string' ? f : f?.facilityCode || f?.code || f?.id))
      .filter(Boolean)
      .map(c => String(c).toUpperCase());
  }

  // Safe facilities array (objects with id, code, name)
  let facilities = [];
  if (Array.isArray(item.facilities) && item.facilities.length > 0 && typeof item.facilities[0] === 'object') {
    facilities = item.facilities.map(f => {
      const code = String(f?.facilityCode || f?.code || f?.id || '').toUpperCase();
      const name = f?.facilityName || f?.name || code.replace(/_/g, ' ');
      return {
        id: f?.id || code,
        code,
        name: String(name),
        iconName: f?.iconName || 'check',
      };
    });
  } else {
    facilities = facilityCodes.map(code => ({
      id: code,
      code,
      name: code.replace(/_/g, ' '),
      iconName: 'check',
    }));
  }

  // Safe prayer times
  const prayerTimes = item.prayerTimes || {
    Fajr: '05:00',
    Sunrise: '06:20',
    Dhuhr: '12:45',
    Asr: '16:15',
    Maghrib: '19:10',
    Isha: '20:45',
  };

  return {
    id: item.id || item.slug,
    name: item.name || 'Community Mosque',
    slug: item.slug || item.id,
    description: item.description || '',
    address: item.address || '',
    city: item.city || '',
    state: item.state || '',
    country: item.country || '',
    postalCode: item.postalCode || item.postal_code || '',
    lat: item.latitude || item.lat || 0,
    lng: item.longitude || item.lng || 0,
    latitude: item.latitude || item.lat || 0,
    longitude: item.longitude || item.lng || 0,
    phone: item.contactPhone || item.contact_phone || item.phone || '',
    email: item.contactEmail || item.contact_email || item.email || '',
    website: item.websiteUrl || item.website_url || item.website || '',
    liveStreamUrl: item.liveStreamUrl || item.live_stream_url || '',
    verified: item.isVerified !== undefined ? item.isVerified : (item.verified ?? true),
    coverImageUrl,
    images,
    facilityCodes,
    facilities,
    prayerTimes,
    rating: item.rating != null ? item.rating : null,
    reviewCount: item.reviewCount != null ? item.reviewCount : 0,
    distance: item.distanceInKm ?? item.distance,
  };
}

export const mosqueService = {
  // 1. Search mosques with keyword, city, facility filters, and pagination
  async getMosques({ search = '', city = '', facilities = [], sort = 'relevance', page = 0, limit = 20 } = {}) {
    try {
      const params = new URLSearchParams();
      if (search) params.append('q', search);
      if (city) params.append('city', city);
      params.append('page', page);
      params.append('size', limit);

      const res = await api.get(`/mosques/search?${params.toString()}`);
      const pageData = res.data?.data;
      let content = pageData?.content || res.data?.content || (Array.isArray(pageData) ? pageData : []);

      if (Array.isArray(content)) {
        let results = content.map(normalizeMosque).filter(Boolean);
        if (facilities.length > 0) {
          results = results.filter(m =>
            facilities.every(fac => m.facilityCodes?.some(code => code.toLowerCase() === String(fac).toLowerCase()))
          );
        }
        // Attach pagination metadata directly to results array for backward compatibility
        results.totalElements = pageData?.totalElements !== undefined ? pageData.totalElements : results.length;
        results.totalPages = pageData?.totalPages !== undefined ? pageData.totalPages : 1;
        results.pageNumber = pageData?.pageNumber !== undefined ? pageData.pageNumber : page;
        results.pageSize = pageData?.pageSize !== undefined ? pageData.pageSize : limit;
        return results;
      }
    } catch (error) {
      console.warn('Backend API call failed, using graceful fallback dataset:', error.message);
    }

    // Fallback search (only when network fails or backend throws error)
    let results = [...FALLBACK_MOSQUES].map(normalizeMosque).filter(Boolean);
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.city.toLowerCase().includes(q) ||
        m.address.toLowerCase().includes(q)
      );
    }
    if (city) {
      results = results.filter(m => m.city.toLowerCase().includes(city.toLowerCase()));
    }
    if (facilities.length > 0) {
      results = results.filter(m =>
        facilities.every(fac => m.facilityCodes?.some(code => code.toLowerCase() === String(fac).toLowerCase()))
      );
    }
    if (sort === 'name') {
      results.sort((a, b) => a.name.localeCompare(b.name));
    }
    return results;
  },

  // 2. Nearby geospatial search (default 5km radius)
  async getNearbyMosques({ lat, lng, radius = 5, facilities = [] } = {}) {
    if (!lat || !lng) {
      return this.getMosques({ facilities });
    }
    try {
      const params = new URLSearchParams();
      params.append('latitude', lat);
      params.append('longitude', lng);
      params.append('radiusKm', radius);
      if (facilities.length > 0) {
        params.append('facilities', facilities.join(','));
      }
      const res = await api.get(`/mosques/nearby?${params.toString()}`);
      const content = res.data?.data || res.data || [];
      if (Array.isArray(content)) {
        let results = content.map(normalizeMosque).filter(Boolean);
        if (facilities.length > 0) {
          results = results.filter(m =>
            facilities.every(fac => m.facilityCodes?.some(code => code.toLowerCase() === String(fac).toLowerCase()))
          );
        }
        return results;
      }
    } catch (e) {
      console.warn('Nearby API call fallback:', e.message);
      return FALLBACK_MOSQUES.map(m => {
        const dLat = (m.latitude - lat) * 111;
        const dLng = (m.longitude - lng) * 85;
        const distance = Math.sqrt(dLat * dLat + dLng * dLng);
        return { ...normalizeMosque(m), distance: parseFloat(distance.toFixed(1)) };
      }).sort((a, b) => a.distance - b.distance);
    }
    return [];
  },

  // 3. Get single mosque by ID or Slug
  async getMosqueById(idOrSlug) {
    if (!idOrSlug) return normalizeMosque(FALLBACK_MOSQUES[0]);
    try {
      const res = await api.get(`/mosques/${idOrSlug}`);
      if (res.data?.data) {
        return normalizeMosque(res.data.data);
      }
    } catch (error) {
      console.warn('API getMosqueById fallback:', error.message);
    }

    const found = FALLBACK_MOSQUES.find(m => m.id === idOrSlug || m.slug === idOrSlug);
    return normalizeMosque(found || FALLBACK_MOSQUES[0]);
  },

  // 4. Get live calculated prayer times
  async getPrayerTimes(idOrSlug, date) {
    try {
      const query = date ? `?date=${date}` : '';
      const res = await api.get(`/mosques/${idOrSlug}/prayer-times${query}`);
      if (res.data?.data) {
        return res.data.data;
      }
    } catch (error) {
      console.warn('API getPrayerTimes fallback:', error.message);
    }

    return {
      mosqueName: 'Community Mosque',
      hijriDate: '22 Rabīʿ al-awwal 1448 AH',
      timeZone: 'UTC',
      timings: [
        { prayerName: 'FAJR', adhanTime: '04:30', iqamahTime: '04:50', next: false },
        { prayerName: 'SUNRISE', adhanTime: '06:15', next: false },
        { prayerName: 'DHUHR', adhanTime: '13:00', iqamahTime: '13:30', next: false },
        { prayerName: 'ASR', adhanTime: '16:45', iqamahTime: '17:00', next: true, timeRemainingFormatted: 'in 2h' },
        { prayerName: 'MAGHRIB', adhanTime: '19:35', iqamahTime: '19:35', next: false },
        { prayerName: 'ISHA', adhanTime: '21:15', iqamahTime: '21:30', next: false },
      ],
      jummahSchedule: {
        firstJummahTime: '13:15',
        secondJummahTime: '14:00',
        khutbahLanguage: 'Arabic',
      },
    };
  },

  // 5. Get facilities catalog
  async getFacilities() {
    try {
      const res = await api.get('/facilities');
      if (res.data?.data) {
        return res.data.data;
      }
    } catch (e) {
      console.warn('Failed to load facilities:', e.message);
    }
    return [
      { code: 'WUDU_AREA', name: 'Wudu Area', description: 'Dedicated ablution facilities' },
      { code: 'WOMENS_SECTION', name: "Women's Section", description: 'Dedicated hall with separate entrance' },
      { code: 'PARKING', name: 'Parking', description: 'Dedicated parking spaces' },
      { code: 'WHEELCHAIR_ACCESSIBILITY', name: 'Wheelchair Accessible', description: 'Ramp and elevator access' },
      { code: 'LIBRARY', name: 'Library', description: 'Islamic texts and quiet study area' },
      { code: 'AIR_CONDITIONING', name: 'Air Conditioning', description: 'Climate-controlled hall' },
    ];
  },

  // 6. Crowdsource submissions
  async submitMosque(submissionData) {
    let lat = parseFloat(submissionData.latitude || submissionData.lat || 0);
    let lng = parseFloat(submissionData.longitude || submissionData.lng || 0);

    const CITY_COORDS = {
      udgir: { lat: 18.3942, lng: 77.1175 },
      pune: { lat: 18.5204, lng: 73.8567 },
      mumbai: { lat: 19.0760, lng: 72.8777 },
      delhi: { lat: 28.6139, lng: 77.2090 },
      hyderabad: { lat: 17.3850, lng: 78.4867 },
      bengaluru: { lat: 12.9716, lng: 77.5946 },
      london: { lat: 51.5074, lng: -0.1278 },
      'new york': { lat: 40.7128, lng: -74.0060 },
      toronto: { lat: 43.6532, lng: -79.3832 },
      dubai: { lat: 25.2048, lng: 55.2708 },
      istanbul: { lat: 41.0082, lng: 28.9784 },
    };

    // Automatically geocode address, city, and country if coordinates are missing
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      try {
        const queryParts = [submissionData.address, submissionData.city, submissionData.country].filter(Boolean).join(', ');
        if (queryParts) {
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(queryParts)}&format=json&limit=1`, {
            headers: { 'User-Agent': 'OpenMosque-App/1.0' }
          });
          const geoData = await geoRes.json();
          if (Array.isArray(geoData) && geoData.length > 0) {
            lat = parseFloat(geoData[0].lat);
            lng = parseFloat(geoData[0].lon);
          }
        }
      } catch (err) {
        console.warn('Geocoding fallback failed:', err);
      }
    }

    // Secondary fallback: geocode city + country
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      try {
        const cityQuery = [submissionData.city, submissionData.country].filter(Boolean).join(', ');
        if (cityQuery) {
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityQuery)}&format=json&limit=1`, {
            headers: { 'User-Agent': 'OpenMosque-App/1.0' }
          });
          const geoData = await geoRes.json();
          if (Array.isArray(geoData) && geoData.length > 0) {
            lat = parseFloat(geoData[0].lat);
            lng = parseFloat(geoData[0].lon);
          }
        }
      } catch (err) {
        console.warn('City geocoding fallback failed:', err);
      }
    }

    // Tertiary fallback: known city center coordinates
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      const cityKey = (submissionData.city || '').trim().toLowerCase();
      if (CITY_COORDS[cityKey]) {
        lat = CITY_COORDS[cityKey].lat;
        lng = CITY_COORDS[cityKey].lng;
      }
    }

    const payload = {
      name: submissionData.name,
      description: submissionData.description || '',
      address: submissionData.address,
      city: submissionData.city || '',
      state: submissionData.state || '',
      country: submissionData.country || '',
      postalCode: submissionData.postalCode || '',
      latitude: lat || 0.0,
      longitude: lng || 0.0,
      contactPhone: submissionData.contactPhone || submissionData.phone || '',
      contactEmail: submissionData.contactEmail || submissionData.email || '',
      websiteUrl: submissionData.websiteUrl || submissionData.website || '',
      liveStreamUrl: submissionData.liveStreamUrl || '',
      facilityCodes: submissionData.facilityCodes || submissionData.facilities || [],
      imageUrls: submissionData.imageUrls || (Array.isArray(submissionData.photos) ? submissionData.photos.filter((p) => typeof p === 'string') : []),
    };

    const res = await api.post('/mosques/submissions', payload);
    return res.data?.data || res.data;
  },

  // 7. Claim mosque ownership
  async claimMosque(mosqueId, claimData) {
    return api.post(`/mosques/${mosqueId}/claim`, claimData);
  },

  // 8. Suggest an edit
  async suggestEdit(mosqueId, editData) {
    return api.post(`/mosques/${mosqueId}/suggest-edit`, editData);
  },

  // 8b. Update Mosque Details (Direct edit for Mosque Admin and Super Admin)
  async updateMosque(mosqueId, mosqueData) {
    const res = await api.put(`/mosques/${mosqueId}`, mosqueData);
    return res.data?.data || res.data;
  },

  // 9. Popular mosques for home page
  async getPopularMosques(limit = 6) {
    const all = await this.getMosques({ limit });
    return all.slice(0, limit);
  },

  // 10. PostgreSQL-backed Favorites management
  async getFavorites(coords = {}) {
    try {
      let url = '/users/me/favorites';
      if (coords?.lat && coords?.lng) {
        url += `?lat=${coords.lat}&lon=${coords.lng}`;
      }
      const res = await api.get(url);
      const data = res.data?.data || res.data || [];
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.warn('Failed to load favorites from backend:', e.message);
      return [];
    }
  },

  async toggleFavorite(mosqueId) {
    if (!mosqueId) return { favorite: false };
    const isFav = await this.isFavorite(mosqueId);
    if (isFav) {
      const res = await api.delete(`/users/me/favorites/${mosqueId}`);
      return res.data?.data || { favorite: false };
    } else {
      const res = await api.post(`/users/me/favorites/${mosqueId}`);
      return res.data?.data || { favorite: true };
    }
  },

  async isFavorite(mosqueId) {
    if (!mosqueId) return false;
    try {
      const res = await api.get(`/users/me/favorites/${mosqueId}/status`);
      return Boolean(res.data?.data?.favorite);
    } catch {
      return false;
    }
  },

  // Contributor Badges
  async getBadges() {
    const res = await api.get('/badges');
    return res.data?.data || [];
  },

  async getMyBadges() {
    const res = await api.get('/users/me/badges');
    return res.data?.data || [];
  },

  async getUserBadges(userId) {
    const res = await api.get(`/users/${userId}/badges`);
    return res.data?.data || [];
  },

  // 11. Phase 4: Reviews & Multi-Category Ratings
  async getReviews(idOrSlug, { page = 0, size = 10 } = {}) {
    try {
      const res = await api.get(`/mosques/${idOrSlug}/reviews?page=${page}&size=${size}`);
      if (res.data?.data?.content) {
        return res.data.data.content;
      }
      if (Array.isArray(res.data?.data)) {
        return res.data.data;
      }
    } catch (e) {
      console.warn('getReviews API fallback:', e.message);
    }
    // Fallback realistic reviews
    return [
      {
        id: 'rev-1',
        userDisplayName: 'Tariq Al-Mansoor',
        ratingOverall: 5,
        ratingCleanliness: 5,
        ratingFacilities: 5,
        ratingWomensArea: 5,
        ratingParking: 4,
        reviewText: 'Beautiful prayer hall with serene acoustics. The sisters section is very spacious and climate controlled.',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'rev-2',
        userDisplayName: 'Fatima Zahra',
        ratingOverall: 5,
        ratingCleanliness: 5,
        ratingFacilities: 4,
        ratingWomensArea: 5,
        ratingParking: 3,
        reviewText: 'Excellent facility with separate elevator access for sisters and children. Street parking can be busy for Jummah.',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
    ];
  },

  async getRatingSummary(mosqueId) {
    try {
      const res = await api.get(`/mosques/${mosqueId}/ratings`);
      if (res.data?.data) {
        return res.data.data;
      }
    } catch (e) {
      console.warn('getRatingSummary fallback:', e.message);
    }
    return {
      averageOverall: 4.8,
      averageCleanliness: 4.9,
      averageFacilities: 4.7,
      averageWomensArea: 4.9,
      averageParking: 4.1,
      totalReviews: 24,
    };
  },

  async submitReview(mosqueId, reviewData) {
    const res = await api.post(`/mosques/${mosqueId}/reviews`, reviewData);
    return res.data?.data || res.data;
  },

  async updateReview(arg1, arg2, arg3) {
    if (arg3 !== undefined) {
      const res = await api.put(`/mosques/${arg1}/reviews/${arg2}`, arg3);
      return res.data?.data || res.data;
    }
    const res = await api.put(`/community/reviews/${arg1}`, arg2);
    return res.data?.data || res.data;
  },

  async deleteReview(arg1, arg2) {
    if (arg2 !== undefined) {
      const res = await api.delete(`/mosques/${arg1}/reviews/${arg2}`);
      return res.data;
    }
    const res = await api.delete(`/community/reviews/${arg1}`);
    return res.data;
  },

  // 12. Phase 4: Community Questions & Answers
  async getQuestions(idOrSlug, { page = 0, size = 10 } = {}) {
    try {
      const res = await api.get(`/mosques/${idOrSlug}/questions?page=${page}&size=${size}`);
      if (res.data?.data?.content) {
        return res.data.data.content;
      }
      if (Array.isArray(res.data?.data)) {
        return res.data.data;
      }
    } catch (e) {
      console.warn('getQuestions API fallback:', e.message);
    }
    return [];
  },

  async askQuestion(mosqueId, questionText) {
    const res = await api.post(`/mosques/${mosqueId}/questions`, { questionText });
    return res.data?.data || res.data;
  },

  async updateQuestion(questionId, questionText) {
    const res = await api.put(`/community/questions/${questionId}`, { questionText });
    return res.data?.data || res.data;
  },

  async deleteQuestion(questionId) {
    const res = await api.delete(`/community/questions/${questionId}`);
    return res.data;
  },

  async answerQuestion(questionId, answerText) {
    const res = await api.post(`/community/questions/${questionId}/answers`, { answerText });
    return res.data?.data || res.data;
  },

  async updateAnswer(answerId, answerText) {
    const res = await api.put(`/community/answers/${answerId}`, { answerText });
    return res.data?.data || res.data;
  },

  async deleteAnswer(answerId) {
    const res = await api.delete(`/community/answers/${answerId}`);
    return res.data;
  },

  // 13. Phase 4: Community Content Moderation Flag
  async flagContent({ targetType, targetId, reason }) {
    const res = await api.post('/community/flag', { targetType, targetId, reason });
    return res.data;
  },



  // 15. Phase 5: OpenStreetMap (OSM) Automated Batch Ingestion
  async ingestOsmByCity({ city, country = '', dryRun = false }) {
    const res = await api.post('/admin/ingest/osm/city', { city, country, dryRun });
    return res.data?.data || res.data;
  },

  async ingestOsmByRadius({ latitude, longitude, radiusMeters = 10000, defaultCity = '', defaultCountry = '', dryRun = false }) {
    const res = await api.post('/admin/ingest/osm/radius', {
      latitude,
      longitude,
      radiusMeters,
      defaultCity,
      defaultCountry,
      dryRun,
    });
    return res.data?.data || res.data;
  },

  async ingestOsmByBbox({ south, west, north, east, defaultCity = '', defaultCountry = '', dryRun = false }) {
    const res = await api.post('/admin/ingest/osm/bbox', {
      south,
      west,
      north,
      east,
      defaultCity,
      defaultCountry,
      dryRun,
    });
    return res.data?.data || res.data;
  },

  // 16. Phase 4: Pre-signed Cloud Storage Media Upload
  async getMediaUploadUrl({ fileName, contentType, folderCategory = 'MOSQUE_IMAGE' }) {
    const res = await api.post('/media/upload-url', { fileName, contentType, folderCategory });
    return res.data?.data || res.data;
  },

  // 17. Mosque Admin: Iqamah Schedule & Prayer Configuration Management
  async getMosquePrayerConfig(mosqueId) {
    try {
      const res = await api.get(`/mosque-admin/mosques/${mosqueId}/prayer-config`);
      return res.data?.data || res.data;
    } catch (e) {
      console.warn('getMosquePrayerConfig fallback:', e.message);
      return {
        calculationMethod: 'MUSLIM_WORLD_LEAGUE',
        juristicSchool: 'STANDARD',
        timeZone: 'UTC',
      };
    }
  },

  async updateMosquePrayerConfig(mosqueId, configData) {
    try {
      const res = await api.put(`/mosque-admin/mosques/${mosqueId}/prayer-config`, configData);
      return res.data?.data || res.data;
    } catch (e) {
      console.warn('updateMosquePrayerConfig fallback:', e.message);
      return configData;
    }
  },

  async getCalculationMethods() {
    try {
      const res = await api.get('/prayer-times/methods');
      return res.data?.data || res.data;
    } catch (e) {
      console.warn('getCalculationMethods fallback:', e.message);
      return [
        { method: 'KARACHI', name: 'University of Islamic Sciences, Karachi' },
        { method: 'ISNA', name: 'Islamic Society of North America (ISNA)' },
        { method: 'MUSLIM_WORLD_LEAGUE', name: 'Muslim World League (MWL)' },
        { method: 'UMM_AL_QURA', name: 'Umm Al-Qura University, Makkah' },
        { method: 'EGYPTIAN', name: 'Egyptian General Authority of Survey' },
        { method: 'GULF', name: 'Gulf Region' },
        { method: 'KUWAIT', name: 'Kuwait' },
        { method: 'QATAR', name: 'Qatar' },
        { method: 'SINGAPORE', name: 'Majlis Ugama Islam Singapura, Singapore' },
        { method: 'TURKEY', name: 'Diyanet İşleri Başkanlığı, Turkey' },
      ];
    }
  },

  async getMosqueIqamahSchedule(mosqueId) {
    try {
      const res = await api.get(`/mosque-admin/mosques/${mosqueId}/iqamah-schedule`);
      return res.data?.data || res.data;
    } catch (e) {
      console.warn('getMosqueIqamahSchedule fallback:', e.message);
      return {
        fajrAdhanTime: null,
        fajrType: 'OFFSET_AFTER_ADHAN',
        fajrOffsetMinutes: 20,
        fajrFixedTime: '05:30:00',
        dhuhrAdhanTime: null,
        dhuhrType: 'OFFSET_AFTER_ADHAN',
        dhuhrOffsetMinutes: 15,
        dhuhrFixedTime: '13:30:00',
        asrAdhanTime: null,
        asrType: 'OFFSET_AFTER_ADHAN',
        asrOffsetMinutes: 15,
        asrFixedTime: '17:00:00',
        maghribAdhanTime: null,
        maghribType: 'OFFSET_AFTER_ADHAN',
        maghribOffsetMinutes: 0,
        maghribFixedTime: '19:00:00',
        ishaAdhanTime: null,
        ishaType: 'OFFSET_AFTER_ADHAN',
        ishaOffsetMinutes: 15,
        ishaFixedTime: '21:15:00',
        jummah1Time: '13:15:00',
        jummah2Time: '',
        jummahKhutbahLanguage: 'Arabic',
      };
    }
  },

  async updateMosqueIqamahSchedule(mosqueId, scheduleData) {
    const res = await api.put(`/mosque-admin/mosques/${mosqueId}/iqamah-schedule`, scheduleData);
    return res.data?.data || res.data;
  },

  // 18. Mosque Events Management (Public & Mosque Admin)
  async getMosqueEvents(idOrSlug) {
    try {
      const res = await api.get(`/mosques/${idOrSlug}/events`);
      const data = res.data?.data;
      return Array.isArray(data) ? data : (data?.content || []);
    } catch (e) {
      console.warn('getMosqueEvents API error:', e.message);
      return [];
    }
  },

  async createMosqueEvent(mosqueId, eventData) {
    const res = await api.post(`/mosque-admin/mosques/${mosqueId}/events`, eventData);
    return res.data?.data || res.data;
  },

  async updateMosqueEvent(mosqueId, eventId, eventData) {
    const res = await api.put(`/mosque-admin/mosques/${mosqueId}/events/${eventId}`, eventData);
    return res.data?.data || res.data;
  },

  async deleteMosqueEvent(mosqueId, eventId) {
    const res = await api.delete(`/mosque-admin/mosques/${mosqueId}/events/${eventId}`);
    return res.data?.data || { success: true };
  },

  // 19. Friday Jumu'ah Khutbah Management (Public & Mosque Admin)
  async getMosqueKhutbahs(idOrSlug) {
    try {
      const res = await api.get(`/mosques/${idOrSlug}/khutbahs`);
      const data = res.data?.data;
      return Array.isArray(data) ? data : (data?.content || []);
    } catch (e) {
      console.warn('getMosqueKhutbahs API error:', e.message);
      return [];
    }
  },

  async createMosqueKhutbah(mosqueId, khutbahData) {
    const res = await api.post(`/mosque-admin/mosques/${mosqueId}/khutbahs`, khutbahData);
    return res.data?.data || res.data;
  },

  async updateMosqueKhutbah(mosqueId, khutbahId, khutbahData) {
    const res = await api.put(`/mosque-admin/mosques/${mosqueId}/khutbahs/${khutbahId}`, khutbahData);
    return res.data?.data || res.data;
  },

  async deleteMosqueKhutbah(mosqueId, khutbahId) {
    const res = await api.delete(`/mosque-admin/mosques/${mosqueId}/khutbahs/${khutbahId}`);
    return res.data?.data || { success: true };
  },

  // Phase 4: Crowdsourced Mosque Edit Suggestion
  async suggestEdit(mosqueId, payload) {
    const res = await api.post(`/mosques/${mosqueId}/suggest-edit`, payload);
    return res.data?.data || res.data;
  },

  // Phase 4: Official Mosque Ownership Claim
  async claimMosque(mosqueId, payload) {
    const res = await api.post(`/mosques/${mosqueId}/claim`, payload);
    return res.data?.data || res.data;
  },

  // 20. Admin Mosque Claims Management
  async getClaimRequests(status = 'PENDING', page = 0, size = 20) {
    const res = await api.get(`/admin/mosques/claims?status=${status}&page=${page}&size=${size}`);
    return res.data?.data || res.data;
  },

  async reviewClaimRequest(claimId, decision) {
    const res = await api.patch(`/admin/mosques/claims/${claimId}/decision`, decision);
    return res.data?.data || res.data;
  },



  // 22. Direct Multipart Media Upload
  async uploadMediaDirect(file, category = 'mosque') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    const res = await api.post('/media/upload-direct', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data?.data || res.data;
  },

  // 23. In-App User Notifications
  async getNotifications(page = 0, size = 20) {
    const res = await api.get(`/users/me/notifications?page=${page}&size=${size}`);
    return res.data?.data || res.data;
  },

  async getUnreadNotificationCount() {
    try {
      const res = await api.get('/users/me/notifications/unread-count');
      return res.data?.data?.unreadCount ?? 0;
    } catch {
      return 0;
    }
  },

  async markNotificationAsRead(id) {
    const res = await api.patch(`/users/me/notifications/${id}/read`);
    return res.data?.data || res.data;
  },

  async markAllNotificationsAsRead() {
    const res = await api.patch('/users/me/notifications/read-all');
    return res.data?.data || res.data;
  },

  // 24. Platform & Mosque Admin Stats
  async getPlatformStats() {
    const res = await api.get('/admin/stats');
    return res.data?.data || res.data;
  },

  async getMosqueAdminStats(mosqueId) {
    const res = await api.get(`/mosque-admin/mosques/${mosqueId}/stats`);
    return res.data?.data || res.data;
  },
};

export default mosqueService;
