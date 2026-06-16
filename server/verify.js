const crypto = require('crypto');

function verifyTelegramWebAppData(initData, botToken) {
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  urlParams.delete('hash');

  const keys = Array.from(urlParams.keys()).sort();
  const dataCheckString = keys
    .map((key) => `${key}=${urlParams.get(key)}`)
    .join('\n');

  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();

  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  if (signature !== hash) return null;

  const userString = urlParams.get('user');
  if (!userString) return null;

  try {
    return JSON.parse(userString);
  } catch (e) {
    return null;
  }
}

module.exports = { verifyTelegramWebAppData };