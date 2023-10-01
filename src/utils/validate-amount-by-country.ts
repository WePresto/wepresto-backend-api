const countries = {
  CO: {
    divisor: 10000,
    min: 250000,
    max: 1500000,
  },
};

export const validateAmountByCountry = (
  countryCode: string,
  amount: number | string,
) => {
  const parsedAmount = typeof amount === 'string' ? parseInt(amount) : amount;

  const r = parsedAmount % countries[countryCode].divisor;

  if (r !== 0) {
    throw new Error(`amount must be a multiple of ${countries[countryCode]}`);
  }

  if (parsedAmount < countries[countryCode].min) {
    throw new Error(
      `amount must be greater than or equal to ${countries[countryCode].min}`,
    );
  }

  if (parsedAmount > countries[countryCode].max) {
    throw new Error(
      `amount must be less than or equal to ${countries[countryCode].max}`,
    );
  }

  return true;
};
