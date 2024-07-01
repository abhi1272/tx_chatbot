const stringSimilarity = require("string-similarity");
const {
  FIELD_MAPPING,
  FILTER_COLS,
  SUM_COLS,
} = require("../constants/dialogflow");

function filterAndSum(data, filterCriteria) {
  try {
    const filteredData = filter(data, filterCriteria);

    const sumResult = sumByColName(filteredData.data, filterCriteria);
    const formattedSumResult = sumResult.toLocaleString();

    return `${filterCriteria.ColumnName[0]} of ${filteredData.colName} ${filteredData.keyValue} is ${formattedSumResult}.`;
  } catch (error) {
    console.error("Error in filterAndSum:", error);
    return "An error occurred while processing your request.";
  }
}

function filter(data, filterCriteria) {
  try {
    const { ColumnName, ...criteria } = filterCriteria;

    let filteredData = [];
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
  } catch (error) {
    console.error("Error in filter:", error);
    throw new Error("Error filtering data");
  }
}

function filterByCategory(data, keyV, key) {
  try {
    const filteredData = data.filter((row) => {
      return row[FIELD_MAPPING[key]] === keyV;
    });

    if (filteredData.length === 0) {
      throw new Error("No matching data found");
    }

    return {
      key,
      colName: FIELD_MAPPING[key],
      keyValue: filteredData[0][FIELD_MAPPING[key]],
      data: filteredData,
    };
  } catch (error) {
    console.error("Error in filterByCategory:", error);
    throw new Error("Error filtering by category");
  }
}

function filterByCustomerName(data, filterCriteria) {
  try {
    const customerNameLower = normalizeString(filterCriteria.CustomerName);
    const partyNames = data.map((record) =>
      normalizeString(record["PARTY NAME"])
    );

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
      throw new Error("No matching customer found");
    }

    return {
      key: "CustomerName",
      colName: "customer",
      keyValue: filteredData[0]["PARTY NAME"],
      data: filteredData,
    };
  } catch (error) {
    console.error("Error in filterByCustomerName:", error);
    throw new Error("Error filtering by customer name");
  }
}

function sumByColName(data, filterCriteria) {
  try {
    const columnName = filterCriteria.ColumnName[0];
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
    throw new Error("Error summing by column name");
  }
}

function groupByAndSum(data, parameters) {
  try {
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
      acc[key][`total ${sumColName}`] += +obj[sumColName];
      return acc;
    }, {});

    const sortedData = sortData(Object.values(result), `total ${sumColName}`, parameters.sortOrder || "desc").slice(0, 10);
    const finalResult = sortedData.map(item => `${item[parameters.ColumnName[0]]} :- ${item[`total ${sumColName}`].toLocaleString()}`).join('\n');
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
    throw new Error("Error sorting data");
  }
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
