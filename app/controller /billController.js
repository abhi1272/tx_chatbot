const _ = require('lodash');
const { ObjectId } = require('mongodb');

async function getTotalOutstandingAmount(db) {
  const bills = await db.collection('bills').find().toArray();
  return _.sumBy(bills, 'netBalance');
}

async function getLargestBillAmount(db) {
  const bills = await db.collection('bills').find().toArray();
  const largestBill = _.maxBy(bills, 'bill_amount');
  return largestBill ? largestBill.bill_amount : 0;
}

async function getOldestBillDate(db) {
  const bills = await db.collection('bills').find().toArray();
  const oldestBill = _.minBy(bills, bill => new Date(bill.bill_date));
  return oldestBill ? new Date(oldestBill.bill_date).toDateString() : 'No bills found';
}

async function getBillsByCustomer(db, customerName) {
  return db.collection('bills').find({ 'customer.name': customerName }).toArray();
}

async function getTotalBillsByCustomer(db, customerName) {
  const bills = await db.collection('bills').find({ 'customer.name': customerName }).toArray();
  return bills.length;
}

async function getAverageBillAmount(db) {
  const bills = await db.collection('bills').find().toArray();
  return _.meanBy(bills, 'bill_amount');
}

async function getBillsOverAmount(db, amount) {
  return db.collection('bills').find({ 'bill_amount': { $gt: amount } }).toArray();
}

async function getRecentBills(db, date) {
  return db.collection('bills').find({ 'createdAt': { $gte: new Date(date) } }).toArray();
}

async function getTotalOutstandingAmountByCustomer(db, customerName) {
  const bills = await db.collection('bills').find({ 'customer.name': customerName }).toArray();
  return _.sumBy(bills, 'netBalance');
}

async function getBillsByArea(db, area) {
  return db.collection('bills').find({ 'customer.area': area }).toArray();
}

module.exports = {
  getTotalOutstandingAmount,
  getLargestBillAmount,
  getOldestBillDate,
  getBillsByCustomer,
  getTotalBillsByCustomer,
  getAverageBillAmount,
  getBillsOverAmount,
  getRecentBills,
  getTotalOutstandingAmountByCustomer,
  getBillsByArea,
};
