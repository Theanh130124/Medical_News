import { JSX, useContext, useEffect, useState } from "react";
import { MyUserContext } from "../../configs/MyContexts";
import { authApis, endpoint } from "../../configs/Apis";
import { Card, Col, Container, Image, Row, Form, Button, Badge, ListGroup, InputGroup } from "react-bootstrap";
import MySpinner from "../layout/MySpinner";
import { reactionIcons } from "../../types/reactionIcons";
import styles from "./Styles/profile.module.css";
import { showCustomToast } from "../layout/MyToaster";
import CreatePost from "../post/CreatePost";

const Profile = () => {
  const user = useContext(MyUserContext);
  const [posts, setPosts] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<{ [key: string]: string }>({});
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(0)
  const [commentContent, setCommentContent] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!user) return;

    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await authApis().get(
          endpoint.get_post_userId(user.id) + `?page=${page}`
        );

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

  useEffect(() => {
    setPage(0);
  }, [user]);

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  };

    // Lấy danh sách bạn bè
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

  const handleReaction = async (postId: string, type: string) => {
    if (!user) return;
    try {
      const post = posts.find(p => p.id === postId);
      const existingReaction = post.reactions?.find((r: any) => r.userId === user.id);
      if (!existingReaction) {
        await authApis().post(endpoint["create_reaction"], { postId, userId: user.id, type });
        showCustomToast("Đã thả reaction!", "success");
      } else if (existingReaction.type === type) {
        await authApis().delete(endpoint.delete_reaction(existingReaction.id));
        showCustomToast("Đã xóa reaction!", "success");
      } else {
        await authApis().put(endpoint.update_reaction(existingReaction.id), { type });
        showCustomToast("Đã cập nhật reaction!", "success");
      }
      setRefreshFlag(prev => prev + 1);
    } catch (error) {
      console.log(error);
      showCustomToast("Thao tác reaction thất bại!", "error");
    }
  };

  // Tạo comment
  const handleCreateComment = async (postId: string) => {
    if (!user) return;
    try {
      const content = commentContent[postId];
      if (!content) return;
      await authApis().post(endpoint['create_comment'], { postId, userId: user.id, content });
      setCommentContent(prev => ({ ...prev, [postId]: "" }));
      showCustomToast("Bình luận thành công!", "success");
      setRefreshFlag(prev => prev + 1);
    } catch (error) {
      console.error(error);
      showCustomToast("Bình luận thất bại!", "error");
    }
  };

  // Sửa comment
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

  // Xóa comment
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

    return (
    <Container className={styles.profile}>
      <Row>
        {/* Cột trái - Thông tin cá nhân */}
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

          {/* Danh sách bạn bè */}
          <Card className={`mt-4 ${styles.profileSidebar}`}>
            <Card.Body>
              <h6>Bạn bè ({friends.length})</h6>
              {friends.length === 0 && <p className="text-muted">Chưa có bạn bè</p>}
              {friends.map((f: any, idx: number) => {
                const friendUser = f.firstUserId.id === user.id ? f.secondUserId : f.firstUserId;
                return (
                  <div key={idx} className="d-flex align-items-center mb-2">
                    <Image src={friendUser.avatar} roundedCircle width={40} height={40} />
                    <span className="ms-2">{friendUser.firstName} {friendUser.lastName}</span>
                  </div>
                );
              })}
            </Card.Body>
          </Card>
        </Col>

        {/* Cột phải - Bài viết */}
        <Col xs={12} md={8}>
          {loading && page === 0 && <MySpinner />}
          <CreatePost onPostCreated={() => setRefreshFlag(prev => prev + 1)} />
          <div className={styles.profilePosts}>
            {posts.map((post: any) => (
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

                  {/* Survey */}
                  {post.type === "SURVEY" && post.surveyOptions && (
                    <Form>
                      {post.surveyOptions.map((option: any) => (
                        <Form.Check
                          key={option.id}
                          type="radio"
                          label={`${option.optionText} (${option.voteCount} votes)`}
                          name={`survey-${post.id}`}
                          checked={selectedOption[post.id] === option.id}
                          onChange={() =>
                            setSelectedOption(prev => ({ ...prev, [post.id]: option.id }))
                          }
                        />
                      ))}
                      <Button variant="primary" size="sm" className="mt-2" onClick={() => handleVote(post.id)}>Bình chọn</Button>
                    </Form>
                  )}

                  {/* Reactions */}
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
                    {post.comments?.map((c: any) => (
                      <Card key={c.id} className="mt-2 p-2">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center">
                            <Image src={c.userResponse.avatar} roundedCircle width={30} height={30} className="me-2" />
                            <strong>{c.userResponse.firstName} {c.userResponse.lastName}</strong>
                            <small className="ms-2 text-muted">{new Date(c.createdAt).toLocaleString("vi-VN")}</small>
                          </div>
                          {c.userId === user.id && (
                            <div>
                              <Button size="sm" variant="outline-warning" className="me-1"
                                onClick={() => {
                                  const newContent = prompt("Cập nhật bình luận", c.content);
                                  if (newContent) handleUpdateComment(c.id, newContent);
                                }}>Sửa</Button>
                              <Button size="sm" variant="outline-danger" onClick={() => handleDeleteComment(c.id)}>Xóa</Button>
                            </div>
                          )}
                        </div>
                        <div>{c.content}</div>
                      </Card>
                    ))}
                    <InputGroup className="mt-2">
                      <Form.Control
                        placeholder="Viết bình luận..."
                        value={commentContent[post.id] || ""}
                        onChange={e => setCommentContent(prev => ({ ...prev, [post.id]: e.target.value }))}
                      />
                      <Button variant="primary" onClick={() => handleCreateComment(post.id)}>Gửi</Button>
                    </InputGroup>
                  </div>
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

export default Profile;
