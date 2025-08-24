import { JSX, useContext, useEffect, useState } from "react";
import { MyUserContext } from "../../configs/MyContexts";
import { authApis, authformdataApis, endpoint } from "../../configs/Apis";
import { Card, Col, Container, Image, Row, Form, Button, Badge, InputGroup ,Modal} from "react-bootstrap";
import MySpinner from "../layout/MySpinner";
import { reactionIcons } from "../../types/reactionIcons";
import styles from "./Styles/timeline.module.css";
import { showCustomToast } from "../layout/MyToaster";
import CreatePost from "./CreatePost";
import { Post } from "../../types/post";
import { FaTrash, FaEdit } from "react-icons/fa";

const TimeLine = () => {
  const user = useContext(MyUserContext);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<{ [key: string]: string }>({});
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(0);

  const [commentContent, setCommentContent] = useState<{ [key: string]: string }>({});
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editingComment, setEditingComment] = useState<{ id: string; content: string } | null>(null);

  // Fetch posts khi page hoặc user thay đổi
  useEffect(() => {
    if (!user) return;

    const fetchPosts = async () => {
      setLoading(true);
      try {
        // URL phân trang: &page vì đã có ?currentUserId
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
  }, [user, page,refreshFlag]); 


  


    const handleReaction = async (postId: string, type: string) => {
        if (!user) return;
        try {
          const post = posts.find(p => p.id === postId);
          const existingReaction = post.reactions?.find((r: any) => r.userId === user.id);

          if (!existingReaction) {
              await authApis().post(endpoint["create_reaction"], {
                postId,
                userId: user.id,
                type
              });
          } else if (existingReaction.type === type) {
            await authApis().delete(endpoint.delete_reaction(existingReaction.id));
          } else {
            await authApis().put(endpoint.update_reaction(existingReaction.id), { type });
          }
          setRefreshFlag(prev => prev + 1);
        } catch (error) {
          console.log(error);
          showCustomToast("Thao tác reaction thất bại!", "error");
        }
      };

  const handleCreateComment = async (postId: string) => {
    if (!user) return;
    try {
      const content = commentContent[postId];
      if (!content) return;
      await authApis().post(endpoint['create_comment'], { postId, userId: user.id, content });
      setCommentContent(prev => ({ ...prev, [postId]: "" }));
      setRefreshFlag(prev => prev + 1);
    } catch (error) {
      console.error(error);
      showCustomToast("Bình luận thất bại!", "error");
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
      showCustomToast("Cập nhật bài viết thất bại!", "error");
    }
  };

  const handleDeletePost = async (postId: string) => {
  try {
    await authApis().delete(endpoint.update_post(postId)); // dùng cùng endpoint update_post cho delete
    showCustomToast("Xóa bài viết thành công!", "success");
    setRefreshFlag(prev => prev + 1);
  } catch (error) {
    console.error(error);
    showCustomToast("Xóa bài viết thất bại!", "error");
  }
};



  const handleUpdateComment = async (commentId: string, content: string) => {

    try {
      await authApis().put(endpoint.update_comment(commentId), { content });
      showCustomToast("Cập nhật bình luận thành công!", "success");
      setRefreshFlag(prev => prev + 1);
    } catch (error) {
      console.error(error);
      showCustomToast("Cập nhật bình luận thất bại!", "error");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await authApis().delete(endpoint.delete_comment(commentId));
      showCustomToast("Xóa bình luận thành công!", "success");
      setRefreshFlag(prev => prev + 1);
    } catch (error) {
      console.error(error);
      showCustomToast("Xóa bình luận thất bại!", "error");
    }
  };

  // Reset page khi user thay đổi
  useEffect(() => {
    setPage(0);
  }, [user]);

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  };

  const handleVote = async (postId: string) => {
    try {
      const optionId = selectedOption[postId];
      if (!optionId) return alert("Vui lòng chọn một lựa chọn để bình chọn!");
      await authApis().post(`/posts/survey/vote/${optionId}?userId=${user.id}`);
      showCustomToast("Bình chọn thành công!", "success");
      setPage(0); // reload page 0 sau khi vote
    } catch (error) {
      console.error(error);
      showCustomToast("Bình chọn thất bại!", "error");
    }
  };


return (
  <Container className="mt-5">
    <Row className="justify-content-center">
      <Col xs={12} md={8}>
        {loading && page === 0 && <MySpinner />}
        <CreatePost onPostCreated={() => setRefreshFlag(prev => prev + 1)} />

        {posts.map((post: any, index: number) => {
          const canEditPost = post.userResponse.id === user.id;
          const canDeletePost = canEditPost || user.role === "ADMIN";
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
                  <Form className={styles.surveyForm}>
                   {post.surveyOptions.map((option: any, idx: number) => (
                      <Form.Check
                        key={option.id ?? `option-${post.id}-${idx}`}
                        type="radio"
                        label={`${option.optionText} (${option.voteCount} votes)`} 
                        name={`survey-${post.id}`}
                        checked={selectedOption[post.id] === option.id}
                        onChange={() => setSelectedOption(prev => ({ ...prev, [post.id]: option.id }))}
                      />
                    ))}
                    <Button variant="primary" size="sm" className="mt-2" onClick={() => handleVote(post.id)}>
                      Bình chọn
                    </Button>
                  </Form>
                )}

                {/* Reaction */}
                <div className="mt-2">
                  {Object.entries(post.reactions?.reduce((acc: Record<string, number>, r: { type: string }) => {
                    acc[r.type] = acc[r.type] ? acc[r.type] + 1 : 1;
                    return acc;
                  }, {} as Record<string, number>) || {}).map(([type, count]) => {
                    const icon = reactionIcons[type as keyof typeof reactionIcons] ?? null;
                    return (
                      <Badge key={`${post.id}-reaction-${type}`} bg="light" text="dark" className="me-2">
                        {icon} {Number(count)}
                      </Badge>
                    );
                  })}
                </div>
                <div className="mt-2">
                  {Object.keys(reactionIcons).map((type) => (
                    <Button
                      key={`${post.id}-btn-${type}`}
                      size="sm"
                      variant="outline-secondary"
                      className="me-1"
                      onClick={() => handleReaction(post.id, type)}
                    >
                      {reactionIcons[type as keyof typeof reactionIcons]}
                    </Button>
                  ))}
                </div>

                {/* Comment */}
                <div className="mt-3">
                  <strong>Bình luận:</strong>
                  {post.comments?.map((c: any, idx: number) => {
                  const canEditComment = c.userResponse?.id === user.id;
                  const canDeleteComment = canEditComment || user.role === "ADMIN";

                  return (
                    <Card key={c.id ?? `comment-${post.id}-${idx}`} className="mt-2 p-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <Image
                            src={c.userResponse?.avatar}
                            roundedCircle
                            width={30}
                            height={30}
                            className="me-2"
                          />
                          <strong>{c.userResponse?.firstName} {c.userResponse?.lastName}</strong>
                          <small className="ms-2 text-muted">
                            {c.createdAt ? new Date(c.createdAt).toLocaleString("vi-VN") : ""}
                          </small>
                        </div>
                        <div>
                          {canEditComment && (
                            <Button
                              size="sm"
                              variant="warning"
                              className="me-1"
                              onClick={() => setEditingComment({ id: c.id, content: c.content })}
                            >
                              <i className="bi bi-pencil-square"></i>
                            </Button>
                          )}
                          {canDeleteComment && (
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDeleteComment(c.id)}
                            >
                              <i className="bi bi-trash"></i>
                            </Button>
                          )}
                        </div>
                      </div>
                      <div>{c.content}</div>
                    </Card>
                  );
                })}

                  <InputGroup className="mt-2">
                    <Form.Control
                      placeholder={post.allowComments ? "Viết bình luận..." : "Bài viết này không cho phép bình luận"}
                      value={commentContent[post.id] || ""}
                      onChange={e => post.allowComments && setCommentContent(prev => ({ ...prev, [post.id]: e.target.value }))}
                      disabled={!post.allowComments}
                    />
                    <Button
                      variant="primary"
                      onClick={() => handleCreateComment(post.id)}
                      disabled={!post.allowComments}
                    >
                      Gửi
                    </Button>
                  </InputGroup>
                </div>
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

        {/* Modal chỉnh sửa bình luận */}
        <Modal show={!!editingComment} onHide={() => setEditingComment(null)}>
          <Modal.Header closeButton>
            <Modal.Title>Sửa bình luận</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Control
                as="textarea"
                value={editingComment?.content || ""}
                onChange={e => setEditingComment(prev => prev && { ...prev, content: e.target.value })}
              />
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setEditingComment(null)}>Hủy</Button>
            <Button
              variant="primary"
              onClick={() => editingComment && handleUpdateComment(editingComment.id, editingComment.content)}
            >
              Cập nhật
            </Button>
          </Modal.Footer>
        </Modal>
      </Col>
    </Row>
  </Container>
);
};

export default TimeLine;
