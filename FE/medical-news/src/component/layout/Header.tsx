import { Container, Navbar, Button, NavDropdown, Nav, Badge, Dropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Styles/header.module.css";
import { useContext, useState, useEffect } from "react";
import { MyDipatcherContext, MyUserContext } from "../../configs/MyContexts";
import { authApis, endpoint } from "../../configs/Apis"; 
import cookie from 'react-cookies';
import { FriendRequest } from "../../types/friends";
import { handleApiError } from "../../utils/errorHandler";

// Định nghĩa kiểu dữ liệu cho Notification
interface Notification {
  id: string;
  userResponse: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    isActive: boolean;
    address: string;
    email: string;
    gender: string;
    avatar: string;
    dateOfBirth: string;
    role: {
      name: string;
      description: string;
    };
    createdAt: string;
    doctor: any;
  };
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

const Header = () => {
  const user = useContext(MyUserContext);
  const dispatch = useContext(MyDipatcherContext);
  const navigate = useNavigate();
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFriendRequests, setShowFriendRequests] = useState(false);
  const [activeTab, setActiveTab] = useState<'notifications' | 'friendRequests'>('notifications');

  // Lấy danh sách thông báo
  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      const response = await authApis().get(endpoint.all_notification(user.id));
      if (response.data.code === 0) {
        setNotifications(response.data.result);
      }
    } catch (error) {
      handleApiError(error, "Lấy thông báo thất bại!");
    }
  };

  // Lấy danh sách lời mời kết bạn
  const fetchFriendRequests = async () => {
    if (!user) return;
    
    try {
      const response = await authApis().get(endpoint.friend_pending(user.id));
      if (response.data.code === 0) {
        setFriendRequests(response.data.result.content);
      }
    } catch (error) {
      handleApiError(error, "Lấy lời mời kết bạn thất bại!");
    }
  };

  // Xử lý đọc một thông báo
  const handleReadNotification = async (id: string) => {
    try {
      await authApis().patch(endpoint.read_notification(id));
      
      // Cập nhật lại danh sách thông báo
      fetchNotifications();
    } catch (error) {
      handleApiError(error, "Đọc thông báo thất bại!");
    }
  };

  // Xử lý đọc tất cả thông báo
  const handleReadAllNotifications = async () => {
    if (!user) return;
    
    try {
      await authApis().patch(endpoint.read_all_notification(user.id));
      
      // Cập nhật lại danh sách thông báo
      fetchNotifications();
    } catch (error) {
      handleApiError(error, "Đọc tất cả thông báo thất bại!");
    }
  };

  // Xử lý chấp nhận lời mời kết bạn
  const handleAcceptFriend = async (firstUserId: string) => {
    try {
      await authApis().patch(endpoint.accept_friend(firstUserId, user.id), {
        status: "ACCEPTED"
      });
      
      // Cập nhật lại danh sách
      fetchFriendRequests();
    } catch (error) {
      handleApiError(error, "Chấp nhận lời mời kết bạn thất bại!");
    }
  };

  // Xử lý từ chối lời mời kết bạn
  const handleRejectFriend = async (firstUserId: string) => {
    try {
      await authApis().delete(endpoint.reject_friend(firstUserId, user.id));
      
      // Cập nhật lại danh sách
      fetchFriendRequests();
    } catch (error) {
      handleApiError(error, "Từ chối lời mời kết bạn thất bại!");
    }
  };

  const handleLogout = () => {
    dispatch({ type: "logout" });
    navigate("/login");
  };

  // Tính số thông báo chưa đọc
  const unreadNotificationsCount = notifications.filter(notif => !notif.isRead).length;
  const totalUnreadCount = unreadNotificationsCount + friendRequests.length;

  // Gọi API khi component mount và khi user thay đổi
  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchFriendRequests();
      
      // Thiết lập interval để cập nhật thông báo mỗi 30 giây
      const interval = setInterval(() => {
        fetchNotifications();
        fetchFriendRequests();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <Navbar collapseOnSelect expand="lg" variant="light" bg="light" className={styles.header}>
      <Container className="p-0">
        <Navbar.Brand as={Link} to="/" className={styles.logoLink}>
          <h2 className={styles.logoTitle}>
            <span className={styles.logoHealth}>MEDICAL</span>
            <span className={styles.logoCare}>NEWS</span>
          </h2>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">

          <Nav className={`me-auto ${styles.headerMenu} text-center`}>
            <Link to="/" className={`nav-link text-dark ${styles.navItemWithSubtext} ms-4`}>
              <i className="bi bi-house me-1"></i>
              <span className={styles.navText}>Trang chủ</span>
              <span className={styles.subText}>Home</span>
            </Link>

            {user !== null && (
              <Link to="/timeline" className={`nav-link text-dark ${styles.navItemWithSubtext} ms-4`}>
                <i className="bi bi-clock-history me-1"></i>
                <span className={styles.navText}>Hoạt động</span>
                <span className={styles.subText}>Timeline</span>
              </Link>
            )}
        
            <Link to="/news" className={`nav-link text-dark ${styles.navItemWithSubtext} ms-4`}>
              <i className="bi bi-newspaper me-1"></i>
              <span className={styles.navText}>Tin tức</span>
              <span className={styles.subText}>Xem ngay</span>
            </Link>
         
          </Nav>

          <Nav className={styles.headerAuth}>
            {user === null ? (
              <>
                <Link to="/register" className={styles.registerBtn} style={{ textDecoration: "none" }}>
                  Đăng ký
                </Link>
                <Link to="/login" className={styles.loginBtn} style={{ textDecoration: "none" }}>
                  Đăng nhập
                </Link>
              </>
            ) : (
              <>
                {/* Chuông thông báo */}
                <Dropdown 
                  show={showNotifications} 
                  onToggle={(isOpen) => setShowNotifications(isOpen)}
                  align="end"
                >
                  <Dropdown.Toggle 
                    variant="light" 
                    className={`position-relative border-0 bg-transparent ${styles.customToggle}`}
                  >
                    <i className="bi bi-bell fs-5"></i>
                    {totalUnreadCount > 0 && (
                      <Badge 
                        pill 
                        bg="danger" 
                        className={styles.notificationBadge}
                        style={{ fontSize: '0.6rem' }}
                      >
                        {totalUnreadCount}
                      </Badge>
                    )}
                  </Dropdown.Toggle>

                  <Dropdown.Menu style={{ width: '350px' }}>
                    <div className="d-flex border-bottom">
                      <Button 
                        variant={activeTab === 'notifications' ? 'primary' : 'light'} 
                        className="flex-fill rounded-0 border-0"
                        onClick={() => setActiveTab('notifications')}
                      >
                        Thông báo
                        {unreadNotificationsCount > 0 && (
                          <Badge bg="danger" className="ms-1">
                            {unreadNotificationsCount}
                          </Badge>
                        )}
                      </Button>
                      <Button 
                        variant={activeTab === 'friendRequests' ? 'primary' : 'light'} 
                        className="flex-fill rounded-0 border-0"
                        onClick={() => setActiveTab('friendRequests')}
                      >
                        Lời mời kết bạn
                        {friendRequests.length > 0 && (
                          <Badge bg="danger" className="ms-1">
                            {friendRequests.length}
                          </Badge>
                        )}
                      </Button>
                    </div>

                    {activeTab === 'notifications' ? (
                      <>
                        <Dropdown.Header>
                          <div className="d-flex justify-content-between align-items-center">
                            <span>Thông báo</span>
                            <div>
                              <Button 
                                variant="link" 
                                size="sm" 
                                className="p-0 me-2"
                                onClick={fetchNotifications}
                                title="Làm mới"
                              >
                                <i className="bi bi-arrow-clockwise"></i>
                              </Button>
                              {unreadNotificationsCount > 0 && (
                                <Button 
                                  variant="link" 
                                  size="sm" 
                                  className="p-0"
                                  onClick={handleReadAllNotifications}
                                  title="Đọc tất cả"
                                >
                                  <i className="bi bi-check-all"></i>
                                </Button>
                              )}
                            </div>
                          </div>
                        </Dropdown.Header>
                        
                        {notifications.length === 0 ? (
                          <Dropdown.ItemText className="text-center text-muted py-3">
                            Không có thông báo
                          </Dropdown.ItemText>
                        ) : (
                          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {notifications.map((notification) => (
                              <Dropdown.Item 
                                key={notification.id} 
                                className={`p-3 border-bottom ${!notification.isRead ? 'bg-light' : ''}`}
                                onClick={() => handleReadNotification(notification.id)}
                                style={{ cursor: 'pointer' }}
                              >
                                <div className="d-flex align-items-start">
                                  {!notification.isRead && (
                                    <span className="me-2 text-primary">
                                      <i className="bi bi-circle-fill" style={{ fontSize: '8px' }}></i>
                                    </span>
                                  )}
                                  <div className="flex-grow-1">
                                    <div className="fw-normal">{notification.message}</div>
                                    <small className="text-muted">
                                      {new Date(notification.createdAt).toLocaleString('vi-VN')}
                                    </small>
                                  </div>
                                </div>
                              </Dropdown.Item>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <Dropdown.Header>
                          <div className="d-flex justify-content-between align-items-center">
                            <span>Lời mời kết bạn</span>
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="p-0"
                              onClick={fetchFriendRequests}
                              title="Làm mới"
                            >
                              <i className="bi bi-arrow-clockwise"></i>
                            </Button>
                          </div>
                        </Dropdown.Header>
                        
                        {friendRequests.length === 0 ? (
                          <Dropdown.ItemText className="text-center text-muted py-3">
                            Không có lời mời kết bạn
                          </Dropdown.ItemText>
                        ) : (
                          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {friendRequests.map((request, index) => (
                              <Dropdown.Item 
                                key={index} 
                                className="p-3 border-bottom"
                                style={{ cursor: 'default' }}
                              >
                                <div className="d-flex align-items-center">
                                  <img 
                                    src={request.firstUserId.avatar} 
                                    width="40" 
                                    height="40"
                                    className="rounded-circle me-2" 
                                    alt={request.firstUserId.username}
                                  />
                                  <div className="flex-grow-1">
                                    <div className="fw-bold">{request.firstUserId.firstName} {request.firstUserId.lastName}</div>
                                  </div>
                                </div>
                                <div className="d-flex justify-content-end mt-2 gap-1">
                                  <Button 
                                    variant="outline-success" 
                                    size="sm"
                                    onClick={() => handleAcceptFriend(request.firstUserId.id)}
                                  >
                                    <i className="bi bi-check-lg"></i> Chấp nhận
                                  </Button>
                                  <Button 
                                    variant="outline-danger" 
                                    size="sm"
                                    onClick={() => handleRejectFriend(request.firstUserId.id)}
                                  >
                                    <i className="bi bi-x-lg"></i> Từ chối
                                  </Button>
                                </div>
                              </Dropdown.Item>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </Dropdown.Menu>
                </Dropdown>

                {/* Dropdown người dùng */}
                <NavDropdown
                  title={
                    <span>
                      <img src={user.avatar} width="40" className="rounded-circle me-1" alt="Avatar" /> 
                      {user.username}
                    </span>
                  }
                  id="user-dropdown"
                  align="end"
                >
                  <NavDropdown.Item as={Link} to="/editProfile">
                    Sửa thông tin cá nhân
                  </NavDropdown.Item>

                  <NavDropdown.Item as={Link} to="/profile">
                    Trang cá nhân
                  </NavDropdown.Item>
                  
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i> Đăng xuất
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;