import globals from 'globals';
import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue'

export default [
  // add more generic rulesets here, such as:
  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      // override/add rules settings here, such as:
      // 'vue/no-unused-vars': 'error'
    }
  },
  {
    // vite plugins run in node
    files: ['plugins/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  }
]