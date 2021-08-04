import type { Rule, Scope } from 'eslint';
import type ESTree from 'estree';
import { resolveSettings } from '../settings';
import { collectObjectPath, matchObjectPath, memoizeWithWeakMap } from '../utils';

export const NoTopLevelTranslation: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      category: 'Best Practices',
      description: 'Require `i18next.t()` calls to be inside the function scope.',
      recommended: true,
      suggestion: false,
      // url: '', // TODO: 文档
    },
  },
  create(context) {
    const settings = resolveSettings(context.settings.i18n2);
    const memoizedCollectObjectPath = memoizeWithWeakMap(collectObjectPath);

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
      const path = memoizedCollectObjectPath(callee);
      return settings.translator.some((patterns) => matchObjectPath(patterns, path));
    }
  },
};

/**
 * 判断 node 所在的 scope 是否在 function 内部。
 */
function isInsideFunctionScope(scope: Scope.Scope): boolean {
  let currentScope: Scope.Scope | null = scope;

  do if (currentScope.type === 'function') return true;
  while ((currentScope = currentScope.upper));

  return false;
}
