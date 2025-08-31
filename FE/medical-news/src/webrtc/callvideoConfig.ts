import Peer from "peerjs";

export const openStream = (): Promise<MediaStream> => {
    const config: MediaStreamConstraints = { audio: true, video: true };
    return navigator.mediaDevices.getUserMedia(config);
};

export const playStream = (idVideoTag: string, stream: MediaStream): void => {
    const video = document.getElementById(idVideoTag) as HTMLVideoElement | null;
    if (video) {
        if (video.srcObject !== stream) {
            video.srcObject = stream;
            video.onloadedmetadata = () => {
                video.play().catch(() => {
                    // Xử lý lỗi play nếu cần
                });
            };
        }
    }
};

export const createPeer = (): Peer => {
    return new Peer({
        host: 'localhost',
        port: 9000,
        path: '/',
        secure: false,
    });
};