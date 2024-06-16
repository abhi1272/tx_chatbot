const express = require('express');
const router = express.Router();
const { fetchSheetData } = require('../services/sheet');

const { GOOGLE_SHEET_API_KEY, SHEET_ID } = process.env;
const sheetName = "Sheet1"; // Replace with your sheet name

router.get('/fetch-sheet-data', async (req, res) => {
  try {
    const data = await fetchSheetData(GOOGLE_SHEET_API_KEY, SHEET_ID, sheetName);
    res.json(data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
