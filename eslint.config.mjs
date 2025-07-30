// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu({
  vue: {
    overrides: {
      'vue/define-props-declaration': 'error',
      'vue/define-emits-declaration': ['error', 'type-literal'],
      'vue/no-unused-emit-declarations': 'error',
      'vue/html-button-has-type': 'error',
      'vue/prefer-use-template-ref': 'error',
      'vue/require-explicit-slots': 'error',
      'vue/component-api-style': ['error', ['script-setup']],
      'vue/no-empty-component-block': 'error',
      'vue/define-props-destructuring': 'error',
      'vue/html-self-closing': ['error', { html: { void: 'never', normal: 'never', component: 'always' } }],
    },
  },
  typescript: {
    overridesTypeAware: {
      'ts/consistent-type-imports': 'error',
      'ts/consistent-type-exports': 'error',
      'ts/require-await': 'error',
      'ts/return-await': 'error',
      'ts/prefer-optional-chain': 'error',
      'ts/prefer-nullish-coalescing': 'error',
      'ts/no-redundant-type-constituents': 'error',
      'ts/no-unnecessary-boolean-literal-compare': 'error',
      'ts/no-unnecessary-condition': 'error',
      'ts/no-unnecessary-type-arguments': 'error',
      'ts/no-unnecessary-template-expression': 'error',
      'ts/no-unnecessary-type-parameters': 'error',
      'ts/non-nullable-type-assertion-style': 'error',
    },
    overrides: {
      'ts/no-unused-vars': 'error',
      'ts/no-explicit-any': 'warn',
      'ts/array-type': 'error',
      'ts/consistent-indexed-object-style': 'error',
      'ts/consistent-type-assertions': 'error',
      'ts/no-unnecessary-parameter-property-assignment': 'error',
    },
  },
  ignores: [
    '**/dist/**',
    '**/.turbo/**',
    '**/generated/**',
  ],
})
