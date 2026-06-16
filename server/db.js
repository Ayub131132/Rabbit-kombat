const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'u0_a270',
  password: 'password',
  database: 'rabbitkombat'
});

module.exports = { pool };