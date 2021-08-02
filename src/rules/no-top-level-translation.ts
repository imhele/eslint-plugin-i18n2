import type { Rule, Scope } from 'eslint';
import type ESTree from 'estree';
import { memoizeWithWeakMap } from '../utils';

export interface NoTopLevelTranslationConfig {
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
  translator?: readonly string[];
}

export const NoTopLevelTranslation: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      category: 'Possible Errors',
      description: 'require `i18next.t()` calls to be inside the function scope',
      recommended: true,
      suggestion: false,
      // url: '',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          translator: { type: 'array', items: { type: 'string' }, minItems: 1 },
        },
      },
    ],
  },
  create(context) {
    const config: NoTopLevelTranslationConfig = context.options[0] || {};
    const translatorPatternList = (config.translator ?? ['i18next.t']).map((item) =>
      item.split('.'),
    );

    /**
     * 收集对象的访问路径。
     */
    const collectObjectPath = memoizeWithWeakMap(function collectObjectPath(
      node: ESTree.Node,
    ): readonly (string | null)[] {
      if (node.type === 'Identifier') return [node.name];

      if (node.type === 'MemberExpression') {
        // 左侧表达式
        const left = collectObjectPath(node.object);

        // object.prop object?.prop
        if (node.property.type === 'Identifier') return left.concat(node.property.name);

        // object['123'] object[123]
        if (node.computed && node.property.type === 'Literal')
          return left.concat(
            typeof node.property.value === 'string'
              ? node.property.value
              : String(node.property.value),
          );

        return left.concat(null);
      }

      return [];
    });

    return {
      CallExpression,
    };

    function CallExpression(node: ESTree.CallExpression): void {
      // 跳过非顶层 scope 的所有函数调用的检查
      if (isInsideFunctionScope(context.getScope())) return;
      // 如果不是翻译调用，则忽略
      if (!isTranslator(node.callee)) return;

      context.report({
        node,
        message:
          'It is dangerous to get the translation at the top level, ' +
          'because the translation resources may not be loaded at this time, ' +
          'so that the corresponding translation copy cannot be obtained.\n' +
          '在顶层获取翻译是危险的，因为此时可能还未载入翻译资源，导致无法获取到对应的翻译文案。',
      });
    }

    /**
     * 判断调用的函数是否用于翻译。
     */
    function isTranslator(callee: ESTree.CallExpression['callee']): boolean {
      const path = collectObjectPath(callee);
      return translatorPatternList.some((patterns) => matchObjectPath(patterns, path));
    }

    /**
     * 判断 node 所在的 scope 是否在 function 内部。
     */
    function isInsideFunctionScope(scope: Scope.Scope): boolean {
      let currentScope: Scope.Scope | null = scope;

      do if (currentScope.type === 'function') return true;
      while ((currentScope = currentScope.upper));

      return false;
    }
  },
};

/**
 * 根据配置匹配对象的访问路径。
 */
function matchObjectPath(patterns: readonly string[], path: readonly (string | null)[]): boolean {
  // 匹配完成
  if (patterns.length === 0 && path.length === 0) return true;
  // 无法继续匹配
  if (!(patterns.length > 0) || !(path.length > 0)) return false;
  // 任意层级通配符
  if (patterns[0] === '**')
    return (
      matchObjectPath(patterns.slice(1), path.slice(1)) || matchObjectPath(patterns, path.slice(1))
    );
  // 通配符
  if (patterns[0] === '*' || patterns[0] === path[0])
    return matchObjectPath(patterns.slice(1), path.slice(1));
  return false;
}
