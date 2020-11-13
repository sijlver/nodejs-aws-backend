import { S3Handler } from 'aws-lambda';
import S3 from 'aws-sdk/clients/s3';
import csvParser from 'csv-parser';

const {
  S3_BUCKET_NAME,
  S3_BUCKET_FOLDER_UPLOADED,
  S3_BUCKET_FOLDER_PARSED,
  S3_BUCKET_REGION,
  SECRET_ACCESS_KEY,
  ACCESS_KEY_ID
} = process.env;

const uploadData = ({ s3, readableConfig, writableConfig, parser }) =>
  new Promise((resolve, reject) => {
    const readableStream = s3.getObject(readableConfig)
      .createReadStream();

    readableStream
      .pipe(parser)
      .on('data', async data => {
        const body = JSON.stringify(data);

        try {
          await s3.upload({
            ...writableConfig,
            Body: body
          }).promise();
          console.log(`File: ${body} was successfully uploaded!`);
        } catch(err) {
          console.log(`Error occurred during uploading data ${body}!`);
        }
      })
      .on('error', reject)
      .on('end', resolve);
  })

const importFileParser: S3Handler = async event =>  {
  console.log('Event data: ', event);

  const s3 = new S3({
    region: S3_BUCKET_REGION,
    signatureVersion: 'v4',
    secretAccessKey: SECRET_ACCESS_KEY,
    accessKeyId: ACCESS_KEY_ID
  });

  for (const record of event.Records) {
    try {
      const key = record.s3.object.key;

      await uploadData({
        s3,
        readableConfig: {
          Bucket: S3_BUCKET_NAME,
          Key: key
        },
        writableConfig: {
          Bucket: S3_BUCKET_NAME,
          Key: key.replace(S3_BUCKET_FOLDER_UPLOADED, S3_BUCKET_FOLDER_PARSED)
        },
        parser: csvParser()
      })
      console.log(`File: ${key} was successfully uploaded to ${S3_BUCKET_FOLDER_PARSED} folder!`);

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
