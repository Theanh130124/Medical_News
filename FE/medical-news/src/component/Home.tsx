import { Button, Card, Carousel, Col, Container, Image, Row } from "react-bootstrap";
import styles from "./Styles/home.module.css";
import { useEffect, useState } from "react";

import { Post } from "../types/post";
import Apis, { endpoint } from "../configs/Apis";
import MySpinner from "./layout/MySpinner";

const slideItems = [
    { id: 1, title: "Đặt lịch khám", desc: "Nhanh chóng, dễ dàng mọi lúc mọi nơi" },
    { id: 2, title: "Bác sĩ tư vấn", desc: "Tư vấn trực tuyến với bác sĩ giàu kinh nghiệm" },
    { id: 3, title: "Đặt lịch xét nghiệm", desc: "Lên lịch xét nghiệm tận nơi linh hoạt" },
    { id: 4, title: "Thanh toán viện phí", desc: "Thanh toán không tiền mặt tiện lợi" },
    { id: 5, title: "Quản lý hồ sơ y tế", desc: "Lưu trữ và xem lại lịch sử khám chữa bệnh" },
    { id: 6, title: "Theo dõi đơn thuốc", desc: "Xem và nhắc nhở uống thuốc đúng giờ" },
    { id: 7, title: "Hỗ trợ y tế 24/7", desc: "Luôn có nhân viên hỗ trợ bất kể thời gian" },
    { id: 8, title: "Tái khám dễ dàng", desc: "Đặt lịch tái khám chỉ trong vài bước" },
];


const Home = () => {


    const [topPosts, setTopPosts] = useState<Post[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const loadTopPosts = async () => {
        try {
        setLoading(true);
        const res = await Apis.get(`${endpoint["top_posts"]}&page=${page}`);
        const newPosts: Post[] = res.data.result.content;

        if (page === 0) {
            setTopPosts(newPosts);
        } else {
            setTopPosts((prev) => [...prev, ...newPosts]);
        }

        // Nếu ít hơn pageSize (ví dụ 5 hay 10 tùy backend) thì coi như hết data
        if (newPosts.length === 0) {
            setHasMore(false);
        }
        } catch (error) {
        console.error("Lỗi khi lấy top posts:", error);
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        loadTopPosts();
    }, [page]);
    
    return (
        <Container fluid className="p-0">
            <Row className={`align-items-center justify-content-center mt-5 ${styles.customRow}`}>
                <Col xs={12} md={7} lg={6} className={styles.homeText}>
                    <h2 className="text-white">Tin tức y tế chính thống, từ hơn 500 bác sĩ uy tín</h2>
                    <span>
                        Theo dõi các thông tin y tế mới nhất được tổng hợp và xác thực bởi đội ngũ chuyên gia và bác sĩ hàng đầu từ hệ thống MEDICAL NEWS
                    </span>
                </Col>
                <Col xs={12} md={5} lg={4} className="text-center mt-4 mt-md-0">
                    <Image src="/assets/images/doctor.jpg" alt="Doctor" className={styles.doctorImage} />
                </Col>
            </Row>

            <Row className="align-items-center justify-content-center mt-5">
                <Col xs={12} md={8} lg={6} className={`text-center mt-4 ${styles.homeText}`}>
                    <h2>Dịch vụ</h2>
                    <hr className="my-4 border border-dark" />
                </Col>
            </Row>   <Row className="align-items-center justify-content-center mt-2">
                <Carousel className={styles.customCarousel}>
                    <Carousel.Item>
                        <Row className="justify-content-center">
                            {slideItems.slice(0, 4).map((item) => (
                                <Col key={item.id} xs={12} sm={6} md={3} className="mb-4">
                                    <div className={styles.cardWrapper}>
                                        <Image
                                            src="/assets/images/service.png"
                                            alt={item.title}
                                            className={styles.carouselImage}
                                            fluid
                                        />
                                        <Carousel.Caption className={styles.carouselCaption}>
                                            <h5>{item.title}</h5>
                                            <p>{item.desc}</p>
                                        </Carousel.Caption>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </Carousel.Item>
                    <Carousel.Item>
                        <Row className="justify-content-center">
                            {slideItems.slice(4, 8).map((item) => (
                                <Col key={item.id} xs={12} sm={6} md={3} className="mb-4">
                                    <div className={styles.cardWrapper}>
                                        <Image
                                            src="/assets/images/service.png"
                                            alt={item.title}
                                            className={styles.carouselImage}
                                            fluid
                                        />
                                        <Carousel.Caption className={styles.carouselCaption}>
                                            <h5>{item.title}</h5>
                                            <p>{item.desc}</p>
                                        </Carousel.Caption>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </Carousel.Item>
                </Carousel>
            </Row>
         
            {/* Bài viết nổi bật */}
            <Row className="align-items-center justify-content-center mt-5">
                <Col xs={12} md={8} lg={6} className="text-center">
                <h2>Bài viết nổi bật</h2>
                <hr className="my-4 border border-dark" />
                </Col>
            </Row>

                <Row className="justify-content-center mt-3">
                {topPosts.length === 0 && !loading ? (
                    <p className="text-center">Không có bài viết nào.</p>
                ) : (
                    topPosts.map((post, idx) => (
                    <Col key={idx} xs={12} md={6} lg={4} className="mb-4">
                        <Card className={styles.postCard}>
                        {/* Nếu có ảnh thì show ở trên */}
                        {post.imagePostResponses && post.imagePostResponses.length > 0 && (
                            <Card.Img
                            variant="top"
                            src={post.imagePostResponses[0].postImageUrl}
                            className={styles.postImage}
                            />
                        )}

                        <Card.Body className={styles.postContent}>
                            <div className={styles.authorInfo}>
                            <Image
                                src={post.userResponse.avatar}
                                roundedCircle
                                width={40}
                                height={40}
                                alt={post.userResponse.username}
                            />
                            <div className="ms-2">
                                <div className={styles.authorName}>
                                {post.userResponse.firstName} {post.userResponse.lastName}
                                </div>
                                <div className={styles.postDate}>
                                {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                                </div>
                            </div>
                            </div>

                            <Card.Title className={styles.postTitle}>{post.title}</Card.Title>
                            <Card.Text className={styles.postText}>
                            {post.content.slice(0, 120)}...
                            </Card.Text>

                            <Button variant="outline-primary" size="sm">
                            Xem chi tiết
                            </Button>
                        </Card.Body>
                        </Card>
                    </Col>
                    ))
                )}
                </Row>


                  <Row className="justify-content-center mt-4 mb-5">
                    {hasMore && !loading && (
                    <Col xs={10} md={6} className="text-center">
                        <Button variant="info" onClick={() => setPage((prev) => prev + 1)}>
                        Xem thêm
                        </Button>
                    </Col>
                    )}
                </Row>

                      {loading && (
                    <div className="text-center mb-4">
                    <MySpinner/>
                    </div>
                )}
            



        </Container>
    );
}

export default Home;