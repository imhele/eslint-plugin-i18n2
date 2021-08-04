import type { Rule, Scope } from 'eslint';
import { ReferenceTracker, TrackedReferences } from 'eslint-utils2';
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
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          includeRead: { type: 'boolean' },
        },
      },
    ],
  },
  create(context) {
    const settings = resolveSettings(context.settings.i18n2);
    const includeRead: boolean = context.options[0]?.includeRead ?? false;

    return {
      'Program:exit'(): void {
        const { scopeManager } = context.getSourceCode();

        const tracker = new ReferenceTracker(context.getScope(), {
          multiLevelWildcard: ObjectPath.MultiLevelWildcard,
          singleLevelWildcard: ObjectPath.SingleLevelWildcard,
        });

        let references: IterableIterator<TrackedReferences>;

        if (settings.translatorSourceModule === 'cjs') {
          references = tracker.iterateCjsReferences(settings.translator);
        } else if (settings.translatorSourceModule === 'esm') {
          references = tracker.iterateEsmReferences(settings.translator);
        } else {
          references = tracker.iterateGlobalReferences(settings.translator);
        }

        for (const { node, type } of references) {
          // 跳过非顶层 scope 的所有函数调用的检查
          if (isInsideFunctionScope(scopeManager.acquire(node))) continue;

          if (type === ReferenceTracker.CALL || (includeRead && type === ReferenceTracker.READ)) {
            context.report({ node, message: Translations.NoTopLevelTranslationWarning });
            // 由于引用分析比较复杂，所以一次只汇报一个错误
            break;
          }
        }
      },
    };
  },
};

/**
 * 判断 node 所在的 scope 是否在 function 内部。
 */
function isInsideFunctionScope(scope: Scope.Scope | null): boolean {
  if (!scope) return false;

  let currentScope: Scope.Scope | null = scope;

  do if (currentScope.type === 'function') return true;
  while ((currentScope = currentScope.upper));

  return false;
}
