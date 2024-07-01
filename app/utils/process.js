const cacheMethods = require("../services/cache");
const { filterAndSum } = require("./utils");

function processData(parameters) {
  const { operation, ColumnName, order } = parameters

  try {
    const data = cacheMethods.get("sheetData");

    let processedData = filterAndSum(data, parameters)
    return processedData
  } catch (error) {
    return "Error processing data";
  }
}

module.exports = { processData };
