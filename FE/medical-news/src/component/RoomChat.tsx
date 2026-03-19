import { useContext, useEffect, useRef, useState, createElement } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MyUserContext } from "../configs/MyContexts";
import { endpoint, fbApis } from "../configs/Apis";
import { CLOUDINARY_PRESET, CLOUDINARY_URL } from "../configs/Apis";
import { addDoc, updateDoc, doc, getDocs, collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../configs/firebase";
import { createPeer } from "../webrtc/callvideoConfig";
import CallVideo from "./CallVideo";
import styles from "./Styles/roomchat.module.css";
import { FiSend, FiImage, FiVideo, FiX, FiPhone, FiPhoneOff } from "react-icons/fi";
import { RiMedicineBottleLine } from "react-icons/ri";

const ico = (C: any, size: number) => createElement(C, { size });

interface User {
    id: string; username: string; firstName: string; lastName: string;
    phoneNumber: string; isActive: boolean | null; address: string;
    email: string; gender: string; avatar: string; dateOfBirth: string;
    role: { name: string; description: string };
    createdAt: string; doctor: any | null;
}

interface Message {
    messageId: string; senderId: string;
    text?: string; imageUrl?: string;
    timestamp: any; isNew?: boolean;
}

interface Friend {
    firstUserId: User; secondUserId: User; status: string;
}

interface RoomChatProps {
    room?: any; friend?: Friend; otherUser?: User;
}

const RoomChat = () => {
    const location = useLocation();
    const { room, friend, otherUser: propOtherUser } = location.state || {} as RoomChatProps;
    const [loading,     setLoading]     = useState(false);
    const [messages,    setMessages]    = useState<Message[]>([]);
    const userContext = useContext(MyUserContext);
    const user = userContext?.result || userContext;
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [showCall,    setShowCall]    = useState(false);
    const [messageText, setMessageText] = useState("");
    const [imageFile,   setImageFile]   = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const nav = useNavigate();

    let otherUser: User | null = propOtherUser || null;
    if (!otherUser && friend) {
        otherUser = friend.firstUserId.id === user.id ? friend.secondUserId : friend.firstUserId;
    }

    const currentAvatar = user.avatar || "https://via.placeholder.com/40";
    const otherAvatar   = otherUser?.avatar || "https://via.placeholder.com/40";

    const [incomingCall,    setIncomingCall]    = useState<any>(null);
    const [showCallModal,   setShowCallModal]   = useState(false);
    const [myPeerId,        setMyPeerId]        = useState<string | null>(null);
    const [peer,            setPeer]            = useState<any>(null);
    const [remotePeerId,    setRemotePeerId]    = useState<string | null>(null);

    const userAId = user.id;
    const userBId = otherUser?.id || "";
    const chatId  = room?.chatId || [userAId, userBId].sort().join("_");

    useEffect(() => {
        if (!peer) {
            const newPeer = createPeer();
            setPeer(newPeer);
            newPeer.on("open", (id: string) => setMyPeerId(id));
        }
    }, []);

    const handleSendMessage = async () => {
        try {
            if (!messageText && !imageFile) return;
            setLoading(true);
            let imageUrl = null;
            if (imageFile) {
                const formData = new FormData();
                formData.append("file", imageFile);
                formData.append("upload_preset", CLOUDINARY_PRESET);
                const res  = await fetch(CLOUDINARY_URL, { method: "POST", body: formData });
                const data = await res.json();
                imageUrl = data.secure_url;
            }
            await fbApis().post(endpoint.chatMessages(chatId), {
                senderId: user.id, text: messageText,
                imageUrl, timestamp: Date.now(),
            });
            setMessageText("");
            setImageFile(null);
            setImagePreview("");
        } catch (error) {
            console.error("Lỗi khi gửi tin nhắn:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEndCallBothSides = async () => {
        const q = query(collection(db, "videoCalls"),
            where("roomId", "==", chatId),
            where("status", "in", ["accepted", "ringing"])
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            await updateDoc(doc(db, "videoCalls", snapshot.docs[0].id), { status: "ended" });
        }
        setShowCall(false);
    };

    useEffect(() => {
        if (!showCall) return;
        const q = query(collection(db, "videoCalls"),
            where("roomId", "==", chatId), where("status", "==", "ended"));
        const unsub = onSnapshot(q, snap => { if (!snap.empty) setShowCall(false); });
        return () => unsub();
    }, [showCall, chatId]);

    useEffect(() => {
        if (!chatId) return;
        const q = query(collection(db, "chats", chatId, "messages"), orderBy("timestamp", "asc"));
        const unsub = onSnapshot(q, snap => {
            setMessages(snap.docs.map(d => ({ ...d.data(), messageId: d.id })) as Message[]);
        });
        return () => unsub();
    }, [chatId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleCallRequest = async () => {
        if (!peer || !myPeerId || !otherUser) return;
        await addDoc(collection(db, "videoCalls"), {
            from: userAId, fromName: `${user.firstName} ${user.lastName}`,
            to: userBId, status: "ringing", roomId: chatId,
            timestamp: Date.now(), peerIdA: myPeerId
        });
        setShowCall(true);
    };

    useEffect(() => {
        const q = query(collection(db, "videoCalls"),
            where("to", "==", userAId), where("status", "==", "ringing"));
        const unsub = onSnapshot(q, snap => {
            if (!snap.empty) {
                setIncomingCall({ ...snap.docs[0].data(), id: snap.docs[0].id });
                setShowCallModal(true);
            }
        });
        return () => unsub();
    }, [userAId]);

    const handleAcceptCall = async () => {
        if (!peer || !myPeerId || !incomingCall) return;
        await updateDoc(doc(db, "videoCalls", incomingCall.id), { status: "accepted", peerIdB: myPeerId });
        setRemotePeerId(incomingCall.peerIdA);
        setShowCall(true);
        setShowCallModal(false);
    };

    const handleRejectCall = async () => {
        if (!incomingCall) return;
        await updateDoc(doc(db, "videoCalls", incomingCall.id), { status: "rejected" });
        setShowCallModal(false);
    };

    useEffect(() => {
        if (!showCall) return;
        const q = query(collection(db, "videoCalls"),
            where("from", "==", userAId), where("to", "==", userBId), where("status", "==", "accepted"));
        const unsub = onSnapshot(q, snap => {
            if (!snap.empty) setRemotePeerId(snap.docs[0].data().peerIdB);
        });
        return () => unsub();
    }, [showCall, userAId, userBId]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0] || null;
        setImageFile(f);
        if (f) setImagePreview(URL.createObjectURL(f));
        else setImagePreview("");
    };

    if (!otherUser) {
        return (
            <div className={styles.errorWrap}>
                <p>Không tìm thấy thông tin người dùng</p>
                <button className={styles.backBtn} onClick={() => nav(-1)}>Quay lại</button>
            </div>
        );
    }

    const isDoctor = otherUser.role?.name === "DOCTOR";

    return (
        <div className={styles.chatPage}>

            {/* ── HEADER ── */}
            <div className={styles.chatHeader}>
                <div className={styles.headerLeft}>
                    <div className={styles.headerAvatarWrap}>
                        <img src={otherAvatar} alt="avatar" className={styles.headerAvatar} />
                        <span className={styles.onlineDot} />
                    </div>
                    <div className={styles.headerInfo}>
                        <div className={styles.headerNameRow}>
                            <span className={styles.headerName}>
                                {otherUser?.firstName} {otherUser?.lastName}
                            </span>
                            {isDoctor && (
                                <span className={styles.doctorBadge}>
                                    {ico(RiMedicineBottleLine, 11)} Bác sĩ
                                </span>
                            )}
                        </div>
                        <span className={styles.headerStatus}>Đang hoạt động</span>
                    </div>
                </div>
                <button className={styles.videoCallBtn} onClick={handleCallRequest}>
                    {ico(FiVideo, 16)} Gọi Video
                </button>
            </div>

            {/* ── MESSAGES ── */}
            <div className={styles.messageList}>
                {messages.map(msg => {
                    const isMe     = msg.senderId === user.id;
                    const avatarUrl = isMe ? currentAvatar : otherAvatar;
                    return (
                        <div
                            key={msg.messageId}
                            className={`${styles.msgRow} ${isMe ? styles.msgRowRight : styles.msgRowLeft}`}
                        >
                            {!isMe && (
                                <img src={avatarUrl} alt="av" className={styles.msgAvatar} />
                            )}
                            <div className={styles.msgContent}>
                                {!isMe && (
                                    <span className={styles.msgSender}>
                                        {otherUser?.firstName} {otherUser?.lastName}
                                    </span>
                                )}
                                <div className={`${styles.bubble} ${isMe ? styles.bubbleMe : styles.bubbleThem}`}>
                                    {msg.text && <p className={styles.bubbleText}>{msg.text}</p>}
                                    {msg.imageUrl && (
                                        <img
                                            src={msg.imageUrl}
                                            alt="img"
                                            className={styles.msgImage}
                                            onClick={() => window.open(msg.imageUrl, "_blank")}
                                        />
                                    )}
                                </div>
                                <span className={styles.msgTime}>
                                    {msg.timestamp
                                        ? new Date(msg.timestamp).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
                                        : ""}
                                </span>
                            </div>
                            {isMe && (
                                <img src={avatarUrl} alt="av" className={styles.msgAvatar} />
                            )}
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* ── INPUT ── */}
            <div className={styles.inputBar}>
                {/* Image preview */}
                {imagePreview && (
                    <div className={styles.imagePreviewWrap}>
                        <img src={imagePreview} alt="preview" className={styles.imagePreviewThumb} />
                        <button
                            className={styles.removeImageBtn}
                            onClick={() => { setImageFile(null); setImagePreview(""); }}
                        >
                            {ico(FiX, 12)}
                        </button>
                    </div>
                )}

                <div className={styles.inputRow}>
                    {/* Image picker */}
                    <label htmlFor="img-upload" className={styles.imageBtn} title="Gửi hình ảnh">
                        {ico(FiImage, 20)}
                    </label>
                    <input
                        id="img-upload"
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleImageChange}
                    />

                    {/* Text input */}
                    <input
                        className={styles.textInput}
                        type="text"
                        placeholder="Soạn tin nhắn..."
                        value={messageText}
                        onChange={e => setMessageText(e.target.value)}
                        autoFocus
                        onKeyPress={e => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                    />

                    {/* Send button */}
                    <button
                        className={styles.sendBtn}
                        onClick={handleSendMessage}
                        disabled={loading || (!messageText && !imageFile)}
                        title="Gửi"
                    >
                        {ico(FiSend, 17)}
                    </button>
                </div>
            </div>

            {/* ── INCOMING CALL MODAL ── */}
            {showCallModal && incomingCall && (
                <div className={styles.callModalOverlay}>
                    <div className={styles.callModal}>
                        <div className={styles.callModalRing}>
                            {ico(FiPhone, 28)}
                        </div>
                        <h3 className={styles.callModalTitle}>Cuộc gọi đến</h3>
                        <p className={styles.callModalFrom}>
                            {incomingCall.fromName || incomingCall.from} đang gọi cho bạn...
                        </p>
                        <div className={styles.callModalActions}>
                            <button className={styles.acceptBtn} onClick={handleAcceptCall}>
                                {ico(FiPhone, 16)} Bắt máy
                            </button>
                            <button className={styles.rejectBtn} onClick={handleRejectCall}>
                                {ico(FiPhoneOff, 16)} Từ chối
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── VIDEO CALL ── */}
            {showCall && (
                <div className={styles.callVideoWrap}>
                    <CallVideo remotePeerId={remotePeerId} peer={peer} onEndCall={handleEndCallBothSides} />
                    <button className={styles.endCallBtn} onClick={handleEndCallBothSides}>
                        {ico(FiPhoneOff, 16)} Đóng Video Call
                    </button>
                </div>
            )}
        </div>
    );
};

export default RoomChat;