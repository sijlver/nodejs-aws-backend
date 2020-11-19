import S3 from 'aws-sdk/clients/s3';
import { APIGatewayProxyHandler } from 'aws-lambda';

const {
  S3_BUCKET_NAME,
  S3_BUCKET_FOLDER_UPLOADED,
  S3_BUCKET_CONTENT_TYPE,
  S3_BUCKET_REGION,
  S3_BUCKET_SIGNED_URL_EXPIRES,
  SECRET_ACCESS_KEY,
  ACCESS_KEY_ID
} = process.env;
const DEFAULT_HEADERS = {
  'Access-Control-Allow-Origin': '*'
};

const getImportProductsFile: APIGatewayProxyHandler = async event =>  {
  console.log('Event data: ', event);
  let body;
  let statusCode = 200;

  try {
    const { name } = event.queryStringParameters;
    const params = {
      Bucket: S3_BUCKET_NAME,
      Key: `${S3_BUCKET_FOLDER_UPLOADED}/${name}`,
      Expires: Number(S3_BUCKET_SIGNED_URL_EXPIRES),
      ContentType: S3_BUCKET_CONTENT_TYPE
    };
    const s3 = new S3({
      region: S3_BUCKET_REGION,
      signatureVersion: 'v4',
      secretAccessKey: SECRET_ACCESS_KEY,
      accessKeyId: ACCESS_KEY_ID
    });

    const url = await s3.getSignedUrlPromise('putObject', params);
    console.log(`Signed url: ${url} was successfully received!`);
    

    body = url;
  } catch (err) {
    console.error('Error during getting signed url:', err);

    statusCode = 500;
    body = err;
  }

  return ({
    statusCode,
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(body)
  });
};


export default getImportProductsFile;
