import AWS from 'aws-sdk';

import { addProduct } from '../helpers/products-service';

const { SNS_ARN, SNS_REGION } = process.env;

const addAndPublishProducts = async ({ data }) => {
  const sns = new AWS.SNS({ region: SNS_REGION });

  return Promise.all(data.map(async ({ body }) => {
    try {
      const product = JSON.parse(body);

      await addProduct({ product });
      console.log(`Product: ${product} was added to the db!`);

      sns.publish({
        TopicArn: SNS_ARN,
        Message: JSON.stringify(product),
        Subject: 'Product',
        MessageAttributes: {
          status: {
            DataType: 'String.Array',
            StringValue: JSON.stringify([product.status])
          }
        }
      }, error => {
        if (error) {
          console.log(`Product: ${product} wasn't sent to the queue!`);
        }
      });
    } catch (err) {
      console.log(`Error: ${err} occurred for the ${body}!`)
    }
  }))
};

const catalogBatchProcess = async event =>  {
  console.log(`Event data: ${event}`);

  try {
    await addAndPublishProducts({ data: event.Records });
    console.log('Products were successfully added and published!');
  } catch (err) {
    console.error(`Error during adding/publishing products: ${err}`);
  }
};


export default catalogBatchProcess;
