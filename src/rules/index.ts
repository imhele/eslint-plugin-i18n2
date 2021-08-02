import type {} from 'eslint';
import { NoTopLevelTranslation } from './no-top-level-translation';

export * from './no-top-level-translation';

export const rules = {
  'no-top-level-translation': NoTopLevelTranslation,
} as const;
