const { GoogleAuth } = require("google-auth-library");

async function getAccessToken() {
  const auth = new GoogleAuth({
    credentials: {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY.split(String.raw`\n`).join('\n'),
    },
    scopes: "https://www.googleapis.com/auth/cloud-platform",
  });
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  return accessToken;
}

module.exports = { getAccessToken };
