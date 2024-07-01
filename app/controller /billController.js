const _ = require('lodash');
const { ObjectId } = require('mongodb');
const { getAllRecords } = require('../services/mongodb');
const cacheMethods = require('../services/cache');


async function getBillData(req, res) {
  // Determine which type of query is being asked

      // if (body.queryResult.intent.displayName.includes('Category')) {
    //   responseText = await handleCategory(req, res);
    // }

    // if (body.queryResult.intent.displayName.includes('Expense')) {
    //   responseText = await handleExpense(req, res);
    // }

    // if (body.queryResult.intent.displayName === "Get Students By Activity") {
    //   responseText = await handleRequest(req, res);
    // }

    // if (body.queryResult.intent.displayName === "bill") {
    //   responseText = await getBillData(req, res);
    // }

  const queryResult = req.body.queryResult;

  let responseText = "";
  const parameters =  queryResult.parameters;
  // Example: queryResult.parameters = {"type": "count", "field": "extracurricularActivity", "value": "Drama Club"}
  const query = queryResult.queryText; 

  if (query.includes('total outstanding amount') & !parameters.customerName) {
    const totalOutstandingAmount = await dataMethods.getTotalOutstandingAmount();
   return responseText = `The total outstanding amount across all bills is ${totalOutstandingAmount}`
  } else if (query.includes('largest bill amount')) {
    const largestBill = await dataMethods.getLargestBillAmount();
   return responseText = `The largest bill amount is ${largestBill.bill_amount} for bill number ${largestBill.bill_no}`
  } else if (query.includes('oldest bill date')) {
    const oldestBill = await dataMethods.getOldestBillDate();
   return responseText = `The oldest bill date is ${oldestBill.bill_date}`
  } else if (query.includes('bills for customer') & parameters.customerName) {
    const customerName = parameters.customerName;
    const billsByCustomer = await dataMethods.getBillsByCustomer(customerName);
   return responseText = `Bills for customer ${customerName}: ${JSON.stringify(billsByCustomer)}`
  } else if (query.includes('total bills for customer') & parameters.customerName) {
    const customerName = parameters.customerName;
    const totalBillsByCustomer = await dataMethods.getTotalBillsByCustomer(customerName);
   return responseText = `Total number of bills for customer ${customerName}: ${totalBillsByCustomer}`
  } else if (query.includes('average bill amount')) {
    const averageBillAmount = await dataMethods.getAverageBillAmount();
   return responseText = `The average bill amount is ${averageBillAmount}`
  } else if (query.includes('bills with an amount greater than') || parameters.amount) {
    const amount = parameters.amount;
    const billsOverAmount = await dataMethods.getBillsOverAmount(amount);
   return responseText = `Bills with an amount greater than ${amount}: ${JSON.stringify(billsOverAmount)}`
  } else if (query.includes('bills created after') || parameters.date) {
    const date = parameters.date;
    const recentBills = await dataMethods.getRecentBills(date);
   return responseText = `Bills created after ${date}: ${JSON.stringify(recentBills)}`
  } else if (query.includes('total outstanding amount for') || parameters.customerName) {
    const customerName = parameters.customerName;
    const totalOutstandingByCustomer = await dataMethods.getTotalOutstandingAmountByCustomer(customerName);
   return responseText = `The total outstanding amount for ${customerName} is ${totalOutstandingByCustomer}`
  } else if (query.includes('bills for customers in') || parameters.area) {
    const area = parameters.area;
    const billsByArea = await dataMethods.getBillsByArea(area);
   return responseText = `Bills for customers in ${area}: ${JSON.stringify(billsByArea)}`
  } else {
   return responseText = "I'm sorry, I didn't understand your query. Could you please rephrase?"
  }
}
const dataMethods = {
  getTotalOutstandingAmount: async () => {
    const data = cacheMethods.get('bills'); // Get the cached data
    return _.sumBy(data, 'bill_amount');
  },

  getLargestBillAmount: async () => {
    const data = cacheMethods.get('bills');
    return _.maxBy(data, 'bill_amount');
  },

  getOldestBillDate: async () => {
    const data = cacheMethods.get('bills');
    return _.minBy(data, 'bill_date');
  },

  getBillsByCustomer: async (customerName) => {
    const data = cacheMethods.get('bills');
    return _.filter(data, (bill) => bill.customer.name === customerName);
  },

  getTotalBillsByCustomer: async (customerName) => {
    const data = cacheMethods.get('bills');
    return _.size(_.filter(data, (bill) => bill.customer.name === customerName));
  },

  getAverageBillAmount: async () => {
    const data = cacheMethods.get('bills');
    return _.meanBy(data, 'bill_amount');
  },

  getBillsOverAmount: async (amount) => {
    const data = cacheMethods.get('bills');
    return _.filter(data, (bill) => bill.bill_amount > amount);
  },

  getRecentBills: async (date) => {
    const data = cacheMethods.get('bills');
    return _.filter(data, (bill) => new Date(bill.createdAt) > new Date(date));
  },

  getTotalOutstandingAmountByCustomer: async (customerName) => {
    const data = cacheMethods.get('bills');
    return _.sumBy(_.filter(data, (bill) => bill.customer.name === customerName), 'netBalance');
  },

  getBillsByArea: async (area) => {
    const data = cacheMethods.get('bills');
    return _.filter(data, (bill) => bill.customer.area === area);
  },
};

module.exports = { getBillData };