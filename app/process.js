app.post('/process-data', async (req, res) => {
    const { operation, columnIndex, order, spreadsheetId, range, apiKey } = req.body;
  
    try {
      const data = await fetchGoogleSheetsData(spreadsheetId, range, apiKey);
  
      // Remove header row for processing
      const headers = data[0];
      const dataRows = data.slice(1);
  
      let processedData;
      switch (operation) {
        case 'sort':
          processedData = sortData(dataRows, columnIndex, order);
          break;
        case 'groupBy':
          processedData = groupBy(dataRows, columnIndex);
          break;
        case 'aggregate':
          processedData = aggregateData(dataRows, columnIndex, order);
          break;
        default:
          return res.status(400).send('Invalid operation');
      }
  
      res.json({
        headers,
        data: processedData,
      });
    } catch (error) {
      res.status(500).send('Error processing data');
    }
  });
  