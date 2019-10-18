module.exports = {
    extends: ['airbnb-typescript'],
    env: {
        browser: false,
        jest: true,
        es6: true,
    },
    globals: {
        document: true,
        process: true,
    },
    rules: {
        'arrow-body-style': ['error', 'as-needed', { 'requireReturnForObjectLiteral': true }],
        'max-len': ['error', { code: 120, ignoreComments: true, ignoreTemplateLiterals: true, ignoreStrings: true }],
        '@typescript-eslint/no-non-null-assertion': 'off',
        'react/jsx-one-expression-per-line': 'off',
        'react/state-in-constructor': 'off',
        'react/button-has-type': 'off',
        'react/prefer-stateless-function': 'off',
        'max-classes-per-file': 'off',
    },
};
