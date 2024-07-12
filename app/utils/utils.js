const _ = require("lodash");
const stringSimilarity = require("string-similarity");
const moment = require('moment');
const {
  FIELD_MAPPING,
  FILTER_COLS,
  SUM_COLS,
} = require("../constants/dialogflow");
const cacheMethods = require("../services/cache");

function filterAndSum(data, filterCriteria) {
  try {
    if (!data || data.length === 0) {
      return "Empty data array received";
    }

    let { filteredData, filterStr } = filter(data, filterCriteria);

    filteredData  = filteredData.data ? filteredData.data : filteredData

    let result 

    if(filterCriteria?.measurement.length){
      result = measureData(filteredData, filterCriteria)
    }else{
      result = sumByColName(filteredData, filterCriteria);
    }

    const concatenatedResult = Array.isArray(result)  ? result.map(item => `${item.sumCol}: ${item.SumColVal}`).join(', ') : result;
    // return `${concatenatedResult}.`;
    const response = `
Here are the details:-
---------------------
${filterStr.length ? 'Filter by:\n' + filterStr : ''}
---------------------
${concatenatedResult}
    `;
    return response
  } catch (error) {
    console.error("Error in filterAndSum:", error);
    return "An error occurred while processing your request.";
  }
}

function filter(data, filterCriteria) {
  try {

    const { ColumnName, ...criteria } = filterCriteria;

    let filteredData = data;
    let filterStr = ``
    const criteriaKeys = Object.keys(criteria);
    criteriaKeys.forEach((key, index) => {
      if (criteria[key] !== "" && criteria[key].length !== 0) {
        filteredData = filteredData.data ? filteredData.data : filteredData
        if (!filteredData || filteredData.length === 0) {
          return "Empty data array received";
        }
        if (key === "CustomerName") {
          filteredData = filterByCustomerName(filteredData, filterCriteria);
          filterStr += `${filteredData.colName} : ${filteredData.keyValue}\n`
        }
        if(key === "date-period" || key === "date"){
          filteredData = filterDataByDatePeriod(filteredData, filterCriteria[key], key);
          filterStr += `${filteredData.colName} : ${filteredData.keyValue}\n`
        } 
        if (key !== "CustomerName" && key !== "date-period" && key !== "date" && key !== "GroupBy" && key !== "measurement") {
          filteredData = filterByCategory(filteredData, criteria[key], key);
          filterStr += `${filteredData.colName} : ${filteredData.keyValue}\n`
        }
      }

    });
    if (filterStr.endsWith('\n')) {
      filterStr = filterStr.slice(0, -1);
    }
    return { filteredData, filterStr };
  } catch (error) {
    console.error("Error in filter:", error);
    return "Error filtering data";
  }
}

function filterByCategory(data, keyV, key) {
  try {
    if (!Array.isArray(data) || data.length === 0) {
      return "Empty data array received";
    }

    const filteredData = data.filter((row) => {
      if (key === 'CountofThreads' || key === 'Blend') {
        if (Array.isArray(keyV)) {
          return keyV.includes(+row[FIELD_MAPPING[key]]);
        }
        return +row[FIELD_MAPPING[key]] === +keyV;
      }
      if (Array.isArray(keyV)) {
        return keyV.includes(row[FIELD_MAPPING[key]]);
      }
      return row[FIELD_MAPPING[key]] === keyV;
    });

    // if (filteredData.length === 0) {
    //   return "No matching data found";
    // }

    return {
      key,
      colName: FIELD_MAPPING[key],
      keyValue: filteredData[0][FIELD_MAPPING[key]],
      data: filteredData,
    };
  } catch (error) {
    console.error("Error in filterByCategory:", error);
    return "Error filtering by category";
  }
}

