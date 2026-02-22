import { useState } from 'react';
import { BookingLanding } from './BookingLanding';
import { BookingFlow } from './BookingFlow';
import { BookingConfirmation } from './BookingConfirmation';

type BookingView = 'landing' | 'flow' | 'confirmation';

export function BookingPortal() {
  const [currentView, setCurrentView] = useState<BookingView>('landing');
  const [completedBooking, setCompletedBooking] = useState<any>(null);

  const handleStartBooking = () => {
    setCurrentView('flow');
  };

  const handleCompleteBooking = (bookingData: any) => {
    setCompletedBooking(bookingData);
    setCurrentView('confirmation');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
    setCompletedBooking(null);
  };

  return (
    <div>
      {currentView === 'landing' && (
        <BookingLanding onStartBooking={handleStartBooking} />
      )}
      
      {currentView === 'flow' && (
        <BookingFlow 
          onComplete={handleCompleteBooking}
          onBack={handleBackToLanding}
        />
      )}
      
      {currentView === 'confirmation' && completedBooking && (
        <BookingConfirmation 
          bookingData={completedBooking}
          onGoHome={handleBackToLanding}
        />
      )}
    </div>
  );
}
