import * as React from 'react';
import { setupChat } from '@livekit/components-core';
import { ConnectionState } from 'livekit-client';
import { useRoomContext } from '../context';
import { useObservableState } from './internal/useObservableState';
import { useConnectionState } from './useConnectionStatus';

/**
 * The `useChat` hook provides chat functionality for a LiveKit room.
 * It returns a simple `send` function to send chat messages and an array of `chatMessages` to hold received messages.
 * It also returns an `update` function that allows you to implement message-edit functionality.
 * @remarks
 * It is possible to pass configurations for custom message encoding and decoding and non-default topics on which to send the messages.
 * @public
 */
export function useChat(options) {
  const room = useRoomContext();
  const connectionState = useConnectionState(room);

  const isDisconnected = React.useMemo(
    () => connectionState === ConnectionState.Disconnected,
    [connectionState]
  );

  const setup = React.useMemo(() => {
    if (!room) {
      console.warn('Room context is not available');
      return {
        send: () => Promise.reject(new Error('Room context is not available')),
        update: () => Promise.reject(new Error('Room context is not available')),
        isSendingObservable: { subscribe: () => {} },
        messageObservable: { subscribe: () => {} }
      };
    }
    return setupChat(room, options);
  }, [room, options, isDisconnected]);

  const isSending = useObservableState(setup.isSendingObservable, false);
  const chatMessages = useObservableState(setup.messageObservable, []);

  return { send: setup.send, update: setup.update, chatMessages, isSending };
}
