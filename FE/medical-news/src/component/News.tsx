import { JSX, useContext, useState, useEffect } from "react";
import { MyUserContext } from "../configs/MyContexts";
import Apis, { authApis, endpoint } from "../configs/Apis";
import { Container, Row, Col, Form, Button, Alert, Card } from "react-bootstrap";
import MySpinner from "./layout/MySpinner";
import PostList from "./post/PostList";
import EditPostModal from "./post/EditPostModal";
import { useLocation, useNavigate } from "react-router-dom";
import { usePosts } from "./hooks/usePost";
import { handleApiError } from "../utils/errorHandler";
import styles from "./Styles/news.module.css";
import styleshome from "./Styles/home.module.css";

const News = (): JSX.Element => {
  const user = useContext(MyUserContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Lấy keyword từ URL
  const queryParams = new URLSearchParams(location.search);
  const initialKeyword = queryParams.get("q") || "";
  
  const [searchKeyword, setSearchKeyword] = useState(initialKeyword);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(!!initialKeyword);

  const {
    posts,
    loading,
    hasMore,
    editingPost,
    setEditingPost,
    loadMore,
    handleUpdatePost,
    handleDeletePost,
    handleRefresh
  } = usePosts(endpoint.get_posts_timeline(user?.id || ""));

  const searchByKeyword = async (keyword: string) => {
    if (!keyword.trim()) {
      setHasSearched(false);
      setSearchResults([]);
      return;
    }

    setLoadingSearch(true);
    setError("");

    try {
      const response = await Apis.get(endpoint.search_post(keyword));
      if (response.data.code === 0) {
        setSearchResults(response.data.result.content || []);
        setHasSearched(true);
        
        // Cập nhật URL với keyword tìm kiếm
        navigate(`?q=${encodeURIComponent(keyword)}`, { replace: true });
      } else {
        setError(response.data.message || "Có lỗi xảy ra khi tìm kiếm");
      }
    } catch (error) {
      console.error("Search error:", error);
      setError("Có lỗi xảy ra khi tìm kiếm");
      handleApiError(error, "Tìm kiếm thất bại!");
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await searchByKeyword(searchKeyword);
  };

  // Cập nhật searchKeyword khi URL thay đổi
  useEffect(() => {
    const newKeyword = queryParams.get("q") || "";
    setSearchKeyword(newKeyword);
    
    if (newKeyword) {
      searchByKeyword(newKeyword);
    } else {
      setHasSearched(false);
      setSearchResults([]);
    }
  }, [location.search]);

  const handleNavigateToProfile = (userId: string) => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    if (userId === user.id) {
      navigate("/profile");
    } else {
      navigate(`/otherprofile/${userId}`);
    }
  };

  const handleReactionRequireLogin = () => {
    if (!user) {
      navigate("/login");
    }
  };

  const handleCommentRequireLogin = () => {
    if (!user) {
      navigate("/login");
    }
  };

  // Hiển thị kết quả tìm kiếm nếu có, nếu không hiển thị bài viết mặc định
  const displayPosts = hasSearched ? searchResults : posts;

  return (
    <Container className={styles.container}>
      <Row className="justify-content-center">
        <Col md={3}></Col>
        <Col md={6}>
          <h2 className={styles.header}>Tin Tức Y Tế</h2>
          
          {/* Form tìm kiếm */}
          <Form onSubmit={handleSearch} className={styles.searchForm}>
            <Form.Group controlId="searchKeyword">
              <Form.Label className={styles.searchLabel}>Tìm kiếm bài viết</Form.Label>
              <div className="d-flex">
                <Form.Control
                  type="text"
                  placeholder="Nhập từ khóa tìm kiếm..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className={styles.searchInput}
                />
                <Button 
                  variant="primary" 
                  type="submit" 
                  className={`ms-2 ${styles.searchButton}`}
                  disabled={loadingSearch || !searchKeyword.trim()}
                >
                  {loadingSearch ? "Đang tìm..." : "Tìm kiếm"}
                </Button>
              </div>
            </Form.Group>
          </Form>

          {error && <Alert variant="danger" className={styles.alertDanger}>{error}</Alert>}

          {/* Thông báo khi không có kết quả tìm kiếm */}
          {hasSearched && searchResults.length === 0 && !loadingSearch && (
            <Alert variant="info" className={styles.alertInfo}>
              Không tìm thấy bài viết nào phù hợp với từ khóa "{searchKeyword}".
            </Alert>
          )}

          {/* Nút quay lại xem tất cả bài viết sau khi tìm kiếm */}
          {hasSearched && (
            <div className="mb-3">
              <Button 
                variant="outline-secondary" 
                size="sm"
                className={styles.backButton}
                onClick={() => {
                  setHasSearched(false);
                  setSearchKeyword("");
                  setSearchResults([]);
                  navigate("", { replace: true }); // Xóa query parameter
                }}
              >
                ← Quay lại xem tất cả
              </Button>
            </div>
          )}

          {(loading || loadingSearch) && (
            <div className={styles.spinnerContainer}>
              <MySpinner />
            </div>
          )}

          <PostList
            posts={displayPosts}
            currentUser={user}
            onEditPost={setEditingPost}
            onDeletePost={handleDeletePost}
            onVoteUpdate={user ? handleRefresh : handleReactionRequireLogin}
            onReactionUpdate={user ? handleRefresh : handleReactionRequireLogin}
            onCommentUpdate={user ? handleRefresh : handleCommentRequireLogin}
            onNavigateToProfile={handleNavigateToProfile}
          />

          {/* Chỉ hiển thị nút "Xem thêm" khi không ở chế độ tìm kiếm */}
          {!hasSearched && hasMore && posts.length > 0 && (
            <div className="text-center mb-4">
              <Button 
                variant="info" 
                onClick={loadMore} 
                disabled={loading}
              >
                {loading ? "Đang tải..." : "Xem thêm bài viết"}
              </Button>
            </div>
          )}

          {/* Modal chỉnh sửa bài viết */}
          <EditPostModal
            show={!!editingPost}
            editingPost={editingPost}
            onHide={() => setEditingPost(null)}
            onUpdatePost={handleUpdatePost}
            onTitleChange={(title) => setEditingPost(prev => ({ ...prev!, title }))}
            onContentChange={(content) => setEditingPost(prev => ({ ...prev!, content }))}
            onAllowCommentsChange={(allowComments) => setEditingPost(prev => ({ ...prev!, allowComments }))}
          />
        </Col>
        <Col md={3} className="d-none d-md-block">
          {!user && (
            <Card className={styles.sidebarCard}>
              <Card.Body className="text-center">
                <h5 className={styles.sidebarTitle}>Đăng nhập để tương tác</h5>
                <p className={styles.sidebarText}>Bạn cần đăng nhập để bình luận, reaction và thực hiện các tương tác khác.</p>
                <Button 
                  variant="primary" 
                  className={styles.sidebarButton}
                  onClick={() => navigate("/login")}
                >
                  Đăng nhập ngay
                </Button>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default News;