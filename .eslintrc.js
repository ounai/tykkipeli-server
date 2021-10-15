/* eslint-disable quote-props */
'use strict';

module.exports = {
  parser: '@babel/eslint-parser',
  env: {
    commonjs: true,
    es2021: true,
    node: true,
    'jest/globals': true
  },
  extends: [
    'standard'
  ],
  parserOptions: {
    ecmaVersion: 12,
    requireConfigFile: false,
    sourceType: 'script'
  },
  plugins: [
    'jest',
    'prefer-arrow'
  ],
  rules: {
    'semi': ['error', 'always'],
    'eol-last': ['error', 'always'],
    'max-len': ['warn', { 'code': 120 }],
    'max-lines-per-function': ['warn', 50],
    'strict': ['error', 'global'],
    'no-multiple-empty-lines': [
      'error',
      {
        'max': 1,
        'maxEOF': 0,
        'maxBOF': 0
      }
    ],
    'prefer-arrow/prefer-arrow-functions': [
      'error',
      {
        'disallowPrototype': true,
        'singleReturnOnly': false,
        'classPropertiesAllowed': false
      }
    ],
    'prefer-arrow-callback': [
      'error',
      { 'allowNamedFunctions': true }
    ],
    'func-style': [
      'error',
      'expression',
      { 'allowArrowFunctions': true }
    ]
  }
}
