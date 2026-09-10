/**
 * OpenMosque - OpenStreetMap (OSM) Importer for Indian Metropolitan Cities
 * 
 * Data Source: OpenStreetMap contributors (ODbL License)
 * Cities Covered: Mumbai, Bengaluru, Hyderabad, Delhi, Lucknow, Pune, Kolkata, etc.
 * Database Target: Neon PostgreSQL (Spatial PostGIS)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const crypto = require('crypto');

const CITIES = [
  { name: 'Hyderabad', state: 'Telangana', bbox: '17.30,78.40,17.48,78.55' },
  { name: 'Mumbai', state: 'Maharashtra', bbox: '18.90,72.78,19.25,73.00' },
  { name: 'Delhi', state: 'Delhi', bbox: '28.52,77.12,28.72,77.30' },
  { name: 'Bengaluru', state: 'Karnataka', bbox: '12.88,77.52,13.04,77.68' },
  { name: 'Pune', state: 'Maharashtra', bbox: '18.44,73.78,18.62,73.96' },
  { name: 'Lucknow', state: 'Uttar Pradesh', bbox: '26.80,80.86,26.94,81.04' },
  { name: 'Ahmedabad', state: 'Gujarat', bbox: '22.96,72.50,23.10,72.66' },
  { name: 'Chennai', state: 'Tamil Nadu', bbox: '12.96,80.16,13.15,80.31' },
  { name: 'Kolkata', state: 'West Bengal', bbox: '22.48,88.28,22.64,88.44' },
];

const OVERPASS_MIRRORS = [
  'overpass-api.de',
  'overpass.kumi.systems',
];

function fetchWithMirror(mirror, postData) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: mirror,
      path: '/api/interpreter',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'OpenMosque-Importer/1.0 (contact@openmosque.com)',
        'Content-Length': Buffer.byteLength(postData),
      },
      timeout: 35000,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
        try {
          const json = JSON.parse(data);
          resolve(json.elements || []);
        } catch {
          reject(new Error(`Invalid JSON`));
        }
      });
    });

    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    req.on('error', (err) => reject(err));
    req.write(postData);
    req.end();
  });
}

function generateSafeSlug(rawName, city, osmId) {
  let clean = rawName
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  if (!clean || clean.length < 2) {
    const numId = osmId.replace(/[^0-9]/g, '');
    clean = `masjid-${numId}`;
  }

  return `${clean}-${city.toLowerCase().replace(/\s+/g, '-')}`;
}

module.exports = {
  CITIES,
  fetchWithMirror,
  generateSafeSlug,
};
