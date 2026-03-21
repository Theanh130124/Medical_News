import { useState, useRef, useEffect, useContext, createElement } from "react";
import { authApis, endpoint } from "../configs/Apis";
import { MyUserContext } from "../configs/MyContexts";
import styles from "./Styles/chatbotpage.module.css";
import { FiSend, FiPlus, FiMessageCircle, FiImage, FiX } from "react-icons/fi";
import { RiRobot2Line } from "react-icons/ri";

const ico = (C: any, size: number) => createElement(C, { size });

const SESSION_KEY = "chatbot_session_messages";
const SESSION_CONV_KEY = "chatbot_session_conversations";

interface Message {
    text: string;
    sender: "user" | "bot";
    timestamp: Date;
    imageUrl?: string;
}

interface Conversation {
    id: string;
    title: string;
}

const formatTime = (d: Date) =>
    new Date(d).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

const ChatBotPage = () => {
    const user = useContext(MyUserContext);
    const isLoggedIn = !!user;

    const [messages,        setMessages]        = useState<Message[]>([]);
    const [inputMessage,    setInputMessage]    = useState("");
    const [isLoading,       setIsLoading]       = useState(false);
    const [conversationId,  setConversationId]  = useState<string | null>(null);
    const [conversations,   setConversations]   = useState<Conversation[]>([]);
    const [selectedFile,    setSelectedFile]    = useState<File | null>(null);
    const [imagePreview,    setImagePreview]    = useState<string>("");

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef       = useRef<HTMLInputElement>(null);
    const fileInputRef   = useRef<HTMLInputElement>(null);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Load initial data
    useEffect(() => {
        if (isLoggedIn) {
            loadConversations();
        } else {
            // Load từ sessionStorage nếu chưa đăng nhập
            const saved = sessionStorage.getItem(SESSION_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
            }
            const savedConvs = sessionStorage.getItem(SESSION_CONV_KEY);
            if (savedConvs) setConversations(JSON.parse(savedConvs));
        }
    }, [isLoggedIn]);

    // Lưu messages vào session khi chưa đăng nhập
    useEffect(() => {
        if (!isLoggedIn && messages.length > 0) {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(messages));
        }
    }, [messages, isLoggedIn]);

    const loadConversations = async () => {
        try {
            const res = await authApis().get(endpoint.chat_list);
            setConversations(res.data.result || []);
        } catch (err) { console.error(err); }
    };

    const loadMessages = async (convId: string) => {
        try {
                const res = await authApis().get(endpoint.chat_messages(convId));
                setMessages((res.data.result || []).map((msg: any) => ({
                text: msg.content,
                sender: msg.messageType === "user" ? "user" : "bot",
                timestamp: new Date(msg.timestamp),
                imageUrl: msg.imageUrl,
            })));
        } catch (err) { console.error(err); }
    };

    const handleSelectConversation = (conv: Conversation) => {
        setConversationId(conv.id);
        setMessages([]);
        if (isLoggedIn) loadMessages(conv.id);
    };

    const handleNewChat = () => {
        setConversationId(null);
        setMessages([]);
        if (!isLoggedIn) {
            sessionStorage.removeItem(SESSION_KEY);
        }
        inputRef.current?.focus();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0] || null;
        setSelectedFile(f);
        if (f) setImagePreview(URL.createObjectURL(f));
        else setImagePreview("");
    };

    const handleSend = async () => {
        if (!inputMessage.trim() && !selectedFile) return;

        const userMsg: Message = {
            text: inputMessage,
            sender: "user",
            timestamp: new Date(),
            imageUrl: selectedFile ? URL.createObjectURL(selectedFile) : undefined,
        };

        setMessages(prev => [...prev, userMsg]);
        const currentText = inputMessage;
        setInputMessage("");
        const currentFile = selectedFile;
        setSelectedFile(null);
        setImagePreview("");
        setIsLoading(true);

        try {
            if (isLoggedIn) {
                // ── Đăng nhập: gọi API ──
                let convId = conversationId;
                if (!convId) {
                    const res = await authApis().post(endpoint.chat_create, {
                        title: currentText || "Gửi ảnh"
                    });
                    convId = res.data.result?.id;
                    setConversationId(convId);
                    await loadConversations();
                }
                if (!convId) return;

                const formData = new FormData();
                if (currentFile) formData.append("image", currentFile);
                formData.append("content", currentText);
                formData.append("messageType", "user");

                const res = await authApis().post(
                    endpoint.chat_messages(convId), formData,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );

                if (res.data.result?.botResponse) {
                    setMessages(prev => [...prev, {
                        text: res.data.result.botResponse,
                        sender: "bot",
                        timestamp: new Date(),
                    }]);
                }
            } else {
                // ── Chưa đăng nhập: lưu session + giả lập bot trả lời ──
                const sessionConvId = conversationId || `session_${Date.now()}`;
                if (!conversationId) {
                    setConversationId(sessionConvId);
                    const newConv = { id: sessionConvId, title: currentText.slice(0, 30) || "Cuộc trò chuyện mới" };
                    const updated = [newConv, ...conversations];
                    setConversations(updated);
                    sessionStorage.setItem(SESSION_CONV_KEY, JSON.stringify(updated));
                }

                // Gọi API không cần auth nếu có, hoặc để bot trả lời mặc định
                setTimeout(() => {
                    setMessages(prev => [...prev, {
                        text: "Bạn cần đăng nhập để sử dụng đầy đủ tính năng hỏi đáp y tế. Tuy nhiên tôi vẫn có thể trả lời các câu hỏi cơ bản!",
                        sender: "bot",
                        timestamp: new Date(),
                    }]);
                    setIsLoading(false);
                }, 800);
                return;
            }
        } catch {
            setMessages(prev => [...prev, {
                text: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại!",
                sender: "bot",
                timestamp: new Date(),
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className={styles.pageWrapper}>
            {/* ── SIDEBAR ── */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.sidebarLogo}>
                        {ico(RiRobot2Line, 18)} Hỏi đáp y tế
                    </div>
                    <button className={styles.newChatBtn} onClick={handleNewChat}>
                        {ico(FiPlus, 14)} Mới
                    </button>
                </div>

                <div className={styles.convList}>
                    {conversations.length === 0 ? (
                        <div className={styles.convEmpty}>Chưa có cuộc trò chuyện</div>
                    ) : (
                        conversations.map(conv => (
                            <div
                                key={conv.id}
                                className={`${styles.convItem} ${conversationId === conv.id ? styles.convItemActive : ""}`}
                                onClick={() => handleSelectConversation(conv)}
                            >
                                {ico(FiMessageCircle, 13)}
                                <span className={styles.convTitle}>{conv.title}</span>
                            </div>
                        ))
                    )}
                </div>

                {!isLoggedIn && (
                    <div className={styles.loginNotice}>
                        <span>Đăng nhập để lưu lịch sử chat</span>
                        <a href="/login" className={styles.loginLink}>Đăng nhập</a>
                    </div>
                )}
            </aside>

            {/* ── MAIN CHAT ── */}
            <main className={styles.chatMain}>
                {/* Header */}
                <div className={styles.chatHeader}>
                    <div className={styles.chatHeaderLeft}>
                        <div className={styles.botAvatar}>{ico(RiRobot2Line, 20)}</div>
                        <div>
                            <div className={styles.botName}>Trợ lý y tế MEDICAL</div>
                            <div className={styles.botStatus}>
                                <span className={styles.statusDot} /> Sẵn sàng hỗ trợ
                            </div>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className={styles.messageList}>
                    {messages.length === 0 && (
                        <div className={styles.welcome}>
                            <div className={styles.welcomeIcon}>{ico(RiRobot2Line, 40)}</div>
                            <h3 className={styles.welcomeTitle}>Xin chào! Tôi là trợ lý y tế MEDICAL</h3>
                            <p className={styles.welcomeDesc}>
                                Hỏi tôi bất kỳ câu hỏi nào về sức khỏe, triệu chứng, hoặc lời khuyên y tế.
                            </p>
                            <div className={styles.suggestions}>
                                {["Triệu chứng cảm cúm?", "Cách phòng bệnh tim mạch?", "Chế độ ăn uống lành mạnh?"].map(s => (
                                    <button
                                        key={s}
                                        className={styles.suggestionChip}
                                        onClick={() => { setInputMessage(s); inputRef.current?.focus(); }}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((msg, i) => (
                        <div key={i} className={`${styles.msgRow} ${msg.sender === "user" ? styles.msgRowUser : styles.msgRowBot}`}>
                            {msg.sender === "bot" && (
                                <div className={styles.botBubbleAvatar}>{ico(RiRobot2Line, 16)}</div>
                            )}
                            <div className={`${styles.bubble} ${msg.sender === "user" ? styles.bubbleUser : styles.bubbleBot}`}>
                                {msg.text && <p className={styles.bubbleText}>{msg.text}</p>}
                                {msg.imageUrl && (
                                    <img src={msg.imageUrl} alt="img" className={styles.msgImg} />
                                )}
                                <span className={styles.bubbleTime}>{formatTime(msg.timestamp)}</span>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className={`${styles.msgRow} ${styles.msgRowBot}`}>
                            <div className={styles.botBubbleAvatar}>{ico(RiRobot2Line, 16)}</div>
                            <div className={`${styles.bubble} ${styles.bubbleBot} ${styles.typingBubble}`}>
                                <span className={styles.dot} /><span className={styles.dot} /><span className={styles.dot} />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className={styles.inputArea}>
                    {imagePreview && (
                        <div className={styles.previewWrap}>
                            <img src={imagePreview} alt="preview" className={styles.previewImg} />
                            <button className={styles.previewRemove} onClick={() => { setSelectedFile(null); setImagePreview(""); }}>
                                {ico(FiX, 11)}
                            </button>
                        </div>
                    )}
                    <div className={styles.inputRow}>
                        <button className={styles.attachBtn} onClick={() => fileInputRef.current?.click()} title="Gửi ảnh">
                            {ico(FiImage, 19)}
                        </button>
                        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
                        <input
                            ref={inputRef}
                            className={styles.textInput}
                            type="text"
                            placeholder="Nhập câu hỏi y tế..."
                            value={inputMessage}
                            onChange={e => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            autoFocus
                        />
                        <button
                            className={styles.sendBtn}
                            onClick={handleSend}
                            disabled={isLoading || (!inputMessage.trim() && !selectedFile)}
                        >
                            {ico(FiSend, 16)}
                        </button>
                    </div>
                    <p className={styles.disclaimer}>
                        Thông tin chỉ mang tính tham khảo, không thay thế tư vấn y tế chuyên nghiệp.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default ChatBotPage;