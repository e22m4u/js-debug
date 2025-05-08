import globals from 'globals';
import eslintJs from '@eslint/js';
import eslintMochaPlugin from 'eslint-plugin-mocha';
import eslintPrettierConfig from 'eslint-config-prettier';
import eslintChaiExpectPlugin from 'eslint-plugin-chai-expect';

export default [{
  languageOptions: {
    globals: {
      ...globals.node,
      ...globals.browser,
      ...globals.es2021,
      ...globals.mocha,
    },
  },
  plugins: {
    'mocha': eslintMochaPlugin,
    'chai-expect': eslintChaiExpectPlugin,
  },
  rules: {
    ...eslintJs.configs.recommended.rules,
    ...eslintPrettierConfig.rules,
    ...eslintMochaPlugin.configs.recommended.rules,
    ...eslintChaiExpectPlugin.configs['recommended-flat'].rules,
    "no-unused-vars": ["error", {caughtErrors: "none"}],
  },
  files: ['src/**/*.js'],
}];
