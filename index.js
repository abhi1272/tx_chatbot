const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;

const apiKey = process.env.GOOGLE_SHEET_API_KEY
const spreadsheetId = process.env.SHEET_ID;
const sheetName = 'Sheet1'; // Replace with your sheet name

app.get('/fetch-sheet-data', async (req, res) => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}?key=${apiKey}`;

  console.log(url)
  try {
    const response = await axios.get(url);
    const data = response.data;
    res.json(data.values);
  } catch (error) {
    console.error('Error response data:', error.response ? error.response.data : error.message);
    console.error('Error response status:', error.response ? error.response.status : 'N/A');

    if (error.response) {
      const status = error.response.status;
      if (status === 400) {
        res.status(400).send('Bad Request. Please check your request parameters and ensure they are correct.');
      } else if (status === 403) {
        res.status(403).send('Access denied. Please check your API key and spreadsheet permissions.');
      } else {
        res.status(status).send(`An error occurred: ${error.response.data.error.message}`);
      }
    } else {
      res.status(500).send('An unknown error occurred.');
    }
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
