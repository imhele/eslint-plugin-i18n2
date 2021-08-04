import type { Rule, Scope } from 'eslint';
import type ESTree from 'estree';
import { Translations } from '../locales';
import { resolveSettings } from '../settings';
import { collectObjectPath, matchObjectPath, memoizeWithWeakMap } from '../utils';

export const NoTopLevelTranslation: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      category: 'Best Practices',
      description: Translations.NoTopLevelTranslationRuleDescription,
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

      context.report({ node, message: Translations.NoTopLevelTranslationWarning });
    }

    /**
     * 判断 node 是否为翻译函数。
     */
    function isTranslator(node: ESTree.Node): boolean {
      const path = memoizedCollectObjectPath(node);
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
