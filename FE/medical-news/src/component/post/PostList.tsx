import { JSX } from "react";
import { Card, Button, Badge, Image, Row, Col } from "react-bootstrap";
import { Post } from "../../types/post";
import Reaction from "../post/Reaction";
import Comment from "../post/Comment";
import SurveyVote from "../post/SurveyVote";
import PrivacyIcon from "../../utils/privacyIcon";
import styles from "./Styles/postList.module.css";

interface PostListProps {
  posts: any[];
  currentUser: any;
  onEditPost: (post: Post) => void;
  onDeletePost: (postId: string) => void;
  onVoteUpdate: () => void;
  onReactionUpdate: () => void;
  onCommentUpdate: () => void;
  onNavigateToProfile: (userId: string) => void;
}

const PostList = ({
  posts,
  currentUser,
  onEditPost,
  onDeletePost,
  onVoteUpdate,
  onReactionUpdate,
  onCommentUpdate,
  onNavigateToProfile
}: PostListProps): JSX.Element => {
  return (
    <div className={styles.postList}>
      {posts.map((post: any, index: number) => {
        const canEditPost = post.userResponse?.id === currentUser?.id;
        const canDeletePost = canEditPost || currentUser?.role?.name === "ADMIN";
        const isDoctor = post.userResponse?.role?.name === "DOCTOR";
        const hasImages = post.imagePostResponses?.length > 0;
        const isSingleImage = post.imagePostResponses?.length === 1;
        const isMultipleImages = post.imagePostResponses?.length > 1;

        return (
          <Card className={`mb-4 ${styles.postCard} ${styles.medicalNewsCard}`} key={post.id ?? `post-${index}`}>
            <Card.Body className={styles.postCardBody}>
              {/* Header với thông tin tác giả */}
              <div className={styles.postHeader}>
                <div 
                  className={styles.authorInfo}
                  style={{ cursor: 'pointer' }}
                  onClick={() => onNavigateToProfile(post.userResponse.id)}
                >
                  <Image 
                    src={post.userResponse.avatar} 
                    alt={post.userResponse.username} 
                    className={styles.authorAvatar}
                  />
                  <div className={styles.authorDetails}>
                    <div className="d-flex align-items-center">
                      <strong className={styles.authorName}>
                        {post.userResponse.firstName} {post.userResponse.lastName}
                      </strong>
                      {isDoctor && (
                        <Badge bg="info" className={`ms-2 ${styles.doctorBadge}`}>
                          <i className="bi bi-heart-pulse me-1"></i>Bác sĩ
                        </Badge>
                      )}
                    </div>
                    <div className={styles.postMeta}>
                      <small className="text-muted">
                        {new Date(post.createdAt).toLocaleString("vi-VN")}
                        <PrivacyIcon 
                          privacyMode={post.visibility} 
                          className="ms-1" 
                        />
                      </small>
                    </div>
                  </div>
                </div>

                {/* Nút hành động */}
                <div className={styles.postActions}>
                  {canEditPost && (
                    <Button 
                      size="sm" 
                      variant="outline-warning" 
                      className="me-2" 
                      onClick={() => onEditPost(post)}
                    >
                      <i className="bi bi-pencil-square"></i>
                    </Button>
                  )}
                  {canDeletePost && (
                    <Button 
                      size="sm" 
                      variant="outline-danger" 
                      onClick={() => onDeletePost(post.id)}
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  )}
                </div>
              </div>

              {/* Tiêu đề bài viết */}
              {post.title && (
                <Card.Title className={styles.postTitle}>{post.title}</Card.Title>
              )}

              {/* Nội dung bài viết */}
              {post.content && (
                <Card.Text className={styles.postContent}>{post.content}</Card.Text>
              )}

              {/* Hiển thị ảnh */}
              {hasImages && (
                <div className={styles.postImages}>
                  {isSingleImage ? (
                    <div className={styles.singleImageContainer}>
                      <Image
                        src={post.imagePostResponses[0].postImageUrl}
                        alt="Post image"
                        className={styles.singleImage}
                        fluid
                      />
                    </div>
                  ) : isMultipleImages ? (
                    <Row className={styles.multipleImagesContainer}>
                      {post.imagePostResponses.slice(0, 4).map((image: any, imgIndex: number) => (
                        <Col 
                          key={imgIndex} 
                          xs={post.imagePostResponses.length === 2 ? 6 : 6}
                          md={post.imagePostResponses.length === 2 ? 6 : 3}
                          className={styles.imageColumn}
                        >
                          <div className={styles.multiImageWrapper}>
                            <Image
                              src={image.postImageUrl}
                              alt={`Post image ${imgIndex + 1}`}
                              className={styles.multiImage}
                              fluid
                            />
                            {imgIndex === 3 && post.imagePostResponses.length > 4 && (
                              <div className={styles.moreImagesOverlay}>
                                +{post.imagePostResponses.length - 4}
                              </div>
                            )}
                          </div>
                        </Col>
                      ))}
                    </Row>
                  ) : null}
                </div>
              )}

              {/* Survey (nếu có) */}
              {post.type === "SURVEY" && post.surveyOptions && (
                <div className={styles.surveySection}>
                  <SurveyVote post={post} onVoteUpdate={onVoteUpdate} />
                </div>
              )}

              {/* Reaction và Comment */}
              <div className={styles.interactionSection}>
                <Reaction post={post} onReactionUpdate={onReactionUpdate} />
                <Comment post={post} onCommentUpdate={onCommentUpdate} />
              </div>
            </Card.Body>
          </Card>
        );
      })}
    </div>
  );
};

export default PostList;