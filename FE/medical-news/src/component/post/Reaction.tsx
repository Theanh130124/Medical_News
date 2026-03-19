import { useContext, useState, useRef, createElement } from "react";
import { MyUserContext } from "../../configs/MyContexts";
import { authApis, endpoint } from "../../configs/Apis";
import { reactionIcons } from "../../types/reactionIcons";
import { handleApiError } from "../../utils/errorHandler";
import styles from "./Styles/reaction.module.css";
import { FiThumbsUp } from "react-icons/fi";

const ico = (C: any, size: number) => createElement(C, { size });

interface ReactionProps {
  post: any;
  onReactionUpdate: () => void;
}

const Reaction = ({ post, onReactionUpdate }: ReactionProps) => {
  const user = useContext(MyUserContext);
  const [hovered, setHovered] = useState(false);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleReaction = async (type: string) => {
    if (!user) return;
    setHovered(false);
    try {
      const existing = post.reactions?.find((r: any) => r.userResponse?.id === user.id);
      if (!existing) {
        await authApis().post(endpoint["create_reaction"], { postId: post.id, userId: user.id, type });
      } else if (existing.type === type) {
        await authApis().delete(endpoint.delete_reaction(existing.id));
      } else {
        await authApis().patch(endpoint.update_reaction(existing.id), { type });
      }
      onReactionUpdate();
    } catch (error) {
      handleApiError(error, "Thao tác reaction thất bại!");
    }
  };

  // Đếm reactions
  const reactionCounts: Record<string, number> =
    post.reactions?.reduce((acc: Record<string, number>, r: { type: string }) => {
      acc[r.type] = (acc[r.type] ?? 0) + 1;
      return acc;
    }, {}) ?? {};

  const myReaction = post.reactions?.find((r: any) => r.userResponse?.id === user?.id);
  const totalCount = post.reactions?.length ?? 0;

  const handleMouseEnter = () => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    setHovered(true);
  };

  const handleMouseLeave = () => {
    hideTimeout.current = setTimeout(() => setHovered(false), 300);
  };

  return (
    <div className={styles.reactionWrap}>
      {/* Like button + popup */}
      <div
        className={styles.likeArea}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Popup picker */}
        {hovered && (
          <div className={styles.picker}>
            {Object.entries(reactionIcons).map(([type, icon]) => (
              <button
                key={type}
                className={`${styles.pickerBtn} ${myReaction?.type === type ? styles.pickerBtnActive : ""}`}
                onClick={() => handleReaction(type)}
                title={type}
              >
                {icon}
              </button>
            ))}
          </div>
        )}

        {/* Main like button */}
        <button
          className={`${styles.likeBtn} ${myReaction ? styles.likeBtnActive : ""}`}
          onClick={() => {
            if (myReaction) {
              handleReaction(myReaction.type); // toggle off
            } else {
              handleReaction("LIKE");
            }
          }}
        >
          {myReaction
            ? <span className={styles.myReactionIcon}>{reactionIcons[myReaction.type as keyof typeof reactionIcons]}</span>
            : ico(FiThumbsUp, 15)
          }
          <span className={`${styles.likeBtnLabel} ${myReaction ? styles.likeBtnLabelActive : ""}`}>
            {myReaction ? myReaction.type.charAt(0) + myReaction.type.slice(1).toLowerCase() : "Thích"}
          </span>
        </button>
      </div>

      {/* Reaction summary */}
      {totalCount > 0 && (
        <div className={styles.summary}>
          {Object.entries(reactionCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([type]) => (
              <span key={type} className={styles.summaryIcon}>
                {reactionIcons[type as keyof typeof reactionIcons]}
              </span>
            ))
          }
          <span className={styles.summaryCount}>{totalCount}</span>
        </div>
      )}
    </div>
  );
};

export default Reaction;