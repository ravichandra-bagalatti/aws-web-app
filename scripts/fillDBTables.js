const AWS = require('aws-sdk');
const productsMockData = require('../products-service/mock-data/mock-products-response.json');
const stocksMockData = require('../products-service/mock-data/mock-stocks.json');

AWS.config.update({ region: 'eu-west-1' });

const ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

const post = (params) => {
  ddb.putItem(params, (err, data) => {
    if (err) {
      console.log('Error: ', err);
    } else {
      console.log('Success: ', { params, data });
    }
  });
};

const productsDbItems = productsMockData.products.map(({ id, description, title, price }) => ({
  TableName: 'products-table',
  Item: {
    id: { S: id },
    description: { S: description },
    title: { S: title },
    price: { N: price.toString() },
  },
}));

const stocksDbItems = stocksMockData.stocks.map(({ product_id, count }) => ({
  TableName: 'stock-table',
  Item: {
    product_id: { S: product_id },
    count: { N: count.toString() },
  },
}));

[...productsDbItems, ...stocksDbItems].forEach(post);