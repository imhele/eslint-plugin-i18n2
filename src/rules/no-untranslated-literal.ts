import type { Rule } from 'eslint';
import type ESTree from 'estree';
import { Translations } from '../locales';
import { resolveSettings } from '../settings';

export const NoUntranslatedLiteral: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      category: 'Best Practices',
      description: Translations.NoUntranslatedLiteralRuleDescription,
      recommended: true,
      suggestion: false,
      url: 'https://github.com/imhele/eslint-plugin-i18n2',
    },
  },
  create(context) {
    const settings = resolveSettings(context.settings.i18n2);

    return {
      Literal,
      TemplateLiteral,
    };

    function Literal(node: ESTree.Literal): void {
      if (checkLiteral(node.value)) report(node);
    }

    function TemplateLiteral(node: ESTree.TemplateLiteral): void {
      if (node.quasis.some(checkLiteral)) report(node);
    }

    function checkLiteral(value: unknown): boolean {
      return typeof value === 'string' && settings.untranslatedChars.test(value);
    }

    function report(node: ESTree.Node): void {
      context.report({ node, message: Translations.NoUntranslatedLiteralWarning });
    }
  },
};
