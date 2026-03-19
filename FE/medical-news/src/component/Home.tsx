import { useEffect, useState, createElement } from "react";
import { useNavigate } from "react-router-dom";
import Apis, { endpoint } from "../configs/Apis";
import MySpinner from "./layout/MySpinner";
import ChatBot from "./ChatBot";
import { Post } from "../types/post";
import styles from "./Styles/home.module.css";
import { FiArrowRight, FiCalendar, FiChevronLeft, FiChevronRight } from "react-icons/fi";

const ico = (C: any, size: number) => createElement(C, { size });

const slideItems = [
  { id: 1, title: "Tin tức y tế nóng hổi",   desc: "Cập nhật các thông tin y tế mới nhất hàng ngày" },
  { id: 2, title: "Kiến thức sức khỏe",       desc: "Mẹo chăm sóc sức khỏe và phòng bệnh tại nhà" },
  { id: 3, title: "Cảnh báo dịch bệnh",       desc: "Thông tin cảnh báo sớm về dịch bệnh và biện pháp phòng ngừa" },
  { id: 4, title: "Bác sĩ chia sẻ",           desc: "Tư vấn trực tuyến từ các bác sĩ chuyên khoa uy tín" },
  { id: 5, title: "Hướng dẫn điều trị",       desc: "Thông tin về phương pháp điều trị và chăm sóc bệnh nhân" },
  { id: 6, title: "Tin tức bệnh viện",         desc: "Cập nhật hoạt động, chương trình và thông báo từ bệnh viện" },
  { id: 7, title: "Sức khỏe cộng đồng",       desc: "Các chiến dịch, sự kiện và thông tin y tế cộng đồng" },
  { id: 8, title: "Mẹo sống khỏe",            desc: "Lời khuyên, thói quen tốt và chế độ dinh dưỡng hàng ngày" },
];

