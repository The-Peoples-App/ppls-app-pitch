import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
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
