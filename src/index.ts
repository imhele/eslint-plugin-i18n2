import type { Linter } from 'eslint';

export * from './rules';

export type { ESLintI18n2Settings } from './settings';

const recommended: Linter.BaseConfig = {
  plugins: ['i18n2'],
  rules: {
    'i18n2/no-top-level-translation': 'error',
    'i18n2/no-untranslated-literal': 'warn',
  },
};

export const configs = { recommended } as const;
