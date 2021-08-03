export type RemoveVoidFields<Source> = { [Key in keyof Source]: Exclude<Source[Key], undefined> };

export function removeVoidFields<Source>(
  source: Source,
): asserts source is RemoveVoidFields<Source> {
  Object.entries(source).forEach(([key, value]) => {
    if (value === undefined) delete source[key as keyof Source];
  });
}
