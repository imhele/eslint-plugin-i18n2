import { CALL, ESM } from 'eslint-utils2';
import { mustBeValid, validate } from 'json-schema';
import t from 'types-lib';
import { ObjectPath, ownKeys, removeVoidFields } from '../utils';
import {
  DefaultESLintI18n2Settings,
  ESLintI18n2Settings,
  ResolvedESLintI18n2Settings,
} from './interface';
import { SettingsSchema } from './schema';

export function resolveSettings(settings: unknown = {}): ResolvedESLintI18n2Settings {
  assertSettings(settings);
  removeVoidFields(settings);

  const merged = { ...DefaultESLintI18n2Settings(), ...settings };
  const translatorTraceMap = ObjectPath.mergeAsTraceMap(merged.translator.map(ObjectPath.compile), {
    [CALL]: true,
  });

  if (merged.translatorSourceModule === 'esm') {
    ownKeys(translatorTraceMap).forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(translatorTraceMap[key], ESM)) {
        (translatorTraceMap[key] as t.UnknownRecord)[ESM as never] = true;
      }
    });
  }

  return {
    translator: translatorTraceMap,
    translatorSourceModule: merged.translatorSourceModule,
    untranslatedChars: RegExp(merged.untranslatedChars),
  };
}

function assertSettings(settings: unknown): asserts settings is ESLintI18n2Settings {
  mustBeValid(validate(settings as never, SettingsSchema));
}
