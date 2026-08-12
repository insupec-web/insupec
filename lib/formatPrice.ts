export function formatPrice(price: number): string {
  const formatted = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
  return formatted;
}

export function toTitleCase(text: string): string {
  if (!text) return '';

  const smallWords = ['y', 'o', 'de', 'del', 'la', 'el', 'a', 'en', 'x'];

  return text
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      if (index === 0 || !smallWords.includes(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    })
    .join(' ');
}
