import type { TraceMap } from 'eslint-utils2';
import type { RemoveVoidFields } from '../utils';

export type ESLintI18n2TranslatorSourceModule = 'cjs' | 'esm' | 'global';

export interface ESLintI18n2Settings {
  /**
   * 指定翻译函数调用的访问路径。
   *
   * 支持一级通配符 `*` 和多级通配符 `**` ，可以使用 `\` 转义。
   *
   * @default
   * ```ts
   * ['i18next.t']
   * ```
   *
   * @example
   * ```ts
   * ['i18next.t', 't.*', 'i18next.**']
   * ```
   */
  translator?: readonly string[] | undefined;
  /**
   * 指定翻译函数的来源。
   *
   * @default
   * ```ts
   * 'global'
   * ```
   *
   * @example
   * ```ts
   * const settings: ESLintI18n2Settings = {
   *   translator: ['@imhele/my-i18next-pkg.i18next.t'],
   *   translatorSourceModule: 'esm',
   * };
   * ```
   */
  translatorSourceModule?: ESLintI18n2TranslatorSourceModule;
  /**
   * 符合此正则表达式的字符都将被视为未翻译。
   *
   * 传入字符串会被直接转为正则表达式。
   *
   * @default
   * ```ts
   * /[^\x00-\x7F]/
   * ```
   */
  untranslatedChars?: RegExp | string | undefined;
}

export interface ResolvedESLintI18n2Settings {
  translator: TraceMap;
  translatorSourceModule: ESLintI18n2TranslatorSourceModule;
  untranslatedChars: RegExp;
}

export function DefaultESLintI18n2Settings(): Required<RemoveVoidFields<ESLintI18n2Settings>> {
  return {
    translator: ['i18next.t'],
    translatorSourceModule: 'global',
    // eslint-disable-next-line no-control-regex
    untranslatedChars: /[^\x00-\x7F]/,
  };
}
