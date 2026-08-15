import { useEffect, useRef } from 'react';

/**
 * Makes an open overlay (modal/drawer) dismissible with the browser/hardware
 * back button, matching standard mobile-web behaviour: back should close the
 * overlay first, not navigate the whole app away.
 */
export function useCloseOnBack(open: boolean, onClose: () => void) {
  const pushedRef = useRef(false);
  const closingViaPopRef = useRef(false);

  useEffect(() => {
    if (open && !pushedRef.current) {
      window.history.pushState({ overlay: true }, '');
      pushedRef.current = true;
    } else if (!open && pushedRef.current) {
      pushedRef.current = false;
      if (!closingViaPopRef.current) {
        window.history.back();
      }
      closingViaPopRef.current = false;
    }
  }, [open]);

  useEffect(() => {
    function onPopState() {
      if (pushedRef.current) {
        closingViaPopRef.current = true;
        pushedRef.current = false;
        onClose();
      }
    }
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
