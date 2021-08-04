/**
 * 获取所有 own 的 names 与 symbols 。
 */
export function ownKeys<Source>(source: Source): (keyof Source)[] {
  const names: (string | symbol)[] = Object.getOwnPropertyNames(source);
  return names.concat(Object.getOwnPropertySymbols(source)) as (keyof Source)[];
}
