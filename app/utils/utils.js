const stringSimilarity = require("string-similarity");
const {
  FIELD_MAPPING,
  FILTER_COLS,
  SUM_COLS,
} = require("../constants/dialogflow");

function filterAndSum(data, filterCriteria) {
  const filteredData = filter(data, filterCriteria);

  sumResult = sumByColName(filteredData.data, filterCriteria);

  sumResult = sumResult.toLocaleString();

  return `${filterCriteria.ColumnName[0]} of ${filteredData.colName} ${filteredData.keyValue} is ${sumResult}.`;
}

function filter(data, filterCriteria) {
  const { ColumnName, ...criteria } = filterCriteria;

  // Filter the data based on the provided criteria
  let filteredData = [];
  let sumResult = 0;
  Object.keys(criteria).forEach((key) => {
    if (criteria[key] !== "" && criteria[key].length !== 0) {
      if (key === "CustomerName") {
        filteredData = filterByCustomerName(data, filterCriteria);
      } else {
        filteredData = filterByCategory(data, criteria[key], key);
      }
    }
  });

  return filteredData;
}

function filterByCategory(data, keyV, key) {
  const filteredData = data.filter((row) => {
    return row[FIELD_MAPPING[key]] === keyV;
  });
  return {
    key,
    colName: FIELD_MAPPING[key],
    keyValue: filteredData[0][FIELD_MAPPING[key]],
    data: filteredData,
  };
}

function filterByCustomerName(data, filterCriteria) {
  const customerNameLower = normalizeString(filterCriteria.CustomerName);

  // Convert all party names to normalized lowercase for case-insensitive comparison
  const partyNames = data.map((record) =>
    normalizeString(record["PARTY NAME"])
  );

  // Find the best match using normalized names
  const matches = stringSimilarity.findBestMatch(customerNameLower, partyNames);
  const bestMatch = matches.bestMatch;

  console.log("Best match:", bestMatch.target);

  // Filter data based on the best match
  const filteredData = data.filter((record) => {
    return (
      stringSimilarity.compareTwoStrings(
        normalizeString(record["PARTY NAME"]),
        bestMatch.target
      ) > 0.7 // Adjust similarity threshold as needed
    );
  });

  return {
    key: "CustomerName",
    colName: "customer",
    keyValue: filteredData[0]["PARTY NAME"],
    data: filteredData,
  };
}

function sumByColName(data, filterCriteria) {
  const columnName = filterCriteria.ColumnName[0]; // Assuming ColumnName is an array with a single element

  return data.reduce((acc, item) => {
    // Remove commas, trim whitespace, and convert the value to a number
    const value = parseFloat(item[columnName]);
    // Check if the parsed value is a valid number
    if (!isNaN(value)) {
      return acc + value; // Add the value to the accumulator
    } else {
      return acc; // Ignore invalid values
    }
  }, 0);
}

function groupByAndSum(data, parameters) {
  const filterColName = Object.keys(parameters).find((key) =>
    FILTER_COLS.includes(key)
  );

  const sumColName = SUM_COLS.find((col) =>
    parameters.ColumnName.includes(col)
  );

  let filterData = data;

  if (filterColName) {
    filterData = filter(data, parameters).data;
  }

  const result = filterData.reduce((acc, obj) => {
    let key = obj[parameters.ColumnName[0]];
    if (!acc[key]) {
      acc[key] = { [parameters.ColumnName[0]]: key, [`total ${sumColName}`]: 0 };
    }
    acc[key][ [`total ${sumColName}`]] += +obj[sumColName];
    return acc;
  }, {});
  const sortedData = sortData(Object.values(result),  [`total ${sumColName}`], parameters.sortOrder || "desc").slice(0, 10);
  const finalResult = sortedData.map(item => `${item[parameters.ColumnName[0]]} :- ${item[ [`total ${sumColName}`]].toLocaleString()}`).join('\n');
  return finalResult;
}

function normalizeString(str) {
  return str.replace(/\./g, "").toLowerCase();
}

const sortData = (data, columnIndex, order = "asc") => {
  return data.sort((a, b) => {
    if (order === "asc") {
      return a[columnIndex] > b[columnIndex] ? 1 : -1;
    } else {
      return a[columnIndex] < b[columnIndex] ? 1 : -1;
    }
  });
};


// function filterByBusinessLine(data, filterCriteria) {
//   const filteredData = data.filter((row) => {
//     return row["Business Line"] === filterCriteria.BusinessLine;
//   });
//   return {
//     key: "YarnCategory",
//     colName: "Business Line",
//     keyValue: filteredData[0]["Business Line"],
//     data: filteredData,
//   };
// }

// function filterByMaterialGroupDesc(data, filterCriteria) {
//   const filteredData = data.filter((row) => {
//     return row["Material Group Desc"] === filterCriteria.MaterialGroupDesc;
//   });
//   return {
//     key: "MaterialGroupDesc",
//     colName: "Material Group Desc",
//     keyValue: filteredData[0]["Material Group Desc"],
//     data: filteredData,
//   };
// }

// function filterBySalesOffice(data, filterCriteria) {
//   const filteredData = data.filter((row) => {
//     return row["Sales Office Name"] === filterCriteria.SalesOffice;
//   });
//   return {
//     key: "SalesOffice",
//     colName: "Sales Office Name",
//     keyValue: filteredData[0]["Sales Office Name"],
//     data: filteredData,
//   };
// }



// const groupBy = (data, columnIndex) => {
//   return data.reduce((acc, row) => {
//     const key = row[columnIndex];
//     if (!acc[key]) {
//       acc[key] = [];
//     }
//     acc[key].push(row);
//     return acc;
//   }, {});
// };

// const aggregateData = (data, columnIndex, operation) => {
//   switch (operation) {
//     case "sum":
//       return data.reduce((acc, row) => acc + parseFloat(row[columnIndex]), 0);
//     case "avg":
//       return (
//         data.reduce((acc, row) => acc + parseFloat(row[columnIndex]), 0) /
//         data.length
//       );
//     // Add more operations as needed
//     default:
//       return null;
//   }
// };

// const filterAndAggregateData = (data, filterCol, filterValue, sumField) => {
//   const filteredData = data
//     .filter((row) => {
//       return row[filterCol] === filterValue;
//     })
//     .reduce((acc, sum) => {
//       return acc + parseFloat(sum[sumField]);
//     });
// };

// function toPascalCase(str) {
//   return str
//     .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) =>
//       index === 0 ? match.toUpperCase() : match.toLowerCase()
//     )
//     .replace(/\s+/g, "");
// }

// function fromPascalCase(str) {
//   return str.replace(/([a-z])([A-Z])/g, "$1 $2").toUpperCase();
// }

module.exports = {
  filterAndSum,
  groupByAndSum,
};
