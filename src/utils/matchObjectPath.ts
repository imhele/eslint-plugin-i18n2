/**
 * 根据配置匹配对象的访问路径。
 *
 * @example
 * ```ts
 * matchObjectPath(['a', '*', 'c'], ['a', 'b', 'c']) // true
 * matchObjectPath(['a', '*', 'c'], ['a', 'b', 'c', 'd']) // false
 * matchObjectPath(['a', '**', 'd'], ['a', 'b', 'c', 'd']) // true
 * matchObjectPath(['a', '**', 'c'], ['a', 'b', 'c', 'd']) // false
 * ```
 */
export function matchObjectPath(
  patterns: readonly string[],
  path: readonly (string | null)[],
): boolean {
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
