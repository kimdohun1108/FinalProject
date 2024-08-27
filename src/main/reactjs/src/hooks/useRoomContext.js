import * as React from 'react'; // React 라이브러리를 임포트

/** 
 * RoomContext는 LiveKit의 Room 객체를 저장하는 컨텍스트를 생성합니다.
 * 초기값은 undefined로 설정되어 있습니다.
 * @public
 */
export const RoomContext = React.createContext(null);

/**
 * 이 훅은 RoomContext를 통해 제공된 Room 객체를 반환합니다.
 * 만약 RoomContext가 제공되지 않았다면 오류를 발생시킵니다.
 * @public
 */
export function useRoomContext() {
  // RoomContext에서 Room 객체를 가져옵니다.
  const ctx = React.useContext(RoomContext);
  // 만약 Room 객체가 없다면 (즉, RoomContext가 제공되지 않았다면) 오류를 던집니다.
  if (!ctx) {
    throw Error('tried to access room context outside of livekit room component');
  }
  // Room 객체를 반환합니다.
  return ctx;
}

/**
 * 이 훅은 RoomContext에서 Room 객체를 반환합니다.
 * RoomContext가 제공되지 않았다면 undefined를 반환합니다.
 * @public
 */
export function useMaybeRoomContext() {
  // RoomContext에서 Room 객체를 가져옵니다.
  // 컨텍스트가 없으면 undefined를 반환합니다.
  return React.useContext(RoomContext);
}

/**
 * 이 훅은 Room 객체를 반환합니다.
 * Room 객체를 파라미터로 직접 전달받거나, RoomContext에서 가져옵니다.
 * 만약 둘 다 제공되지 않았다면 오류를 발생시킵니다.
 * @public
 */
export function useEnsureRoom(room) {
  // RoomContext에서 Room 객체를 가져옵니다.
  const context = useMaybeRoomContext();
  // 파라미터로 전달된 room 객체가 있으면 그것을 사용하고, 없으면 context에서 가져옵니다.
  const r = room ?? context;
  // 만약 Room 객체가 없다면 오류를 던집니다.
  if (!r) {
    throw new Error(
      'No room provided, make sure you are inside a Room context or pass the room explicitly',
    );
  }
  // Room 객체를 반환합니다.
  return r;
}
