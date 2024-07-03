// apiClient.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function getResponseFromModel(input) {
  try {
    const result = await model.generateContent(input);
    const response = await result.response;
    const text = response.text();
    return text
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  getResponseFromModel,
};
