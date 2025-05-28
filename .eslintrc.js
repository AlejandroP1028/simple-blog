module.exports = {
    root: true,
    extends: [
      'next',
      'next/core-web-vitals',
      'plugin:prettier/recommended', // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors
    ],
    plugins: ['prettier'],
    rules: {
      'prettier/prettier': ['error'],
    },
  }
  