export default function setupForm() {
  const demoHomeScreen = document.querySelector('#demo-home');
  const demoFormScreen = document.querySelector('#demo-form');
  const demoCompleteScreen = document.querySelector('#demo-complete');

  let activeScreen = demoHomeScreen;

  function setActiveScreen(screen) {
    activeScreen.hidden = true;
    screen.hidden = false;
    activeScreen = screen;
  }

  const form = document.querySelector('form[name="hosted-web-config"]');
  const button = document.querySelector('#submitForm');
  const product = document.querySelector('#product');

  const getWebToken = async () => {
    const payload = { product: product.value };
    const fetchConfig = {};

    fetchConfig.cache = 'no-cache';
    fetchConfig.mode = 'cors';
    fetchConfig.headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
    fetchConfig.body = JSON.stringify(payload);

    fetchConfig.method = 'POST';
    try {
      const response = await fetch('http://localhost:8080/token', fetchConfig);

      if (response.status === 201 || response.statusCode === 201) {
        const json = await response.json();

        if (json.error) {
          throw new Error(json.error);
        }

        return json;
      }
    } catch (e) {
      console.log(`SmileIdentity Core: ${e.name}, ${e.message}`);
      throw e;
    }
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    button.textContent = 'Initializing session...';
    button.disabled = true;
    const tokenResults = await getWebToken();
    // debugger;
    const {
      token,
      product,
      callback_url,
      environment,
      partner_id,
      signature,
      timestamp,
    } = tokenResults;

    if (window.SmileIdentity) {
      window.SmileIdentity({
        token,
        product,
        callback_url,
        environment,
        demo_mode: true,
        use_new_component: true,
        // id_selection: {
        // 	[country]: ["PASSPORT"],
        //   },
        previewBVNMFA: true,
        document_capture_modes: ['camera', 'upload'],
        partner_details: {
          partner_id,
          signature,
          timestamp,
          name: 'Demo Account',
          logo_url: 'https://via.placeholder.com/50/000000/FFFFFF?text=DA',
          policy_url: 'https://smileidentity.com/privacy-privacy',
          theme_color: '#000',
        },
        onSuccess: () => {
          button.textContent = 'Verify with Smile Identity';
          button.disabled = false;
          setActiveScreen(demoCompleteScreen);
        },
        onClose: () => {
          button.textContent = 'Verify with Smile Identity';
          button.disabled = false;
        },
        onError: () => {
          button.textContent = 'Verify with Smile Identity';
          button.disabled = false;
        },
      });
    }
  });
}
