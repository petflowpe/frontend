import { CalendarLayout } from './calendar/CalendarLayout';

interface CalendarProps {
  currentUser?: { companyId?: number } | null;
}

export function Calendar({ currentUser }: CalendarProps) {
  return <CalendarLayout currentUser={currentUser} />;
}
