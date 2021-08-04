import type { TranslationsType } from './interface';

const Translations: TranslationsType = {
  NoTopLevelTranslationRuleDescription: '要求 `i18next.t()` 必须在函数作用域内调用。',
  NoTopLevelTranslationWarning:
    '在顶层获取翻译是危险的，因为此时可能还未载入翻译资源，导致无法获取到对应的翻译文案。',
};

export default Translations;
