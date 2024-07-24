/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  modulePaths: ['<rootDir>/src'],
  moduleDirectories: ['node_modules', 'src'],
  testEnvironment: "node",
  globalSetup: "<rootDir>/src/test-setup.ts",
  globalTeardown: "<rootDir>/src/test-teardown.ts",
};
