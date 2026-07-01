export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^Ѐ-ӿa-z0-9-]/g, "");
}
