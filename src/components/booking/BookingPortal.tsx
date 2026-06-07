import { useState } from 'react';
import { BookingLanding } from './BookingLanding';
import { BookingFlow } from './BookingFlow';
import { BookingConfirmation } from './BookingConfirmation';

type BookingView = 'landing' | 'flow' | 'confirmation';

export function BookingPortal() {
  const [currentView, setCurrentView] = useState<BookingView>('landing');
  const [completedBooking, setCompletedBooking] = useState<any>(null);
  const [flowOpen, setFlowOpen] = useState(false);

  const handleStartBooking = () => {
    setFlowOpen(true);
    setCurrentView('flow');
  };

  const handleCompleteBooking = (bookingData: any) => {
    setCompletedBooking(bookingData);
    setFlowOpen(false);
    setCurrentView('confirmation');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
    setCompletedBooking(null);
    setFlowOpen(false);
  };

  return (
    <div>
      {currentView === 'landing' && (
        <BookingLanding onStartBooking={handleStartBooking} />
      )}

      <BookingFlow
        isOpen={flowOpen}
        onClose={() => {
          setFlowOpen(false);
          if (currentView === 'flow') setCurrentView('landing');
        }}
        onSuccess={() => {
          handleCompleteBooking({ confirmed: true });
        }}
      />

      {currentView === 'confirmation' && completedBooking && (
        <BookingConfirmation
          bookingData={completedBooking}
          onGoHome={handleBackToLanding}
        />
      )}
    </div>
  );
}
