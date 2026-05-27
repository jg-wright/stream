/** @import { Config } from 'jest' */

/** @type {Config} */
const config = {
  testEnvironment: 'jsdom',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/test/tsconfig.json',
        useESM: true,
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!@johngw)'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  setupFilesAfterEnv: [import.meta.resolve('web-streams-polyfill/polyfill')],
}

export default config
