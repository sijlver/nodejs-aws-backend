import { S3Handler } from 'aws-lambda';
import AWS from 'aws-sdk';
import csvParser from 'csv-parser';

const {
  S3_BUCKET_NAME,
  S3_BUCKET_REGION,
  SECRET_ACCESS_KEY,
  ACCESS_KEY_ID,
  SQS_REGION,
  SQS_URL
} = process.env;

const uploadData = ({ s3, sqs, sqsUrl, readableConfig, parser }) =>
  new Promise((resolve, reject) => {
    const readableStream = s3.getObject(readableConfig)
      .createReadStream();

    readableStream
      .pipe(parser)
      .on('data', async data => {
        const message = JSON.stringify({ ...data, status: 'data' });

        try {
          await sqs.sendMessage({
            QueueUrl: sqsUrl,
            MessageBody: message
          }).promise();
          console.log(`Message: ${message} was successfully sent to sqs!`);
        } catch(err) {
          console.log(`Error ${err} occurred during sending the message: ${message} to sqs!`);
        }
      })
      .on('error', reject)
      .on('end', async () => {
        const message = `File: ${readableConfig.Key} was successfully parsed and sent to sqs`;

        try {
          await sqs.sendMessage({
            QueueUrl: sqsUrl,
            MessageBody: JSON.stringify({ message, status: 'end' })
          }).promise();
          console.log(message);
        } catch(err) {
          console.log(`Error occurred during sending the message: ${message} to sqs!`);
        }
        resolve();
      });
  })

const importFileParser: S3Handler = async event =>  {
  console.log('Event data: ', event);

  const s3 = new AWS.S3({
    region: S3_BUCKET_REGION,
    signatureVersion: 'v4',
    secretAccessKey: SECRET_ACCESS_KEY,
    accessKeyId: ACCESS_KEY_ID
  });
  const sqs = new AWS.SQS({
    region: SQS_REGION,
    secretAccessKey: SECRET_ACCESS_KEY,
    accessKeyId: ACCESS_KEY_ID
  });

  for (const record of event.Records) {
    try {
      const key = record.s3.object.key;

      await uploadData({
        s3,
        sqs,
        sqsUrl: SQS_URL,
        readableConfig: {
          Bucket: S3_BUCKET_NAME,
          Key: key
        },
        parser: csvParser()
      });

      await s3.deleteObject({
        Bucket: S3_BUCKET_NAME,
        Key: key
      }).promise();
      console.log(`File: ${key} was successfully deleted!`);
    } catch (err) {
      console.log(`Error occurred: ${err}`);
    }
  };
};


export default importFileParser;
