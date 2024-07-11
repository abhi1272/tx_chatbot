const express = require('express');
const bodyParser = require('body-parser');
const dialogflowRoutes = require('./app/routes/dialogflow');
const telegramRoutes = require('./app/routes/telegram');
const sheetRoutes = require('./app/routes/sheet');
const dataRoutes = require('./app/routes/data');
const samRoutes = require('./app/routes/samRoute');
const { fetchSheetData } = require('./app/services/sheet');
const { createTable } = require('./app/services/sqllite');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.use('/dialogflow', dialogflowRoutes);
// app.use('/telegram', telegramRoutes);
app.use('/sheet', sheetRoutes);
app.use('/sam', samRoutes);
fetchSheetData().then(() => {
  // createTable().then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  // });
})



