module.exports = {
  testMatch: ['<rootDir>/tests/unit/**/*.test.ts'],
  testEnvironment: 'node',
  preset: 'ts-jest',
  transform: {
    '^.+\\.tsx?$':
    ['ts-jest',
      { tsconfig: 'tsconfig.json',
        diagnostics: {
          ignoreCodes: [5107] // This specifically ignores the "node10 is deprecated" error
        }
      }
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!tests/**/*', '!src/**/*.d.ts'],
};