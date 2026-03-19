import { useState, useContext, createElement } from "react";
import { MyUserContext } from "../../configs/MyContexts";
import { authApis, endpoint } from "../../configs/Apis";
import { showCustomToast } from "../layout/MyToaster";
import { handleApiError } from "../../utils/errorHandler";
import styles from "./Styles/comment.module.css";
import { FiEdit2, FiTrash2, FiSend, FiX, FiCheck, FiMessageCircle } from "react-icons/fi";

const ico = (C: any, size: number) => createElement(C, { size });

interface CommentProps {
  post: any;
  onCommentUpdate: () => void;
}

const Comment = ({ post, onCommentUpdate }: CommentProps) => {
  const user = useContext(MyUserContext);
  const [commentContent, setCommentContent] = useState("");
  const [editingComment, setEditingComment] = useState<{ id: string; content: string } | null>(null);

  const handleCreateComment = async () => {
    if (!user || !commentContent.trim()) return;
    try {
      await authApis().post(endpoint["create_comment"], {
        postId: post.id, userId: user.id, content: commentContent
      });
      setCommentContent("");
      onCommentUpdate();
    } catch (ex) {
      handleApiError(ex, "Bình luận thất bại!");
    }
  };

  const handleUpdateComment = async (commentId: string, content: string) => {
    try {
      await authApis().patch(endpoint.update_comment(commentId), { content });
      showCustomToast("Cập nhật bình luận thành công!", "success");
      onCommentUpdate();
      setEditingComment(null);
    } catch (ex) {
      handleApiError(ex, "Cập nhật bình luận thất bại!");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await authApis().delete(endpoint.delete_comment(commentId));
      showCustomToast("Xóa bình luận thành công!", "success");
      onCommentUpdate();
    } catch (ex) {
      handleApiError(ex, "Xóa bình luận thất bại!");
    }
  };

  return (
    <div className={styles.commentWrap}>

      {/* Section label */}
      <div className={styles.sectionLabel}>
        {ico(FiMessageCircle, 13)}
        <span>Bình luận</span>
        {post.comments?.length > 0 && (
          <span className={styles.commentCount}>{post.comments.length}</span>
        )}
      </div>

      {/* Comment list */}
      {post.comments?.map((c: any, index: number) => {
        const canEdit   = c.userResponse?.id === user?.id;
        const canDelete = canEdit || user?.role?.name === "ADMIN";
        const isEditing = editingComment?.id === c.id;

        return (
          <div key={c.id ?? `${post.id}-c-${index}`} className={styles.commentItem}>
            <img
              src={c.userResponse.avatar}
              alt={c.userResponse.username}
              className={styles.commentAvatar}
            />
            <div className={styles.commentBody}>
              <div className={styles.commentHeader}>
                <div className={styles.commentMeta}>
                  <span className={styles.commentAuthor}>
                    {c.userResponse.firstName} {c.userResponse.lastName}
                  </span>
                  <span className={styles.commentTime}>
                    {c.createdAt ? new Date(c.createdAt).toLocaleString("vi-VN") : ""}
                  </span>
                </div>
                {(canEdit || canDelete) && !isEditing && (
                  <div className={styles.commentActions}>
                    {canEdit && (
                      <button
                        className={`${styles.commentActionBtn} ${styles.editBtn}`}
                        onClick={() => setEditingComment({ id: c.id, content: c.content })}
                      >
                        {ico(FiEdit2, 12)}
                      </button>
                    )}
                    {canDelete && (
                      <button
                        className={`${styles.commentActionBtn} ${styles.deleteBtn}`}
                        onClick={() => handleDeleteComment(c.id)}
                      >
                        {ico(FiTrash2, 12)}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className={styles.editWrap}>
                  <textarea
                    className={styles.editTextarea}
                    value={editingComment?.content ?? ""}
                    onChange={e => setEditingComment(prev => prev ? { ...prev, content: e.target.value } : prev)}
                    rows={2}
                    autoFocus
                  />
                  <div className={styles.editActions}>
                    <button
                      className={styles.editCancelBtn}
                      onClick={() => setEditingComment(null)}
                    >
                      {ico(FiX, 13)} Hủy
                    </button>
                    <button
                      className={styles.editSaveBtn}
                      onClick={() => {
                        if (editingComment) handleUpdateComment(editingComment.id, editingComment.content);
                      }}
                    >
                      {ico(FiCheck, 13)} Lưu
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.commentContent}>{c.content}</div>
              )}
            </div>
          </div>
        );
      })}

      {/* Input */}
      <div className={styles.inputRow}>
        {user && (
          <img src={user.avatar} alt={user.username} className={styles.inputAvatar} />
        )}
        <div className={styles.inputWrap}>
          <input
            className={styles.input}
            type="text"
            placeholder={
              post.allowComments
                ? "Viết bình luận..."
                : "Bài viết này không cho phép bình luận"
            }
            value={commentContent}
            disabled={!post.allowComments}
            onChange={e => post.allowComments && setCommentContent(e.target.value)}
            onKeyPress={e => e.key === "Enter" && handleCreateComment()}
          />
          <button
            className={styles.sendBtn}
            onClick={handleCreateComment}
            disabled={!post.allowComments || !commentContent.trim()}
          >
            {ico(FiSend, 14)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Comment;