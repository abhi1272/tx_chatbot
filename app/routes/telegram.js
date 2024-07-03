const express = require("express");
const router = express.Router();
const axios = require("axios");
const TelegramBot = require("node-telegram-bot-api");
const { telegramToken } = require("../config/config");

const bot = new TelegramBot(telegramToken, { 
  webHook: true 
});

const { getAccessToken } = require("../services/google");
const { getResponseFromModel } = require("../services/geminiClient");

// Set the Telegram webhook to your Vercel deployed URL
const url = `${process.env.VERCEL_URL}`;
bot.setWebHook(`${url}/telegram/webhook`);

// Endpoint to handle Telegram webhook
router.post("/telegram/webhook", (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  // Use Telegram chat ID as the session ID
  const sessionId = chatId.toString();

  try {
    // Get OAuth 2.0 token
    const accessToken = await getAccessToken();
    let response;

    if (!messageText.includes("\n")) {
      // Send message to Dialogflow
      response = await axios.post(
        `https://dialogflow.googleapis.com/v2/projects/${process.env.GOOGLE_PROJECT_ID}/agent/sessions/${sessionId}:detectIntent`,
        {
          queryInput: {
            text: {
              text: messageText,
              languageCode: "en",
            },
          },
          originalDetectIntentRequest: {
            payload: {
              data: msg,
            },
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken.token}`,
          },
        }
      );
    }

    let responseText;
    if (process.env.GEMINI_ENABLE &&
      (messageText.includes("\n") ||
      response?.data.queryResult.intent.displayName ===
        "Default Fallback Intent" ||
      response?.data.queryResult.parameters?.ColumnName?.length === 0)
    ) {
      responseText = await getResponseFromModel(messageText);
    } else {
      responseText = response.data.queryResult.fulfillmentText;
    }
    bot.sendMessage(chatId, responseText);
  } catch (error) {
    console.error("Dialogflow request error:", error);
    bot.sendMessage(chatId, "Sorry, I encountered an error.");
  }
});

router.post("/telegram", (req, res) => {
  // This endpoint is not necessary unless you need to handle custom updates
  res.send("Telegram endpoint");
});

module.exports = router;
