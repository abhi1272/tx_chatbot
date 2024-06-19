const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();

app.use(bodyParser.json());

const API_BASE_URL = 'https://om-agency-bk.vercel.app/api/v1'; 

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

const handleCategory = async (req, res) => {

    const intentName = req.body.queryResult.intent.displayName;
    const category = req.body.queryResult.parameters.categoryname;

    if (intentName === 'AddCategory') {
        try {
            await callApi('POST', `${API_BASE_URL}/category/add`, {"name": category});
            return `Category ${category} added successfully.`
        } catch (error) {
            return `Failed to add category ${category}.`
        }
    } else if (intentName === 'DeleteCategory') {
        try {
            await callApi('DELETE', `${API_BASE_URL}/categories`, { data: { category } });
            res.json({
                fulfillmentText: `Category ${category} deleted successfully.`
            });
        } catch (error) {
            res.json({
                fulfillmentText: `Failed to delete category ${category}.`
            });
        }
    } else if (intentName === 'ListCategory') {
        try {
            const categories = await callApi('GET', `${API_BASE_URL}/category`);
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
    handleCategory
}