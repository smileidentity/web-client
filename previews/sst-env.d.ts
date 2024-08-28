/* tslint:disable */
/* eslint-disable */
import "sst"
declare module "sst" {
  export interface Resource {
    "CallbackUrl": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "GetToken": {
      "name": string
      "type": "sst.aws.Function"
      "url": string
    }
    "PartnerId": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "PreviewApp": {
      "type": "sst.aws.Remix"
      "url": string
    }
    "SmileIdApiKey": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "SmileIdEnvironment": {
      "type": "sst.sst.Secret"
      "value": string
    }
  }
}
export {}
