export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function buildUniqueSlug(base: string, existing: Iterable<string>): string {
  const normalized = slugify(base) || "item";
  const used = new Set(existing);
  let candidate = normalized;
  let index = 2;
  while (used.has(candidate)) {
    candidate = `${normalized}-${index}`;
    index += 1;
  }
  return candidate;
}
