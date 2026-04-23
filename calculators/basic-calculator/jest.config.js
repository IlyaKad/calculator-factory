/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/logic.test.ts'],
  collectCoverageFrom: ['logic.ts'],
}
