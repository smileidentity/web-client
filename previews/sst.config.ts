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

    const api = new sst.aws.Function('GetToken', {
      handler: 'api/lambda.handler',
      url: true,
      link: [PARTNER_ID, CALLBACK_URL, SMILEID_API_KEY, SMILE_ID_ENVIRONMENT],
    });

    const site = new sst.aws.Remix('PreviewApp', {
      link: [api],
    });

    return {
      api: api.url,
      site: site.url,
    };
  },
});
