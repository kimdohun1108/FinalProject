import {
    LocalAudioTrack,
    LocalVideoTrack,
    RemoteParticipant,
    RemoteTrack,
    RemoteTrackPublication,
    Room,
    RoomEvent
} from "livekit-client";
import "./App.css";
import { useCallback, useEffect, useRef, useState } from "react";
import VideoComponent from "./components/VideoComponent";
import AudioComponent from "./components/AudioComponent";
import { LiveKitRoom, LayoutContextProvider } from "@livekit/components-react";



// 로컬 개발을 위한 기본값 설정
// 프로덕션에서는 배포에 따라 올바른 URL을 구성해야 합니다
let APPLICATION_SERVER_URL = "";
let LIVEKIT_URL = "";
configureUrls();

function configureUrls() {
    // 로컬 개발을 위한 URL 구성
    // 프로덕션을 위한 URL 구성
    APPLICATION_SERVER_URL = "https://openvidu.quizver.kro.kr/";
    LIVEKIT_URL = "wss://openvidu.quizverse.kro.kr/";
}

// 로컬이면 6080 http, 배포면 6443 https,

// function configureUrls() {
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
    const [localAudioTrack, setLocalAudioTrack] = useState(null);
    const [remoteTracks, setRemoteTracks] = useState([]);
    const [participantName, setParticipantName] = useState("Participant" + Math.floor(Math.random() * 100));
    const [roomName, setRoomName] = useState("Test Room");
    const [token, setToken] = useState(null);
    const [isCameraEnabled, setIsCameraEnabled] = useState(true);
    const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [screenTrack, setScreenTrack] = useState(null);
    
    
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
            setToken(token);

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
                console.warn("참가자의 비디오 트랙을 찾을 수 없습니다.");
            }
        } catch (error) {
            console.log("방에 연결하는 중 오류가 발생 : ", error.message);
            await leaveRoom();
        }
    }

    //방 나가기
    async function leaveRoom() {
        // 'disconnect' 메서드를 호출하여 방에서 나가기
        await room?.disconnect();

        // 상태 초기화
        setRoom(undefined);
        setLocalTrack(undefined);
        setRemoteTracks([]);
        //공유화면, ?
        if (isScreenSharing && screenTrack) {
            await screenTrack.stop();
            setScreenTrack(null);
        }
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
    //카메라 켜기
    async function enableCamera() {
        // 사용자의 비디오 장치에서 비디오 스트림을 생성
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const videoTrack = stream.getVideoTracks()[0];
        const localVideoTrack = new LocalVideoTrack(videoTrack);
        await room.localParticipant.publishTrack(localVideoTrack);
        setLocalTrack(localVideoTrack);
    }
    //카메라 끄기
    async function disableCamera() {
        await room.localParticipant.unpublishTrack(localTrack);
        localTrack.stop();
        setLocalTrack(null);
    }
    //카메라 토글 함수
    async function toggleCamera() {
        if (isCameraEnabled) {
            await disableCamera();
        } else {
            await enableCamera();
        }
        setIsCameraEnabled(!isCameraEnabled);
    }
    //마이크 켜기
    async function enableMicrophone() {
        if (!localAudioTrack) {
            // 새로운 오디오 트랙을 생성합니다.
            const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const track = mediaStream.getAudioTracks()[0];
            const audioTrack = new LocalAudioTrack(track);
        
            // 트랙을 퍼블리시합니다.
            await room.localParticipant.publishTrack(audioTrack);
            setLocalAudioTrack(audioTrack);
        } else {
            // 이미 트랙이 존재하면, 상태를 활성화합니다.
            //localAudioTrack.mediaStreamTrack.enabled = true;
            if (localAudioTrack.mediaStreamTrack) {
                localAudioTrack.mediaStreamTrack.enabled = true;
            }
        }
        setIsMicrophoneEnabled(true);
    }
    ///////
    // async function stopAllMediaStreams() {
    //     const devices = await navigator.mediaDevices.enumerateDevices();
    //     const audioInputs = devices.filter(device => device.kind === 'audioinput');

    //     // 병렬로 모든 오디오 입력 장치 처리
    //     // const stopPromises = audioInputs.map(async device => {
    //     //     const stream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: device.deviceId } });
    //     //     stream.getTracks().forEach(track => track.stop());
    //     // });
    //     // await Promise.all(stopPromises);
    //     for (const device of audioInputs) {
    //         const stream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: device.deviceId } });
    //             stream.getTracks().forEach(track => {
    //                 console.log(`Stopping track from device: ${device.label}`);
    //                 track.stop(); // Stop the individual track
    //             });
    //     }
    // }
    //마이크 끄기
    async function disableMicrophone() {
        if (localAudioTrack) {
            // 필요시 트랙을 언퍼블리시합니다.
            await room.localParticipant.unpublishTrack(localAudioTrack);
            if (localAudioTrack.mediaStreamTrack) {
                localAudioTrack.mediaStreamTrack.stop(); // 트랙을 완전히 중지합니다.
            }
            // 트랙을 중지
            localAudioTrack.stop();  // 추가: LocalAudioTrack의 stop 메서드를 호출하여 트랙을 정리합니다.
            setLocalAudioTrack(null);
        }
        // 모든 오디오 트랙 중지
        // await stopAllMediaStreams();
        setIsMicrophoneEnabled(false);
    }
    //마이크 토글
    async function toggleMicrophone() {
        if (isMicrophoneEnabled) {
            await disableMicrophone();
        } else {
            await enableMicrophone();
        }
    }
    //화면공유
    async function toggleScreenSharing() {
        if (isScreenSharing) {
            //화면 공유 중지
            if (screenTrack) {
                await screenTrack.stop();
                room.localParticipant.unpublishTrack(screenTrack);
                setScreenTrack(null);
            }
        } else {
            //화면 공유 
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            const track = stream.getVideoTracks()[0];
            setScreenTrack(track);
            await room.localParticipant.publishTrack(track);
        }
        setIsScreenSharing(!isScreenSharing);
    }

    //채팅
    const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const ws = new WebSocket('wss://223.130.139.215:6080/ws/chat');
    
    ws.onopen = () => {
      console.log('웹소켓 연결이 설정되었습니다.');
    };

    ws.onmessage = (event) => {
      console.log('메시지 수신됨:', event.data);
      setMessages((prevMessages) => [...prevMessages, `${participantName} : ${event.data}`]);
    };
  
    ws.onclose = () => {
      console.log('웹소켓 연결이 종료되었습니다.');
    };
  
    ws.onerror = (error) => {
      console.error('웹소켓 오류 발생:', error);
    };

    setSocket(ws);
    
    return () => {
        ws.close();
    };
    }, [participantName]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (socket && message) {
      socket.send(message);
      //setMessages((prevMessages) => [...prevMessages, `나: ${message}`]); // 나의 메시지를 화면에 추가
      setMessage(''); // 메시지 입력란 비우기
    }
    else {
      console.warn('소켓이 열려 있지 않거나 메시지가 비어 있습니다.');
    }
  };

    return (
        <LayoutContextProvider>
        <LiveKitRoom> 
            {/* token={token} serverUrl={LIVEKIT_URL} connect={!!token} */}
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
                        {/* 화면 공유 비디오 표시 */}
                        {isScreenSharing && screenTrack && (
                            <VideoComponent
                                track={screenTrack} // 화면 공유 비디오 트랙
                                participantIdentity={participantName} // 화면 공유를 나타내는 고유 이름
                                local={true}
                            />
                        )}
                    </div>
                    <button className="btn btn-secondary" onClick={toggleCamera}>
                        {isCameraEnabled ? "카메라 끄기" : "카메라 켜기"}
                    </button>
                    <button className="btn btn-secondary" onClick={toggleMicrophone}>
                        {isMicrophoneEnabled ? "마이크 끄기" : "마이크 켜기"}
                    </button>
                    <button className="btn btn-secondary" onClick={toggleScreenSharing}>
                        {isScreenSharing ? "화면 공유 중지" : "화면 공유"}
                    </button>
                    <div className="chat-container">
                        <ul id="messages">
                        {messages.map((msg, index) => (
                            <li key={index}>{msg}</li>
                        ))}
                        </ul>
                        <form onSubmit={sendMessage}>
                        <input
                            autoComplete="off"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="메시지를 입력하세요"
                        />
                        <button type="submit">Send</button>
                        </form>
                    </div>
                </div>
            )}
        </LiveKitRoom>
        </LayoutContextProvider> 
    );
}

export default App;
