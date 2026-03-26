const bdtFormatter = new Intl.NumberFormat('en-BD', {
  style: 'currency',
  currency: 'BDT',
  maximumFractionDigits: 2,
});

export const formatCurrency = (value) => {
  const numericValue = Number(value);
  return bdtFormatter.format(Number.isFinite(numericValue) ? numericValue : 0);
};

export const CURRENCY_CODE = 'BDT';
