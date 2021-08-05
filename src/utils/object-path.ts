import type { Scope } from 'eslint';
import { TraceMap, TraceMapObject, getStringIfConstant } from 'eslint-utils2';
import type ESTree from 'estree';

export namespace ObjectPath {
  /**
   * 任意层级通配符 `**` 。
   */
  export const MultiLevelWildcard = Symbol('MultiLevelWildcard');

  /**
   * 单层级通配符 `*` 。
   */
  export const SingleLevelWildcard = Symbol('SingleLevelWildcard');

  export type FragmentType = symbol | string;

  export const WildcardStringsMap: ReadonlyMap<string, symbol> = new Map([
    ['*', SingleLevelWildcard],
    ['**', MultiLevelWildcard],
  ]);

  export const SplitString = '.';

  export const EscapeString = '\\';

  /**
   * 收集对象的访问路径。
   */
  export function collect(root: ESTree.Node, scope?: Scope.Scope): readonly (string | null)[] {
    const queue = [root];
    const path: (string | null)[] = [];

    let node: ESTree.Node | undefined;

    while ((node = queue.pop())) {
      if (node.type === 'Identifier') {
        path.push(node.name);
        continue;
      }

      if (node.type === 'ThisExpression') {
        path.push('this');
        continue;
      }

      if (node.type === 'ChainExpression') {
        node = node.expression;
      }

      if (node.type === 'MemberExpression') {
        // 右侧表达式
        if (node.property.type === 'Identifier') {
          // object.prop object?.prop
          path.push(node.property.name);
        } else if (node.computed) {
          // object['123'] object[123] object[`template`]
          path.push(getStringIfConstant(node.property, scope));
        } else {
          // 未知的访问形式
          path.push(null);
        }

        // 左侧表达式
        queue.push(node.object);
      }
    }

    return path.reverse();
  }

  /**
   * 解析对象访问路径用于匹配。
   *
   * 支持一级通配符 `*` 和多级通配符 `**` ，可以使用 `\` 转义。
   *
   * @example
   * ```ts
   * compile('i18next.t') // ['i18next', 't']
   * compile('i18next.*') // ['i18next', Wildcard.SingleLevel]
   * compile('i18next.**') // ['i18next', Wildcard.MultiLevel]
   * compile('i18next.hello\\.t\\\\.world') // ['i18next', 'hello.t\\', 'world']
   * ```
   */
  export function compile(text: string): readonly FragmentType[] {
    const fragments: FragmentType[] = [];

    let end = 0;
    let start = 0;
    let offset = 0;
    let fragment: string | null = null;

    for (; end < text.length; start = end) {
      if (scanText(EscapeString)) {
        appendChar(text[end]);
        end += 1;
        continue;
      }

      if (scanText(SplitString)) {
        appendFragment();
        continue;
      }

      appendChar(text[end]);
      end += 1;
    }

    if (fragment !== null) {
      appendFragment();
    }

    return fragments;

    function appendChar(char: string): void {
      if (fragment === null) fragment = char;
      else fragment += char;
    }

    function appendFragment(): void {
      fragment ||= '';
      fragments.push(WildcardStringsMap.get(fragment) || fragment);
      fragment = null;
    }

    function scanText(shouldBe: string): boolean {
      for (offset = 0; offset < shouldBe.length; offset += 1) {
        if (text[start + offset] !== shouldBe[offset]) {
          return false;
        }
      }

      end = start + offset;

      return true;
    }
  }

  export function mergeAsTraceMap(
    list: readonly (readonly FragmentType[])[],
    info: TraceMapObject,
  ): TraceMap {
    return list.reduce<TraceMap>((map, fragments) => {
      const lastIndex = fragments.length - 1;

      (fragments as string[]).reduce<TraceMapObject>((current, fragment, index) => {
        if (!Object.prototype.hasOwnProperty.call(current, fragment)) {
          current[fragment] = Object.create(null);
        }

        if (index === lastIndex) {
          Object.defineProperties(current[fragment], Object.getOwnPropertyDescriptors(info));
        }

        return current[fragment];
      }, map);

      return map;
    }, Object.create(null));
  }

  /**
   * 根据配置匹配对象的访问路径。
   *
   * @example
   * ```ts
   * matchObjectPath(['a', Wildcard.SingleLevel, 'c'], ['a', 'b', 'c']) // true
   * matchObjectPath(['a', Wildcard.SingleLevel, 'c'], ['a', 'b', 'c', 'd']) // false
   * matchObjectPath(['a', Wildcard.MultiLevel, 'd'], ['a', 'b', 'c', 'd']) // true
   * matchObjectPath(['a', Wildcard.MultiLevel, 'c'], ['a', 'b', 'c', 'd']) // false
   * ```
   */
  export function match(
    patterns: readonly FragmentType[],
    path: readonly (string | null)[],
  ): boolean {
    // 匹配完成
    if (patterns.length === 0 && path.length === 0) return true;
    // 无法继续匹配
    if (!(patterns.length > 0) || !(path.length > 0)) return false;
    // 任意层级通配符
    if (patterns[0] === MultiLevelWildcard)
      return match(patterns.slice(1), path.slice(1)) || match(patterns, path.slice(1));
    // 通配符
    if (patterns[0] === SingleLevelWildcard || patterns[0] === path[0])
      return match(patterns.slice(1), path.slice(1));
    return false;
  }
}
