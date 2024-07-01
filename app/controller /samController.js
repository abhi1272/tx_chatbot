const { getQuantity } = require("../services/sam");

async function pendingOrderBook(req, res) {
  const intentName = req.body.queryResult.intent.displayName;
  const query = req.body.queryResult.queryText;
  const parameters = req.body.queryResult.parameters;
  // ColumnName YarnCategory

  const resp = await getQuantity(parameters);
  return resp
}

module.exports = { pendingOrderBook };
