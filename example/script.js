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

  const resetButton = () => {
    button.textContent = 'Verify with Smile Identity';
    button.disabled = false;
  };
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
    try {
      const tokenResults = await getWebToken();
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
          use_new_component: true,
          //demo_mode: true,
          // previewBVNMFA: true,
          hide_attribution: true,
          document_capture_modes: ['camera', 'upload'],
          allow_agent_mode: true,
          partner_details: {
            partner_id,
            signature,
            timestamp,
            name: 'Demo Account',
            logo_url: 'https://via.placeholder.com/50/000000/FFFFFF?text=DA',
            policy_url: 'https://smileidentity.com/privacy-privacy',
            theme_color: '#96002d',
          },
          onSuccess: () => {
            resetButton();
          },
          onClose: () => {
            resetButton();
          },
          onError: () => {
            resetButton();
          },
        });
      }
    } catch (error) {
      resetButton();
    }
  });
}
