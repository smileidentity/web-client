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

    // Use a Linkable with a localhost default during `sst dev` so the embed
    // can be served from the local embed dev server. CI/deployed stages use
    // a Secret set to a full CDN URL (e.g. https://cdn.smileidentity.com/...)
    const EmbedUrl = $dev
      ? new sst.Linkable('EmbedUrl', {
          properties: {
            value: process.env.EmbedUrl ?? 'http://localhost:8000',
          },
        })
      : new sst.Secret('EmbedUrl');

    const api = new sst.aws.Function('GetToken', {
      handler: 'api/lambda.handler',
      url: true,
      link: [PARTNER_ID, CALLBACK_URL, SMILEID_API_KEY, SMILE_ID_ENVIRONMENT],
    });

    // Only add WAF configuration for deployed stages (skip local `sst dev`)
    const WafWebAclArn = $dev ? undefined : new sst.Secret('WafWebAclArn');

    const site = new sst.aws.React('PreviewApp', {
      link: [api, EmbedUrl, PARTNER_ID],
      // AWS-managed CachingDisabled policy. Previews don't need edge caching of
      // server responses, and per-stage custom policies exhaust the account
      // quota (~20) when `sst remove` fails to detach them from a distribution.
      cachePolicy: '4135ea2d-6df8-44a3-9df3-4b5a84be39ad',
      transform: {
        cdn: {
          transform: {
            distribution: (args) => {
              if (WafWebAclArn) {
                args.webAclId = WafWebAclArn.value;
              }
            },
          },
        },
      },
    });

    return {
      api: api.url,
      site: site.url,
    };
  },
});
