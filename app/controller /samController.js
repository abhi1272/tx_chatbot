const fs = require('fs').promises;
const { columnMapping } = require("../constants/dialogflow");
const { getResponseFromModel } = require("../services/geminiClient");
const { getQuantity } = require("../services/sam");
const { runQuery } = require("../services/sqllite");

async function pendingOrderBook(req, res) {
  const intentName = req.body.queryResult.intent.displayName;
  const query = req.body.queryResult.queryText;
  const parameters = req.body.queryResult.parameters;

  try {
    let resp 
    // const resp = await fetchDataFromSQl(query, parameters);

    if(intentName === 'Default Fallback Intent'){
      resp = await getResponseFromModel(query);
    }else{
      resp = await getQuantity(parameters, query);
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      intentName,
      query,
      parameters,
      response: resp
    };


    // Append log entry to log file
    if(process.env.ADD_LOG){
      await appendLog(logEntry);
    }

    if(!resp.includes('Filter by:') || !resp.includes('Group by:')){
      resp = `No Data Found! Please Refine your Query!\n-------------\nyou can ask like:-\nGive me details of customer with balance qty\nbalance qty by blend`
    }

    return resp;
  } catch (error) {
    console.error('Error in pendingOrderBook:', error);

    const errorLogEntry = {
      timestamp: new Date().toISOString(),
      intentName,
      query,
      parameters,
      error: error.message
    };

    if(process.env.ADD_LOG){
      await appendLog(errorLogEntry);
    }

    return { error: 'An error occurred while processing your request.' };
  }
}

async function fetchDataFromSQl(query, parameters = {}) {
  try {
    parameters.Blend = +parameters.Blend
    const modifiedQuery = await convertToSQLQuery(query, parameters);
    console.log('modifiedQuery', modifiedQuery);

    const results = await runQuery(modifiedQuery);

    if (results.length === 0) {
      return {
        fulfillmentText: 'No results found.',
      };
    }

    let responseText = '';
    results.forEach((result, index) => {
      if (index > 0) {
        responseText += '\n';
      }
      Object.keys(result).forEach(key => {
        responseText += `${key}: ${result[key]}\n`;
      });
    });

    return responseText;
  } catch (error) {
    console.error('Error in fetchDataFromSQl:', error);
    return { error: 'An error occurred while fetching data from SQL.' };
  }
}

const multiWordKeywords = ['ORDER BY', 'GROUP BY', 'SELECT', 'FROM', 'WHERE', 'LIMIT'];

const mapToColumnNames = (plainText, removeDuplicatesFlag) => {
  try {
    columnMapping.forEach(mapping => {
      mapping.synonyms.forEach(synonym => {
        const regex = new RegExp(`\\b${synonym}\\b`, 'gi');
        plainText = plainText.replace(regex, mapping.value);
      });
    });

    multiWordKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword.replace(' ', '\\s+')}\\b`, 'gi');
      plainText = plainText.replace(regex, keyword);
    });

    if(removeDuplicatesFlag){
      return removeDuplicates(plainText)
    }else{
      return plainText;
    }
  } catch (error) {
    console.error('Error in mapToColumnNames:', error);
    return plainText; // Return the original text in case of error
  }
};

const removeDuplicates = (text) => {
  try {
    return [...new Set(text.split(' '))].join(' ');
  } catch (error) {
    console.error('Error in removeDuplicates:', error);
    return text; // Return the original text in case of error
  }
};

const convertToSQLQuery = async (plainText, parameters) => {
  try {
    const { hasValues, modifiedData } = filterAndModifyData(parameters);
    const mappedText = mapToColumnNames(plainText, true);

    let sqlQuery;
    if (hasValues) {
      sqlQuery = `Convert this to correct sql query for table pendingOrder with parameters ${JSON.stringify(modifiedData)}, only give query in simple text as response: ${mappedText}, do double check on syntax`;
    } else {
      sqlQuery = `Convert this to correct sql query for table pendingOrder, only give query in simple text as response: ${mappedText}, do double check on syntax`;
    }

    console.log('sqlQuery', sqlQuery)
    sqlQuery = await getResponseFromModel(sqlQuery);
    const modifiedSqlQuery = mapToColumnNames(sqlQuery, false);

    return extractSQLQuery(modifiedSqlQuery);
  } catch (error) {
    console.error('Error in convertToSQLQuery:', error);
    return null; // Return null in case of error
  }
};

const extractSQLQuery = (text) => {
  try {
    const cleanedText = text.replace(/\n/g, ' ').replace(/\\'/g, "'");
    const match = cleanedText.match(sqlRegex);
    if (match) {
      return match[0].trim();
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error in extractSQLQuery:', error);
    return null;
  }
};

const sqlRegex = /SELECT[\s\S]*?;/i;

function filterAndModifyData(data) {
  try {
    let hasValues = false;
    const modifiedData = {};

    for (const key in data) {
      if (key === 'ColumnName' || key === 'GroupBy') {
        continue;
      }
      if (Array.isArray(data[key])) {
        if (data[key].length > 0) {
          modifiedData[key] = data[key];
          hasValues = true;
        }
      } else if (data[key] && data[key].length > 0) {
        modifiedData[key] = data[key];
        hasValues = true;
      }
    }

    return { hasValues, modifiedData };
  } catch (error) {
    console.error('Error in filterAndModifyData:', error);
    return { hasValues: false, modifiedData: {} };
  }
}

async function appendLog(entry) {
  const logFilePath = 'query_log.json';
  try {
    await fs.appendFile(logFilePath, JSON.stringify(entry) + '\n');
  } catch (error) {
    console.error('Error appending to log file:', error);
  }
}

module.exports = { pendingOrderBook, fetchDataFromSQl };
