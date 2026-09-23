const dateFormatter = new Intl.DateTimeFormat('en-US', {
  calendar: 'gregory',
  numberingSystem: 'latn',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function formatPublishDate(date: Date, style: 'numeric' | 'japanese' = 'numeric'): string {
  // Keep the runtime's local time zone, as date-fns/format does today.
  const parts = dateFormatter.formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value.padStart(4, '0');
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  if (year === undefined || month === undefined || day === undefined) {
    throw new RangeError('Cannot format publish date');
  }

  return style === 'japanese' ? `${year}年${month}月${day}日` : `${year}/${month}/${day}`;
}
