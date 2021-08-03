import { mustBeValid, validate } from 'json-schema';
import { RemoveVoidFields, removeVoidFields } from '../utils';

export interface ESLintI18n2Settings {
  /**
   * 指定翻译函数调用的访问路径。
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
   * 符合此正则表达式的字符都将被视为未翻译。
   *
   * 传入字符串会被直接转为正则表达式。
   *
   * @default
   * /[^\x00-\x7F]/
   */
  untranslatedChars?: RegExp | string;
}

export interface ResolvedESLintI18n2Settings {
  translator: readonly (readonly string[])[];
  untranslatedChars: RegExp;
}

export function DefaultESLintI18n2Settings(): Required<RemoveVoidFields<ESLintI18n2Settings>> {
  return {
    translator: ['i18next.t'],
    // eslint-disable-next-line no-control-regex
    untranslatedChars: /[^\x00-\x7F]/,
  };
}

export function resolveSettings(settings: unknown = {}): ResolvedESLintI18n2Settings {
  assertSettings(settings);
  removeVoidFields(settings);

  const merged = { ...DefaultESLintI18n2Settings(), ...settings };

  return {
    translator: merged.translator.map((item) => item.split('.')),
    untranslatedChars: RegExp(merged.untranslatedChars),
  };
}

function assertSettings(settings: unknown): asserts settings is ESLintI18n2Settings {
  const result = validate(settings as never, {
    type: 'object',
    additionalProperties: false,
    properties: {
      translator: { type: 'array', items: { type: 'string' }, minItems: 1 },
      untranslatedChars: { type: 'string' },
    },
  });

  mustBeValid(result);
}
