const { pool } = require('./db');

async function getUserById(userId) {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
  return result.rows[0];
}

async function createUser(userData) {
  const { id, username, first_name } = userData;
  const result = await pool.query(
    'INSERT INTO users (id, username, first_name) VALUES ($1, $2, $3) RETURNING *',
    [id, username, first_name]
  );
  return result.rows[0];
}

async function createUserWithReferral(userData, referrerId) {
  const { id, username, first_name } = userData;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // 1. Create the new user
    const newUserResult = await client.query(
      'INSERT INTO users (id, username, first_name, referred_by) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, username, first_name, referrerId]
    );
    
    // 2. Update referrer stats
    await client.query(
      'UPDATE users SET referral_count = referral_count + 1, referral_rewards = referral_rewards + 500, points = points + 500 WHERE id = $1',
      [referrerId]
    );
    
    // 3. Add point transaction for referrer
    await client.query(
      'INSERT INTO point_transactions (user_id, amount, reason, description) VALUES ($1, $2, $3, $4)',
      [referrerId, 500, 'referral', `Referral reward for inviting ${first_name}`]
    );
    
    await client.query('COMMIT');
    return newUserResult.rows[0];
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

async function getReferredFriends(userId) {
  const result = await pool.query(
    'SELECT id, username, first_name, joined_at FROM users WHERE referred_by = $1 ORDER BY joined_at DESC',
    [userId]
  );
  return result.rows;
}

async function addPointTransaction(userId, amount, reason, description) {
  const result = await pool.query(
    'INSERT INTO point_transactions (user_id, amount, reason, description) VALUES ($1, $2, $3, $4) RETURNING *',
    [userId, amount, reason, description]
  );
  return result.rows[0];
}

async function getUserTransactions(userId) {
  const result = await pool.query(
    'SELECT * FROM point_transactions WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
}

module.exports = {
  getUserById,
  createUser,
  createUserWithReferral,
  getReferredFriends,
  addPointTransaction,
  getUserTransactions
};