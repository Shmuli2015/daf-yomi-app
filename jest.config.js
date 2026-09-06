/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        diagnostics: false,
        tsconfig: {
          rootDir: '.',
          allowJs: true,
          types: ['jest', 'node'],
        },
      },
    ],
  },
  transformIgnorePatterns: [
    'node_modules[\\\\/](?!(@hebcal|quick-lru)[\\\\/])',
  ],
  moduleNameMapper: {
    '^@hebcal/core$': '<rootDir>/node_modules/@hebcal/core/dist/esm/index.js',
    '^@hebcal/learning$': '<rootDir>/node_modules/@hebcal/learning/dist/esm/index.js',
  },
};
