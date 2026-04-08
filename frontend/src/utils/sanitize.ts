export function sanitizeText(value: string) {
  return value.replace(/[<>]/g, "").trim();
}
