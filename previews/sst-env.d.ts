/* This file is auto-generated by SST. Do not edit. */
/* tslint:disable */
/* eslint-disable */
/* deno-fmt-ignore-file */
import "sst"
export {}
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
