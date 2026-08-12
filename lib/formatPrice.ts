export function formatPrice(price: number): string {
  const formatted = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
  return formatted;
}

export function toTitleCase(text: string): string {
  if (!text) return '';

  const smallWords = ['y', 'o', 'de', 'del', 'la', 'el', 'a', 'en', 'x', 'cm', 'mm', 'cc', 'ml'];

  return text
    .toLowerCase()
    .split(/(\s+|-)/g)
    .map((word, index, array) => {
      if (!word || /^\s+$/.test(word) || word === '-') {
        return word;
      }

      const isFirstWord = array.slice(0, index).every((w) => /^\s+$/.test(w) || w === '-' || w === '');

      if (isFirstWord || !smallWords.includes(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    })
    .join('');
}
