import type { Rule } from 'eslint';
import type ESTree from 'estree';
import { resolveSettings } from '../settings';

export const NoUntranslatedLiteral: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      category: 'Best Practices',
      description: 'This rule helps to find out where untranslated literals are.',
      recommended: true,
      suggestion: false,
      // url: '', // TODO: 文档
    },
  },
  create(context) {
    const settings = resolveSettings(context.settings.i18n2);

    return {
      Literal,
      TemplateElement,
    };

    function Literal(node: ESTree.Literal): void {
      if (typeof node.value === 'string') checkLiteral(node.value, node);
    }

    function TemplateElement(node: ESTree.TemplateElement): void {
      checkLiteral(node.value.cooked ?? node.value.raw, node);
    }

    function checkLiteral(value: string, node: ESTree.Node): void {
      if (settings.untranslatedChars.test(value)) {
        context.report({
          node,
          message: '',
        });
      }
    }
  },
};
