import { JSX, useContext, useState, useEffect, createElement } from "react";
import { MyUserContext } from "../configs/MyContexts";
import Apis, { authApis, endpoint } from "../configs/Apis";
import MySpinner from "./layout/MySpinner";
import PostList from "./post/PostList";
import EditPostModal from "./post/EditPostModal";
import { useLocation, useNavigate } from "react-router-dom";
import { usePosts } from "./hooks/usePost";
import { handleApiError } from "../utils/errorHandler";
import styles from "./Styles/news.module.css";
import { FiSearch, FiArrowLeft, FiChevronDown, FiLogIn } from "react-icons/fi";

const ico = (C: any, size: number) => createElement(C, { size });

const News = (): JSX.Element => {
  const user = useContext(MyUserContext);
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const initialKeyword = queryParams.get("q") || "";

  const [searchKeyword,  setSearchKeyword]  = useState(initialKeyword);
  const [searchResults,  setSearchResults]  = useState<any[]>([]);
  const [loadingSearch,  setLoadingSearch]  = useState(false);
  const [error,          setError]          = useState("");
  const [hasSearched,    setHasSearched]    = useState(!!initialKeyword);

  const {
    posts, loading, hasMore, editingPost,
    setEditingPost, loadMore, handleUpdatePost,
    handleDeletePost, handleRefresh
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
        navigate(`?q=${encodeURIComponent(keyword)}`, { replace: true });
      } else {
        setError(response.data.message || "Có lỗi xảy ra khi tìm kiếm");
      }
    } catch (error) {
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
    if (!user) { navigate("/login"); return; }
    if (userId === user.id) navigate("/profile");
    else navigate(`/otherprofile/${userId}`);
  };

  const handleReactionRequireLogin  = () => { if (!user) navigate("/login"); };
  const handleCommentRequireLogin   = () => { if (!user) navigate("/login"); };

  const displayPosts = hasSearched ? searchResults : posts;

  return (
    <div className={styles.pageWrapper}>
      {/* ── PAGE HERO BANNER ── */}
      <div className={styles.heroBanner}>
        <div className={styles.heroBlob1} />
        <div className={styles.heroBlob2} />
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>Tin Tức Y Tế</h1>
          <p className={styles.heroSub}>Thông tin sức khỏe chính thống từ đội ngũ bác sĩ và chuyên gia</p>

          {/* Search bar in hero */}
          <form onSubmit={handleSearch} className={styles.searchBar}>
            <span className={styles.searchIcon}>{ico(FiSearch, 17)}</span>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Tìm kiếm bài viết, chủ đề..."
              value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
            />
            <button
              type="submit"
              className={styles.searchBtn}
              disabled={loadingSearch || !searchKeyword.trim()}
            >
              {loadingSearch ? "Đang tìm..." : "Tìm kiếm"}
            </button>
          </form>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className={styles.contentWrap}>
        <div className={styles.mainCol}>

          {/* Error */}
          {error && (
            <div className={styles.alertDanger}>{error}</div>
          )}

          {/* No results */}
          {hasSearched && searchResults.length === 0 && !loadingSearch && (
            <div className={styles.alertInfo}>
              Không tìm thấy bài viết nào phù hợp với từ khóa "<strong>{searchKeyword}</strong>".
            </div>
          )}

          {/* Back button */}
          {hasSearched && (
            <button
              className={styles.backBtn}
              onClick={() => {
                setHasSearched(false);
                setSearchKeyword("");
                setSearchResults([]);
                navigate("", { replace: true });
              }}
            >
              {ico(FiArrowLeft, 14)} Quay lại xem tất cả
            </button>
          )}

          {/* Search result label */}
          {hasSearched && searchResults.length > 0 && (
            <div className={styles.resultLabel}>
              Tìm thấy <strong>{searchResults.length}</strong> kết quả cho "<em>{searchKeyword}</em>"
            </div>
          )}

          {(loading || loadingSearch) && (
            <div className={styles.spinnerWrap}><MySpinner /></div>
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

          {!hasSearched && hasMore && posts.length > 0 && (
            <div className={styles.loadMoreWrap}>
              <button
                className={styles.loadMoreBtn}
                onClick={loadMore}
                disabled={loading}
              >
                {loading ? "Đang tải..." : <>{ico(FiChevronDown, 15)} Xem thêm bài viết</>}
              </button>
            </div>
          )}

          <EditPostModal
            show={!!editingPost}
            editingPost={editingPost}
            onHide={() => setEditingPost(null)}
            onUpdatePost={handleUpdatePost}
            onTitleChange={(title) => setEditingPost(prev => ({ ...prev!, title }))}
            onContentChange={(content) => setEditingPost(prev => ({ ...prev!, content }))}
            onAllowCommentsChange={(allowComments) => setEditingPost(prev => ({ ...prev!, allowComments }))}
          />
        </div>

        {/* ── SIDEBAR ── */}
        <aside className={styles.sidebar}>
          {!user && (
            <div className={styles.sideCard}>
              <div className={styles.sideCardAccent} />
              <h5 className={styles.sideCardTitle}>Đăng nhập để tương tác</h5>
              <p className={styles.sideCardText}>
                Bạn cần đăng nhập để bình luận, reaction và thực hiện các tương tác khác.
              </p>
              <button
                className={styles.sideCardBtn}
                onClick={() => navigate("/login")}
              >
                {ico(FiLogIn, 15)} Đăng nhập ngay
              </button>
            </div>
          )}

          {/* Tips card */}
          <div className={styles.sideCard} style={{ marginTop: user ? 0 : 16 }}>
            <div className={styles.sideCardAccent} style={{ background: 'linear-gradient(135deg,#38d9a9,#4f6fff)' }} />
            <h5 className={styles.sideCardTitle}>Mẹo tìm kiếm</h5>
            <ul className={styles.tipList}>
              <li>Dùng từ khóa ngắn gọn, cụ thể</li>
              <li>Tìm theo tên bác sĩ hoặc chuyên khoa</li>
              <li>Tìm theo tên bệnh hoặc triệu chứng</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default News;