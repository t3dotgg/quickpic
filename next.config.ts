/** @type {import('next').NextConfig} */  
import { type NextConfig } from 'next'; 
const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.tsx',
        },
      },
    },
  },

  webpack: (config) => {
    config.optimization.minimize = false; // Helps with the BABEL deoptimization
    return config;
  },
}

module.exports = nextConfig