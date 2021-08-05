import type { TranslationsType } from './interface';

const Locales: TranslationsType = {
  NoTopLevelTranslationRuleDescription:
    'Require `i18next.t()` calls to be inside the function scope.',
  NoTopLevelTranslationWarning:
    'It is dangerous to get the translation at the top level, ' +
    'because the translation resources may not be loaded at this time, ' +
    'so that the corresponding translation copy cannot be obtained.',
  NoUntranslatedLiteralRuleDescription:
    'This rule helps to find out where untranslated literals are.',
  NoUntranslatedLiteralWarning: 'This text may not have been translated.',
  SettingsDescription:
    'The configuration of this eslint plugin, all rules will share this configuration.',
  SettingsTranslatorDescription:
    'Specify the access path of the translation function call. ' +
    'Supports the single-level wildcard `*` and the multi-level wildcard `**`, ' +
    'which can be escaped with `\\`.',
  SettingsTranslatorSourceModule:
    'Specify the import source of the translation function, ' +
    'currently supports CommonJS (cjs) / ECMAScript Module (esm) / Global (global).',
  SettingsUntranslatedChars:
    'The characters that meet this regular expression will be regarded as untranslated, ' +
    'and the incoming string will be directly converted into a regular expression.',
};

export default Locales;
