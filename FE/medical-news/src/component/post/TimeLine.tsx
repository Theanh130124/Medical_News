import { JSX, useContext, useEffect, useState } from "react";
import { MyUserContext } from "../../configs/MyContexts";
import { authApis, endpoint } from "../../configs/Apis";
import { Card, Col, Container, Image, Row, Form, Button, Badge, InputGroup } from "react-bootstrap";
import MySpinner from "../layout/MySpinner";
import { reactionIcons } from "../../types/reactionIcons";
import styles from "./Styles/timeline.module.css";
import { showCustomToast } from "../layout/MyToaster";
import CreatePost from "./CreatePost";

const TimeLine = () => {
  const user = useContext(MyUserContext);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<{ [key: string]: string }>({});
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(0);

  const [commentContent, setCommentContent] = useState<{ [key: string]: string }>({});

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

          {/* Tạo bài viết mới */}
          <CreatePost onPostCreated={() => setRefreshFlag(prev => prev + 1)} />

          {posts.map((post: any, index: number) => (
            <Card className={`mb-4 ${styles.timelineCard}`} key={post.id ?? `post-${index}`}>
              {post.imagePostResponses?.length > 0 && (
                <Card.Img
                  variant="top"
                  src={post.imagePostResponses[0].postImageUrl}
                  className={styles.timelineCardImg}
                />
              )}
              <Card.Body className={styles.timelineCardBody}>
                <div className={styles.authorInfo}>
                  <Image src={post.userResponse.avatar} alt={post.userResponse.username} />
                  <div className={styles.authorDetails}>
                    <strong>{post.userResponse.firstName} {post.userResponse.lastName}</strong>
                    <br />
                    <small>{new Date(post.createdAt).toLocaleString("vi-VN")}</small>
                  </div>
                </div>

                <Card.Title>{post.title}</Card.Title>
                <Card.Text>{post.content}</Card.Text>

                {/* Survey */}
                {post.type === "SURVEY" && post.surveyOptions && (
                  <Form className={styles.surveyForm}>
                    {post.surveyOptions.map((option: any) => (
                      <Form.Check
                        key={option.id}
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

                {/* Reactions */}
                {/* Reactions hiện tại trên bài viết */}
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

                {/* Nút thả reaction */}
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

export default TimeLine;
