import antfu from '@antfu/eslint-config'

export default antfu(
  {
    stylistic: {
      indent: 2,
      quotes: 'single',
      semi: false,
    },
  },
  {
    rules: {
      'ts/consistent-type-definitions': 'off',
      'curly': ['error', 'all'],
      'style/brace-style': ['error', '1tbs'],
    },
  },
  {
    files: [
      'playground/**/*.ts',
      'playground/**/*.js',
    ],
    rules: {
      'no-alert': ['off'],
      'no-console': ['off'],
    },
  },
)
