const countries = {
  CO: 50,
};

export const getAmountToForgive = (country: string) => {
  return countries[country];
};
