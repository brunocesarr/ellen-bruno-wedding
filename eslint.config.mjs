import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import { defineConfig, globalIgnores } from 'eslint/config'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    '.netlify/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
  {
    // Pin the React version so eslint-plugin-react skips filesystem-based

    settings: { react: { version: '19.2' } },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'react/no-unescaped-entities': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
    },
  },
  {
    // Full a11y ruleset as warnings (next's preset only enables a handful).
    // The plugin itself is already registered by eslint-config-next.
    files: ['**/*.{jsx,tsx}'],
    rules: Object.fromEntries(
      Object.entries(jsxA11y.flatConfigs.recommended.rules).map(([k, v]) => [
        k,
        v === 'off' || v === 0 ? v : 'warn',
      ])
    ),
    // Noisy: flags every icon-only/custom-component control it can't resolve.
    // Real unlabeled buttons are caught by manual review + Lighthouse.
  },
  {
    files: ['**/*.{jsx,tsx}'],
    rules: { 'jsx-a11y/control-has-associated-label': 'off' },
  },
  {
    // Clean Architecture: use cases and entities never reach into
    // infrastructure (they depend on interfaces only).
    files: ['src/application/**', 'src/entities/**'],
    ignores: ['**/__tests__/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/src/infrastructure/*', '@/src/di/*', 'next/*'],
              message:
                'Application/entity layers must depend on interfaces, not infrastructure or the framework.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/__tests__/**', '**/*.test.{ts,tsx}'],
    rules: { '@typescript-eslint/no-explicit-any': 'off' },
  },
])

export default eslintConfig
