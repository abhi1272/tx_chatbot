const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const moment = require('moment')
const app = express();

app.use(bodyParser.json());

const API_BASE_URL = 'http://localhost:4000/api/v1'; 

const callApi = async (method, url, data = {}) => {
    try {
        const response = await axios({
            method,
            url,
            data,
            headers: {
                'Authorization': `Bearer ${process.env.AUTH_TOKEN}`
            }
        });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const handleExpense = async (req, res) => {

    const intentName = req.body.queryResult.intent.displayName;
    const category_name = req.body.queryResult.parameters.category_name;
    const amount = req.body.queryResult.parameters.amount;
    const date = req.body.queryResult.parameters.date;

    if (intentName === 'AddExpense') {
        try {
            await callApi("POST", `${API_BASE_URL}/expense/add`, {
              date: date ? moment(date).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
              amount: amount,
              type: {
                name: category_name,
              },
            });
            return `Expense ${expense} added successfully.`
        } catch (error) {
            return `Failed to add expense ${expense}.`
        }
    } else if (intentName === 'DeleteCategory') {
        try {
            await callApi('DELETE', `${API_BASE_URL}/categories`, { data: { expense } });
            res.json({
                fulfillmentText: `Expense ${expense} deleted successfully.`
            });
        } catch (error) {
            res.json({
                fulfillmentText: `Failed to delete expense ${expense}.`
            });
        }
    } else if (intentName === 'ListCategory') {
        try {
            const categories = await callApi('GET', `${API_BASE_URL}/expense`);
            const categoryNames = categories?.data.map(cat => cat.name).join('\n');
            return `Here are your categories:\n${categoryNames}`
        } catch (error) {
            return `Failed to retrieve categories.`
        }
    } else {
        res.json({
            fulfillmentText: 'Intent not recognized.'
        });
    }
}

module.exports = {
    handleExpense
}