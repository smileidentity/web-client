import type { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { Resource } from 'sst';
import products from '~/data/products.json';

declare global {
  interface Window {
    SmileIdentity: Function;
  }
}

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
  label: string;
  name: string;
  url: string;
}

interface TokenResults {
  callback_url: string;
  document_capture_modes?: string;
  document_id?: string;
  partner_id: string;
  token: string;
}

const getToken = async (apiUrl: string, body: string | object) => {
  try {
    const result = await fetch(apiUrl, {
      method: 'POST',
      body: typeof body === 'string' ? body : JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const jsonResponse = await result.json();
    return jsonResponse;
  } catch (error) {
    return error;
  }
};

export async function loader({ params }: LoaderFunctionArgs) {
  const product = products.find((p) => p.url === params.productName);
  if (product) {
    return {
      product,
      apiUrl: Resource.GetToken.url,
      appStage: Resource.App.stage,
    };
  }
  return null;
}

export default function Product() {
  const { product, apiUrl, appStage } = useLoaderData<{ product: Product, apiUrl: string, appStage: string } | null>(null);
  const [isGettingToken, setIsGettingToken] = useState<boolean>(false);

  function initializeSdk(config: TokenResults) {
    if (typeof window.SmileIdentity === 'function' && config) {
      window.SmileIdentity({
        ...config,
        document_ids: [config.document_id],
        document_capture_modes: (
          (config.document_capture_modes as String) ?? ''
        ).split(','),
        partner_details: {
          partner_id: config.partner_id,
          name: 'Demo Account',
          logo_url: 'https://via.placeholder.com/50/000000/FFFFFF?text=DA',
          policy_url: 'https://usesmileid.com/privacy-privacy',
          theme_color: '#000',
        },
        onSuccess: () => {},
        onClose: () => {},
        onError: () => {},
      });
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const body = Object.fromEntries(formData);
    setIsGettingToken(true);
    try {
      const tokenResults = await getToken(apiUrl, body);
      initializeSdk(tokenResults);
      return tokenResults;
    } catch (error) {
      return new Response(JSON.stringify({ error }), { status: 400 });
    } finally {
      setIsGettingToken(false);
    }
  }

  return (
    <>
      {product === null ? <h1>Unsupported Product</h1> : null}

      {product !== null ? (
        <>
          <form onSubmit={handleSubmit}>
            <fieldset disabled={isGettingToken}>
              <legend>
                <h1>{product.label}</h1>
              </legend>

              <input type="hidden" name="product" value={product.name} />
              {product.input_fields.map((input, inputIdx) => (
                <div key={inputIdx}>
                  {input.type === 'select' ? (
                    <>
                      <label htmlFor={`input-${inputIdx}`}>{input.label}</label>
                      <select
                        disabled={isGettingToken}
                        required={input.required}
                        name={input.name}
                        id={`input-${inputIdx}`}
                      >
                        {(input as SelectInput).options.map(
                          (option, optionIdx) => (
                            <option key={optionIdx} value={option.name}>
                              {option.label}
                            </option>
                          ),
                        )}
                      </select>
                    </>
                  ) : (
                    <label>
                      <span>{input.label}</span>
                      <input
                        disabled={isGettingToken}
                        required={input.required}
                        type={input.type}
                        name={input.name}
                      />
                    </label>
                  )}
                </div>
              ))}
              <button disabled={isGettingToken} type="submit">
                Create Preview
              </button>
            </fieldset>
          </form>

          <script
            src={`https://cdn.smileidentity.com/inline/${
              appStage.includes('preview/') ? appStage : 'v1'
            }/js/script.min.js`}
          ></script>
        </>
      ) : null}
    </>
  );
}
