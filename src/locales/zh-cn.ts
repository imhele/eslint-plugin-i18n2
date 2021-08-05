import type { TranslationsType } from './interface';

const Translations: TranslationsType = {
  NoTopLevelTranslationRuleDescription: '要求 `i18next.t()` 必须在函数作用域内调用。',
  NoTopLevelTranslationWarning:
    '在顶层获取翻译是危险的，因为此时可能还未载入翻译资源，导致无法获取到对应的翻译文案。',
  SettingsDescription: '此 ESLint 插件的配置，所有规则都会共享此配置。',
  SettingsTranslatorDescription:
    '指定翻译函数调用的访问路径，支持单级通配符 `*` 和多级通配符 `**` ，可以使用 `\\` 转义。',
  SettingsTranslatorSourceModule:
    '指定翻译函数的导入来源，目前支持 CommonJS (cjs) / ECMAScript Module (esm) / Global (global) 。',
  SettingsUntranslatedChars:
    '符合此正则表达式的字符都将被视为未翻译，传入字符串会被直接转为正则表达式。',
};

export default Translations;
