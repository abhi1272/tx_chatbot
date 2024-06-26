const express = require('express');
const router = express.Router();
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const { telegramToken } = require('../config/config');
const bot = new TelegramBot(telegramToken, { polling: true });
const { getAccessToken } = require('../services/google')

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  // Use Telegram chat ID as the session ID
  const sessionId = chatId.toString();

  try {
      // Get OAuth 2.0 token
      const accessToken = await getAccessToken();

      // Send message to Dialogflow
      const response = await axios.post(`https://dialogflow.googleapis.com/v2/projects/${process.env.GOOGLE_PROJECT_ID}/agent/sessions/${sessionId}:detectIntent`, {
          queryInput: {
              text: {
                  text: messageText,
                  languageCode: 'en'
              }
          },
          originalDetectIntentRequest: {
              payload: {
                  data: msg
              }
          }
      }, {
          headers: {
              Authorization: `Bearer ${accessToken.token}`
          }
      });

      const responseText = response.data.queryResult.fulfillmentText;
      bot.sendMessage(chatId, responseText);
  } catch (error) {
      console.error('Dialogflow request error:', error);
      bot.sendMessage(chatId, 'Sorry, I encountered an error.');
  }
});

router.post('/telegram', (req, res) => {
  // This endpoint is not necessary unless you need to handle custom updates
  res.send('Telegram endpoint');
});

module.exports = router;
