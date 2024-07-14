const cacheMethods = require("../services/cache");
const { filterAndSum } = require("./utils");
const axios = require('axios');

function processData(parameters) {

  try {
    const data = cacheMethods.get("sheetData");

    let processedData = filterAndSum(data, parameters)
    return processedData
  } catch (error) {
    return "Error processing data";
  }
}

const callApi = async (method, url, data = {}) => {
  try {
      const response = await axios({
          method,
          url,
          data,
          headers: {
              'Authorization': `Bearer ${process.env.AUTH_TOKEN}`
          }
      });
      return response.data;
  } catch (error) {
      console.error(error);
      throw error;
  }
};

module.exports = { processData, callApi };
