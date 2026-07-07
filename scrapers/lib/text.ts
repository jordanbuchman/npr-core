/** Collapses whitespace runs and trims. */
export function cleanText(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

/** Removes surrounding straight/curly quotes from a title. */
export function stripQuotes(text: string): string {
  return cleanText(text)
    .replace(/^[“"']+|[”"']+$/g, '')
    .trim()
}
