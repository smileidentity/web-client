import { WebApi as SIDWebAPI } from 'smile-identity-core';
import * as crypto from 'node:crypto';
import { Resource } from 'sst';


const SID_SERVER_MAPPING: { [key: string]: string } = {
  0: 'sandbox',
  1: 'production',
};

export const handler = async (event: { body: string }) => {
  const { callback_url, job_id, product, user_id } = JSON.parse(event.body);
  try {
    const environmentServer = SID_SERVER_MAPPING[Resource.SmileIdEnvironment.value] || Resource.SmileIdEnvironment.value;
    let baseServer = Resource.SmileIdEnvironment.value;
    // the smile-identity-core client appears to append https:// to the baseServer
    // this is a workaround to prevent the client from appending https:// twice
    if (baseServer.startsWith('https://')) {
      baseServer = `${baseServer.slice(8)}/v1`;
    }

    const connection = new SIDWebAPI(
      Resource.PartnerId.value,
      callback_url || Resource.CallbackUrl.value,
      Resource.SmileIdApiKey.value,
      baseServer,
    );

    const request_params = {
      user_id: user_id || `user-${crypto.randomUUID()}`,
      job_id: job_id || `job-${crypto.randomUUID()}`,
      callback_url: callback_url || Resource.CallbackUrl.value,
      product,
    };

    const result = await connection.get_web_token(request_params);

    return {
      statusCode: 201,
      body: {
        ...result,
        ...JSON.parse(event.body),
        callback_url: request_params.callback_url,
        environment: environmentServer,
        partner_id: Resource.PartnerId.value,
        product,
      },
    };
  } catch (e) {
    console.error(e);
    return {
      statusCode: 400,
      body: JSON.stringify(e),
    };
  }
};
