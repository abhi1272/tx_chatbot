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

    const customerNames = _.uniqBy(filteredData, function (e) {
      return e['PARTY NAME'];
    });

  
    return {
      key: "CustomerName",
      colName: "Best Match Customer",
      keyValue: customerNames.map(item => `${item['PARTY NAME']}`).join(', '), 
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

    let sumColumnNames = filterCriteria.ColumnName.filter(item => SUM_COLS.includes(item));
    sumColumnNames = sumColumnNames.filter(col => col !== 'Contract Rate Converted')
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
        SumColVal: `${Math.round(sum).toLocaleString()} Kg`,
      });
    });

    if (filterCriteria.ColumnName.includes("Contract Rate Converted")) {
      const resp = getContractRate(data, filterCriteria);
      result.push({
        sumCol: "Contract Rate Converted",
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
        item["CONTRACT QTY"] * item["Contract Rate Converted"]
      );
      if (!isNaN(contractQty) && !isNaN(contractVal)) {
        contractValSum = contractValSum + contractVal;
        contractQtyValSum = contractQtyValSum + contractQty;
      } else {
        console.warn(`Invalid value for ${sumCol}:`, item[sumCol]);
        return acc;
      }
    });

    const result = `\u20B9 ${(contractValSum/contractQtyValSum).toFixed(2)}`

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

    const { filteredData, filterStr } = filter(data, parameters);

    if (!Array.isArray(filteredData) || filteredData.length === 0) {
      return "Empty data array received";
    }

    let sumColNames = parameters.ColumnName.filter(col => SUM_COLS.includes(col));

    // if (parameters.ColumnName.includes("Contract Rate Converted")) {
    //   sumColNames.push("Contract Rate Converted");
    // }

    let groupByColNames = [];
    if (parameters?.GroupBy?.length) {
      groupByColNames = [...groupByColNames, ...parameters.GroupBy];
    }

    const parseDate = (dateStr) => {
      return moment(dateStr, 'D-MMM-YYYY').format('YYYY-MM-DD');
    };

    const result = _(filteredData)
      .groupBy(item => groupByColNames.map(col => col.toLowerCase() === 'date' ? parseDate(item[FIELD_MAPPING[col]]) : item[col]).join('|'))
      .mapValues(items => {
        const initialValue = sumColNames.reduce((acc, col) => {
          acc[`total ${col}`] = 0;
          return acc;
        }, {
          totalContractQty: 0,
          totalContractRateTimesQty: 0,
        });

        const aggregated = items.reduce((acc, obj) => {
          sumColNames.forEach(sumColName => {
            if (sumColName === 'Contract Rate Converted') {
              acc.totalContractQty += parseFloat(obj['CONTRACT QTY']);
              acc.totalContractRateTimesQty += parseFloat(obj['Contract Rate Converted']) * parseFloat(obj['CONTRACT QTY']);
            } else {
              acc[`total ${sumColName}`] += parseFloat(obj[sumColName]);
            }
          });
          return acc;
        }, initialValue);

        if (sumColNames.includes('Contract Rate Converted')) {
          aggregated[`total Contract Rate Converted`] = `\u20B9 ${parseFloat((aggregated.totalContractRateTimesQty / aggregated.totalContractQty).toFixed(2))}`;
          delete aggregated.totalContractQty;
          delete aggregated.totalContractRateTimesQty;
        }

        return aggregated;
      })
      .value();

    const sortedData = _.orderBy(Object.entries(result), ([key, value]) => value[`total ${sumColNames[0]}`], parameters.sortOrder || 'desc')
      .slice(0, 100)
      .map(([key, value]) => {
        const sums = sumColNames.map(col => `${col === 'Contract Rate Converted' ? value[`total ${col}`] :  Math.round(value[`total ${col}`]).toLocaleString()} ${col === 'Contract Rate Converted' ? '' : 'Kg'}`).join(', ');
        return `${key.split('|').join(', ')} :- ${sums}`;
      })
      .join('\n');

    const responseHeader = `${groupByColNames.join(', ')} : ${sumColNames.join(', ')}`;

    const response = `
${filterStr.length ? 'Filter by:\n' + filterStr : ''}
Group by:
${groupByColNames.join(', ')}
---------------------
${responseHeader}
${sortedData}
    `.trim();

    return response;
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
