export const formatCurrency = (value, currency = 'USD') => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(Number(value || 0));
  } catch {
    return `$${Number(value || 0).toFixed(2)}`;
  }
};

export const formatDateTime = (value, options = {}) => {
  const { emptyLabel = '—', ...intlOptions } = options;

  if (!value) return emptyLabel;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return emptyLabel;

  const resolvedIntlOptions = Object.keys(intlOptions).length
    ? intlOptions
    : { dateStyle: 'medium', timeStyle: 'short' };

  return new Intl.DateTimeFormat('en-US', resolvedIntlOptions).format(date);
};

export const formatDate = (value, options = {}) => formatDateTime(value, options);

export const formatPercent = (value, options = {}) => {
  const { digits = 2, includePlus = true } = options;
  const amount = Number(value || 0);
  const prefix = includePlus && amount >= 0 ? '+' : '';

  return `${prefix}${amount.toFixed(digits)}%`;
};

export const formatNumber = (value, options = {}) => new Intl.NumberFormat('en-US', options).format(Number(value || 0));