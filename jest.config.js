/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", {
      tsconfig: "tsconfig.json",
      useESM: true,
      babelConfig: {
        presets: [
          "@babel/preset-env",
          ["@babel/preset-react", { runtime: "automatic" }],
          "@babel/preset-typescript"
        ]
      }
    }],
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(next-plausible)/)",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/.next/",
  ],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};