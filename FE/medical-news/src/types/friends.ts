import { UserResponse } from "./user";



export interface FriendRequest {
  firstUserId: UserResponse;
  secondUserId: UserResponse;
  status: string;
}
