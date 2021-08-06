import { JSONSchema4 } from 'json-schema';
import { Translations } from '../locales';

export const SettingsSchema: JSONSchema4 = {
  type: 'object',
  additionalProperties: false,
  description: Translations.SettingsDescription,
  properties: {
    translator: {
      type: 'array',
      minItems: 1,
      items: { type: 'string' },
      description: Translations.SettingsTranslatorDescription,
    },
    translatorSourceModule: {
      enum: ['cjs', 'esm', 'global'],
      description: Translations.SettingsTranslatorSourceModule,
    },
    untranslatedChars: {
      type: ['string', 'object'],
      description: Translations.SettingsUntranslatedChars,
    },
    wellknownText: {
      type: ['string', 'object', 'null'],
      description: Translations.SettingsWellknownText,
    },
  },
};
