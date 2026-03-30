export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatCurrencyInput = (value: string): string => {
  if (!value) return '';

  const numericValue = value.replace(/[^0-9.]/g, '');
  
  const parts = numericValue.split('.');
  let integerPart = parts[0];
  const decimalPart = parts.length > 1 ? parts[1].slice(0, 2) : '';

  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  if (parts.length > 1) {
    return `$${integerPart}.${decimalPart}`;
  }
  return `$${integerPart}`;
};

export const parseCurrency = (value: string): number => {
  if (!value) return 0;
  const numericValue = value.replace(/[^0-9.]/g, '');
  return parseFloat(numericValue) || 0;
};
