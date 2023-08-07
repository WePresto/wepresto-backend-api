import { isHolidayOrWeekend } from '../../utils/is-holyday-or-weekend.util';
import { getReferenceDate } from '../../utils';

const countryCode = 'CO';
const currentDate = new Date();

// take 1 day from current dateç
currentDate.setDate(currentDate.getDate());

(async () => {
  const referenceDate = getReferenceDate(currentDate, 'America/Bogota');
  const isHolydayOrWeekend = await isHolidayOrWeekend(
    countryCode,
    referenceDate,
  );
  // eslint-disable-next-line no-console
  console.log('isHolydayOrWeekend:', isHolydayOrWeekend);
})();
