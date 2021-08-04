export namespace ObjectPath {
  export enum Wildcard {
    /**
     * 单层级通配符 `*` 。
     */
    SingleLevel,
    /**
     * 任意层级通配符 `**` 。
     */
    MultiLevel,
  }

  export type FragmentType = Wildcard | string;

  export const WildcardStringsMap: ReadonlyMap<string, Wildcard> = new Map([
    ['*', Wildcard.SingleLevel],
    ['**', Wildcard.MultiLevel],
  ]);

  export const SplitString = '.';

  export const EscapeString = '\\';

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
      fragments.push(WildcardStringsMap.get(fragment) ?? fragment);
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
    if (patterns[0] === Wildcard.MultiLevel)
      return match(patterns.slice(1), path.slice(1)) || match(patterns, path.slice(1));
    // 通配符
    if (patterns[0] === Wildcard.SingleLevel || patterns[0] === path[0])
      return match(patterns.slice(1), path.slice(1));
    return false;
  }
}
