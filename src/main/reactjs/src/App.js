import {
    LocalVideoTrack,
    RemoteParticipant,
    RemoteTrack,
    RemoteTrackPublication,
    Room,
    RoomEvent
} from "livekit-client";
import "./App.css";
import { useState } from "react";
import VideoComponent from "./components/VideoComponent";
import AudioComponent from "./components/AudioComponent";


// 로컬 개발을 위한 기본값 설정
// 프로덕션에서는 배포에 따라 올바른 URL을 구성해야 합니다
let APPLICATION_SERVER_URL = "";
let LIVEKIT_URL = "";
configureUrls();

function configureUrls() {
    // 로컬 개발을 위한 URL 구성
    // 프로덕션을 위한 URL 구성
    APPLICATION_SERVER_URL = "http://223.130.139.215:6080/";
    LIVEKIT_URL = "wss://openvidu.quizverse.kro.kr/";
}

// 로컬이면 6080 http, 배포면 6443 https,

// function configureUrls() {
//     // If APPLICATION_SERVER_URL is not configured, use default value from OpenVidu Local deployment
//     if (!APPLICATION_SERVER_URL) {
//         if (window.location.hostname === "localhost") {
//             APPLICATION_SERVER_URL = "http://localhost:6080/";
//         } else {
//             APPLICATION_SERVER_URL = "https://" + window.location.hostname + ":6443/";
//         }
//     }

//     LIVEKIT_URL = "wss://openvidu.quizverse.kro.kr/";
// }

function App() {
    const [room, setRoom] = useState(undefined);
    const [localTrack, setLocalTrack] = useState(undefined);
    const [remoteTracks, setRemoteTracks] = useState([]);

    const [participantName, setParticipantName] = useState("Participant" + Math.floor(Math.random() * 100));
    const [roomName, setRoomName] = useState("Test Room");

    async function joinRoom() {
        // 새 Room 객체 초기화
        const room = new Room();
        setRoom(room);

        // Room에서 이벤트 발생 시 동작 지정
        // 새로운 Track을 받을 때...
        room.on(
            RoomEvent.TrackSubscribed,
            (_track, publication, participant) => {
                setRemoteTracks((prev) => [
                    ...prev,
                    { trackPublication: publication, participantIdentity: participant.identity }
                ]);
            }
        );

         // Track이 삭제될 때...
        room.on(RoomEvent.TrackUnsubscribed, (_track, publication) => {
            setRemoteTracks((prev) => prev.filter((track) => track.trackPublication.trackSid !== publication.trackSid));
        });

        try {
            // 방 이름과 참가자 이름으로 애플리케이션 서버에서 토큰 가져오기
            const token = await getToken(roomName, participantName);

            // LiveKit URL과 토큰으로 방에 연결
            await room.connect(LIVEKIT_URL, token);

            // 카메라와 마이크 활성화
            await room.localParticipant.enableCameraAndMicrophone();
            // 로컬 비디오 트랙 가져오기
            //setLocalTrack(room.localParticipant.videoTrackPublications.values().next().value.videoTrack);
            const LocalVideoTrack = room.localParticipant.videoTrackPublications.values().next().value?.videoTrack;
            if (LocalVideoTrack) {
                setLocalTrack(LocalVideoTrack);
            } else {
                console.warn("No video track found for local participant.");
            }
        } catch (error) {
            console.log("There was an error connecting to the room:", error.message);
            await leaveRoom();
        }
    }

    async function leaveRoom() {
        // 'disconnect' 메서드를 호출하여 방에서 나가기
        await room?.disconnect();

        // 상태 초기화
        setRoom(undefined);
        setLocalTrack(undefined);
        setRemoteTracks([]);
    }

    /**
     * --------------------------------------------
     * 애플리케이션 서버에서 토큰 가져오기
     * --------------------------------------------
     * 아래 메서드는 애플리케이션 서버에서 토큰을 요청합니다.
     * 이를 통해 LiveKit API 키와 비밀을 클라이언트 측에 노출하지 않습니다.
     *
     * 이 샘플 코드에서는 사용자 제어가 없습니다. 누구나
     * 애플리케이션 서버 엔드포인트에 접근할 수 있습니다. 실제 프로덕션에서는
     * 애플리케이션 서버가 사용자 인증을 통해 엔드포인트 접근을 허용해야 합니다.
     */

    async function getToken(roomName, participantName) {
        try {
            const response = await fetch(APPLICATION_SERVER_URL + "token", {
                method: "POST",
                //url: "http://localhost:6080",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    roomName: roomName,
                    participantName: participantName
                })
            });
    
            if (!response.ok) {
                const error = await response.json();
                throw new Error(`토큰 가져오기 실패: ${error.errorMessage}`);
            }
    
            const data = await response.json();
            return data.token;
        } catch (error) {
            console.error("토큰 가져오기 실패:", error);
            throw error;
        }
    }

    return (
        <>
            {!room ? (
                <div id="join">
                    <div id="join-dialog">
                        <h2>Join a Video Room</h2>
                        <form
                            onSubmit={(e) => {
                                joinRoom();
                                e.preventDefault();
                            }}
                        >
                            <div>
                                <label htmlFor="participant-name">참가자</label>
                                <input
                                    id="participant-name"
                                    className="form-control"
                                    type="text"
                                    value={participantName}
                                    onChange={(e) => setParticipantName(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="room-name">Room</label>
                                <input
                                    id="room-name"
                                    className="form-control"
                                    type="text"
                                    value={roomName}
                                    onChange={(e) => setRoomName(e.target.value)}
                                    required
                                />
                            </div>
                            <button
                                className="btn btn-lg btn-success"
                                type="submit"
                                disabled={!roomName || !participantName}
                            >
                                Join!
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <div id="room">
                    <div id="room-header">
                        <h2 id="room-title">{roomName}</h2>
                        <button className="btn btn-danger" id="leave-room-button" onClick={leaveRoom}>
                            Leave Room
                        </button>
                    </div>
                    <div id="layout-container">
                        {localTrack && (
                            <VideoComponent track={localTrack} participantIdentity={participantName} local={true} />
                        )}
                        {remoteTracks.map((remoteTrack) =>
                            remoteTrack.trackPublication.kind === "video" ? (
                                <VideoComponent
                                    key={remoteTrack.trackPublication.trackSid}
                                    track={remoteTrack.trackPublication.videoTrack}
                                    participantIdentity={remoteTrack.participantIdentity}
                                />
                            ) : (
                                <AudioComponent
                                    key={remoteTrack.trackPublication.trackSid}
                                    track={remoteTrack.trackPublication.audioTrack}
                                />
                            )
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

export default App;
