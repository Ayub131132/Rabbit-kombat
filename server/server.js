const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { verifyTelegramWebAppData } = require('./verify');
const authMiddleware = require('./middleware');

const app = express();
const PORT = 5000;
const BOT_TOKEN = 'YOUR_BOT_TOKEN'; 
const JWT_SECRET = 'your_jwt_secret'; 

// Mock Database (In production, use MongoDB or PostgreSQL)
const users = {}; 

app.use(cors());
app.use(express.json());

// 1. Auth Endpoint with Referral Logic
app.post('/auth/telegram', (req, res) => {
  const { initData, start_param } = req.body;
  if (!initData) return res.status(400).json({ success: false, error: 'No data' });

  const userData = verifyTelegramWebAppData(initData, BOT_TOKEN);
  if (!userData) return res.status(401).json({ success: false, error: 'Invalid auth' });

  const userId = userData.id;
  let isNewUser = !users[userId];

  // Create user if they don't exist
  if (isNewUser) {
    users[userId] = {
      id: userId,
      username: userData.username,
      first_name: userData.first_name,
      referredBy: null,
      referralCount: 0,
      referralRewards: 0,
      joinedAt: new Date()
    };

    // Process Referral if valid
    if (start_param) {
      const referrerId = parseInt(start_param);

      // Prevent self-referral and ensure referrer exists
      if (referrerId !== userId && users[referrerId]) {
        users[userId].referredBy = referrerId;
        users[referrerId].referralCount += 1;
        users[referrerId].referralRewards += 500; // Example reward: 500 coins
        console.log(`User ${userId} referred by ${referrerId}`);
      }
    }
  }

  const token = jwt.sign(
    { id: userId, username: userData.username },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    success: true,
    token,
    user: users[userId]
  });
});

// 2. Referral Stats Endpoint
app.get('/referrals/me', authMiddleware, (req, res) => {
  const user = users[req.user.id];
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Get list of friends this user referred
  const referredFriends = Object.values(users)
    .filter(u => u.referredBy === user.id)
    .map(u => ({
      id: u.id,
      username: u.username,
      first_name: u.first_name
    }));

  const botUsername = 'Rabbitkombatofc_bot';
  const referralLink = `https://t.me/${botUsername}?startapp=${user.id}`;

  res.json({
    success: true,
    referralLink,
    referralCount: user.referralCount,
    referralRewards: user.referralRewards,
    friends: referredFriends
  });
});

app.listen(PORT, () => console.log(`Server on ${PORT}`));