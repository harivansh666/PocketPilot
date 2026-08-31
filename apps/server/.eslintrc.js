module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended', // prettier ke saath conflict avoid karta hai
  ],
  rules: {
    '@typescript-eslint/consistent-type-imports': 'error', // import type force karta hai
    '@typescript-eslint/no-unused-vars': 'warn',
    'prettier/prettier': 'error', // formatting errors dikhayega
  },
};
