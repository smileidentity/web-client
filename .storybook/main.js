import { join, dirname } from 'path';
import { mergeConfig } from 'vite';

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, 'package.json')));
}

/** @type { import('@storybook/web-components-vite').StorybookConfig } */
const config = {
  stories: [
    '../packages/web-components/**/**/*.mdx',
    '../packages/web-components/**/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-essentials'),
  ],
  docs: {},
  framework: {
    name: getAbsolutePath('@storybook/web-components-vite'),
    options: {},
  },
  // Storybook runs its own Vite config, so it needs the same `.lottie` asset
  // registration as packages/web-components/vite.config.ts for the hero
  // animations imported via `?inline` in DocumentCaptureInstructions.
  async viteFinal(viteConfig) {
    return mergeConfig(viteConfig, {
      assetsInclude: ['**/*.lottie'],
    });
  },
};
export default config;
