import * as React from 'react';

/**
 * @internal
 */
export function useObservableState(
  observable,
  startWith,
  resetWhenObservableChanges = true,
) {
  const [state, setState] = React.useState(startWith);
  
  React.useEffect(() => {
    if (resetWhenObservableChanges) {
      setState(startWith);
    }
    
    // observable state doesn't run in SSR
    if (typeof window === 'undefined' || !observable) return;

    const subscription = observable.subscribe(setState);
    return () => subscription.unsubscribe();
  }, [observable, resetWhenObservableChanges]);

  return state;
}