function filterByCustomerName(data, filterCriteria) {
  try {
    if (!Array.isArray(data) || data.length === 0) {
      return "Empty data array received";
    }

    const customerNameLower = normalizeString(filterCriteria.CustomerName);
    const partyNames = cacheMethods.get('PARTY_NAME')

    const matches = stringSimilarity.findBestMatch(customerNameLower, partyNames);
    const bestMatch = matches.bestMatch;

    console.log("Best match:", bestMatch.target);

    const filteredData = data.filter((record) => {
      return (
        stringSimilarity.compareTwoStrings(
          normalizeString(record["PARTY NAME"]),
          bestMatch.target
        ) > 0.7
      );
    });

    if (filteredData.length === 0) {
      return "No matching customer found";
    }

    return {
      key: "CustomerName",
      colName: "customer",
      keyValue: filteredData[0]['PARTY NAME'], 
      data: filteredData,
    };
  } catch (error) {
    console.error("Error in filterByCustomerName:", error);
    return "Error filtering by customer name";
  }
}

function sumByColName(data, filterCriteria) {
  try {
    if (!Array.isArray(data) || data.length === 0) {
      return "Empty data array received";
    }

    const sumColumnNames = filterCriteria.ColumnName.filter(item => SUM_COLS.includes(item));
    
    // Calculate sums for the specified columns
    let result = []

    sumColumnNames.map(sumCol => {

      const sum = data.reduce((acc, item) => {
        const value = parseFloat(item[sumCol]);
        if (!isNaN(value)) {
          return acc + value;
        } else {
          console.warn(`Invalid value for ${sumCol}:`, item[sumCol]);
          return acc;
        }
      }, 0);

      result.push({
        sumCol,
        SumColVal: `${sum.toLocaleString()} Kg`,
      });
    });

    if (filterCriteria.ColumnName.includes("CONTRACT RATE")) {
      const resp = getContractRate(data, filterCriteria);
      result.push({
        sumCol: "CONTRACT RATE",
        SumColVal: resp,
      });
    }

    return result;
  } catch (error) {
    console.error("Error in sumByColName:", error);
    return "Error summing by column name";
  }
}

function getContractRate(data) {
  try {
    if (!Array.isArray(data) || data.length === 0) {
      return "Empty data array received";
    }
    let contractValSum = 0
    let contractQtyValSum = 0

    data.map((item) => {
      const contractQty = parseFloat(item["CONTRACT QTY"]);
      const contractVal = parseFloat(
        item["CONTRACT QTY"] * item["CONTRACT RATE"]
      );
      if (!isNaN(contractQty) && !isNaN(contractVal)) {
        contractValSum = contractValSum + contractVal;
        contractQtyValSum = contractQtyValSum + contractQty;
      } else {
        console.warn(`Invalid value for ${sumCol}:`, item[sumCol]);
        return acc;
      }
    });

    const result = (contractValSum/contractQtyValSum).toFixed(2)

    return result;
  } catch (error) {
    console.error("Error in getContractRate:", error);
    return "Error summing by column name";
  }
}

