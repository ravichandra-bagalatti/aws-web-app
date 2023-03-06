'use strict';
const AWS = require('aws-sdk');

let responseBody = "";
let statusCode = 0;

const params = {
    TableName: "Products",
    Item: {
        id: '1234',
        title: 'New Car2',
        description: 'Brand New Car2',
        price: 23233
    }
};
exports.handler = async (event, context) => {
    const documentClient = new AWS.DynamoDB.DocumentClient();
    try {
        const data = await documentClient.put(params).promise();
        responseBody = JSON.stringify(data);
        statusCode = 201;
    } catch (err) {
        responseBody = `Unable to put products: ${err}`;
        statusCode = 403;
    }
    const response = {
        statusCode: statusCode,
        headers: {
            "Content-Type": "application/json"
        },
        body: responseBody
    };
    return response;
};