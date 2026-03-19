import { JSX, createElement } from "react";
import { Post } from "../../types/post";
import Reaction from "../post/Reaction";
import Comment from "../post/Comment";
import SurveyVote from "../post/SurveyVote";
import PrivacyIcon from "../../utils/privacyIcon";
import styles from "./Styles/postList.module.css";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { RiMedicineBottleLine } from "react-icons/ri";

const ico = (C: any, size: number) => createElement(C, { size });

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
  posts, currentUser, onEditPost, onDeletePost,
  onVoteUpdate, onReactionUpdate, onCommentUpdate, onNavigateToProfile
}: PostListProps): JSX.Element => {
  return (
    <div className={styles.postList}>
      {posts.map((post: any, index: number) => {
        const canEditPost   = post.userResponse?.id === currentUser?.id;
        const canDeletePost = canEditPost || currentUser?.role?.name === "ADMIN";
        const isDoctor      = post.userResponse?.role?.name === "DOCTOR";
        const hasImages     = post.imagePostResponses?.length > 0;
        const isSingle      = post.imagePostResponses?.length === 1;
        const isMultiple    = post.imagePostResponses?.length > 1;

        return (
          <div className={styles.postCard} key={post.id ?? `post-${index}`}>

            {/* ── HEADER ── */}
            <div className={styles.postHeader}>
              <div
                className={styles.authorRow}
                onClick={() => onNavigateToProfile(post.userResponse.id)}
              >
                <div className={styles.avatarWrap}>
                  <img
                    src={post.userResponse.avatar}
                    alt={post.userResponse.username}
                    className={styles.avatar}
                  />
                  {isDoctor && <span className={styles.doctorDot} title="Bác sĩ" />}
                </div>
                <div className={styles.authorMeta}>
                  <div className={styles.authorNameRow}>
                    <span className={styles.authorName}>
                      {post.userResponse.firstName} {post.userResponse.lastName}
                    </span>
                    {isDoctor && (
                      <span className={styles.doctorBadge}>
                        {ico(RiMedicineBottleLine, 11)} Bác sĩ
                      </span>
                    )}
                  </div>
                  <div className={styles.postMeta}>
                    <span>{new Date(post.createdAt).toLocaleString("vi-VN")}</span>
                    <PrivacyIcon privacyMode={post.visibility} className={styles.privacyIcon} />
                  </div>
                </div>
              </div>

              {(canEditPost || canDeletePost) && (
                <div className={styles.actionBtns}>
                  {canEditPost && (
                    <button className={`${styles.actionBtn} ${styles.editBtn}`} onClick={() => onEditPost(post)}>
                      {ico(FiEdit2, 14)}
                    </button>
                  )}
                  {canDeletePost && (
                    <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => onDeletePost(post.id)}>
                      {ico(FiTrash2, 14)}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* ── BODY ── */}
            <div className={styles.postBody}>
              {post.title && (
                <h3 className={styles.postTitle}>{post.title}</h3>
              )}
              {post.content && (
                <p className={styles.postContent}>{post.content}</p>
              )}
            </div>

            {/* ── IMAGES ── */}
            {hasImages && (
              <div className={styles.imagesWrap}>
                {isSingle && (
                  <div className={styles.singleImgWrap}>
                    <img
                      src={post.imagePostResponses[0].postImageUrl}
                      alt="Post image"
                      className={styles.singleImg}
                    />
                  </div>
                )}
                {isMultiple && (
                  <div className={`${styles.multiGrid} ${post.imagePostResponses.length === 2 ? styles.grid2 : styles.grid4}`}>
                    {post.imagePostResponses.slice(0, 4).map((img: any, i: number) => (
                      <div key={i} className={styles.multiImgWrap}>
                        <img src={img.postImageUrl} alt={`img-${i}`} className={styles.multiImg} />
                        {i === 3 && post.imagePostResponses.length > 4 && (
                          <div className={styles.moreOverlay}>+{post.imagePostResponses.length - 4}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── SURVEY ── */}
            {post.type === "SURVEY" && post.surveyOptions && (
              <div className={styles.surveyWrap}>
                <SurveyVote post={post} onVoteUpdate={onVoteUpdate} />
              </div>
            )}

            {/* ── INTERACTIONS ── */}
            <div className={styles.interactionRow}>
              <Reaction post={post} onReactionUpdate={onReactionUpdate} />
              <Comment  post={post} onCommentUpdate={onCommentUpdate} />
            </div>

          </div>
        );
      })}
    </div>
  );
};

export default PostList;