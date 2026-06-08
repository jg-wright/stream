export function sortFields(json: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(json).sort(([a], [b]) => a.localeCompare(b)),
  )
}
