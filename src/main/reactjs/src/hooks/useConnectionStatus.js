import { connectionStateObserver } from '@livekit/components-core';
import * as React from 'react';
import { useEnsureRoom } from '../hooks/useRoomContext';
import { useObservableState } from '../hooks/useObservableState';

/**
 * The `useConnectionState` hook allows you to simply implement your own `ConnectionState` component.
 *
 * @example
 * ```jsx
 * const connectionState = useConnectionState(room);
 * ```
 * @public
 */
export function useConnectionState(room) {
  // passed room takes precedence, if not supplied get current room context
  const r = useEnsureRoom(room);
  const observable = React.useMemo(() => connectionStateObserver(r), [r]);
  const connectionState = useObservableState(observable, r.state);
  return connectionState;
}
