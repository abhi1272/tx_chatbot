const axios = require('axios');
const _ = require('lodash');

function handleDynamicQuery(data, query) {
  // Example query: {"type": "count", "field": "extracurricularActivity", "value": "Drama Club"}
  const { type, field, value, groupBy, aggregate } = query;

  let result;

  switch (type) {
    case "count":
      result = _.filter(data, [field, value]).length;
      break;
    case "Max":
      result = _.maxBy(data, field);
      break;
    case "groupBy":
      result = _.groupBy(data, field);
      if (aggregate === "count") {
        result = _.mapValues(result, (group) => group.length);
      }
      break;
    case "sum":
      result = _.sumBy(data, (item) => {
        // Convert the field value to a number, use 0 if conversion fails
        const value = Number(item[field]);
        return isNaN(value) ? 0 : value;
      });
      break;
    default:
      result = "Invalid query type";
  }

  return result;
}

// Handle different types of queries
async function handleRequest(req, res) {
  const data = await loadDataFromAPI(); // Load dynamic data
  const fields = getFields(data);
  console.log("Available fields:", fields);

  const queryResult = req.body.queryResult;
  const intent = queryResult.intent.displayName;

  let responseText = "";

  // Example: queryResult.parameters = {"type": "count", "field": "extracurricularActivity", "value": "Drama Club"}
  const query = queryResult.parameters;

  // Handle dynamic queries
  const result = handleDynamicQuery(data, query);

  responseText = `Query result: ${JSON.stringify(result)}`;

  return responseText
  // res.json({
  //   fulfillmentText: responseText,
  // });
}

function getFields(data) {
  if (data.length === 0) return [];
  return Object.keys(data[0]);
}

function loadData() {
  const filePath = path.join(__dirname, "data.json"); // Change to your file path
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  return data;
}

// Example function to load data from an external API
async function loadDataFromAPI() {
  const response = await axios.get("http://localhost:3000/sheet/fetch-sheet-data"); // Change to your API endpoint
  return response.data;
}

module.exports = {
  handleRequest,
};
