import type { Rule, Scope } from 'eslint';
import { ReferenceTracker } from 'eslint-utils2';
import type ESTree from 'estree';
import { Translations } from '../locales';
import { resolveSettings } from '../settings';
import { ObjectPath } from '../utils';

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

    return {
      'Program:exit'(): void {
        const { scopeManager } = context.getSourceCode();
        const globalScope = scopeManager.globalScope || context.getScope();

        const tracker = new ReferenceTracker(globalScope, {
          multiLevelWildcard: ObjectPath.MultiLevelWildcard,
          singleLevelWildcard: ObjectPath.SingleLevelWildcard,
        });

        const references = (() => {
          if (settings.translatorSourceModule === 'cjs') {
            return tracker.iterateCjsReferences(settings.translator);
          } else if (settings.translatorSourceModule === 'esm') {
            return tracker.iterateEsmReferences(settings.translator);
          } else {
            return tracker.iterateGlobalReferences(settings.translator);
          }
        })();

        for (const { node } of references) {
          // 跳过非顶层 scope 的所有函数调用的检查
          if (isInnermostScopeInsideFunctionScope(globalScope, node)) continue;

          context.report({ node, message: Translations.NoTopLevelTranslationWarning });
        }
      },
    };
  },
};

/**
 * 从 globalScope 向内搜索 node 所在的 scope ，判断其是否在 function 内部。
 */
function isInnermostScopeInsideFunctionScope(scope: Scope.Scope, node: ESTree.Node): boolean {
  const location = node.range[0];

  outside: do {
    if (scope.type === 'function') return true;

    for (const childScope of scope.childScopes) {
      const { range } = childScope.block;

      if (range[0] <= location && location < range[1]) {
        scope = childScope;
        continue outside;
      }
    }

    break outside;
    // eslint-disable-next-line no-constant-condition
  } while (true);

  return false;
}
