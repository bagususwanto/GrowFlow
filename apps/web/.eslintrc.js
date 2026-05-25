module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  extends: [
    '@growflow/eslint-config/next'
  ],
  ignorePatterns: ['.eslintrc.js', 'next.config.mjs', 'postcss.config.mjs'],
};
