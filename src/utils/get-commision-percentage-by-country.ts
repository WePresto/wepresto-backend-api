const countries = {
  CO: 0.025,
};

export const getCommisionPercentageByCountry = (countryCode: string) => {
  return countries[countryCode];
};
