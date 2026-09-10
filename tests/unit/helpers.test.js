import { test, expect } from '@playwright/test';
import {
  formatPrayerTime,
  calculateDistance,
  formatDistance,
  truncate,
  capitalize,
  timeAgo
} from '../../src/utils/helpers.js';

test.describe('Unit Tests: Helpers and Utility Functions', () => {
  test('formatPrayerTime formats 24-hour time to 12-hour AM/PM correctly', () => {
    expect(formatPrayerTime('05:30')).toBe('5:30 AM');
    expect(formatPrayerTime('13:45')).toBe('1:45 PM');
    expect(formatPrayerTime('00:00')).toBe('12:00 AM');
    expect(formatPrayerTime('12:00')).toBe('12:00 PM');
    expect(formatPrayerTime('23:59')).toBe('11:59 PM');
    expect(formatPrayerTime('')).toBe('--:--');
    expect(formatPrayerTime(null)).toBe('--:--');
  });

  test('calculateDistance computes accurate Haversine distance between coordinates', () => {
    // London (51.5074, -0.1278) to Paris (48.8566, 2.3522) ~ 343 km
    const distLondonParis = calculateDistance(51.5074, -0.1278, 48.8566, 2.3522);
    expect(distLondonParis).toBeGreaterThan(340);
    expect(distLondonParis).toBeLessThan(346);

    // Same point should be 0
    const zeroDist = calculateDistance(51.5074, -0.1278, 51.5074, -0.1278);
    expect(zeroDist).toBeCloseTo(0, 5);
  });

  test('formatDistance formats meters and kilometers accurately', () => {
    expect(formatDistance(0.45)).toBe('450m');
    expect(formatDistance(0.05)).toBe('50m');
    expect(formatDistance(1.24)).toBe('1.2km');
    expect(formatDistance(15.789)).toBe('15.8km');
  });

  test('truncate properly trims strings and appends ellipsis', () => {
    const text = 'The quick brown fox jumps over the lazy dog';
    expect(truncate(text, 100)).toBe(text);
    expect(truncate(text, 10)).toBe('The quick...');
    expect(truncate('', 50)).toBe('');
    expect(truncate(null, 50)).toBe(null);
  });

  test('capitalize formats first character uppercase and rest lowercase', () => {
    expect(capitalize('london')).toBe('London');
    expect(capitalize('LONDON')).toBe('London');
    expect(capitalize('tOrOnTo')).toBe('Toronto');
    expect(capitalize('')).toBe('');
  });

  test('Mathematical rating calculations work deterministically', () => {
    const ratings = [5, 4, 5, 3];
    const sum = ratings.reduce((acc, r) => acc + r, 0);
    const avg = sum / ratings.length;
    expect(avg).toBe(4.25);
    expect(avg.toFixed(1)).toBe('4.3');
  });
});
