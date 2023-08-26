// import * as dotenv from 'dotenv';
// import { HolidayAPI } from 'holidayapi';

// dotenv.config();

// const holidayApi = new HolidayAPI({ key: process.env.HOLIDAY_API_KEY });

export const isHolidayOrWeekend = (
  countryCode: string,
  date: Date,
): boolean => {
  // const year = date.getFullYear();
  // const month = date.getMonth() + 1;
  // const day = date.getDate();

  // console.log('countryCode:', countryCode);
  // console.log('year:', year);
  // console.log('month:', month);
  // console.log('day:', day);

  /*
  const { holidays } = await holidayApi.holidays({
    country: countryCode,
    year,
    month,
    day,
  });
  */
  const dayOfWeek = date.getDay();

  // eslint-disable-next-line prettier/prettier
  // const dateToCompare = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  return (
    /*
    holidays.some(
      (holiday) =>
        holiday.date === dateToCompare || holiday.observed === dateToCompare,
    ) ||
    */
    dayOfWeek === 0 || dayOfWeek === 6
  );
};
