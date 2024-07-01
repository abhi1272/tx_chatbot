const stringSimilarity = require('string-similarity');
const { processData } = require('../utils/process');


async function getQuantity(parameters) {
  const resp = processData(parameters)
  return resp
} 

async function getCustomerData(req, res, data) {
  const { partyName, contract, item, duration } =
    // req.body.queryResult.parameters;
    req.body


  // Calculate the date range for the past 4 days
  const currentDate = new Date();
  const pastDate = new Date();
  pastDate.setDate(currentDate.getDate() - duration);

  const partyNames = data.map(record => record["PARTY NAME"]);
  const matches = stringSimilarity.findBestMatch(partyName, partyNames);
  const bestMatch = matches.bestMatch;

  // Filter data based on the best match and date range
  const filteredData = data.filter(record => {
    const recordDate = new Date(record["DATE"]);
    return (
      stringSimilarity.compareTwoStrings(record["PARTY NAME"], bestMatch.target) > 0.7 // Adjust similarity threshold as needed
    );
  });

  res.json({
    fulfillmentText: `Found ${filteredData.length} records for party name ${partyName}, contract ${contract}, and item ${item} in the past 4 days.`,
    fulfillmentMessages: [
      {
        text: {
          text: filteredData.map((record) => JSON.stringify(record)),
        },
      },
    ],
  });
}

module.exports = { getCustomerData, getQuantity };
