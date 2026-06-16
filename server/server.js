const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { verifyTelegramWebAppData } = require('./verify');
const authMiddleware = require('./middleware');
const db = require('./dbHelpers');

const app = express();
const PORT = 5000;
const BOT_TOKEN = '8276775164:AAFwVDlpesINJUJwOUQBGARuCznmwZ6TE2Y'; 
const JWT_SECRET = 'your_jwt_secret'; 

app.use(cors());
app.use(express.json());

// 1. Auth Endpoint with PostgreSQL
app.post('/auth/telegram', async (req, res) => {
  const { initData, start_param } = req.body;
  if (!initData) return res.status(400).json({ success: false, error: 'No data' });

  try {
    const userData = verifyTelegramWebAppData(initData, BOT_TOKEN);
    if (!userData) return res.status(401).json({ success: false, error: 'Invalid auth' });

    const userId = userData.id;
    let user = await db.getUserById(userId);

    // Create user if they don't exist
    if (!user) {
      if (start_param && parseInt(start_param) !== userId) {
        const referrerId = parseInt(start_param);
        const referrer = await db.getUserById(referrerId);
        
        if (referrer) {
          user = await db.createUserWithReferral(userData, referrerId);
        } else {
          user = await db.createUser(userData);
        }
      } else {
        user = await db.createUser(userData);
      }
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user
    });
  } catch (err) {
    console.error('Auth Error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// 2. Referral Stats Endpoint
app.get('/referrals/me', authMiddleware, async (req, res) => {
  try {
    const user = await db.getUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const friends = await db.getReferredFriends(user.id);

    const botUsername = 'Rabbitkombatofc_bot';
    const referralLink = `https://t.me/${botUsername}?startapp=${user.id}`;

    res.json({
      success: true,
      referralLink,
      referralCount: user.referral_count,
      referralRewards: user.referral_rewards,
      friends
    });
  } catch (err) {
    console.error('Referral Stats Error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.listen(PORT, () => console.log(`Server on ${PORT}`));