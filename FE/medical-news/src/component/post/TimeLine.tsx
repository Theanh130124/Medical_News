import { JSX, useContext, useEffect, useState } from "react";
import { MyUserContext } from "../../configs/MyContexts";
import { authApis, authformdataApis, endpoint } from "../../configs/Apis";
import { Card, Col, Container, Image, Row, Form, Button, Badge, InputGroup, Modal, ProgressBar } from "react-bootstrap";
import MySpinner from "../layout/MySpinner";
import styles from "./Styles/timeline.module.css";
import { showCustomToast } from "../layout/MyToaster";
import CreatePost from "./CreatePost";
import { Post } from "../../types/post";
import Reaction from "../post/Reaction";
import Comment from "../post/Comment";

const TimeLine = () => {
  const user = useContext(MyUserContext);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

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

  // Hàm kiểm tra xem người dùng hiện tại đã bình chọn option nào chưa
  const getUserVotedOptions = (surveyOptions: any[]) => {
    if (!user) return [];
    
    const votedOptions = [];
    for (const option of surveyOptions) {
      if (option.userResponses && option.userResponses.some((u: any) => u.id === user.id)) {
        votedOptions.push(option.id);
      }
    }
    return votedOptions;
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  };

  const handleVote = async (postId: string, optionId: string) => {
    try {
      // Kiểm tra xem người dùng đã bình chọn option này chưa
      const post = posts.find(p => p.id === postId);
      if (!post || !user) return;
      
      const option = post.surveyOptions.find((o: any) => o.id === optionId);
      const hasVoted = option.userResponses.some((u: any) => u.id === user.id);
      
      if (hasVoted) {
        // Nếu đã bình chọn thì xóa bình chọn
        await authApis().delete(endpoint.vote_survey(optionId, user.id));
        showCustomToast("Đã xóa bình chọn!", "success");
      } else {
        // Nếu chưa bình chọn thì thêm bình chọn
        await authApis().post(endpoint.vote_survey(optionId, user.id));
        showCustomToast("Đã bình chọn!", "success");
      }
      
      // Cập nhật UI ngay lập tức bằng cách refresh dữ liệu
      setRefreshFlag(prev => prev + 1);
    } catch (error) {
      console.error(error);
      showCustomToast("Thao tác thất bại!", "error");
    }
  };

  // Hàm tính tổng số vote của một survey
  const getTotalVotes = (surveyOptions: any[]) => {
    return surveyOptions.reduce((total, option) => total + option.voteCount, 0);
  };

  // Hàm tính phần trăm vote
  const calculatePercentage = (voteCount: number, totalVotes: number) => {
    if (totalVotes === 0) return 0;
    return (voteCount / totalVotes) * 100;
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
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col xs={12} md={8}>
          {loading && page === 0 && <MySpinner />}
          <CreatePost onPostCreated={handleRefresh} />

          {posts.map((post: any, index: number) => {
            const canEditPost = post.userResponse?.id === user?.id;
            const canDeletePost = canEditPost || user?.role === "ADMIN";
            const totalVotes = post.type === "SURVEY" ? getTotalVotes(post.surveyOptions) : 0;
            const userVotedOptions = post.type === "SURVEY" ? getUserVotedOptions(post.surveyOptions) : [];
            
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
                  <div className={styles.authorInfo}>
                    <Image src={post.userResponse.avatar} alt={post.userResponse.username} />
                    <div className={styles.authorDetails}>
                      <strong>{post.userResponse.firstName} {post.userResponse.lastName}</strong>
                      <br />
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
                          <i className="bi bi-pencil-square"></i>
                      </Button>
                    )}
                    {canDeletePost && (
                      <Button size="sm" variant="danger" onClick={() => handleDeletePost(post.id)}>
                        <i className="bi bi-trash"></i>
                      </Button>
                    )}
                  </div>

                  {/* Survey */}
                  {post.type === "SURVEY" && post.surveyOptions && (
                    <div className={styles.surveyForm}>
                      {post.surveyOptions.map((option: any, idx: number) => {
                        const percentage = calculatePercentage(option.voteCount, totalVotes);
                        const isUserVoted = userVotedOptions.includes(option.id);
                        
                        return (
                          <div key={option.id ?? `option-${post.id}-${idx}`} className="mb-2">
                            <Form.Check
                              type="checkbox"
                              label={option.optionText}
                              name={`survey-${post.id}`}
                              checked={isUserVoted}
                              onChange={() => handleVote(post.id, option.id)}
                              disabled={!user} // Vô hiệu hóa nếu chưa đăng nhập
                            />
                            <div className="d-flex align-items-center mt-1">
                              <ProgressBar 
                                now={percentage} 
                                className="flex-grow-1 me-2" 
                                style={{ height: '8px' }}
                                label={`${percentage.toFixed(1)}%`}
                              />
                              <small className="text-muted">
                                {option.voteCount} vote{option.voteCount !== 1 ? 's' : ''}
                              </small>
                            </div>
                            {isUserVoted && (
                              <Badge bg="info" className="mt-1">Bạn đã chọn</Badge>
                            )}
                          </div>
                        );
                      })}
                      <div className="mt-1 text-muted">
                        <small>Tổng số vote: {totalVotes}</small>
                      </div>
                    </div>
                  )}

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