import { JSX, useContext, useEffect, useState } from "react";
import { MyUserContext } from "../../configs/MyContexts";
import { authApis, authformdataApis, endpoint } from "../../configs/Apis";
import { Card, Col, Container, Image, Row, Form, Button, Badge, ListGroup, InputGroup, Modal } from "react-bootstrap";
import MySpinner from "../layout/MySpinner";
import { reactionIcons } from "../../types/reactionIcons";
import styles from "./Styles/profile.module.css";
import { showCustomToast } from "../layout/MyToaster";
import CreatePost from "../post/CreatePost";
import { Post } from "../../types/post";

const Profile = () => {
  const user = useContext(MyUserContext);
  const [posts, setPosts] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<{ [key: string]: string }>({});
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [commentContent, setCommentContent] = useState<{ [key: string]: string }>({});
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editingComment, setEditingComment] = useState<{ id: string; content: string } | null>(null);

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

  // Vote survey
  const handleVote = async (postId: string) => {
    try {
      const optionId = selectedOption[postId];
      if (!optionId) return alert("Vui lòng chọn một lựa chọn để bình chọn!");
      await authApis().post(`/posts/survey/vote/${optionId}?userId=${user.id}`);
      showCustomToast("Bình chọn thành công!", "success");
      setPage(0);
    } catch (error) {
      console.error(error);
      showCustomToast("Bình chọn thất bại!", "error");
    }
  };

  // Reaction
  const handleReaction = async (postId: string, type: string) => {
    if (!user) return;
    try {
      const post = posts.find(p => p.id === postId);
      const existingReaction = post.reactions?.find((r: any) => r.userResponse?.id === user.id);

      if (!existingReaction) {
        await authApis().post(endpoint["create_reaction"], { postId, userId: user.id, type });
      } else if (existingReaction.type === type) {
        await authApis().delete(endpoint.delete_reaction(existingReaction.id));
      } else {
        await authApis().patch(endpoint.update_reaction(existingReaction.id), { type });
      }
      setRefreshFlag(prev => prev + 1);
    } catch (error) {
      console.log(error);
      showCustomToast("Thao tác reaction thất bại!", "error");
    }
  };

  // Comment
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

  const handleUpdateComment = async (commentId: string, content: string) => {
    try {
      await authApis().patch(endpoint.update_comment(commentId), { content });
      showCustomToast("Cập nhật bình luận thành công!", "success");
      setRefreshFlag(prev => prev + 1);
      setEditingComment(null);
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
          <CreatePost onPostCreated={() => setRefreshFlag(prev => prev + 1)} />
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
                      <Form>
                        {post.surveyOptions.map((option: any) => (
                          <Form.Check
                            key={`${post.id}-${option.id}`}
                            type="radio"
                            label={`${option.optionText} (${option.voteCount} votes)`}
                            name={`survey-${post.id}`}
                            checked={selectedOption[post.id] === option.id}
                            onChange={() => setSelectedOption(prev => ({ ...prev, [post.id]: option.id }))}
                          />
                        ))}
                        <Button variant="primary" size="sm" className="mt-2" onClick={() => handleVote(post.id)}>Bình chọn</Button>
                      </Form>
                    )}

                    {/* Reaction */}
                    <div className="mt-2">
                      {Object.entries(
                        post.reactions?.reduce((acc: Record<string, number>, r: { type: string }) => {
                          acc[r.type] = acc[r.type] ? acc[r.type] + 1 : 1;
                          return acc;
                        }, {} as Record<string, number>) || {}
                      ).map(([type, count]) => {
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

                    {/* Comments */}
                    <div className="mt-3">
                      <strong>Bình luận:</strong>
                      {post.comments?.map((c: any, index: number) => {
                        const canEditComment = c.userResponse?.id === user?.id;
                        const canDeleteComment = canEditComment || user?.role === "ADMIN";
                        return (
                          <Card key={c.id ?? `${post.id}-comment-${index}`} className="mt-2 p-2">
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="d-flex align-items-center">
                                <Image src={c.userResponse.avatar} roundedCircle width={30} height={30} className="me-2" />
                                <strong>{c.userResponse.firstName} {c.userResponse.lastName}</strong>
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
                                  <Button size="sm" variant="danger" onClick={() => handleDeleteComment(c.id)}>
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
                        <Button variant="primary" onClick={() => handleCreateComment(post.id)} disabled={!post.allowComments}>Gửi</Button>
                      </InputGroup>
                    </div>
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

      {/* Modal update comment */}
      <Modal show={!!editingComment} onHide={() => setEditingComment(null)}>
        <Modal.Header closeButton><Modal.Title>Sửa bình luận</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Control as="textarea" value={editingComment?.content || ""} onChange={e => setEditingComment(prev => prev && { ...prev, content: e.target.value })} />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEditingComment(null)}>Hủy</Button>
          <Button variant="primary" onClick={() => editingComment && handleUpdateComment(editingComment.id, editingComment.content)}>Cập nhật</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Profile;
