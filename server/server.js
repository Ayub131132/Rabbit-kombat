const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { verifyTelegramWebAppData } = require('./verify');
const authMiddleware = require('./middleware');

const app = express();
const PORT = 5000;
const BOT_TOKEN = 'YOUR_BOT_TOKEN'; // Replace with your actual bot token
const JWT_SECRET = 'your_jwt_secret'; // Replace with a strong secret

app.use(cors());
app.use(express.json());

app.post('/auth/telegram', (req, res) => {
  const { initData } = req.body;
  if (!initData) return res.status(400).json({ success: false, error: 'No data' });

  const userData = verifyTelegramWebAppData(initData, BOT_TOKEN);
  if (!userData) return res.status(401).json({ success: false, error: 'Invalid auth' });

  const token = jwt.sign(
    { id: userData.id, username: userData.username },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    success: true,
    token,
    user: {
      id: userData.id,
      username: userData.username,
      first_name: userData.first_name,
    }
  });
});

app.get('/api/me', authMiddleware, (req, res) => {
  res.json({ success: true, user: req.user });
});

app.listen(PORT, () => console.log(`Server on ${PORT}`));