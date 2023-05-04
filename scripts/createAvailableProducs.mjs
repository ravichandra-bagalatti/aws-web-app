import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { DynamoDBClient, ExecuteTransactionCommand } from '@aws-sdk/client-dynamodb';
import * as dotenv from 'dotenv';
import process from 'process';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../', '.env') });

const ProductsTableName = process.env.PRODUCTS_TABLE_NAME;
const StocksTableName = process.env.STOCKS_TABLE_NAME;
const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({ region: 'eu-west-1' }));

// id: { type: 'string' },
// description: { type: 'string' },
// price: { type: 'number' },
// title: { type: 'string' },
// count: { type: 'number' },

export const createAvailableProduct = async ({ title, description, price, count }) => {
  const id = crypto.randomUUID();
  const command = new ExecuteTransactionCommand({
    TransactStatements: [
      {
        Statement: `INSERT INTO "${ProductsTableName}" VALUE {'id':?, 'title':?, 'description':?, 'price':?}`,
        Parameters: [{ S: id }, { S: title }, { S: description }, { N: price.toString() }],
      },
      {
        Statement: `INSERT INTO "${StocksTableName}" VALUE {'productId':?, 'count':?}`,
        Parameters: [{ S: id }, { N: count.toString() }],
      },
    ],
  });
  return await dynamo.send(command);
};

const res = await createAvailableProduct({
  title: 'Exercise (==== Del Me ====)',
  description: 'Exercise description',
  price: 11,
  count: 1111,
});
console.log(res);