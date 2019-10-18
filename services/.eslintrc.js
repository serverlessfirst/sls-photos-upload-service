// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  extends: ['airbnb-typescript/base'],
  plugins: [
    '@typescript-eslint',
  ],
  env: {
    browser: false,
    jest: true,
    node: true,
    es6: true,
  },
  rules: {
    '@typescript-eslint/indent': ['error', 2, { 'SwitchCase': 1 }],
    'arrow-body-style': ['error', 'as-needed', { 'requireReturnForObjectLiteral': true }],
    'implicit-arrow-linebreak': ['off'],
    'no-multiple-empty-lines': ['error', { 'max': 1 }],
    'no-use-before-define': ['error', 'nofunc'],
    'no-nested-ternary': ['off'],
    'prefer-destructuring': 'off',
    '@typescript-eslint/no-use-before-define': ['error', { functions: false, classes: false }],
    'import/prefer-default-export': ['off'],
    'import/no-extraneous-dependencies': ['error', { 'devDependencies': ['**/tests/**', '**/*.spec.ts'] }],
    'arrow-parens': ['error', 'as-needed', { requireForBlockBody: true }],
    'function-paren-newline': ['error', 'consistent'],
    'max-len': ['error', { code: 120, ignoreComments: true, ignoreTemplateLiterals: true, ignoreStrings: true }],
    '@typescript-eslint/no-non-null-assertion': 'off',
  },
  settings: {
    'import/resolver': {
      'node': { 'extensions': ['.ts', '.tsx', '.js', '.jsx'] },
    },
    'import/core-modules': [
      'aws-lambda',
    ]
  },
};
