import type { MetaFunction } from '@remix-run/node';
import products from '~/data/products.json';

export const meta: MetaFunction = () => {
  return [
    { title: 'Web Client Previews - SmileID' },
    {
      name: 'description',
      content: 'Welcome to the SmileID Web Client Preview App!',
    },
  ];
};

export default function Index() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.8' }}>
      <h1>Welcome to SmileID Web Client Previews</h1>
      <p>Check out the products we have supported</p>
      <nav>
        <ul>
          {products.map((product) => (
            <li key={product.name}>
              <a href={`products/${product.url}`}>{product.label}</a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
