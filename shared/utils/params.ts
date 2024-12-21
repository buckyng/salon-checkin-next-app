import { format, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

export const fetchParams = async (
  promiseParams: Promise<{ id: string }>
): Promise<string> => {
  const params = await promiseParams;
  return params.id;
};

// Convert UTC createdAt to local date
export const getLocalDate = (createdAt: string): string => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone; // Get user's local timezone
  const localTime = toZonedTime(parseISO(createdAt), timeZone); // Convert UTC to local time
  return format(localTime, 'yyyy-MM-dd'); // Format as YYYY-MM-DD
};