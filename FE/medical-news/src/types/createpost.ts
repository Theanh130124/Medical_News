import { UserResponse } from "./user";

interface SurveyOption {
  value: string;
}

interface Post {
  id: string;
  type: "NORMAL" | "SURVEY";
  title: string;
  content: string;
  visibility: "PUBLIC" | "FRIENDS_ONLY" | "PRIVATE";
  allowComments: boolean;
  userResponse: UserResponse; //hãy userId?
  createdAt: string;
  imagePostResponses?: { postImageUrl: string }[];
  surveyOptions?: SurveyOption[];
}
