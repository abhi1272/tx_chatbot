const axios = require('axios');
const cacheMethods = require('./cache');
const { P_GOOGLE_SHEET_API_KEY, P_SHEET_ID } = process.env;

async function fetchSheetData(apiKey = P_GOOGLE_SHEET_API_KEY, spreadsheetId = P_SHEET_ID, sheetName = "Data") {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}?key=${apiKey}`;
  try {

    const response = await axios.get(url);
    const rows = response.data.values;

    if (rows.length === 0) {
      throw new Error('No data found in the sheet.');
    }

    // Extract the header row
    const headers = rows[0];

    // Transform the data into an array of objects, removing fields with empty values
    const data = rows.slice(1).map(row => {
      let obj = {};
      row.forEach((value, index) => {
        if (value) { // Check if the value is not empty
          obj[headers[index]] = value;
        }
      });
      return obj;
    });
    cacheMethods.set('sheetData', data)
    return data;
  } catch (error) {
    console.error(
      "Error response data:",
      error.response ? error.response.data : error.message
    );
    console.error(
      "Error response status:",
      error.response ? error.response.status : "N/A"
    );

    let errorMessage;
    if (error.response) {
      const status = error.response.status;
      if (status === 400) {
        errorMessage = "Bad Request. Please check your request parameters and ensure they are correct.";
      } else if (status === 403) {
        errorMessage = "Access denied. Please check your API key and spreadsheet permissions.";
      } else {
        errorMessage = `An error occurred: ${error.response.data.error.message}`;
      }
      throw new Error(errorMessage);
    } else {
      throw new Error("An unknown error occurred.");
    }
  }
}

async function fetchAllSheets(apiKey, spreadsheetId) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?key=${apiKey}`;

  try {
    const response = await axios.get(url);
    const sheets = response.data.sheets;

    if (!sheets || sheets.length === 0) {
      throw new Error('No sheets found in the document.');
    }

    const sheetNames = sheets.map(sheet => sheet.properties.title);
    console.log('Sheets in the document:', sheetNames);
    return sheetNames;
  } catch (error) {
    console.error(
      "Error response data:",
      error.response ? error.response.data : error.message
    );
    console.error(
      "Error response status:",
      error.response ? error.response.status : "N/A"
    );

    let errorMessage;
    if (error.response) {
      const status = error.response.status;
      if (status === 400) {
        errorMessage = "Bad Request. Please check your request parameters and ensure they are correct.";
      } else if (status === 403) {
        errorMessage = "Access denied. Please check your API key and spreadsheet permissions.";
      } else {
        errorMessage = `An error occurred: ${error.response.data.error.message}`;
      }
      throw new Error(errorMessage);
    } else {
      throw new Error("An unknown error occurred.");
    }
  }
}

module.exports = { fetchSheetData, fetchAllSheets };
