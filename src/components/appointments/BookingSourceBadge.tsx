import { Globe, User, UserPlus } from 'lucide-react';
import { Badge } from '../ui/badge';
import {
  getBookingSourceBadgeClass,
  getBookingSourceLabel,
  normalizeBookingSource,
} from '../../utils/bookingSourceHelpers';

interface BookingSourceBadgeProps {
  source?: string | null;
  className?: string;
  compact?: boolean;
}

export function BookingSourceBadge({ source, className = '', compact = false }: BookingSourceBadgeProps) {
  const normalized = normalizeBookingSource(source);
  const Icon = normalized === 'portal_auth' ? Globe : normalized === 'public_guest' ? UserPlus : User;

  return (
    <Badge
      variant="outline"
      className={`${getBookingSourceBadgeClass(source)} border ${compact ? 'text-[10px] px-1 py-0' : ''} ${className}`}
    >
      <Icon className={`${compact ? 'h-2.5 w-2.5' : 'h-3 w-3'} mr-1`} />
      {getBookingSourceLabel(source)}
    </Badge>
  );
}
