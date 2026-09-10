import pg from 'pg';
const { Pool } = pg;

export const dbPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'openmosque_db',
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres123',
});

export const dbHelper = {
  async query(text, params = []) {
    return await dbPool.query(text, params);
  },

  async findMosqueByName(name) {
    const res = await dbPool.query(
      `SELECT id, name, status, address, city, country, 
              ST_Y(location::geometry) as latitude, 
              ST_X(location::geometry) as longitude, 
              created_at, updated_at 
       FROM mosques 
       WHERE name = $1 AND is_deleted = false`,
      [name]
    );
    return res.rows[0] || null;
  },

  async findMosqueSubmissionByName(name) {
    const res = await dbPool.query(
      `SELECT id, name, status, address, city, country, contact_email, contact_phone, created_at 
       FROM mosque_submissions 
       WHERE name = $1 
       ORDER BY created_at DESC LIMIT 1`,
      [name]
    );
    return res.rows[0] || null;
  },

  async findUserByEmail(email) {
    const res = await dbPool.query(
      `SELECT id, email, display_name, role, firebase_uid, is_active, is_verified, created_at 
       FROM users 
       WHERE email = $1`,
      [email]
    );
    return res.rows[0] || null;
  },

  async findReviewsByMosqueId(mosqueId) {
    const res = await dbPool.query(
      `SELECT id, mosque_id, user_id, rating_overall, review_text, status, created_at 
       FROM mosque_reviews 
       WHERE mosque_id = $1 AND is_deleted = false 
       ORDER BY created_at DESC`,
      [mosqueId]
    );
    return res.rows;
  },

  async findQuestionsByMosqueId(mosqueId) {
    const res = await dbPool.query(
      `SELECT id, mosque_id, user_id, question_text, status, created_at 
       FROM mosque_questions 
       WHERE mosque_id = $1 AND is_deleted = false 
       ORDER BY created_at DESC`,
      [mosqueId]
    );
    return res.rows;
  },

  async findIqamahSchedule(mosqueId) {
    const res = await dbPool.query(
      `SELECT id, mosque_id, fajr_type, fajr_offset_minutes, fajr_fixed_time,
              dhuhr_type, dhuhr_offset_minutes, dhuhr_fixed_time,
              asr_type, asr_offset_minutes, asr_fixed_time,
              maghrib_type, maghrib_offset_minutes, maghrib_fixed_time,
              isha_type, isha_offset_minutes, isha_fixed_time,
              jummah_1_time, jummah_2_time, jummah_khutbah_language
       FROM mosque_iqamah_schedules 
       WHERE mosque_id = $1 AND is_deleted = false`,
      [mosqueId]
    );
    return res.rows[0] || null;
  },

  async findClaimRequestByMosqueId(mosqueId) {
    const res = await dbPool.query(
      `SELECT id, mosque_id, claimant_id, full_name, phone_number, official_email, position_in_mosque, proof_document_url, status, created_at 
       FROM mosque_claim_requests 
       WHERE mosque_id = $1 
       ORDER BY created_at DESC LIMIT 1`,
      [mosqueId]
    );
    return res.rows[0] || null;
  },

  async findKhutbahsByMosqueId(mosqueId) {
    const res = await dbPool.query(
      `SELECT id, mosque_id, topic, khatib_name, batch_number, khutbah_date, khutbah_time, language, stream_url 
       FROM mosque_khutbahs 
       WHERE mosque_id = $1 AND is_deleted = false 
       ORDER BY khutbah_date ASC`,
      [mosqueId]
    );
    return res.rows;
  },

  async findEventsByMosqueId(mosqueId) {
    const res = await dbPool.query(
      `SELECT id, mosque_id, title, description, event_type, audience, start_date_time, end_date_time, speaker_name 
       FROM mosque_events 
       WHERE mosque_id = $1 AND is_deleted = false 
       ORDER BY start_date_time ASC`,
      [mosqueId]
    );
    return res.rows;
  },

  async findUserFavorites(userId) {
    const res = await dbPool.query(
      `SELECT ufm.id, ufm.user_id, ufm.mosque_id, ufm.created_at, m.name as mosque_name
       FROM user_favorite_mosques ufm
       JOIN mosques m ON m.id = ufm.mosque_id
       WHERE ufm.user_id = $1
       ORDER BY ufm.created_at DESC`,
      [userId]
    );
    return res.rows;
  },

  async findUserBadges(userId) {
    const res = await dbPool.query(
      `SELECT ub.id, ub.user_id, ub.badge_id, ub.earned_at, b.code, b.name
       FROM user_badges ub
       JOIN badges b ON b.id = ub.badge_id
       WHERE ub.user_id = $1
       ORDER BY ub.earned_at DESC`,
      [userId]
    );
    return res.rows;
  },

  async cleanupTestEntities(prefix = 'E2E_TEST_') {
    try {
      // Clean up favorites & badges
      await dbPool.query(
        `DELETE FROM user_favorite_mosques WHERE mosque_id IN (SELECT id FROM mosques WHERE name LIKE $1) OR user_id IN (SELECT id FROM users WHERE email LIKE $1 OR firebase_uid LIKE $1)`,
        [`${prefix}%`]
      );
      await dbPool.query(
        `DELETE FROM user_badges WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1 OR firebase_uid LIKE $1)`,
        [`${prefix}%`]
      );
      // Clean up khutbahs & events
      await dbPool.query(
        `DELETE FROM mosque_khutbahs WHERE mosque_id IN (SELECT id FROM mosques WHERE name LIKE $1)`,
        [`${prefix}%`]
      );
      await dbPool.query(
        `DELETE FROM mosque_events WHERE mosque_id IN (SELECT id FROM mosques WHERE name LIKE $1)`,
        [`${prefix}%`]
      );
      // Clean up claims
      await dbPool.query(
        `DELETE FROM mosque_claim_requests WHERE mosque_id IN (SELECT id FROM mosques WHERE name LIKE $1)`,
        [`${prefix}%`]
      );
      // Clean up reviews for test mosques
      await dbPool.query(
        `DELETE FROM mosque_reviews WHERE mosque_id IN (SELECT id FROM mosques WHERE name LIKE $1)`,
        [`${prefix}%`]
      );
      // Clean up questions for test mosques
      await dbPool.query(
        `DELETE FROM mosque_questions WHERE mosque_id IN (SELECT id FROM mosques WHERE name LIKE $1)`,
        [`${prefix}%`]
      );
      // Clean up iqamah schedules for test mosques
      await dbPool.query(
        `DELETE FROM mosque_iqamah_schedules WHERE mosque_id IN (SELECT id FROM mosques WHERE name LIKE $1)`,
        [`${prefix}%`]
      );
      // Clean up test mosques
      await dbPool.query(
        `DELETE FROM mosques WHERE name LIKE $1`,
        [`${prefix}%`]
      );
      // Clean up test submissions
      await dbPool.query(
        `DELETE FROM mosque_submissions WHERE name LIKE $1`,
        [`${prefix}%`]
      );
      // Clean up test users
      await dbPool.query(
        `DELETE FROM users WHERE email LIKE $1 OR firebase_uid LIKE $1`,
        [`${prefix}%`]
      );
    } catch (err) {
      console.warn('Cleanup error (ignored):', err.message);
    }
  },

  async close() {
    await dbPool.end();
  }
};