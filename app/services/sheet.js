const axios = require('axios');

async function fetchSheetData(apiKey, spreadsheetId, sheetName) {
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

module.exports = { fetchSheetData };
