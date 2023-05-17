const countries = {
  CO: 10000,
};

export const validateAmountByCountry = (
  countryCode: string,
  amount: number | string,
) => {
  const parsedAmount = typeof amount === 'string' ? parseInt(amount) : amount;

  const r = parsedAmount % countries[countryCode];

  if (r !== 0) {
    throw new Error(`amount must be a multiple of ${countries[countryCode]}`);
  }

  return true;
};
