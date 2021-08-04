import type { TranslationsType } from './interface';

const Locales: TranslationsType = {
  NoTopLevelTranslationRuleDescription:
    'Require `i18next.t()` calls to be inside the function scope.',
  NoTopLevelTranslationWarning:
    'It is dangerous to get the translation at the top level, ' +
    'because the translation resources may not be loaded at this time, ' +
    'so that the corresponding translation copy cannot be obtained.',
};

export default Locales;
