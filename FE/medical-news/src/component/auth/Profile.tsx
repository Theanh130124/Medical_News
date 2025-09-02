// Profile.tsx
import { JSX, useContext, useEffect, useState } from "react";
import { MyUserContext } from "../../configs/MyContexts";
import { authApis, endpoint } from "../../configs/Apis";
import { Card, Col, Container, Image, Row, Button, ListGroup } from "react-bootstrap";
import MySpinner from "../layout/MySpinner";
import styles from "./Styles/profile.module.css";
import CreatePost from "../post/CreatePost";
import { usePosts } from "../hooks/usePost";
import PostList from "../post/PostList";
import EditPostModal from "../post/EditPostModal";
import { handleApiError } from "../../utils/errorHandler";
import { useNavigate } from "react-router-dom";
import ChatSidebar from "../chat/ChatSidebar";

const Profile = () => {
  const user = useContext(MyUserContext);
  const [friends, setFriends] = useState<any[]>([]);
  const navigate = useNavigate();
  
  const {
    posts,
    loading,
    hasMore,
    editingPost,
    setEditingPost,
    loadMore,
    handleUpdatePost,
    handleDeletePost,
    handleRefresh
  } = usePosts(endpoint.get_post_userId(user?.id || ""));

  // Lấy bạn bè
  useEffect(() => {
    if (!user) return;
    const fetchFriends = async () => {
      try {
        const res = await authApis().get(endpoint.get_list_friends(user.id));
        setFriends(res.data.result.content || []);
      } catch (error) {
        console.error("Lỗi lấy bạn bè:", error);
        handleApiError(error);
      }
    };
    fetchFriends();
  }, [user]);

  const handleNavigateToProfile = (userId: string) => {
    if (userId === user?.id) {
      navigate("/profile");
    } else {
      navigate(`/otherprofile/${userId}`);
    }
  };

  return (
    <Container className={styles.profile}>
      <Row>
        {/* Sidebar */}
        <Col xs={12} md={4}>
          {user && (
            <Card className={styles.profileSidebar}>
              <Card.Body className="text-center">
                <Image src={user.avatar} roundedCircle width={120} height={120} />
                <h5 className="mt-3">{user.firstName} {user.lastName}</h5>
              </Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item><strong>Email:</strong> {user.email}</ListGroup.Item>
                <ListGroup.Item><strong>SĐT:</strong> {user.phoneNumber}</ListGroup.Item>
                <ListGroup.Item><strong>Địa chỉ:</strong> {user.address}</ListGroup.Item>
                <ListGroup.Item><strong>Ngày sinh:</strong> {user.dateOfBirth}</ListGroup.Item>
              </ListGroup>
            </Card>
          )}

          {/* Friends */}
          <Card className={`mt-4 ${styles.profileSidebar}`}>
            <Card.Body>
              <h6>Bạn bè ({friends.length})</h6>
              {friends.length === 0 && <p className="text-muted">Chưa có bạn bè</p>}
              {friends.map((f: any) => {
                if (!f.firstUserId || !f.secondUserId || !user) return null;
                const friendUser = f.firstUserId.id === user.id ? f.secondUserId : f.firstUserId;
                if (!friendUser) return null;
                return (
                  <div key={friendUser.id} className="d-flex align-items-center mb-2">
                    <Image src={friendUser.avatar} roundedCircle width={40} height={40} />
                    <span className="ms-2">{friendUser.firstName} {friendUser.lastName}</span>
                  </div>
                );
              })}
            </Card.Body>
          </Card>
        </Col>

        {/* Posts */}
        <Col xs={12} md={8}>
          {loading && <MySpinner />}
          <CreatePost onPostCreated={handleRefresh} />
          
          <PostList
            posts={posts}
            currentUser={user}
            onEditPost={setEditingPost}
            onDeletePost={handleDeletePost}
            onVoteUpdate={handleRefresh}
            onReactionUpdate={handleRefresh}
            onCommentUpdate={handleRefresh}
            onNavigateToProfile={handleNavigateToProfile}
          />

          {hasMore && (
            <div className="text-center mb-4">
              <Button variant="info" onClick={loadMore} disabled={loading}>
                {loading ? "Đang tải..." : "Xem thêm"}
              </Button>
            </div>
          )}
        </Col>
        <Col md={4} className="d-none d-md-block">
          <ChatSidebar />
        </Col>
      </Row>

      {/* Modal update post */}
      <EditPostModal
        show={!!editingPost}
        editingPost={editingPost}
        onHide={() => setEditingPost(null)}
        onUpdatePost={handleUpdatePost}
        onTitleChange={(title) => setEditingPost(prev => ({ ...prev!, title }))}
        onContentChange={(content) => setEditingPost(prev => ({ ...prev!, content }))}
        onAllowCommentsChange={(allowComments) => setEditingPost(prev => ({ ...prev!, allowComments }))}
      />
    </Container>
  );
};

export default Profile;