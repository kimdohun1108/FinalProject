import { LocalVideoTrack, RemoteVideoTrack } from "livekit-client";
import "./ShareVideoComponent.css";
import { useEffect, useRef } from "react";

function ShareVideoComponent({ track, participantIdentity, local = false, isScreenShare = false}) {
    const videoElement = useRef(null);

    useEffect(() => {
        if (videoElement.current) {
            //track.attach(videoElement.current);
            if (track instanceof MediaStreamTrack) {
                // MediaStreamTrack을 사용하는 경우
                videoElement.current.srcObject = new MediaStream([track]);
            } else if (track.attach) {
                // LiveKit 트랙을 사용하는 경우
                track.attach(videoElement.current);
            }
        }

        return () => {
            //track.detach();
            if (track instanceof MediaStreamTrack) {
                // MediaStreamTrack을 사용하는 경우
                //videoElement.current.srcObject = null;
            } else if (track.detach) {
                // LiveKit 트랙을 사용하는 경우
                track.detach();
            }
        };
    }, [track]);

    return (
        <div id={"camera-" + participantIdentity} className="sharevideo-container">
            <div className="participant-data">
                <p>{participantIdentity + (" (Share)")}</p>
            </div>
            {/* <video ref={videoElement} id={track.sid}></video> */}
            <video ref={videoElement} autoPlay playsInline muted={local}></video>
        </div>
    );
}

export default ShareVideoComponent;
