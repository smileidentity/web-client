# smileid web client previews

a full-stack application to create previews for pr changes to the smileID web
client. it contains two parts:

- api: a lambda function for generating the web token
- app: a remix application for creating previews for the products supported

these are managed by [sst](https://ion.sst.dev) and [remix](https://remix.run).

## integration with github actions
the `deploy-preview` github workflow now has a `full-stack` job for creating the
previews on a pull request.

it requires that the following secrets are added to the repository:
`PREVIEW_PARTNER_ID`: partner_id used for the preview app
`PREVIEW_CALLBACK_URL`: callback url for webhook responses
`PREVIEW_SMILEID_API_KEY`: api key for the partner
`PREVIEW_SMILEID_ENVIRONMENT`: environment code should be run in

note: api_key, partner_id, and environment need to be in alignment for this to
work effectively.

there is a step to create a preview when a PR is created / updated, and a step
to remove the preview app when the PR is removed.

## how it works?

the remix application is bootstrapped using `app/data/products.json`. in the
data file, we have objects of the shape:

```ts
interface InputField {
  type: 'select' | 'text' | 'url';
  label: string;
  name: string;
  required: boolean;
}

interface SelectOption {
  name: string;
  label: string;
}

interface SelectInput extends InputField {
  options: SelectOption[];
}

interface Product {
  input_fields: (InputField | SelectInput)[];
  label: string; // this is the public label used in urls
  name: string; // this is the name used within the smileid systems
  url: string; // this is the url used in the browser
}
```

these objects represent the supported products within the smileid web client,
and the instantiation constraints.

the product details page — `app/routes/products.$productName.tsx` — contains
a form built using the `input_fields` configuration. it uses native html
validation for now, and can be extended. it is responsible for submitting the
form to the api endpoint, which when successful, returns a token, and some other
configuration options.

## configuration
to run this, we need a few secrets:
- PartnerId
- CallbackUrl
- SmileIdApiKey
- SmileIdEnvironment

## how do i run this locally?
for local development / audit, you can follow the steps:

- ensure you have the aws cli installed and access configured on your computer.
- [install sst cli](https://ion.sst.dev/docs/reference/cli)
- set up the secrets for sst using the following convention
  ```bash
  sst secret set <secret_name> <secret_value>
  ```
- npm install
- npm run dev

note: after you're done locally, run `sst remove` to remove the resources in aws
