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
}

export interface ResolvedESLintI18n2Settings {
  translator: readonly (readonly string[])[];
}

export function DefaultESLintI18n2Settings(): Required<RemoveVoidFields<ESLintI18n2Settings>> {
  return { translator: ['i18next.t'] };
}

export function resolveSettings(settings: unknown = {}): ResolvedESLintI18n2Settings {
  assertSettings(settings);
  removeVoidFields(settings);

  const merged = { ...DefaultESLintI18n2Settings(), ...settings };

  return {
    translator: merged.translator.map((item) => item.split('.')),
  };
}

function assertSettings(settings: unknown): asserts settings is ESLintI18n2Settings {
  const result = validate(settings as never, {
    type: 'object',
    additionalProperties: false,
    properties: {
      translator: { type: 'array', items: { type: 'string' }, minItems: 1 },
    },
  });

  mustBeValid(result);
}
