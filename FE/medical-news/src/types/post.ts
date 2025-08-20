import { UserResponse } from "./user";

export interface ImagePostResponse {
  id: number;
  postImageUrl: string;
  createdAt: string;
}




export interface Post {
  title: string;
  content: string;
  visibility: string;
  type: string;
  allowComments: boolean;
  createdAt: string;
  updatedAt: string;
  imagePostResponses: ImagePostResponse[];
  surveyOptions: any[];      
  userResponse: UserResponse;
}
