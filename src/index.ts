import type { Linter } from 'eslint';

export * from './rules';

const recommended: Linter.BaseConfig = {
  plugins: ['i18n2'],
  rules: {
    'i18n2/no-top-level-translation': 'error',
  },
};

export const configs = { recommended } as const;
