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
  const language = document.querySelector('#language');
  const allowLegacySelfieFallback = document.querySelector(
    '#allowLegacySelfieFallback',
  );
  const autoCaptureEnabled = document.querySelector('#autoCaptureEnabled');
  const autoCapture = document.querySelector('#autoCapture');
  const newInstructions = document.querySelector('#newInstructions');

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
      const response = await fetch('/api/token', fetchConfig);

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
      window.SmileIdentity({
        token,
        product,
        callback_url,
        environment,
        use_new_component: true,
        //demo_mode: true,
        previewBVNMFA: true,
        allow_legacy_selfie_fallback:
          allowLegacySelfieFallback.value === 'true',
        auto_capture_feature: autoCaptureEnabled.value === 'true',
        auto_capture: autoCapture.value,
        new_instructions: newInstructions.value === 'true',
        hide_attribution: true,
        show_navigation: true,
        document_capture_modes: ['camera', 'upload'],
        allow_agent_mode: true,
        use_strict_mode: true,
        translation: {
          language: language.value,
          locales: {
            en: {
              common: {
                continue: 'Proceed to Next Step',
                back: 'Go Back',
              },
              selfie: {
                instructions: {
                  title: "Let's take a quick selfie",
                },
              },
            },
          },
        },
        // id_selection: {
        //   NG: ['PASSPORT']
        // },
        // consent_required: {
        //   NG: ['BVN'],
        // },
        id_info: {
          GH: {
            // IDENTITY_CARD: {},
          },
          NG: {
            // BVN: {},
            // NATIONAL_ID: {},
          },
        },
        partner_details: {
          partner_id,
          signature,
          timestamp,
          name: 'Demo Account',
          logo_url:
            'https://placeholderimage.co/200x80/0f172a/22c55e/?text=Solo%27s+Bank',
          policy_url: 'https://smileidentity.com/privacy-privacy',
          theme_color: '#151F72',
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
    } catch (error) {
      console.error(error);
      resetButton();
    }
  });
}
