// components/chat/ChatSidebar.tsx
import { JSX, useContext, useEffect, useState } from "react";
import { MyUserContext } from "../../configs/MyContexts";
import { authApis, endpoint } from "../../configs/Apis";
import { Card, ListGroup, Badge, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import styles from "./Styles/chatsidebar.module.css";

interface Friend {
  id: string;
  firstUserId: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar: string;
    role: {
      name: string;
    };
  };
  secondUserId: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar: string;
    role: {
      name: string;
    };
  };
  status: string;
}

const ChatSidebar = (): JSX.Element => {
  const user = useContext(MyUserContext);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Lấy danh sách bạn bè
  useEffect(() => {
    if (!user) return;

    const fetchFriends = async () => {
      try {
        const res = await authApis().get(endpoint.get_list_friends(user.id));
        setFriends(res.data.result.content || []);
      } catch (error) {
        console.error("Lỗi lấy bạn bè:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [user]);

  const handleChatClick = async (friendUser: any) => {
    // Tạo room chat dựa trên ID của 2 người
    const chatId = [user.id, friendUser.id].sort().join('_');
    
    navigate('/chat', { 
      state: { 
        room: { chatId },
        otherUser: friendUser
      } 
    });
  };

  const handleVideoCall = (friendUser: any, e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn sự kiện click lan ra parent
    
    // Tạo room chat
    const chatId = [user.id, friendUser.id].sort().join('_');
    
    // Chuyển đến trang chat và tự động bắt đầu cuộc gọi
    navigate('/chat', { 
      state: { 
        room: { chatId },
        otherUser: friendUser,
        autoStartCall: true
      } 
    });
  };

  if (!user) return <div>Vui lòng đăng nhập</div>;

  return (
    <Card className={styles.chatSidebar}>
      <Card.Header className={styles.sidebarHeader}>
        <h5>Đoạn chat</h5>
      </Card.Header>
      <Card.Body className={styles.sidebarBody}>
        {loading ? (
          <div>Đang tải...</div>
        ) : friends.length === 0 ? (
          <div className="text-muted ms-2">Chưa có bạn bè</div>
        ) : (
          <ListGroup variant="flush">
            {friends.map((friend: Friend) => {
              if (!friend.firstUserId || !friend.secondUserId) return null;
              
              // Xác định người bạn (không phải user hiện tại)
              const friendUser = friend.firstUserId.id === user.id 
                ? friend.secondUserId 
                : friend.firstUserId;
              
              if (!friendUser) return null;
              
              return (
                <ListGroup.Item 
                  key={friendUser.id}
                  className={styles.friendItem}
                  onClick={() => handleChatClick(friendUser)}
                >
                  <div className={styles.friendInfo}>
                    <img 
                      src={friendUser.avatar} 
                      alt={friendUser.username}
                      className={styles.friendAvatar}
                    />
                    <div className={styles.friendDetails}>
                      <div className={styles.friendName}>
                        {friendUser.firstName} {friendUser.lastName}
                        {friendUser.role?.name === 'DOCTOR' && (
                          <Badge bg="info" className="ms-1">BS</Badge>
                        )}
                      </div>
                      <div className={styles.friendStatus}>
                        <span className={styles.statusIndicator}></span>
                        <small>Hoạt động</small>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.friendActions}>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className={styles.videoCallBtn}
                      onClick={(e) => handleVideoCall(friendUser, e)}
                      title="Gọi video"
                    >
                      <i className="bi bi-camera-video"></i>
                    </Button>
                  </div>
                </ListGroup.Item>
              );
            })}
          </ListGroup>
        )}
      </Card.Body>
    </Card>
  );
};

export default ChatSidebar;