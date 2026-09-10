export function generateTestMosque(suffix = Date.now()) {
  return {
    name: `E2E_TEST_MOSQUE_${suffix}`,
    address: '42 Crescent Way, Westminster',
    city: 'London',
    country: 'United Kingdom',
    latitude: 51.5074,
    longitude: -0.1278,
    phone: '+44 20 7946 0912',
    email: `mosque_${suffix}@openmosque.test`,
    website: 'https://openmosque.org',
    description: 'A verified community mosque for end-to-end automated testing.',
    facilities: ['WUDU_AREA', 'WOMENS_SECTION', 'PARKING', 'WHEELCHAIR_ACCESSIBILITY'],
  };
}

export function generateTestUser(role = 'USER', suffix = Date.now()) {
  const roleLower = role.toLowerCase();
  const prefix = roleLower.includes('admin') ? 'admin' : roleLower.includes('moderator') ? 'moderator' : 'user';
  const email = `${prefix}-${suffix}@openmosque.org`;
  const token = `mock-${prefix}-${suffix}`;
  return {
    email,
    password: 'Password123!',
    displayName: `Test ${role} ${suffix}`,
    role,
    token,
  };
}

export function generateTestReview(rating = 5, suffix = Date.now()) {
  return {
    rating,
    reviewText: `Automated test review ${suffix}: Clean prayer hall, excellent facilities, and peaceful atmosphere.`,
  };
}

export function generateTestQuestion(suffix = Date.now()) {
  return {
    questionText: `Is there dedicated sisters parking available for Taraweeh prayers? (Ref ${suffix})`,
  };
}