function groupByAndSum(data, parameters) {
  try {

    if (!Array.isArray(data) || data.length === 0) {
      return "Empty data array received";
    }
    // const filterColName = Object.keys(parameters).filter((key) =>
    //   FILTER_COLS.includes(key) && parameters[key] !== "" && parameters[key] !== null && parameters[key] !== undefined
    // );


    const { filteredData, filterStr } = filter(data, parameters);

    if (!Array.isArray(filteredData) || filteredData.length === 0) {
      return "Empty data array received";
    }

    let sumColName = SUM_COLS.find((col) =>
      parameters.ColumnName.includes(col)
    );

    if(parameters.ColumnName[0] === "CONTRACT RATE"){
      sumColName = parameters.ColumnName[0]
    }

    let groupByColName = parameters.ColumnName[0];
    if (parameters?.GroupBy?.length) {
      groupByColName = parameters.GroupBy;
    }

    const result = filteredData.reduce((acc, obj) => {
      let key = obj[groupByColName];
      if (!acc[key]) {
        acc[key] = {
          [groupByColName]: key,
          [`total ${sumColName}`]: 0,
          totalContractQty: 0,
          totalContractRateTimesQty: 0,
        };
      }
    
      if (sumColName === 'contract rate') {
        acc[key].totalContractQty += parseFloat(obj['contract qty'], 10);
        acc[key].totalContractRateTimesQty += parseFloat(obj['contract rate']) * parseFloat(obj['contract qty'], 10);
      } else {
        acc[key][`total ${sumColName}`] += parseFloat(obj[sumColName], 10);
      }
    
      return acc;
    }, {});
    
    Object.values(result).forEach(group => {
      if (sumColName === 'contract rate') {
        group[`total ${sumColName}`] = (group.totalContractRateTimesQty / group.totalContractQty).toFixed(2);
        delete group.totalContractQty;
        delete group.totalContractRateTimesQty;
      }
    });

    const sortedData = sortData(Object.values(result), `total ${sumColName}`, parameters.sortOrder || "desc").slice(0, 10);
    const finalResult = sortedData.map(item => `${item[groupByColName]} :- ${item[`total ${sumColName}`].toLocaleString()} Kg`).join('\n');

    const responseHeader = `${groupByColName} : ${sumColName}`;

    // const formattedResponse = `${responseHeader}\n${finalResult}`;

    // return formattedResponse;
    const response = `
Here are the details:-
---------------------
${filterStr.length ? 'Filter by:\n' + filterStr : ''}
Group by:
${groupByColName}
---------------------
${responseHeader}
${finalResult}
    `.trim();
    return response;
    // return finalResult;
  } catch (error) {
    console.error("Error in groupByAndSum:", error);
    return "An error occurred while processing your request.";
  }
}

function normalizeString(str) {
  return str.replace(/\./g, "").toLowerCase();
}

const sortData = (data, columnIndex, order = "asc") => {
  try {
    return data.sort((a, b) => {
      if (order === "asc") {
        return a[columnIndex] > b[columnIndex] ? 1 : -1;
      } else {
        return a[columnIndex] < b[columnIndex] ? 1 : -1;
      }
    });
  } catch (error) {
    console.error("Error in sortData:", error);
    return "Error sorting data";
  }
};

function filterDataByDatePeriod(data, datePeriod, key) {

  let filteredData
  let keyValue

  if (datePeriod[0].startDate) {
    let startDate = moment(datePeriod[0].startDate).valueOf();
    let endDate = moment(datePeriod[0].endDate).valueOf();
    let startDateDisplay = moment(datePeriod[0].startDate).format("DD-MMM-YYYY");
    let endDateDisplay = moment(datePeriod[0].endDate).format("DD-MMM-YYYY");
    filteredData =  data.filter(item => {
      const itemDate = moment(item.DATE, 'DD-MMM-YYYY').valueOf();
      return itemDate >= startDate && itemDate <= endDate;
    });
    keyValue = `${startDateDisplay} to ${endDateDisplay}`
  } else {
    let date = moment(datePeriod[0]).format('DD-MMM-YYYY')
    filteredData =  data.filter(item => {
      const itemDate = moment(item.DATE, 'DD-MMM-YYYY')
      return itemDate._i === date
    });
    keyValue = `${date}`
  }



  return {
    key,
    colName: FIELD_MAPPING[key],
    keyValue,
    data: filteredData,
  };
}

function measureData(data, filterCriteria) {
  if (!Array.isArray(data) || data.length === 0) {
    return "Empty data array received";
  }

  let result;

  const colName = filterCriteria.ColumnName[0];

  // Convert string values to numbers for the specified column
  const numericData = data.map(item => ({
    ...item,
    [colName]: parseFloat(item[colName])
  }));

  if (filterCriteria.measurement === 'Maximum') {
    result = _.maxBy(numericData, item => item[colName]);
  }

  if (filterCriteria.measurement === 'Minimum') {
    result = _.minBy(numericData, item => item[colName]);
  }

  if (filterCriteria.measurement === 'Average') {
    const sum = _.sumBy(numericData, item => item[colName]);
    const avg = sum / numericData.length;
    return avg;
  }

  return result ? `${filterCriteria.measurement} value of customer ${result['PARTY NAME']} is ${result[colName].toLocaleString()} Kg` : 'No result found';
}


module.exports = {
  filterAndSum,
  groupByAndSum,
};
