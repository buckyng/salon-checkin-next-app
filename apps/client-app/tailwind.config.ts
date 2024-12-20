import type { Config } from 'tailwindcss';
import sharedConfig from '../../shared/tailwind.config';

export default {
  presets: [sharedConfig],
  content: [
    './src/**/*.{js,ts,jsx,tsx}', // App content
    '../../shared/**/*.{js,ts,jsx,tsx}',
    '!../../shared/node_modules', // Explicitly exclude node_modules
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
    },
  },
  plugins: [],
} satisfies Config;
