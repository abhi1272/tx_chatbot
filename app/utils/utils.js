const stringSimilarity = require("string-similarity");

function filterAndSum(data, filterCriteria) {
  const { ColumnName, ...criteria } = filterCriteria;

  // Filter the data based on the provided criteria
  let filteredData = [];
  let sumResult = 0;
  Object.keys(criteria).forEach((key) => {
    if (criteria[key] !== "" && criteria[key].length !== 0) {
      if (key === "YarnCategory") {
        filteredData = filterByYarnCategory(data, filterCriteria);
      } else if (key === "CustomerName") {
        filteredData = filterByCustomerName(data, filterCriteria);
      } else if (key === "BusinessLine") {
        filteredData = filterByBusinessLine(data, filterCriteria);
      } else if (key === "MaterialGroupDesc") {
        filteredData = filterByMaterialGroupDesc(data, filterCriteria);
      } else if (key === "SalesOffice") {
        filteredData = filterBySalesOffice(data, filterCriteria);
      }
    }
  });

  sumResult = sumByColName(filteredData.data, filterCriteria);

  sumResult = sumResult.toLocaleString();

  return `${filterCriteria.ColumnName[0]} of ${filteredData.colName} ${filteredData.keyValue} is ${sumResult}.`;
}

function filterByYarnCategory(data, filterCriteria) {
  const filteredData = data.filter((row) => {
    return row["Yarn Category"] === filterCriteria.YarnCategory;
  });
  return {
    key: "YarnCategory",
    colName: "Yarn Category",
    keyValue: filteredData[0]["Yarn Category"],
    data: filteredData,
  };
}

function filterByBusinessLine(data, filterCriteria) {
  const filteredData = data.filter((row) => {
    return row["Business Line"] === filterCriteria.BusinessLine;
  });
  return {
    key: "YarnCategory",
    colName: "Business Line",
    keyValue: filteredData[0]["Business Line"],
    data: filteredData,
  };
}

function filterByMaterialGroupDesc(data, filterCriteria) {
  const filteredData = data.filter((row) => {
    return row["Material Group Desc"] === filterCriteria.MaterialGroupDesc;
  });
  return {
    key: "MaterialGroupDesc",
    colName: "Material Group Desc",
    keyValue: filteredData[0]["Material Group Desc"],
    data: filteredData,
  };
}

function filterBySalesOffice(data, filterCriteria) {
  const filteredData = data.filter((row) => {
    return row["Sales Office Name"] === filterCriteria.SalesOffice;
  });
  return {
    key: "SalesOffice",
    colName: "Sales Office Name",
    keyValue: filteredData[0]["Sales Office Name"],
    data: filteredData,
  };
}

function normalizeString(str) {
  return str.replace(/\./g, "").toLowerCase();
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


// const sortData = (data, columnIndex, order = "asc") => {
//   return data.sort((a, b) => {
//     if (order === "asc") {
//       return a[columnIndex] > b[columnIndex] ? 1 : -1;
//     } else {
//       return a[columnIndex] < b[columnIndex] ? 1 : -1;
//     }
//   });
// };

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
  filterAndSum
};
