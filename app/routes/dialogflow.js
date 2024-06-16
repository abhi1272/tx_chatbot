const express = require('express');
const router = express.Router();
const { telegramToken } = require('../config/config');
const TelegramBot = require('node-telegram-bot-api');
const { handleRequest } = require('../controller /handledQuery');
const { getBillData } = require('../controller /billController');
const bot = new TelegramBot(telegramToken);


router.post('/webhook', async (req, res) => {
  console.log('Received request:', req.body);

  const body = req.body;

  if (body && body.queryResult) {
    let responseText = body.queryResult.fulfillmentText;
    console.log('Response text:', responseText);

    if (body.queryResult.intent.displayName === "Get Students By Activity") {
      responseText = await handleRequest(req, res);
    }

    if (body.queryResult.intent.displayName === "bill") {
      responseText = await getBillData(req, res);
    }

    // Extract chat ID if available
    let chatId;
    if (body.originalDetectIntentRequest && body.originalDetectIntentRequest.payload) {
      // Example: Accessing chat ID for Telegram
      chatId = body.originalDetectIntentRequest.payload.data?.chat?.id;
    } else {
      console.log('No payload or chat ID found in request:', body);
      return res.status(400).send('No payload or chat ID found in request');
    }

    // Send the response back to Telegram if chatId is available
    if (chatId) {
      try {
        await bot.sendMessage(chatId, responseText);
        console.log('Message sent to Telegram:', responseText);
      } catch (error) {
        console.error('Error sending message to Telegram:', error);
        return res.status(500).send('Error sending message to Telegram');
      }
    } else {
      console.log('No chat ID available to send message to Telegram');
    }

    return res.json({
      fulfillmentText: responseText,
    });
  }

  console.log('Invalid Webhook Request');
  return res.status(400).send('Invalid Webhook Request');
});


module.exports = router;
