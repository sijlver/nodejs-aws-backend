import { Injectable, HttpStatus, Request } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AllService {
  private readonly cache: object = {};

  async getAllResources(@Request() req): Promise<object> {
    const { originalUrl, method, body = {} } = req;
    const recipient = originalUrl.split('/')[1];
    const recipientUrl = process.env[recipient];

    console.log(`Url: ${originalUrl}. Method: ${method}. Body: ${JSON.stringify(body)}`);
    console.log(`Recipient url: ${recipientUrl}`);

    if (this.cache[`${originalUrl}${method}`]) {
      if (Date.now() - this.cache[`${originalUrl}${method}`].timestamp <= 120000) {
        return this.cache[`${originalUrl}${method}`].data;
      } else {
        delete this.cache[`${originalUrl}${method}`];
      }
    }

    if (recipientUrl) {
      const config: object = {
        method,
        url: `${recipientUrl}${originalUrl}`,
        ...(Object.keys(body).length && { data: body })
      };

      try {
        const { data } = await axios(config);
        console.log(`Axios response: ${data}`);

        if (recipient === 'products' && method === 'GET') {
          this.cache[`${originalUrl}${method}`] = { data, timestamp: Date.now() };
        }

        return data;
      } catch (error) {
        console.log(`Axios error: ${JSON.stringify(error)}`);

        const {
          status = HttpStatus.INTERNAL_SERVER_ERROR,
          data = { error: error.message }
        } = error.response || {};

        return {
          status,
          message: error.message,
          data
        };
      };
    } else {
      return {
        status: HttpStatus.BAD_GATEWAY,
        message: 'Cannot process request!'
      };
    }
  }
}