const Home = () => {
    const [topPosts, setTopPosts]   = useState<Post[]>([]);
    const [page, setPage]           = useState(0);
    const [hasMore, setHasMore]     = useState(true);
    const [loading, setLoading]     = useState(false);
    const [slideIndex, setSlideIndex] = useState(0);
    const navigate = useNavigate();

    const loadTopPosts = async () => {
        try {
            setLoading(true);
            const res = await Apis.get(`${endpoint["top_posts"]}?page=${page}`);
            const newPosts: Post[] = res.data.result.content;
            if (page === 0) {
                setTopPosts(newPosts);
            } else {
                setTopPosts((prev) => [...prev, ...newPosts]);
            }
            if (newPosts.length === 0) {
                setHasMore(!res.data.result.last);
            }
        } catch (error) {
            console.error("Lỗi khi lấy top posts:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadTopPosts(); }, [page]);

    // Auto-advance carousel
    useEffect(() => {
        const t = setInterval(() => setSlideIndex(i => (i + 1) % 2), 4000);
        return () => clearInterval(t);
    }, []);

    const slidePage = slideIndex === 0 ? slideItems.slice(0, 4) : slideItems.slice(4, 8);

    return (
        <>
            <div className={styles.pageWrapper}>
                {/* ── HERO ── */}
                <section className={styles.hero}>
                    <div className={styles.heroBlob1} />
                    <div className={styles.heroBlob2} />
                    <div className={styles.heroInner}>
                        <div className={styles.heroText}>
                            <span className={styles.heroBadge}>MEDICAL NEWS</span>
                            <h1 className={styles.heroTitle}>
                                Tin tức y tế chính thống,<br />
                                từ hơn <span className={styles.heroAccent}>500 bác sĩ</span> uy tín
                            </h1>
                            <p className={styles.heroDesc}>
                                Theo dõi các thông tin y tế mới nhất được tổng hợp và xác thực bởi đội ngũ chuyên gia và bác sĩ hàng đầu từ hệ thống MEDICAL NEWS
                            </p>
                            <div className={styles.heroCtas}>
                                <button className={styles.ctaPrimary} onClick={() => navigate("/news")}>
                                    Khám phá ngay {ico(FiArrowRight, 16)}
                                </button>
                                <button className={styles.ctaSecondary} onClick={() => navigate("/timeline")}>
                                    Bảng tin
                                </button>
                            </div>
                        </div>
                        <div className={styles.heroImageWrap}>
                            <div className={styles.heroImageGlow} />
                            <img
                                src="/assets/images/doctor.jpg"
                                alt="Doctor"
                                className={styles.heroImage}
                            />
                        </div>
                    </div>
                </section>

                {/* ── SERVICES ── */}
                <section className={styles.section}>
                    <div className={styles.sectionInner}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Dịch vụ</h2>
                            <p className={styles.sectionSub}>Các chuyên mục thông tin y tế nổi bật</p>
                        </div>

                        <div className={styles.carouselWrap}>
                            <button
                                className={styles.carouselArrow}
                                onClick={() => setSlideIndex(i => (i + 1) % 2)}
                                aria-label="prev"
                            >
                                {ico(FiChevronLeft, 20)}
                            </button>

                            <div className={styles.serviceGrid}>
                                {slidePage.map(item => (
                                    <div key={item.id} className={styles.serviceCard}>
                                        <div className={styles.serviceImgWrap}>
                                            <img
                                                src="/assets/images/service.png"
                                                alt={item.title}
                                                className={styles.serviceImg}
                                            />
                                        </div>
                                        <div className={styles.serviceBody}>
                                            <h3 className={styles.serviceTitle}>{item.title}</h3>
                                            <p className={styles.serviceDesc}>{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                className={styles.carouselArrow}
                                onClick={() => setSlideIndex(i => (i + 1) % 2)}
                                aria-label="next"
                            >
                                {ico(FiChevronRight, 20)}
                            </button>
                        </div>

                        {/* Dots */}
                        <div className={styles.carouselDots}>
                            {[0, 1].map(i => (
                                <button
                                    key={i}
                                    className={`${styles.dot} ${slideIndex === i ? styles.dotActive : ""}`}
                                    onClick={() => setSlideIndex(i)}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── TOP POSTS ── */}
                <section className={styles.section} style={{ background: "#f4f7ff" }}>
                    <div className={styles.sectionInner}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Bài viết nổi bật</h2>
                            <p className={styles.sectionSub}>Những nội dung được quan tâm nhiều nhất</p>
                        </div>

                        {topPosts.length === 0 && !loading ? (
                            <p className={styles.emptyMsg}>Không có bài viết nào.</p>
                        ) : (
                            <div className={styles.postsGrid}>
                                {topPosts.map((post, idx) => (
                                    <div
                                        key={idx}
                                        className={styles.postCard}
                                        onClick={() => navigate(`/news?q=${encodeURIComponent(post.title)}`)}
                                    >
                                        {post.imagePostResponses?.length > 0 && (
                                            <img
                                                src={post.imagePostResponses[0].postImageUrl}
                                                alt={post.title}
                                                className={styles.postImg}
                                            />
                                        )}
                                        <div className={styles.postBody}>
                                            <div className={styles.postMeta}>
                                                <img
                                                    src={post.userResponse.avatar}
                                                    alt={post.userResponse.username}
                                                    className={styles.postAvatar}
                                                />
                                                <div>
                                                    <div className={styles.postAuthor}>
                                                        {post.userResponse.firstName} {post.userResponse.lastName}
                                                    </div>
                                                    <div className={styles.postDate}>
                                                        {ico(FiCalendar, 11)}&nbsp;
                                                        {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                                                    </div>
                                                </div>
                                            </div>
                                            <h3 className={styles.postTitle}>{post.title}</h3>
                                            <p className={styles.postExcerpt}>
                                                {post.content.slice(0, 120)}...
                                            </p>
                                            <span className={styles.postReadMore}>
                                                Xem chi tiết {ico(FiArrowRight, 13)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {loading && (
                            <div className={styles.spinnerWrap}><MySpinner /></div>
                        )}

                        {hasMore && !loading && topPosts.length > 0 && (
                            <div className={styles.loadMoreWrap}>
                                <button
                                    className={styles.loadMoreBtn}
                                    onClick={() => setPage(prev => prev + 1)}
                                >
                                    Xem thêm {ico(FiChevronRight, 15)}
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            <ChatBot />
        </>
    );
};

export default Home;