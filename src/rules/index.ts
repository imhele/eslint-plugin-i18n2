import type {} from 'eslint';
import { NoTopLevelTranslation } from './no-top-level-translation';
import { NoUntranslatedLiteral } from './no-untranslated-literal';

export * from './no-top-level-translation';
export * from './no-untranslated-literal';

export const rules = {
  'no-top-level-translation': NoTopLevelTranslation,
  'no-untranslated-literal': NoUntranslatedLiteral,
} as const;
