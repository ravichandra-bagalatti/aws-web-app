import { S3Event } from 'aws-lambda';
import { CopyObjectCommand, DeleteObjectCommand, GetObjectCommand, S3Client, GetObjectCommandOutput } from '@aws-sdk/client-s3';
import csvParser from 'csv-parser';
import { Readable } from 'stream';
import * as console from 'console';
import * as dotenv from 'dotenv';
import * as process from 'process';

dotenv.config();


const asStream = (response: GetObjectCommandOutput) => {
    return response.Body as Readable;
  };
const AwsRegion = process.env.AwsRegion;
const ProductsImportBucketName = process.env.UPLOAD_BUCKET_NAME;

const inputStorage = "uploaded";
const outputStorage = "parsed";

const client = new S3Client({ region: AwsRegion });

const parseProducts = async (s3BucketProductKey: string) => {
  // Read file
  const response = await client.send(
    new GetObjectCommand({
      Bucket: ProductsImportBucketName,
      Key: s3BucketProductKey,
    })
  );
  // Parsing records
  const stream = asStream(response).pipe(csvParser({}));
  for await (const record of stream) {
    console.log(' -- Product: ', record);
  }
};

const moveToOutput = async (s3BucketProductKey: string) => {
  console.log(` --- Copying to "${outputStorage}"...`);
  const copyResult = await client.send(
    new CopyObjectCommand({
      Bucket: ProductsImportBucketName,
      CopySource: `${ProductsImportBucketName}/${s3BucketProductKey}`,
      Key: s3BucketProductKey.replace(inputStorage, outputStorage),
    })
  );
  console.log(` --- Done:`, copyResult);
  console.log(` --- Removing origin one "${s3BucketProductKey}"...`);
  const removeResult = await client.send(
    new DeleteObjectCommand({
      Bucket: ProductsImportBucketName,
      Key: s3BucketProductKey,
    })
  );
  console.log(` --- Done:`, removeResult);
  return [copyResult, removeResult];
};

export const main = async (event: S3Event) => {
  try {
    console.log(`~~~~~ Importing file(s) Job started`);
    console.log('~~~~~ Payload(S3::TriggeredEvent::Records): ', event.Records);
    for (const record of event.Records) {
      const key = record.s3.object.key;
      console.log(`~~~~~ Processing file: "${key}"...`);
      await parseProducts(key);
      console.log(`~~~~~ The "${key}" file parsing complete`);
      await moveToOutput(key);
      console.log(`~~~~~ The "${key}" file moved to "${outputStorage}" output folder`);
    }
  } catch (error) {
    console.error('~~~~~ The error occurred: ', error);
  } finally {
    console.log(`~~~~~ Importing file(s) Job complete`);
  }
};