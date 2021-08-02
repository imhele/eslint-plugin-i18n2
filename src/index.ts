import type { Linter } from 'eslint';

const recommended: Linter.BaseConfig = {
  plugins: ['i18n2'],
};

export const configs = { recommended } as const;

export const rules = {} as const;
