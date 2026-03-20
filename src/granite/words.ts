const ones = [
  '',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
];

const tens = [
  '',
  '',
  'twenty',
  'thirty',
  'forty',
  'fifty',
  'sixty',
  'seventy',
  'eighty',
  'ninety',
];

export function numberToWords(n: number): string {
  if (n === 0) return 'zero';

  let result = '';

  if (n >= 1000) {
    return 'many';
  }

  if (n >= 100) {
    result += ones[Math.floor(n / 100)] + ' hundred';
    n %= 100;
    if (n > 0) result += ' and ';
  }

  if (n >= 20) {
    result += tens[Math.floor(n / 10)];
    n %= 10;
    if (n > 0) result += '-' + ones[n];
  } else if (n > 0) {
    result += ones[n];
  }

  return result;
}
