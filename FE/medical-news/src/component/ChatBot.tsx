import { useState, useRef, useEffect } from "react";
import { Button, Form, InputGroup, Modal, Spinner } from "react-bootstrap";
import { authApis, endpoint } from "../configs/Apis";
import styles from "./Styles/chatbot.module.css";

interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  imageUrl?: string;
}

const ChatBot = () => {
  const [show, setShow] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ================= LOAD CONVERSATIONS =================
  const loadConversations = async () => {
    try {
      const res = await authApis().get(endpoint.chat_list);
      setConversations(res.data.result);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (show) {
      loadConversations();
    }
  }, [show]);

  // ================= LOAD MESSAGES =================
  const loadMessages = async () => {
    try {
      if (!conversationId) return;

      const res = await authApis().get(
        endpoint.chat_messages(conversationId)
      );

      const mapped = res.data.map((msg: any) => ({
        text: msg.content,
        sender: msg.messageType === 'user' ? 'user' : 'bot',
        timestamp: new Date(msg.timestamp),
        imageUrl: msg.imageUrl
      }));

      setMessages(mapped);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (conversationId) {
      loadMessages();
    }
  }, [conversationId]);

  // ================= SEND MESSAGE =================
  const handleSendMessage = async () => {
    //  fix: cho phép gửi text hoặc ảnh
    if (!inputMessage.trim() && !selectedFile) return;

    const userMessage: Message = {
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      imageUrl: selectedFile ? URL.createObjectURL(selectedFile) : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setSelectedFile(null);
    setIsLoading(true);

    try {
      let convId = conversationId;

      //  tạo conversation nếu chưa có
      if (!convId) {
        const res = await authApis().post(endpoint.chat_create, {
          title: inputMessage || "Gửi ảnh"
        });

        convId = res.data.id;
        setConversationId(convId);

        // reload sidebar
        await loadConversations();
      }

      if (!convId) return;

      //  gửi message
      const formData = new FormData();
      if (selectedFile) {
        formData.append("image", selectedFile);
      }
      formData.append("content", inputMessage);
      formData.append("messageType", "user");

      const res = await authApis().post(
        endpoint.chat_messages(convId),
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" }
        }
      );

      //  nếu backend trả bot response
      if (res.data.botResponse) {
        const botMessage: Message = {
          text: res.data.botResponse,
          sender: 'bot',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, botMessage]);
      }

    } catch (error) {
      console.error(error);

      setMessages(prev => [
        ...prev,
        {
          text: "Lỗi rồi!",
          sender: "bot",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Button
        variant="primary"
        className={styles.chatbotButton}
        onClick={handleShow}
      >
         Hỏi đáp y tế
      </Button>

      <Modal show={show} onHide={handleClose} size="lg" centered className={styles.chatbotModal}>
        <Modal.Header closeButton className={styles.chatbotHeader}>
          <Modal.Title>Trợ lý y tế MEDICAL</Modal.Title>
        </Modal.Header>

        <Modal.Body className={styles.chatbotBody}>
          <div style={{ display: "flex", height: "100%" }}>

            {/* SIDEBAR */}
            <div style={{ width: "30%", borderRight: "1px solid #ddd", overflowY: "auto" }}>
              <div style={{ padding: "10px" }}>
                <Button
                  size="sm"
                  onClick={() => {
                    setConversationId(null);
                    setMessages([]);
                  }}
                >
                  + New chat
                </Button>
              </div>

              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  style={{
                    padding: "10px",
                    cursor: "pointer",
                    background: conv.id === conversationId ? "#e3e6ff" : "transparent",
                    fontWeight: conv.id === conversationId ? "bold" : "normal"
                  }}
                  onClick={() => {
                    setConversationId(conv.id);
                    setMessages([]);
                  }}
                >
                  {conv.title}
                </div>
              ))}
            </div>

            {/* CHAT */}
            <div style={{ width: "70%", display: "flex", flexDirection: "column" }}>

              <div className={styles.messagesContainer}>
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`${styles.message} ${message.sender === 'user'
                      ? styles.userMessage
                      : styles.botMessage}`}
                  >
                    <div className={styles.messageContent}>
                      <div className={styles.messageText}>{message.text}</div>

                      {/* HIỂN THỊ ẢNH */}
                      {message.imageUrl && (
                        <img
                          src={message.imageUrl}
                          style={{ maxWidth: "200px", borderRadius: "10px", marginTop: "5px" }}
                        />
                      )}

                      <div className={styles.messageTime}>
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className={`${styles.message} ${styles.botMessage}`}>
                    <Spinner size="sm" />
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* INPUT */}
              <div className={styles.chatbotFooter}>
                <InputGroup>
                  <Form.Control
                    ref={inputRef}
                    type="text"
                    placeholder="Nhập..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />

                  <Form.Control
                    type="file"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setSelectedFile(e.target.files?.[0] || null);
                    }}
                  />

                  <Button onClick={handleSendMessage}>
                    Gửi
                  </Button>
                </InputGroup>
              </div>

            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ChatBot;