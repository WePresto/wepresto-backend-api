const countries = {
  CO: 10000,
};

export const getPlatformFeeByCountry = (countryCode: string) => {
  return countries[countryCode];
};
