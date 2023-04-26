import * as dotenv from 'dotenv';
import * as process from 'process';

dotenv.config();
const buildLambdaHandlerPath = (workingDirectory: string, lambdaHandlerName = 'main') => {
    return `${workingDirectory.split(process.cwd())[1].substring(1).replace(/\\/g, '/')}/handler.${lambdaHandlerName}`;
  };
export const importFileParser = {
  handler: buildLambdaHandlerPath(__dirname),
  events: [
    {
      // https://www.serverless.com/framework/docs/providers/aws/events/s3
      s3: {
        bucket: process.env.PRODUCTS_IMPORT_BUCKET_NAME,
        event: 's3:ObjectCreated:*',
        rules: [{ prefix: `${process.env.PRODUCTS_IMPORT_BUCKET_INPUT_KEY}/` }, { suffix: 'csv' }],
        existing: true,
      },
    },
  ],
  description: 'Get an objects from S3, parse them using csv-parser and log each record to be shown in CloudWatch',
  environment: {
    AwsRegion: process.env.AWS_REGION,
    ProductsImportBucketName: process.env.PRODUCTS_IMPORT_BUCKET_NAME,
    ProductsImportBucketInputStorageKey: process.env.PRODUCTS_IMPORT_BUCKET_INPUT_KEY,
    ProductsImportBucketOutputStorageKey: process.env.PRODUCTS_IMPORT_BUCKET_OUTPUT_KEY,
  },
};