
import { JSX, useContext } from "react";
import { MyUserContext } from "../../configs/MyContexts";
import { endpoint } from "../../configs/Apis";
import { Col, Container, Row, Button } from "react-bootstrap";
import MySpinner from "../layout/MySpinner";
import CreatePost from "../post/CreatePost";
import { usePosts } from "../hooks/usePost";
import PostList from "../post/PostList";
import EditPostModal from "../post/EditPostModal";
import { useNavigate } from "react-router-dom";
import ChatSidebar from "../chat/ChatSidebar";

const TimeLine = (): JSX.Element => {
  const user = useContext(MyUserContext);
  const navigate = useNavigate();
  
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

  const handleNavigateToProfile = (userId: string) => {
    if (userId === user?.id) {
      navigate("/profile");
    } else {
      navigate(`/otherprofile/${userId}`);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={3}></Col>
        <Col md={6}>
          {loading && <MySpinner />}
          <CreatePost onPostCreated={handleRefresh} />

          <PostList
            posts={posts}
            currentUser={user}
            onEditPost={setEditingPost}
            onDeletePost={handleDeletePost}
            onVoteUpdate={handleRefresh}
            onReactionUpdate={handleRefresh}
            onCommentUpdate={handleRefresh}
            onNavigateToProfile={handleNavigateToProfile}
          />

          {hasMore && (
            <div className="text-center mb-4">
              <Button variant="info" onClick={loadMore} disabled={loading}>
                {loading ? "Đang tải..." : "Xem thêm"}
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
          <ChatSidebar />
        </Col>
      </Row>
    </Container>
  );
};

export default TimeLine;