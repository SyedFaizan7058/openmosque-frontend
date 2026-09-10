import { test, expect } from '@playwright/test';

// Validation logic matching backend and frontend domain constraints
function isValidCoordinate(lat, lng) {
  if (lat === null || lat === undefined || lng === null || lng === undefined) return false;
  const numLat = Number(lat);
  const numLng = Number(lng);
  if (isNaN(numLat) || isNaN(numLng)) return false;
  return numLat >= -90 && numLat <= 90 && numLng >= -180 && numLng <= 180;
}

function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

function isValidTimeFormat(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return false;
  const re = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;
  return re.test(timeStr.trim());
}

function validateMosquePayload(payload) {
  const errors = [];
  if (!payload.name || !payload.name.trim()) errors.push('Name is required');
  if (!payload.address || !payload.address.trim()) errors.push('Address is required');
  if (payload.latitude !== undefined && payload.longitude !== undefined) {
    if (!isValidCoordinate(payload.latitude, payload.longitude)) {
      errors.push('Coordinates out of range');
    }
  }
  if (payload.email && !isValidEmail(payload.email)) {
    errors.push('Invalid email format');
  }
  return {
    valid: errors.length === 0,
    errors,
  };
}

test.describe('Unit Tests: Validation and Bounds Checking', () => {
  test('Coordinate bounding validation handles legitimate and out-of-bounds coordinates', () => {
    expect(isValidCoordinate(51.5074, -0.1278)).toBe(true);
    expect(isValidCoordinate(-90, 180)).toBe(true);
    expect(isValidCoordinate(90, -180)).toBe(true);
    expect(isValidCoordinate(0, 0)).toBe(true);

    // Out of bounds
    expect(isValidCoordinate(91, 10)).toBe(false);
    expect(isValidCoordinate(-90.1, 0)).toBe(false);
    expect(isValidCoordinate(45, 180.1)).toBe(false);
    expect(isValidCoordinate(45, -181)).toBe(false);
    expect(isValidCoordinate(null, 50)).toBe(false);
    expect(isValidCoordinate('abc', 50)).toBe(false);
  });

  test('Email validator enforces standard email structure', () => {
    expect(isValidEmail('test@openmosque.org')).toBe(true);
    expect(isValidEmail('admin+staging@sub.domain.co.uk')).toBe(true);

    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('missing@domain')).toBe(false);
    expect(isValidEmail('@nodomain.com')).toBe(false);
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail(null)).toBe(false);
  });

  test('Time format validator validates HH:mm and HH:mm:ss properly', () => {
    expect(isValidTimeFormat('05:30')).toBe(true);
    expect(isValidTimeFormat('13:45:00')).toBe(true);
    expect(isValidTimeFormat('00:00')).toBe(true);
    expect(isValidTimeFormat('23:59:59')).toBe(true);

    expect(isValidTimeFormat('24:00')).toBe(false);
    expect(isValidTimeFormat('12:60')).toBe(false);
    expect(isValidTimeFormat('5:30')).toBe(false);
    expect(isValidTimeFormat('invalid')).toBe(false);
  });

  test('Mosque submission validator prevents invalid payloads', () => {
    const valid = validateMosquePayload({
      name: 'Masjid Al-Taqwa',
      address: '123 Peace Way',
      latitude: 51.5,
      longitude: -0.1,
      email: 'info@masjid.org',
    });
    expect(valid.valid).toBe(true);
    expect(valid.errors).toHaveLength(0);

    const invalid = validateMosquePayload({
      name: '',
      address: '',
      latitude: 95,
      longitude: -0.1,
      email: 'notanemail',
    });
    expect(invalid.valid).toBe(false);
    expect(invalid.errors).toContain('Name is required');
    expect(invalid.errors).toContain('Address is required');
    expect(invalid.errors).toContain('Coordinates out of range');
    expect(invalid.errors).toContain('Invalid email format');
  });
});
