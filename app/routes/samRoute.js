const express = require('express');
const { getPendingData, fetchDataFromSQl } = require('../controller /samController');
const { fetchSheetData } = require('../services/sheet');
const { runQuery } = require('../services/sqllite');
const { getData } = require('../services/api');
const router = express.Router();
const { P_GOOGLE_SHEET_API_KEY, P_SHEET_ID } = process.env;
const sheetName = "Data"; // Replace with your sheet name

router.get("/", async (req, res) => {
  try {
    res.send('Hello Sam!');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.post("/chat", async (req, res) => {
  try {
    const resp = await getData(req.body.query);
    res.send(resp);
  } catch (error) {
    res.status(500).send(error.message);
  }
});


router.post('/pending', async (req, res) => {
  try {
    const data = await fetchSheetData(P_GOOGLE_SHEET_API_KEY, P_SHEET_ID, sheetName)
    const resp = await getPendingData(req, res, data);
    res.json(resp);
  } catch (error) {
    res.status(500).send(error.message);
  }
});


router.post("/query", async (req, res) => {
  try {
    const resp = await fetchDataFromSQl(req.body.query);
    res.json(resp);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
