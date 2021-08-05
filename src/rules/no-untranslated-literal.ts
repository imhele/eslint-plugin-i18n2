import type { Rule } from 'eslint';
import { ReferenceTracker } from 'eslint-utils2';
import type ESTree from 'estree';
import { Translations } from '../locales';
import { resolveSettings } from '../settings';

export interface NoUntranslatedLiteralOptions {
  /**
   * 启用对于 console.xxx() 调用参数的检查。
   *
   * @default
   * ```ts
   * false
   * ```
   */
  checkArgumentsOfConsoleCall?: boolean;
}

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
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        description: Translations.NoUntranslatedLiteralOptionsDescription,
        properties: {
          checkArgumentsOfConsoleCall: {
            type: 'boolean',
            description:
              Translations.NoUntranslatedLiteralOptionsCheckArgumentsOfConsoleCallDescription,
          },
        },
      },
    ],
  },
  create(context) {
    const settings = resolveSettings(context.settings.i18n2);
    const options: NoUntranslatedLiteralOptions = context.options[0] || {};
    const { checkArgumentsOfConsoleCall } = options;
    const consoleCallExpressionSet = new WeakSet<ESTree.CallExpression>();

    return {
      Literal(node: ESTree.Literal): void {
        if (checkLiteral(node.value)) report(node);
      },
      Program(): void {
        const globalScope = context.getSourceCode().scopeManager.globalScope || context.getScope();

        const tracker = new ReferenceTracker(globalScope);
        const consoleCalls = tracker.iterateGlobalReferences({
          console: { [ReferenceTracker.SingleLevelWildcard]: { [ReferenceTracker.CALL]: true } },
        });

        for (const { node } of consoleCalls) {
          if (node.type === 'CallExpression') {
            consoleCallExpressionSet.add(node);
          }
        }
      },
      TemplateLiteral(node: ESTree.TemplateLiteral): void {
        if (node.quasis.some((element) => checkLiteral(element.value.cooked || element.value.raw)))
          report(node);
      },
    };

    function checkLiteral(value: ESTree.Literal['value']): boolean {
      return typeof value === 'string' && settings.untranslatedChars.test(value);
    }

    function report(node: ESTree.Node): void {
      // 如果 node 是 console.xxx() 的参数，并且没有启用 checkArgumentsOfConsoleCall ，则不上报错误
      if (!checkArgumentsOfConsoleCall && isArgumentOfConsole(node)) return;

      context.report({ node, message: Translations.NoUntranslatedLiteralWarning });
    }

    /**
     * 判断 node 是否为 console.xxx 的参数。
     */
    function isArgumentOfConsole(node: ESTree.Node): boolean {
      let parent: ESTree.Node | null = node.parent;

      while (parent) {
        // 如果父节点是 CallExpression ，并且当前节点是其 arguments
        if (parent.type === 'CallExpression') {
          const args: ESTree.Node[] = parent.arguments;
          if (consoleCallExpressionSet.has(parent) && args.includes(node)) return true;
          break;
        }

        node = parent;
        parent = node.parent;
      }

      return false;
    }
  },
};
