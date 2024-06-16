const { MongoClient } = require('mongodb');
const { mongoUri } = require('../config/config');
const cacheMethods = require('./cache');

const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
let db;

async function connectToDatabase() {
  if (!db) {
    await client.connect();
    db = client.db('pocketkhata'); // Replace with your database name
  }
  return db;
}

async function getAllRecords(collectionName) {
  const database = await connectToDatabase();
  const collection = database.collection(collectionName);
  return await collection.find({}).toArray();
}

async function getBillRecords() {
  const bills = await getAllRecords("bills"); // Assuming you have a Bill model
  cacheMethods.set("bills", bills);
}

getBillRecords()

module.exports = { connectToDatabase, getAllRecords };
