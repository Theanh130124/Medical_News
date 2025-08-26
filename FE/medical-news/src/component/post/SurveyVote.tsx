import { JSX, useContext } from "react";
import { MyUserContext } from "../../configs/MyContexts";
import { authApis, endpoint } from "../../configs/Apis";
import { Form, Badge, ProgressBar } from "react-bootstrap";
import { showCustomToast } from "../layout/MyToaster";
import { SurveyOption, SurveyVoteProps } from "../../types/survey";



const SurveyVote = ({ post, onVoteUpdate }: SurveyVoteProps) => {
  const user = useContext(MyUserContext);

  // Hàm kiểm tra xem người dùng đã bình chọn option nào chưa
  const getUserVotedOptions = (surveyOptions: SurveyOption[]) => {
    if (!user) return [];
    
    const votedOptions = [];
    for (const option of surveyOptions) {
      if (option.userResponses && option.userResponses.some((u: any) => u.id === user.id)) {
        votedOptions.push(option.id);
      }
    }
    return votedOptions;
  };

  // Hàm tính tổng số vote
  const getTotalVotes = (surveyOptions: SurveyOption[]) => {
    return surveyOptions.reduce((total, option) => total + option.voteCount, 0);
  };

  // Hàm tính phần trăm vote
  const calculatePercentage = (voteCount: number, totalVotes: number) => {
    if (totalVotes === 0) return 0;
    return (voteCount / totalVotes) * 100;
  };

  const handleVote = async (optionId: string) => {
    try {
      if (!user) return;
      
      const option = post.surveyOptions.find((o: SurveyOption) => o.id === optionId);
      const hasVoted = option.userResponses.some((u: any) => u.id === user.id);
      
      if (hasVoted) {
        // Hủy bình chọn
        await authApis().delete(endpoint.vote_survey(optionId, user.id));
      } else {
        // Thêm bình chọn
        await authApis().post(endpoint.vote_survey(optionId, user.id));
      }
      
      onVoteUpdate();
    } catch (error) {
      console.error(error);
      showCustomToast("Thao tác thất bại!", "error");
    }
  };

  if (post.type !== "SURVEY" || !post.surveyOptions) return null;

  const totalVotes = getTotalVotes(post.surveyOptions);
  const userVotedOptions = getUserVotedOptions(post.surveyOptions);

  return (
    <div className="mt-3">
      {post.surveyOptions.map((option: SurveyOption) => {
        const percentage = calculatePercentage(option.voteCount, totalVotes);
        const isUserVoted = userVotedOptions.includes(option.id);
        
        return (
          <div key={option.id} className="mb-2">
            <Form.Check
              type="checkbox"
              label={option.optionText}
              name={`survey-${post.id}`}
              checked={isUserVoted}
              onChange={() => handleVote(option.id)}
              disabled={!user}
            />
            <div className="d-flex align-items-center mt-1">
              <ProgressBar 
                now={percentage} 
                className="flex-grow-1 me-2" 
                style={{ height: '8px' }}
                label={`${percentage.toFixed(1)}%`}
              />
              <small className="text-muted">
                {option.voteCount} vote{option.voteCount !== 1 ? 's' : ''}
              </small>
            </div>
            {isUserVoted && (
              <Badge bg="info" className="mt-1">Bạn đã chọn</Badge>
            )}
          </div>
        );
      })}
      <div className="mt-1 text-muted">
        <small>Tổng số vote: {totalVotes}</small>
      </div>
    </div>
  );
};

export default SurveyVote;