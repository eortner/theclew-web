import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  setupFilesAfterEnv: ['<rootDir>/tests/helpers/setup.ts'],
  testTimeout: 15000,
  forceExit: true,
  detectOpenHandles: true,
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        strict: true,
        esModuleInterop: true,
      },
    }],
    '^.+\\.js$': ['ts-jest', {
      tsconfig: {
        strict: true,
        esModuleInterop: true,
        allowJs: true,
      },
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(otplib|@otplib|@scure|@noble)/)',
  ],
};

export default config;