declare module 'next-pwa' {
  import { NextConfig } from 'next';

  interface PWAOptions {
    dest: string;
    disable?: boolean;
    runtimeCaching?: unknown[];
    buildExcludes?: string[];
  }

  function withPWA(options: PWAOptions): (nextConfig: NextConfig) => NextConfig;

  export = withPWA;
}
