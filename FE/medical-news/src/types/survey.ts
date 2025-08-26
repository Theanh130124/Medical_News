export interface SurveyOption {
  id: string;
  optionText: string;
  voteCount: number;
  userResponses: any[];
}

export interface SurveyVoteProps {
  post: any;
  onVoteUpdate: () => void;
}