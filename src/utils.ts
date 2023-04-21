import * as dotenv from 'dotenv';
import * as crypto from 'crypto';
import * as os from 'os';

dotenv.config();

export const delay = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

export const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const subtractDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};

export const addMinutes = (date: Date, minutes: number) => {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
};

export const subtractMinutes = (date: Date, minutes: number) => {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() - minutes);
  return result;
};

export const getNumberOfDays = (startDate: Date, endDate: Date) => {
  // One day in milliseconds
  const oneDay = 1000 * 60 * 60 * 24;

  // Calculating the time difference between two dates
  const diffInTime = endDate.getTime() - startDate.getTime();

  // Calculating the no. of days between two dates
  const diffInDays = Math.round(diffInTime / oneDay);

  return diffInDays;
};

// function to format currency
export const formatCurrency = (value: number, currency = 'COP') => {
  return new Intl.NumberFormat('default', {
    style: 'currency',
    currency,
  }).format(value);
};

export const getRabbitMQExchangeName = () => {
  return `${process.env.NODE_ENV}_${process.env.RABBITMQ_EXCHANGE}`;
};

export const hash = (text: string): string => {
  const hash = crypto.createHash('sha256').update(text).digest('hex');

  return hash;
};

export const getReferenceDate = (date: Date, timeZone = 'America/Bogota') => {
  const localeDateString = date.toLocaleDateString('en-US', {
    timeZone,
  });
  const referenceDateTime = new Date(localeDateString).toISOString();
  const [referenceDate] = referenceDateTime.split('T');

  return new Date(referenceDate);
};

export const isSameDay = (...dates) => {
  // get the day of the first date
  const firstDay = dates[0].toISOString().substr(0, 10);

  // check if all other dates are on the same day
  return dates.every((date) => date.toISOString().substr(0, 10) === firstDay);
};

export const formatDateTime = (date: Date, timeZone = 'America/Bogota') => {
  const year = date.toLocaleString('default', { timeZone, year: 'numeric' });
  const month = date.toLocaleString('default', { timeZone, month: '2-digit' });
  const day = date.toLocaleString('default', { timeZone, day: '2-digit' });
  const hour = date.toLocaleString('default', { timeZone, hour: '2-digit' });
  const minute = date.toLocaleString('default', {
    timeZone,
    minute: '2-digit',
  });
  const second = date.toLocaleString('default', {
    timeZone,
    second: '2-digit',
  });

  return `${year}-${month}-${day} ${hour}:${minute}:${second} ${timeZone}`;
};

export const formatDate = (date: Date, timeZone = 'America/Bogota') => {
  const year = date.toLocaleString('default', { timeZone, year: 'numeric' });
  const month = date.toLocaleString('default', { timeZone, month: '2-digit' });
  const day = date.toLocaleString('default', { timeZone, day: '2-digit' });

  return `${year}-${month}-${day}`;
};

export const getMacAddress = () => {
  const interfaces = os.networkInterfaces();
  for (const devName in interfaces) {
    const iface = interfaces[devName];

    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];

      if (alias.family === 'IPv4' && alias.address !== '' && !alias.internal) {
        return alias.mac;
      }
    }
  }
};
