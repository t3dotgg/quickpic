module.exports = {
  presets: [
    '@babel/preset-env',
    ['@babel/preset-react', { runtime: 'automatic' }], // for React 17+ automatic JSX runtime
    '@babel/preset-typescript',
  ],
};