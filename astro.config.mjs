import { defineConfig } from "astro/config";
import netlifyIntegration from "@astrojs/netlify";

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: netlifyIntegration(),
  image: {
    // Force Astro to use Sharp explicitly for local development
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {},
    },
  },
  vite: {
    server: {
      fs: {
        allow: ['.', './src/assets/images'],
      },
    },
    ssr: {
      noExternal: ['beercss'],
    }
  }
});
