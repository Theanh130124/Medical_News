import { JSX, useContext, useEffect, useState } from "react";
import { MyUserContext } from "../../configs/MyContexts";
import { authApis, endpoint } from "../../configs/Apis";
import { Card, Col, Container, Image, Row, Form, Button, Badge } from "react-bootstrap";
import MySpinner from "../layout/MySpinner";
import { reactionIcons } from "../../types/reactionIcons";
import styles from "./Styles/timeline.module.css";

const TimeLine = () => {
  const user = useContext(MyUserContext);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<{ [key: string]: string }>({});
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

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
  }, [user, page]);

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
      alert("Bình chọn thành công!");
      setPage(0); // reload page 0 sau khi vote
    } catch (error) {
      console.error(error);
      alert("Bình chọn thất bại!");
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col xs={12} md={8}>
          {loading && page === 0 && <MySpinner />}
          {posts.map((post: any) => (
            <Card className={`mb-4 ${styles.timelineCard}`} key={post.id}>
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

                {post.type === "SURVEY" && post.surveyOptions && (
                  <Form className={styles.surveyForm}>
                    {post.surveyOptions.map((option: any) => (
                      <Form.Check
                        key={option.id}
                        type="radio"
                        label={`${option.optionText} (${option.voteCount} votes)`}
                        name={`survey-${post.id}`}
                        checked={selectedOption[post.id] === option.id}
                        onChange={() =>
                          setSelectedOption((prev) => ({ ...prev, [post.id]: option.id }))
                        }
                      />
                    ))}
                    <Button
                      variant="primary"
                      size="sm"
                      className="mt-2"
                      onClick={() => handleVote(post.id)}
                    >
                      Bình chọn
                    </Button>
                  </Form>
                )}

                {post.reactions?.length > 0 && (
                  <div className="mt-2">
                    {Object.entries(
                      post.reactions.reduce(
                        (acc: Record<string, number>, r: { type: keyof typeof reactionIcons }) => {
                          acc[r.type] = acc[r.type] ? acc[r.type] + 1 : 1;
                          return acc;
                        }, {} as Record<keyof typeof reactionIcons, number>
                      )
                    ).map(([type, count]) => {
                      const icon = reactionIcons[type as keyof typeof reactionIcons] as JSX.Element;
                      return (
                        <Badge
                          key={type}
                          bg="light"
                          text="dark"
                          className="me-2"
                          style={{ fontSize: "1rem" }}
                        >
                          {icon} {count as number}
                        </Badge>
                      );
                    })}
                  </div>
                )}

                {post.comments?.length > 0 && (
                  <div className="mt-3">
                    <strong>Bình luận:</strong>
                    {post.comments.map((c: any) => (
                      <Card key={c.id} className="mt-2 p-2">
                        <div className="d-flex align-items-center mb-1">
                          <Image
                            src={c.userResponse.avatar}
                            roundedCircle
                            width={30}
                            height={30}
                            className="me-2"
                          />
                          <strong>{c.userResponse.firstName} {c.userResponse.lastName}</strong>
                          <small className="ms-2 text-muted">
                            {new Date(c.createdAt).toLocaleString("vi-VN")}
                          </small>
                        </div>
                        <div>{c.content}</div>
                      </Card>
                    ))}
                  </div>
                )}

                {post.type === "NORMAL" && (
                  <Button className={styles.normalButton} variant="outline-primary" size="sm">
                    Xem chi tiết
                  </Button>
                )}
              </Card.Body>
            </Card>
          ))}

          {hasMore && (
            <div className="text-center mb-4">
              <Button
                variant="info"
                onClick={loadMore}
                disabled={loading}
              >
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
