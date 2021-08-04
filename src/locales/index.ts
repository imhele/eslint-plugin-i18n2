import osLocale from 'os-locale';
import t from 'types-lib';
import en from './en';
import type { TranslationsType } from './interface';
import zhCN from './zh-cn';

export const Locale = osLocale.sync().toLowerCase();

export const Locales = Locale.split('-').reduce<readonly string[]>((list, fragment) => {
  const locale = list.length > 0 ? `${list[0]}-${fragment}` : fragment;
  return [locale].concat(list);
}, []);

const TranslationsMap = {
  en,
  zh: zhCN,
  'zh-cn': zhCN,
} as const;

const hasOwnProperty = Object.prototype.hasOwnProperty as t.Object.prototype.hasOwnProperty;

export const Translations =
  Locales.reduce<TranslationsType | null>((found, locale) => {
    return !found && hasOwnProperty.call(TranslationsMap, locale) ? TranslationsMap[locale] : found;
  }, null) ?? TranslationsMap.en;
