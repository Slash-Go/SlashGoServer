/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  globalSetup: "<rootDir>/tests/setup.ts",
  setupFiles: ["<rootDir>/tests/authMock.ts"],
};
