import { useEffect, useRef } from 'react';

/**
 * Calls `onEscape` when Escape is pressed, for as long as `isActive`.
 *
 * The callback is held in a ref rather than listed as a dependency, because neither of the
 * obvious alternatives works here. Depending on it directly re-subscribes the listener on
 * every render, since a modal's close handler is rebuilt each time. Memoising that handler
 * at the call site is worse: this app runs the React Compiler, which refuses to optimise a
 * component whose manual `useCallback` dependencies it cannot reproduce — a `useCallback`
 * around a function that only calls `useState` setters is rejected outright.
 *
 * So the listener subscribes once per open and reads the current callback when it fires.
 */
export function useEscapeKey(isActive: boolean, onEscape: () => void): void {
  const onEscapeRef = useRef(onEscape);

  // Deliberately unconditional: the ref must track the latest render's closure, so that a
  // keypress sees the current `isSubmitting` guard rather than the one captured on open.
  useEffect(() => {
    onEscapeRef.current = onEscape;
  });

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onEscapeRef.current();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive]);
}
