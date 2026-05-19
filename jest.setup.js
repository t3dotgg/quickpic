// jest.setup.js
require("@testing-library/jest-dom");

// Mock Response object for tests
global.Response = class Response {
  constructor(body, init) {
    this.body = body;
    this.status = (init && init.status) || 200;
    this.statusText = (init && init.statusText) || 'OK';
    this.headers = (init && init.headers) || {};
  }
};