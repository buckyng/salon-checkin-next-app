import type { Config } from 'tailwindcss';
import sharedConfig from '../../shared/tailwind.config';

export default {
  presets: [sharedConfig],
  content: ['./src/**/*.{js,ts,jsx,tsx}', '../../shared/**/*.{js,ts,jsx,tsx}'],
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
