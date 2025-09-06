import { useState, useRef, useEffect } from "react";
import { Button, Card, Form, InputGroup, Modal, Spinner } from "react-bootstrap";
import { chatbotApis, endpoint } from "../configs/Apis";
import styles from "./Styles/chatbot.module.css";

interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ChatBot = () => {
  const [show, setShow] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Thêm tin nhắn người dùng
    const userMessage: Message = {
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Gọi API chatbot
      const response = await chatbotApis().post(endpoint.chatbot, {
        msg: inputMessage
      });

      // Thêm tin nhắn bot
      const botMessage: Message = {
        text: response.data.answer || "Xin lỗi, tôi không hiểu câu hỏi của bạn.",
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Lỗi khi gọi chatbot:", error);
      
      const errorMessage: Message = {
        text: "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau.",
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
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
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Nút mở chatbot - có thể đặt ở bất kỳ đâu */}
      <Button 
        variant="primary" 
        className={styles.chatbotButton}
        onClick={handleShow}
      >
        <i className="bi bi-robot me-2"></i>
        Hỏi đáp y tế
      </Button>

      {/* Modal chatbot */}
      <Modal show={show} onHide={handleClose} size="lg" centered className={styles.chatbotModal}>
        <Modal.Header closeButton className={styles.chatbotHeader}>
          <Modal.Title>
            <i className="bi bi-robot me-2"></i>
            Trợ lý y tế MEDICAL
          </Modal.Title>
          <span className={styles.chatbotSubtitle}>Tôi có thể giúp gì cho bạn?</span>
        </Modal.Header>
        
        <Modal.Body className={styles.chatbotBody}>
          <div className={styles.messagesContainer}>
            {messages.length === 0 ? (
              <div className={styles.welcomeMessage}>
                <div className={styles.welcomeIcon}>
                  <i className="bi bi-robot"></i>
                </div>
                <h5>Xin chào! Tôi là trợ lý y tế MEDICAL</h5>
                <p>Hãy hỏi tôi về các vấn đề sức khỏe, bệnh lý, thuốc men hoặc bất kỳ thông tin y tế nào bạn quan tâm.</p>
                <div className={styles.suggestionChips}>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => setInputMessage("Bệnh addison là bệnh gì?")}
                  >
                    Bệnh addison là gì?
                  </Button>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => setInputMessage("Triệu chứng của cảm cúm là gì?")}
                  >
                    Triệu chứng của bệnh addison là gì ?
                  </Button>
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`${styles.message} ${message.sender === 'user' ? styles.userMessage : styles.botMessage}`}
                >
                  <div className={styles.messageContent}>
                    <div className={styles.messageText}>{message.text}</div>
                    <div className={styles.messageTime}>{formatTime(message.timestamp)}</div>
                  </div>
                  <div className={styles.messageAvatar}>
                    {message.sender === 'user' ? (
                      <i className="bi bi-person-circle"></i>
                    ) : (
                      <i className="bi bi-robot"></i>
                    )}
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className={`${styles.message} ${styles.botMessage}`}>
                <div className={styles.messageContent}>
                  <div className={styles.messageText}>
                    <Spinner animation="border" variant="primary" size="sm" className="me-2" />
                    Đang trả lời...
                  </div>
                </div>
                <div className={styles.messageAvatar}>
                  <i className="bi bi-robot"></i>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </Modal.Body>
        
        <Modal.Footer className={styles.chatbotFooter}>
          <InputGroup>
            <Form.Control
              ref={inputRef}
              type="text"
              placeholder="Nhập câu hỏi của bạn..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <Button 
              variant="primary" 
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
            >
              <i className="bi bi-send"></i>
            </Button>
          </InputGroup>
          <small className="text-muted mt-2">
            Trợ lý ảo cung cấp thông tin tham khảo, không thay thế chẩn đoán của bác sĩ
          </small>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ChatBot;