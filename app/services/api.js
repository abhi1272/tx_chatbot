const axios = require("axios");
const { v4: uuidv4 } = require('uuid');
const { getAccessToken } = require("../services/google");

async function getData(text) {
  const msg = {
    key1: "value1",
    key2: "value2",
  };
  const messageText = text;
  const sessionId = uuidv4()
  const accessToken = await getAccessToken();

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
  responseText = response.data.queryResult.fulfillmentText;
  return responseText
}

module.exports = { getData };
