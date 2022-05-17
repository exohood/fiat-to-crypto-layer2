module.exports = {
  testTimeout: 15000,
  verbose: true,
  setupFilesAfterEnv: ['./test/mocks/setup-env.ts'],
  collectCoverageFrom: [
    'src/core/core.tsx',
    'src/core/utils.ts',
    'src/core/hooks.tsx',
  ],
};
