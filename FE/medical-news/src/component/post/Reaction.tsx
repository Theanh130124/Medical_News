import { Button, Badge } from "react-bootstrap";
import { reactionIcons } from "../../types/reactionIcons";
import { showCustomToast } from "../layout/MyToaster";
import { authApis, endpoint } from "../../configs/Apis";
import { useContext } from "react";
import { MyUserContext } from "../../configs/MyContexts";
import { handleApiError } from "../../utils/errorHandler";

interface ReactionProps {
  post: any;  // của post nào
  onReactionUpdate: () => void; // setRefreshFlag ở TimeLine đê re-render post
}

const Reaction = ({ post, onReactionUpdate }: ReactionProps) => {
  const user = useContext(MyUserContext);

  const handleReaction = async (postId: string, type: string) => {
    if (!user) return;
    try {
      const existingReaction = post.reactions?.find((r: any) => r.userResponse?.id === user.id);

      if (!existingReaction) {
        await authApis().post(endpoint["create_reaction"], { postId, userId: user.id, type });
      } else if (existingReaction.type === type) {
        await authApis().delete(endpoint.delete_reaction(existingReaction.id));
      } else {
        await authApis().patch(endpoint.update_reaction(existingReaction.id), { type });
      }
      onReactionUpdate();
    } catch (error) {
      console.log(error);
      handleApiError(error, "Thao tác reaction thất bại!");
    }
  };

  return (
    <>
      <div className="mt-2">
        {Object.entries(
          post.reactions?.reduce((acc: Record<string, number>, r: { type: string }) => {
            acc[r.type] = acc[r.type] ? acc[r.type] + 1 : 1;
            return acc;
          }, {} as Record<string, number>) || {}
        ).map(([type, count]) => {
          const icon = reactionIcons[type as keyof typeof reactionIcons] ?? null;
          return (
            <Badge key={`${post.id}-reaction-${type}`} bg="light" text="dark" className="me-2">
              {icon} {Number(count)}
            </Badge>
          );
        })}
      </div>
      <div className="mt-2">
        {Object.keys(reactionIcons).map((type) => (
          <Button
            key={`${post.id}-btn-${type}`}
            size="sm"
            variant="outline-secondary"
            className="me-1"
            onClick={() => handleReaction(post.id, type)}
          >
            {reactionIcons[type as keyof typeof reactionIcons]}
          </Button>
        ))}
      </div>
    </>
  );
};

export default Reaction;