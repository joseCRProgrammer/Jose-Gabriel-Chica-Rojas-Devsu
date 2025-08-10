// jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  preset: 'jest-preset-angular',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testMatch: ['**/?(*.)+(spec).ts'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '\\.(scss|css|sass)$': 'identity-obj-proxy',
    '\\.html$': '<rootDir>/test-utils/html.mock.js'
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'src/app/**/*.ts',
    '!src/app/**/*.spec.ts',
    '!src/main.ts',
    '!src/polyfills.ts',
    '!src/environments/*.ts'
  ],
  coverageReporters: ['text', 'lcov']
};

export default config;
