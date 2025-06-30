// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'previews',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      home: 'aws',
    };
  },
  async run() {
    const PARTNER_ID = new sst.Secret('PartnerId');
    const CALLBACK_URL = new sst.Secret('CallbackUrl');
    const SMILEID_API_KEY = new sst.Secret('SmileIdApiKey');
    const SMILE_ID_ENVIRONMENT = new sst.Secret('SmileIdEnvironment');
    const EmbedUrl = new sst.Secret('EmbedUrl');

    const lambda = new sst.aws.Function('GetToken', {
      handler: 'api/lambda.handler',
      link: [PARTNER_ID, CALLBACK_URL, SMILEID_API_KEY, SMILE_ID_ENVIRONMENT],
    });

    const api = new sst.aws.ApiGatewayV2('GetTokenApi');

    api.addRoutes({
      'POST /': {
        function: lambda,
      },
    });


    const site = new sst.aws.Remix('PreviewApp', {
      link: [api, EmbedUrl],
    });

    return {
      api: api.url,
      site: site.url,
    };
  },
});
