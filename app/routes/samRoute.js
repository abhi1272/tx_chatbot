const express = require('express');
const { getPendingData } = require('../controller /samController');
const { fetchSheetData } = require('../services/sheet');
const router = express.Router();
const { P_GOOGLE_SHEET_API_KEY, P_SHEET_ID } = process.env;
const sheetName = "Data"; // Replace with your sheet name


router.post('/pending', async (req, res) => {
  try {
    const data = await fetchSheetData(P_GOOGLE_SHEET_API_KEY, P_SHEET_ID, sheetName)
    const resp = await getPendingData(req, res, data);
    res.json(resp);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
