import path from 'path';
import { fileURLToPath } from 'url';
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import * as dotenv from 'dotenv';
import process from 'process';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../', '.env') });

const ProductsTableName = process.env.PRODUCTS_TABLE_NAME;
const StocksTableName = process.env.STOCKS_TABLE_NAME;
const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({ region: 'eu-west-1' }));

export const getProductById = async (id) => {
  const [product, stock] = await Promise.all([
    dynamo.send(
      new GetItemCommand({
        TableName: ProductsTableName,
        Key: {
          id: { S: id },
        },
      })
    ),
    dynamo.send(
      new GetItemCommand({
        TableName: StocksTableName,
        Key: {
          productId: { S: id },
        },
      })
    ),
  ]);

  if (product.Item) {
    return {
      ...product.Item,
      count: stock.Item?.count ?? 0,
    };
  }
  return undefined;
};

// 7567ec4b-b10c-45c5-9345-fc73c48a80a1 - not in stock
// 7567ec4b-b10c-48c5-9345-fc73c48a80aa - count 14
// const res = await getProductById("7567ec4b-b10c-48c5-9345-fc73c48a80aa");
// const res = await getProductById("7567ec4b-b10c-45c5-9345-fc73c48a80a1");
const res = await getProductById('7567ec4b-b10c-48c5-9345-fc73c48a80aa');
console.log(res);