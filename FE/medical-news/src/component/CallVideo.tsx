import React, { useEffect, useRef, useState } from "react";
import { Button, Col, Row } from "react-bootstrap";
import { createPeer, openStream, playStream } from "../webrtc/callvideoConfig";
import "./Styles/CallVideo.css";

// Định nghĩa type cho props
interface CallVideoProps {
  remotePeerId?: string | null;
  peer?: any; 
  onEndCall?: () => void;
}

const CallVideo: React.FC<CallVideoProps> = ({ remotePeerId, peer, onEndCall }) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [callActive, setCallActive] = useState<boolean>(false);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  // Lắng nghe cuộc gọi đến
  useEffect(() => {
    if (!peer) return;

    const handleIncomingCall = (call: any) => {
      openStream().then((stream) => {
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        call.answer(stream);
        setCallActive(true);

        call.on("stream", (remote: MediaStream) => {
          setRemoteStream(remote);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remote;
          }
        });
      });
    };

    peer.on("call", handleIncomingCall);
    return () => {
      peer.off("call", handleIncomingCall);
    };
  }, [peer]);

  // Gọi khi có remotePeerId
  useEffect(() => {
    if (!peer || !remotePeerId) return;

    openStream().then((stream) => {
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const call = peer.call(remotePeerId, stream);
      setCallActive(true);

      call.on("stream", (remote: MediaStream) => {
        setRemoteStream(remote);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remote;
        }
      });
    });
  }, [peer, remotePeerId]);

  const handleEndCall = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    setLocalStream(null);
    setRemoteStream(null);
    setCallActive(false);
    if (onEndCall) onEndCall();
  };

  return (
    <>
      <Row className="video-call-section">
        <Col xs={6}>
          <video
            ref={localVideoRef}
            className="video-player"
            autoPlay
            muted
          />
        </Col>
        <Col xs={6}>
          <video
            ref={remoteVideoRef}
            className="video-player"
            autoPlay
          />
        </Col>
      </Row>
      <Row className="call-controls">
        <Col xs={12}>
          <Button variant="danger" onClick={handleEndCall} disabled={!callActive}>
            Kết thúc
          </Button>
        </Col>
      </Row>
    </>
  );
};

export default CallVideo;
