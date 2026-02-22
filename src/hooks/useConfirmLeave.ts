/**
 * Confirmación al salir si hay cambios sin guardar (beforeunload + opcionalmente router)
 */

import { useEffect, useCallback } from 'react';

export function useConfirmLeave(isDirty: boolean, message = '¿Tienes cambios sin guardar. ¿Salir de todos modos?') {
  const handleBeforeUnload = useCallback(
    (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
      }
    },
    [isDirty]
  );

  useEffect(() => {
    if (!isDirty) return;
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, handleBeforeUnload]);

  return { isDirty };
}
