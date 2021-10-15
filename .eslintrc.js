module.exports = {
  'parser': '@babel/eslint-parser',
  'env': {
    'commonjs': true,
    'es2021': true,
    'node': true,
    'jest/globals': true
  },
  'extends': 'eslint:recommended',
  'parserOptions': {
    'ecmaVersion': 2021,
    'requireConfigFile': false
  },
  'plugins': [
    'jest'
  ],
  'rules': {
    'indent': [
      'error',
      2
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'always'
    ],
    'eqeqeq': 'error',
    'no-trailing-spaces': 'error',
    'object-curly-spacing': [
      'error',
      'always'
    ],
    'arrow-spacing': [
      'error',
      {
        'before': true,
        'after': true
      }
    ],
    'eol-last': [
      'error',
      'always'
    ]
  }
};

