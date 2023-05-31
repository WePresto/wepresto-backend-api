export const getYearMonthDayFromDateISOString = (dateISOString: string) => {
  const [year, month, day] = dateISOString.split('-');
  return { year, month, day: day.split('T')[0] };
};
