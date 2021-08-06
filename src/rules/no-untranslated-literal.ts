import type { Rule } from 'eslint';
import { ReferenceTracker, TraceMap, getStaticValue } from 'eslint-utils2';
import type ESTree from 'estree';
import { concat, filter, map, pipe } from 'iter-tools';
import type t from 'types-lib';
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
    const weakSetOfCallExpressionsThatShouldBeIgnored = new WeakSet<ESTree.CallExpression>();

    return {
      Literal(node: ESTree.Literal): void {
        switch (node.parent.type) {
          // 忽略 import 与 export 语句的 source
          case 'ExportAllDeclaration':
          case 'ExportNamedDeclaration':
          case 'ImportDeclaration':
          case 'ImportExpression':
            if (node === node.parent.source) return;
            break;
        }

        if (
          // 必须是 StringLiteral
          isString(node.value) &&
          // 必须包含未翻译的字符
          isUntranslatedText(node.value) &&
          // 不能是无需翻译的文本
          !isWellknownText(node.value) &&
          // 不在需要忽略的节点内
          !isUnderExpressionThatShouldIgnore(node)
        )
          report(node);
      },
      JSXText(node: ESTree.Node & { value: unknown }): void {
        if (
          // 必须是 StringLiteral
          isString(node.value) &&
          // 必须包含未翻译的字符
          isUntranslatedText(node.value) &&
          // 不能是无需翻译的文本
          !isWellknownText(node.value)
        )
          report(node);
      },
      Program(): void {
        const globalScope = context.getSourceCode().scopeManager.globalScope || context.getScope();

        const tracker = new ReferenceTracker(globalScope);
        const traceMap: TraceMap = { require: { [ReferenceTracker.CALL]: true } };

        if (!checkArgumentsOfConsoleCall) {
          // 需要检查 console 时，才去找 console 的依赖
          traceMap.console = {
            [ReferenceTracker.SingleLevelWildcard]: { [ReferenceTracker.CALL]: true },
          };
        }

        for (const { node } of tracker.iterateGlobalReferences(traceMap)) {
          if (node.type === 'CallExpression') {
            weakSetOfCallExpressionsThatShouldBeIgnored.add(node);
          }
        }
      },
      TemplateLiteral(node: ESTree.TemplateLiteral): void {
        // 如果在需要忽略的节点下，直接退出
        if (isUnderExpressionThatShouldIgnore(node)) return;

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

        // 优先检查 quasis ，然后检查 expressions ，使用 iterator 可以提升一些性能
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
      context.report({ node, message: Translations.NoUntranslatedLiteralWarning });
    }

    /**
     * 判断 node 是否为需要被忽略的函数的参数，或是在需要被忽略的 JSX 属性中。
     */
    function isUnderExpressionThatShouldIgnore(node: ESTree.Node): boolean {
      let parent: ESTree.Node | null = node.parent;

      while (parent) {
        // 如果父节点是需要被忽略的 CallExpression ，并且当前节点是其 arguments
        if (parent.type === 'CallExpression') {
          const args: ESTree.Node[] = parent.arguments;

          return weakSetOfCallExpressionsThatShouldBeIgnored.has(parent) && args.includes(node);
        }

        // 如果父节点是需要被忽略的 JSXAttribute ，并且当前节点是其 value
        // @ts-expect-error 类型中暂无 JSXAttribute 节点
        if (parent.type === 'JSXAttribute') {
          const attr = parent as t.UnknownRecord;
          const name = attr.name as t.UnknownRecord | null;

          return (
            attr.value === node &&
            name?.type === 'JSXIdentifier' &&
            /^(className|data-\S*)$/.test(String(name.name))
          );
        }

        // 如果父节点是 ImportExpression ，并且当前节点是其 source
        if (parent.type === 'ImportExpression') {
          return parent.source === node;
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
