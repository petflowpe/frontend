import { CalendarLayout } from './calendar/CalendarLayout';

interface CalendarProps {
  currentUser?: { companyId?: number } | null;
  onNavigate?: (tab: string) => void;
}

export function Calendar({ currentUser, onNavigate }: CalendarProps) {
  return <CalendarLayout currentUser={currentUser} onNavigate={onNavigate} />;
}
