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

    const filteredData = filter(data, filterCriteria);

    const sumResult = sumByColName(filteredData.data, filterCriteria);
    const formattedSumResult = sumResult.toLocaleString();

    return `${filterCriteria.ColumnName[0]} of ${filteredData.colName} ${filteredData.keyValue} is ${formattedSumResult} Kg.`;
  } catch (error) {
    console.error("Error in filterAndSum:", error);
    return "An error occurred while processing your request.";
  }
}

function filter(data, filterCriteria) {
  try {
    if (!data || data.length === 0) {
      return "Empty data array received";
    }

    const { ColumnName, ...criteria } = filterCriteria;

    let filteredData = data;
    Object.keys(criteria).forEach((key) => {
      if (criteria[key] !== "" && criteria[key].length !== 0) {
        if (key === "CustomerName") {
          filteredData = filterByCustomerName(filteredData.data ? filteredData.data : filteredData, filterCriteria);
        }
        if(key === "date-period"){
          filteredData = filterDataByDatePeriod(filteredData, filterCriteria['date-period'], key);
        } 
        if (key !== "CustomerName" && key !== "date-period") {
          filteredData = filterByCategory(filteredData, criteria[key], key);
        }
      }
    });

    return filteredData;
  } catch (error) {
    console.error("Error in filter:", error);
    return "Error filtering data";
  }
}

function filterByCategory(data, keyV, key) {
  try {
    if (!data || data.length === 0) {
      return "Empty data array received";
    }

    const filteredData = data.filter((row) => {
      if (key === 'CountofThreads' || key === 'Blend') {
        return +row[FIELD_MAPPING[key]] === +keyV;
      }
      return row[FIELD_MAPPING[key]] === keyV;
    });

    if (filteredData.length === 0) {
      return "No matching data found";
    }

    return {
      key,
      colName: FIELD_MAPPING[key],
      keyValue: filteredData.length ? filteredData[0][FIELD_MAPPING[key]] : "No matching data found",
      data: filteredData.length ? filteredData : [],
    };
  } catch (error) {
    console.error("Error in filterByCategory:", error);
    return "Error filtering by category";
  }
}

function filterByCustomerName(data, filterCriteria) {
  try {
    if (!data || data.length === 0) {
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
      keyValue: filteredData.length ? filteredData[0]["PARTY NAME"] : "No matching data found", 
      data: filteredData.length ? filteredData : [],
    };
  } catch (error) {
    console.error("Error in filterByCustomerName:", error);
    return "Error filtering by customer name";
  }
}

function sumByColName(data, filterCriteria) {
  try {
    if (!data || data.length === 0) {
      return "Empty data array received";
    }

    const columnName = filterCriteria.ColumnName.find(item => SUM_COLS.includes(item))
    return data.reduce((acc, item) => {
      const value = parseFloat(item[columnName]);
      if (!isNaN(value)) {
        return acc + value;
      } else {
        console.warn(`Invalid value for ${columnName}:`, item[columnName]);
        return acc;
      }
    }, 0);
  } catch (error) {
    console.error("Error in sumByColName:", error);
    return "Error summing by column name";
  }
}

function groupByAndSum(data, parameters) {
  try {
    if (!data || data.length === 0) {
      return "Empty data array received";
    }

    const filterColName = Object.keys(parameters).find((key) =>
      FILTER_COLS.includes(key) && parameters[key] !== "" && parameters[key] !== null && parameters[key] !== undefined
    );

    const sumColName = SUM_COLS.find((col) =>
      parameters.ColumnName.includes(col)
    );

    let groupByColName = parameters.ColumnName[0];
    if (parameters?.GroupBy?.length) {
      groupByColName = parameters.GroupBy;
    }

    let filterData = data;

    if (filterColName) {
      filterData = filter(data, parameters).data;
    }

    const result = filterData.reduce((acc, obj) => {
      let key = obj[groupByColName];
      if (!acc[key]) {
        acc[key] = { [groupByColName]: key, [`total ${sumColName}`]: 0 };
      }
      acc[key][`total ${sumColName}`] += +obj[sumColName];
      return acc;
    }, {});

    const sortedData = sortData(Object.values(result), `total ${sumColName}`, parameters.sortOrder || "desc").slice(0, 10);
    const finalResult = sortedData.map(item => `${item[groupByColName]} :- ${item[`total ${sumColName}`].toLocaleString()} Kg`).join('\n');
    return finalResult;
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
  const startDate = moment(datePeriod[0].startDate).valueOf();
  const endDate = moment(datePeriod[0].endDate).valueOf();
  const startDateDisplay = moment(datePeriod[0].startDate).format('DD-MMM-YYYY');
  const endDateDisplay = moment(datePeriod[0].endDate).format('DD-MMM-YYYY');

  const filteredData =  data.filter(item => {
    const itemDate = moment(item.DATE, 'DD-MMM-YYYY').valueOf();
    return itemDate >= startDate && itemDate <= endDate;
  });

  return {
    key,
    colName: FIELD_MAPPING[key],
    keyValue: `${startDateDisplay} to ${endDateDisplay}`,
    data: filteredData.length ? filteredData : [],
  };
}


module.exports = {
  filterAndSum,
  groupByAndSum,
};
