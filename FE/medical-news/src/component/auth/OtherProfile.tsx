import { useContext, useEffect, useState } from "react";
import { MyUserContext } from "../../configs/MyContexts";
import { useNavigate, useParams } from "react-router-dom";
import { authApis, endpoint } from "../../configs/Apis";
import { handleApiError } from "../../utils/errorHandler";
import { Card, Col, Container, Image, Row, Button, ListGroup, Badge } from "react-bootstrap";
import MySpinner from "../layout/MySpinner";
import styles from "./Styles/profile.module.css";
import { showCustomToast } from "../layout/MyToaster";

const OtherProfile = () => {
  const currentUser = useContext(MyUserContext);
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [friendStatus, setFriendStatus] = useState<string | null>(null);
  const [followStatus, setFollowStatus] = useState<boolean>(false);
  const [isLoadingAction, setIsLoadingAction] = useState(false);

  // Fetch profile user info
  useEffect(() => {
    if (!userId) return;
    
    const fetchProfileUser = async () => {
      try {
        const res = await authApis().get(endpoint.get_otheruser_by_id(userId));
        setProfileUser(res.data.result);
      } catch (error) {
        console.error("Lỗi lấy thông tin người dùng:", error);
        handleApiError(error, "Không thể tải thông tin người dùng");
        navigate(-1);
      }
    };
    
    fetchProfileUser();
  }, [userId, navigate]);

  // Fetch relationship status
  useEffect(() => {
    if (!currentUser || !profileUser) return;
    
    const fetchRelationshipStatus = async () => {
      try {
       
        const pendingRes = await authApis().get(endpoint.friend_pending(currentUser.id));
        const pendingRequests = pendingRes.data.result.content;
        
        //some có ít nhất 1 vế đúng -> ktra 2 người có gửi kết bạn nhau
        const hasPendingRequest = pendingRequests.some((request: any) => 
          (request.firstUserId.id === currentUser.id && request.secondUserId.id === profileUser.id) ||
          (request.firstUserId.id === profileUser.id && request.secondUserId.id === currentUser.id)
        );
        
        if (hasPendingRequest) {
          setFriendStatus("PENDING");
          //đã là bạn bè
        } else { 
          const friendsRes = await authApis().get(endpoint.get_list_friends(currentUser.id));
          const friendsList = friendsRes.data.result.content;
          
          const isFriend = friendsList.some((friend: any) => 
            (friend.firstUserId.id === currentUser.id && friend.secondUserId.id === profileUser.id) ||
            (friend.firstUserId.id === profileUser.id && friend.secondUserId.id === currentUser.id)
          );
          
          setFriendStatus(isFriend ? "FRIEND" : null);
        }
        

        setFollowStatus(false);
      } catch (error) {
        console.error("Lỗi lấy trạng thái quan hệ:", error);
      }
    };
    
    fetchRelationshipStatus();
  }, [currentUser, profileUser]);

  // Fetch posts
  useEffect(() => {
    if (!profileUser) return;
    
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await authApis().get(endpoint.get_post_userId(profileUser.id) + `?page=${page}`);
        const newPosts = res.data.result.content || [];
        setHasMore(page < res.data.result.totalPages - 1);

        if (page === 0) {
          setPosts(newPosts);
        } else {
          setPosts((prev) => [...prev, ...newPosts]);
        }
      } catch (error) {
        console.error("Lỗi lấy posts của user:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, [profileUser, page, refreshFlag]);

  // Reset page khi user đổi
  useEffect(() => {
    setPage(0);
  }, [profileUser]);

  const loadMore = () => {
    if (hasMore && !loading) setPage((prev) => prev + 1);
  };

  // Xử lý gửi lời mời kết bạn
  const handleSendFriendRequest = async () => {
    if (!currentUser || !profileUser) return;
    
    setIsLoadingAction(true);
    try {
      await authApis().post(endpoint.send_friend, {
        firstUser: currentUser.id,
        secondUser: profileUser.id
      });
      
      setFriendStatus("PENDING");
      showCustomToast("Đã gửi lời mời kết bạn!", "success");
    } catch (ex: any) {
      handleApiError(ex, "Gửi lời mời kết bạn thất bại!");
    } finally {
      setIsLoadingAction(false);
    }
  };

  // Xử lý hủy lời mời kết bạn
  const handleCancelFriendRequest = async () => {
    if (!currentUser || !profileUser) return;
    
    setIsLoadingAction(true);
    try {
      // First, get the specific friend request ID
      const pendingRes = await authApis().get(endpoint.friend_pending(currentUser.id));
      const pendingRequests = pendingRes.data.result.content;
      
      const request = pendingRequests.find((req: any) => 
        (req.firstUserId.id === currentUser.id && req.secondUserId.id === profileUser.id) ||
        (req.firstUserId.id === profileUser.id && req.secondUserId.id === currentUser.id)
      );
      
      if (request) {
        await authApis().delete(endpoint.reject_friend(request.firstUserId.id, request.secondUserId.id));
        setFriendStatus(null);
        showCustomToast("Đã hủy lời mời kết bạn!", "success");
      }
    } catch (ex: any) {
      handleApiError(ex, "Hủy lời mời kết bạn thất bại!");
    } finally {
      setIsLoadingAction(false);
    }
  };

  // Xử lý chấp nhận kết bạn (nếu người khác đã gửi lời mời)
  const handleAcceptFriendRequest = async () => {
    if (!currentUser || !profileUser) return;
    
    setIsLoadingAction(true);
    try {
      await authApis().patch(endpoint.accept_friend(profileUser.id, currentUser.id));
      
      setFriendStatus("FRIEND");
      showCustomToast("Đã chấp nhận lời mời kết bạn!", "success");
    } catch (ex: any) {
      handleApiError(ex, "Chấp nhận lời mời kết bạn thất bại!");
    } finally {
      setIsLoadingAction(false);
    }
  };

  // Xử lý hủy kết bạn
  const handleUnfriend = async () => {
    if (!currentUser || !profileUser) return;
    
    setIsLoadingAction(true);
    try {
      await authApis().delete(endpoint.reject_friend(currentUser.id, profileUser.id));
      
      setFriendStatus(null);
      showCustomToast("Đã hủy kết bạn!", "success");
    } catch (ex: any) {
      handleApiError(ex, "Hủy kết bạn thất bại!");
    } finally {
      setIsLoadingAction(false);
    }
  };

  // Xử lý theo dõi
  const handleFollow = async () => {
    if (!currentUser || !profileUser) return;
    
    setIsLoadingAction(true);
    try {
      await authApis().post(endpoint.follow, {
        followerId: currentUser.id,
        followingId: profileUser.id
      });
      
      setFollowStatus(true);
      showCustomToast("Đã theo dõi!", "success");
    } catch (ex: any) {
      handleApiError(ex, "Theo dõi thất bại!");
    } finally {
      setIsLoadingAction(false);
    }
  };

  // Xử lý bỏ theo dõi
  const handleUnfollow = async () => {
    if (!currentUser || !profileUser) return;
    
    setIsLoadingAction(true);
    try {
      await authApis().delete(endpoint.follow,{
         data: {
        followerId: currentUser.id,
        followingId: profileUser.id
      }
      });
      
      setFollowStatus(false);
      showCustomToast("Đã bỏ theo dõi!", "success");
    } catch (ex: any) {
      handleApiError(ex, "Bỏ theo dõi thất bại!");
    } finally {
      setIsLoadingAction(false);
    }
  };

  if (!profileUser) {
    return <MySpinner />;
  }

  return (
    <Container className={styles.profile}>
      <Row>
        {/* Sidebar */}
        <Col xs={12} md={4}>
          <Card className={styles.profileSidebar}>
            <Card.Body className="text-center">
              <Image src={profileUser.avatar} roundedCircle width={120} height={120} />
              <h5 className="mt-3">{profileUser.firstName} {profileUser.lastName}</h5>
              
              {/* Các nút hành động */}
              {currentUser && currentUser.id !== profileUser.id && (
                <div className="mt-3 d-flex flex-wrap justify-content-center gap-2">
                  {/* Nút kết bạn */}
                  {friendStatus === null && (
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={handleSendFriendRequest}
                      disabled={isLoadingAction}
                    >
                      {isLoadingAction ? "Đang xử lý..." : "Kết bạn"}
                    </Button>
                  )}
                  
                  {friendStatus === "PENDING" && (
                    <>
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        onClick={handleCancelFriendRequest}
                        disabled={isLoadingAction}
                      >
                        Hủy lời mời
                      </Button>
                      <Badge bg="warning" text="dark">
                        Đã gửi lời mời
                      </Badge>
                    </>
                  )}
                  
                  {friendStatus === "FRIEND" && (
                    <Button 
                      variant="outline-danger" 
                      size="sm" 
                      onClick={handleUnfriend}
                      disabled={isLoadingAction}
                    >
                      Hủy kết bạn
                    </Button>
                  )}
                  
                  {/* Nút theo dõi */}
                  {!followStatus ? (
                    <Button 
                      variant="outline-info" 
                      size="sm" 
                      onClick={handleFollow}
                      disabled={isLoadingAction}
                    >
                      Theo dõi
                    </Button>
                  ) : (
                    <Button 
                      variant="outline-secondary" 
                      size="sm" 
                      onClick={handleUnfollow}
                      disabled={isLoadingAction}
                    >
                      Bỏ theo dõi
                    </Button>
                  )}
                </div>
              )}
            </Card.Body>
            
            <ListGroup variant="flush">
              <ListGroup.Item><strong>Email:</strong> {profileUser.email}</ListGroup.Item>
              <ListGroup.Item><strong>SĐT:</strong> {profileUser.phoneNumber || "Chưa cập nhật"}</ListGroup.Item>
              <ListGroup.Item><strong>Địa chỉ:</strong> {profileUser.address || "Chưa cập nhật"}</ListGroup.Item>
              <ListGroup.Item><strong>Ngày sinh:</strong> {profileUser.dateOfBirth || "Chưa cập nhật"}</ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>

        {/* Posts */}
        <Col xs={12} md={8}>
          {loading && page === 0 && <MySpinner />}
          
          <div className={styles.profilePosts}>
            {posts.map((post: any) => (
              <Card className={`mb-4 ${styles.profileCard}`} key={post.id}>
                {post.imagePostResponses?.length > 0 && (
                  <Card.Img variant="top" src={post.imagePostResponses[0].postImageUrl} className={styles.profileCardImg} />
                )}
                <Card.Body className={styles.profileCardBody}>
                  <div 
                    className={styles.profileAuthorInfo}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/otherprofile/${post.userResponse.id}`)}
                  
                  >
                    <Image src={post.userResponse.avatar} className={styles.profileAuthorAvatar} />
                    <div className={styles.profileAuthorDetails}>
                      <strong>{post.userResponse.firstName} {post.userResponse.lastName}</strong>
                      <br />
                      <small>{new Date(post.createdAt).toLocaleString("vi-VN")}</small>
                    </div>
                  </div>

                  <Card.Title>{post.title}</Card.Title>
                  <Card.Text>{post.content}</Card.Text>
                </Card.Body>
              </Card>
            ))}
          </div>

          {hasMore && (
            <div className="text-center mb-4">
              <Button variant="info" onClick={loadMore} disabled={loading}>
                {loading ? "Đang tải..." : "Xem thêm"}
              </Button>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default OtherProfile;