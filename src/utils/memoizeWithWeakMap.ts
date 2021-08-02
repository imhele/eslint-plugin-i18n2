/**
 * 为函数调用创建缓存。
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function memoizeWithWeakMap<Arg extends object, Return>(
  fn: (arg: Arg) => Return,
  map: WeakMap<Arg, Return> = new WeakMap(),
): (arg: Arg) => Return {
  return function memoized(arg: Arg): Return {
    let cache = map.get(arg);

    if (!cache) {
      cache = fn(arg);
      map.set(arg, cache);
    }

    return cache;
  };
}
