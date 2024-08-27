import * as React from 'react';
import { setupChat } from '@livekit/components-core'; // LiveKit의 채팅 기능을 설정하는 함수
import { ConnectionState } from 'livekit-client'; // 연결 상태를 나타내는 상수들
import { useRoomContext } from '../hooks/useRoomContext'; // 현재 방(Room) 정보를 가져오는 훅 (주석 처리됨)
import { useObservableState } from '../hooks/useObservableState'; // 옵저버블 상태를 관리하는 훅
import { useConnectionState } from '../hooks/useConnectionStatus'; // 현재 방의 연결 상태를 가져오는 훅

/**
 * `useChat` 훅은 LiveKit 방에서 채팅 기능을 제공합니다.
 * 이 훅은 메시지를 보내고, 받은 메시지를 배열로 관리하며, 메시지를 수정할 수 있는 기능을 반환합니다.
 * @public
 */
export function useChat(options) {
  // 현재 방(Room) 정보를 가져옴. 주석 처리된 `useRoomContext`를 사용해야 함
  const room = useRoomContext();

  // 방의 연결 상태를 가져옴
  const connectionState = useConnectionState(room);

  // 연결 상태가 'Disconnected'인지 확인. 연결이 끊어졌다면 true
  const isDisconnected = React.useMemo(
    () => connectionState === ConnectionState.Disconnected,
    [connectionState]
  );

  // 채팅 기능을 설정하는 setup 객체 생성
  const setup = React.useMemo(() => {
    // 만약 room 정보가 없으면 (정상적인 경우가 아니므로) 경고를 출력하고 빈 객체를 반환
    if (!room) {
      console.warn('Room context is not available');
      return {
        // 방 정보가 없으면 send와 update 함수는 에러를 반환
        send: () => Promise.reject(new Error('Room context is not available')),
        update: () => Promise.reject(new Error('Room context is not available')),
        // 옵저버블은 빈 함수로 처리
        isSendingObservable: { subscribe: () => {} },
        messageObservable: { subscribe: () => {} }
      };
    }
    // room 정보가 있다면 정상적으로 setupChat 함수를 호출해 채팅을 설정
    return setupChat(room, options);
  }, [room, options]);

  // 메시지를 전송 중인지 여부를 관리하는 상태
  const isSending = useObservableState(setup.isSendingObservable, false);

  // 받은 메시지들을 관리하는 상태
  const chatMessages = useObservableState(setup.messageObservable, []);

  // 채팅 기능을 위한 함수와 상태들을 반환
  return { send: setup.send, update: setup.update, chatMessages, isSending };
}
