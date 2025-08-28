// components/timeline/TimeLine.tsx
import { JSX, useContext, useEffect, useState } from "react";
import { MyUserContext } from "../../configs/MyContexts";
import { authApis, authformdataApis, endpoint } from "../../configs/Apis";
import { Card, Col, Container, Image, Row, Form, Button, Modal } from "react-bootstrap";
import MySpinner from "../layout/MySpinner";
import styles from "./Styles/timeline.module.css";
import { showCustomToast } from "../layout/MyToaster";
import CreatePost from "./CreatePost";
import { Post } from "../../types/post";
import Reaction from "../post/Reaction";
import Comment from "../post/Comment";
import SurveyVote from "./SurveyVote";
import { handleApiError } from "../../utils/errorHandler";
import { useNavigate } from "react-router-dom";
import PrivacyIcon from "../../utils/privacyIcon"; // Import component mới

const TimeLine = (): JSX.Element => {
  const user = useContext(MyUserContext);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const navigate = useNavigate();

  // Fetch posts khi page hoặc user thay đổi
  useEffect(() => {
    if (!user) return;

    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await authApis().get(
          endpoint.get_posts_timeline(user.id) + `&page=${page}`
        );

        const newPosts = res.data.result.content || [];
        setHasMore(page < res.data.result.totalPages - 1);

        if (page === 0) {
          setPosts(newPosts);
        } else {
          setPosts((prev) => [...prev, ...newPosts]);
        }
      } catch (error) {
        console.error("Lỗi lấy timeline:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [user, page, refreshFlag]);

  // Reset page khi user thay đổi
  useEffect(() => {
    setPage(0);
  }, [user]);

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  };

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
      handleApiError(error, "Cập nhật bài viết thất bại!");
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await authApis().delete(endpoint.update_post(postId));
      showCustomToast("Xóa bài viết thành công!", "success");
      setRefreshFlag(prev => prev + 1);
    } catch (error) {
      console.error(error);
      handleApiError(error, "Xóa bài viết thất bại!");
    }
  };

  const handleRefresh = () => {
    setRefreshFlag(prev => prev + 1);
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col xs={12} md={8}>
          {loading && page === 0 && <MySpinner />}
          <CreatePost onPostCreated={handleRefresh} />

          {posts.map((post: any, index: number) => {
            const canEditPost = post.userResponse?.id === user?.id;
            const canDeletePost = canEditPost || user?.role === "ADMIN";
            
            return (
              <Card className={`mb-4 ${styles.timelineCard}`} key={post.id ?? `post-${index}`}>
                {post.imagePostResponses?.length > 0 && (
                  <Card.Img
                    variant="top"
                    src={post.imagePostResponses[0].postImageUrl}
                    className={styles.timelineCardImg}
                  />
                )}
                <Card.Body className={styles.timelineCardBody}>
                  {/* Thông tin tác giả */}
                  <div className={styles.authorInfo}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    if (post.userResponse.id === user?.id) {
                      navigate("/profile");
                    } else {
                      navigate(`/otherprofile/${post.userResponse.id}`);
                    }
                  }}
                  >
                    <Image src={post.userResponse.avatar} alt={post.userResponse.username} />
                    <div className={styles.authorDetails}>
                      <div className="d-flex align-items-center">
                        <strong>{post.userResponse.firstName} {post.userResponse.lastName}</strong>
                        {/* Sử dụng PrivacyIcon component */}
                        <PrivacyIcon privacyMode={post.visibility} />
                      </div>
                      <small>{new Date(post.createdAt).toLocaleString("vi-VN")}</small>
                    </div>
                  </div>

                  {/* Nội dung */}
                  <Card.Title>{post.title}</Card.Title>
                  <Card.Text>{post.content}</Card.Text>

                  {/* Nút hành động */}
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

                  {/* Comment */}
                  <Comment post={post} onCommentUpdate={handleRefresh} />
                </Card.Body>
              </Card>
            );
          })}

          {hasMore && (
            <div className="text-center mb-4">
              <Button variant="info" onClick={loadMore} disabled={loading}>
                {loading ? "Đang tải..." : "Xem thêm"}
              </Button>
            </div>
          )}

          {/* Modal chỉnh sửa bài viết */}
          <Modal show={!!editingPost} onHide={() => setEditingPost(null)}>
            <Modal.Header closeButton>
              <Modal.Title>Sửa bài viết</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group>
                  <Form.Label>Tiêu đề</Form.Label>
                  <Form.Control
                    type="text"
                    value={editingPost?.title || ""}
                    onChange={e => setEditingPost(prev => ({ ...prev!, title: e.target.value }))}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Nội dung</Form.Label>
                  <Form.Control
                    as="textarea"
                    value={editingPost?.content || ""}
                    onChange={e => setEditingPost(prev => ({ ...prev!, content: e.target.value }))}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Check
                    type="checkbox"
                    label="Cho phép bình luận"
                    checked={editingPost?.allowComments || false}
                    onChange={e => setEditingPost(prev => ({ ...prev!, allowComments: e.target.checked }))}
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setEditingPost(null)}>Hủy</Button>
              <Button variant="primary" onClick={() => handleUpdatePost(editingPost)}>Cập nhật</Button>
            </Modal.Footer>
          </Modal>
        </Col>
      </Row>
    </Container>
  );
};

export default TimeLine;