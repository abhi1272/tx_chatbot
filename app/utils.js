const sortData = (data, columnIndex, order = 'asc') => {
    return data.sort((a, b) => {
      if (order === 'asc') {
        return a[columnIndex] > b[columnIndex] ? 1 : -1;
      } else {
        return a[columnIndex] < b[columnIndex] ? 1 : -1;
      }
    });
  };
  
  const groupBy = (data, columnIndex) => {
    return data.reduce((acc, row) => {
      const key = row[columnIndex];
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(row);
      return acc;
    }, {});
  };
  
  const aggregateData = (data, columnIndex, operation) => {
    switch (operation) {
      case 'sum':
        return data.reduce((acc, row) => acc + parseFloat(row[columnIndex]), 0);
      case 'avg':
        return data.reduce((acc, row) => acc + parseFloat(row[columnIndex]), 0) / data.length;
      // Add more operations as needed
      default:
        return null;
    }
  };
  