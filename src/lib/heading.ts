/** Delar en rubrik i en fet och en tunn del, affischens viktkontrast. */
export function splitHeading(text: string, boldWords: number): [string, string] {
  const words = text.split(' ');
  return [words.slice(0, boldWords).join(' '), words.slice(boldWords).join(' ')];
}

/** Delar av en mening så att den avslutande punkten kan sättas i rött. */
export function splitPeriod(text: string): [string, boolean] {
  return text.endsWith('.') ? [text.slice(0, -1), true] : [text, false];
}
