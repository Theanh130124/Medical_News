import { JSX, useContext, useEffect, useState } from "react";
import { MyUserContext } from "../../configs/MyContexts";
import { authApis, authformdataApis, endpoint } from "../../configs/Apis";
import { Card, Col, Container, Image, Row, Form, Button, ListGroup, Modal } from "react-bootstrap";
import MySpinner from "../layout/MySpinner";
import styles from "./Styles/profile.module.css";
import { showCustomToast } from "../layout/MyToaster";
import CreatePost from "../post/CreatePost";
import { Post } from "../../types/post";
import Reaction from "../post/Reaction"
import Comment from "../post/Comment";
import SurveyVote from "../post/SurveyVote";

const Profile = () => {
  const user = useContext(MyUserContext);
  const [posts, setPosts] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // Fetch posts
  useEffect(() => {
    if (!user) return;
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await authApis().get(endpoint.get_post_userId(user.id) + `?page=${page}`);
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
  }, [user, page, refreshFlag]);

  // Reset page khi user đổi
  useEffect(() => {
    setPage(0);
  }, [user]);

  const loadMore = () => {
    if (hasMore && !loading) setPage((prev) => prev + 1);
  };

  // Lấy bạn bè
  useEffect(() => {
    if (!user) return;
    const fetchFriends = async () => {
      try {
        const res = await authApis().get(endpoint.get_list_friends(user.id));
        setFriends(res.data.result.content || []);
      } catch (error) {
        console.error("Lỗi lấy bạn bè:", error);
      }
    };
    fetchFriends();
  }, [user]);

  // Post CRUD
  const handleUpdatePost = async (updatedPost: any) => {
    try {
      await authformdataApis().patch(endpoint.update_post(updatedPost.id), {
        title: updatedPost.title,
        content: updatedPost.content,
        allowComments: updatedPost.allowComments
      });
      showCustomToast("Cập nhật bài viết thành công!", "success");
      setEditingPost(null);
      setPage(0);
      setRefreshFlag(prev => prev + 1);
    } catch (error) {
      console.error(error);
      showCustomToast("Cập nhật bài viết thất bại!", "error");
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await authApis().delete(endpoint.update_post(postId));
      showCustomToast("Xóa bài viết thành công!", "success");
      setRefreshFlag(prev => prev + 1);
    } catch (error) {
      console.error(error);
      showCustomToast("Xóa bài viết thất bại!", "error");
    }
  };

  const handleRefresh = () => {
    setRefreshFlag(prev => prev + 1);
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
                const friendUser = f.firstUserId.id === user.id ? f.secondUserId : f.firstUserId;
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
          {loading && page === 0 && <MySpinner />}
          <CreatePost onPostCreated={handleRefresh} />
          <div className={styles.profilePosts}>
            {posts.map((post: any) => {
              const canEditPost = post.userResponse?.id === user?.id;
              const canDeletePost = canEditPost || user?.role === "ADMIN";

              return (
                <Card className={`mb-4 ${styles.profileCard}`} key={post.id}>
                  {post.imagePostResponses?.length > 0 && (
                    <Card.Img variant="top" src={post.imagePostResponses[0].postImageUrl} className={styles.profileCardImg} />
                  )}
                  <Card.Body className={styles.profileCardBody}>
                    <div className={styles.profileAuthorInfo}>
                      <Image src={post.userResponse.avatar} className={styles.profileAuthorAvatar} />
                      <div className={styles.profileAuthorDetails}>
                        <strong>{post.userResponse.firstName} {post.userResponse.lastName}</strong>
                        <br />
                        <small>{new Date(post.createdAt).toLocaleString("vi-VN")}</small>
                      </div>
                    </div>

                    <Card.Title>{post.title}</Card.Title>
                    <Card.Text>{post.content}</Card.Text>

                    {/* Post actions */}
                    <div className="mt-2 d-flex justify-content-end">
                      {canEditPost && (
                        <Button size="sm" variant="warning" className="me-2" onClick={() => setEditingPost(post)}>
                          <i className="bi bi-pencil-square"></i> Sửa bài viết
                        </Button>
                      )}
                      {canDeletePost && (
                        <Button size="sm" variant="danger" onClick={() => handleDeletePost(post.id)}>
                          <i className="bi bi-trash"></i> Xóa bài viết
                        </Button>
                      )}
                    </div>

                    {/* Survey */}
                    <SurveyVote post={post} onVoteUpdate={handleRefresh} />

                    {/* Reaction */}
                    <Reaction post={post} onReactionUpdate={handleRefresh} />

                    {/* Comments */}
                    <Comment post={post} onCommentUpdate={handleRefresh} />
                  </Card.Body>
                </Card>
              );
            })}
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

      {/* Modal update post */}
      <Modal show={!!editingPost} onHide={() => setEditingPost(null)}>
        <Modal.Header closeButton><Modal.Title>Sửa bài viết</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Tiêu đề</Form.Label>
              <Form.Control type="text" value={editingPost?.title || ""} onChange={e => setEditingPost(prev => ({ ...prev!, title: e.target.value }))} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Nội dung</Form.Label>
              <Form.Control as="textarea" value={editingPost?.content || ""} onChange={e => setEditingPost(prev => ({ ...prev!, content: e.target.value }))} />
            </Form.Group>
            <Form.Group>
              <Form.Check type="checkbox" label="Cho phép bình luận" checked={editingPost?.allowComments || false} onChange={e => setEditingPost(prev => ({ ...prev!, allowComments: e.target.checked }))} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEditingPost(null)}>Hủy</Button>
          <Button variant="primary" onClick={() => handleUpdatePost(editingPost)}>Cập nhật</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Profile;