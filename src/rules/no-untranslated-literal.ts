import type { Rule } from 'eslint';
import { ReferenceTracker, getStaticValue } from 'eslint-utils2';
import type ESTree from 'estree';
import { concat, filter, map, pipe } from 'iter-tools';
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
    const { untranslatedChars, wellknownText } = settings;
    const consoleCallExpressionSet = new WeakSet<ESTree.CallExpression>();

    return {
      Literal(node: ESTree.Literal): void {
        if (isString(node.value) && isUntranslatedText(node.value) && !isWellknownText(node.value))
          report(node);
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
        const scope = context.getScope();

        const quasis = pipe(
          map((e: ESTree.TemplateElement) => e.value.cooked ?? e.value.raw),
          filter(isString),
        )(node.quasis);

        const expressions = pipe(
          map((e: ESTree.Expression) => getStaticValue(e, scope)?.value),
          filter(isString),
        )(node.expressions);

        let isThereAnyUntranslatedText = false;

        for (const text of concat(quasis, expressions)) {
          // 发现无需翻译的文本，直接结束检查
          if (isWellknownText(text)) return;
          // 如果未曾找到未翻译的文本，但是现在发现 text 是未翻译的文本，则记录下来，
          // 继续看后面的文本是否存在无需翻译的内容
          isThereAnyUntranslatedText ||= isUntranslatedText(text);
        }

        if (isThereAnyUntranslatedText) report(node);
      },
    };

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

    /**
     * Literal 的值是否为字符串。
     */
    function isString(value: unknown): value is string {
      return typeof value === 'string';
    }

    /**
     * 判断 value 是否为未翻译的文本。
     */
    function isUntranslatedText(value: string): boolean {
      return untranslatedChars.test(value);
    }

    /**
     * 判断 value 是否为无需翻译的文本。
     */
    function isWellknownText(value: string): boolean {
      return wellknownText ? wellknownText.test(value) : false;
    }
  },
};
