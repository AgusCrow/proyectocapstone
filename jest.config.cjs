module.exports = {
  testEnvironment: 'node',
  testTimeout: 10000,
  setupFiles: ['<rootDir>/tests/setup.js'],
  testMatch: [
    '<rootDir>/tests/**/*.test.js'
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  moduleFileExtensions: ['js', 'json'],
  testPathIgnorePatterns: ['/node_modules/'],
  collectCoverage: false
}; 