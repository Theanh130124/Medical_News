import { JSX, useContext, useEffect, useState } from "react";
import { MyUserContext } from "../../configs/MyContexts";
import { authApis, endpoint } from "../../configs/Apis";
import { Card, Col, Container, Image, Row, Form, Button, Badge, ListGroup } from "react-bootstrap";
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
                <p className="text-muted">@{user.username}</p>
              </Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item><strong>Email:</strong> {user.email}</ListGroup.Item>
                <ListGroup.Item><strong>SĐT:</strong> {user.phoneNumber}</ListGroup.Item>
                <ListGroup.Item><strong>Địa chỉ:</strong> {user.address}</ListGroup.Item>
                <ListGroup.Item><strong>Ngày sinh:</strong> {user.dateOfBirth}</ListGroup.Item>
                {user.role?.name === "DOCTOR" && user.doctor && (
                  <>
                    <ListGroup.Item><strong>Chuyên ngành:</strong> {user.doctor.specialty}</ListGroup.Item>
                    <ListGroup.Item><strong>Kinh nghiệm:</strong> {user.doctor.yearsOfExperience} năm</ListGroup.Item>
                    <ListGroup.Item><strong>Nơi làm việc:</strong> {user.doctor.workplace}</ListGroup.Item>
                    <ListGroup.Item><strong>Học vấn:</strong> {user.doctor.educationalLevel}</ListGroup.Item>
                    <ListGroup.Item><strong>Giới thiệu:</strong> {user.doctor.introduction}</ListGroup.Item>
                  </>
                )}
              </ListGroup>
            </Card>
          )}

          {/* Danh sách bạn bè */}
          <Card className={`mt-4 ${styles.profileSidebar}`}>
            <Card.Body>
              <h6>Bạn bè ({friends.length})</h6>
              {friends.length === 0 && <p className="text-muted">Chưa có bạn bè</p>}
              {friends.map((f: any, idx: number) => {
                const friendUser =
                  f.firstUserId.id === user.id ? f.secondUserId : f.firstUserId;
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
                  <Card.Img
                    variant="top"
                    src={post.imagePostResponses[0].postImageUrl}
                    className={styles.profileCardImg}
                  />
                )}
                <Card.Body className={styles.profileCardBody}>
                  <div className={styles.profileAuthorInfo}>
                    <Image
                      src={post.userResponse.avatar}
                      alt={post.userResponse.username}
                      className={styles.profileAuthorAvatar}
                    />
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

                  {/* Reactions */}
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

                  {/* Comments */}
                  {post.comments?.length > 0 && (
                    <div className="mt-3">
                      <strong>Bình luận:</strong>
                      {post.comments.map((c: any) => (
                        <Card key={c.id} className="mt-2 p-2">
                          <div className="d-flex align-items-center mb-1">
                            <Image
                              src={c.userResponse.avatar}
                              className={styles.profileAuthorAvatar}
                            />
                            <strong className="ms-2">
                              {c.userResponse.firstName} {c.userResponse.lastName}
                            </strong>
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
