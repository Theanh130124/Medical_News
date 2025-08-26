import axios from "axios"
import { create } from "domain";
import cookie from 'react-cookies';



const BASE_URL = "http://localhost:8080/SpringBoot_Medical_News/api/";
export const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dxiawzgnz/image/upload";
export const CLOUDINARY_PRESET = "healthapp";



export const endpoint = {


    'register': '/users',
    'login': '/auth/login',
    'logout':'/auth/logout',
    'current_user': '/users/secure/profile',
    'upload_certificate': '/certificate',


    'top_posts': '/posts/public/normal/doctor/top-reactions',


    //Post
    'create_post': '/posts',
    'update_post': (postId: string) => `/posts/${postId}`,
    get_posts_timeline: (currentUserId: string) => `/posts/visible?currentUserId=${currentUserId}`,


    //profile
    get_post_userId : (userId: string) => `/posts/user/${userId}`,
    get_list_friends: (userId: string) => `/friends/${userId}`,



    //vote
    'vote_survey': (postId: string, userId: string) => `/posts/survey/vote/${postId}?userId=${userId}`,



    //Comment
    'create_comment':'/comments',
    update_comment: (commentId: string) => `/comments/${commentId}`,
    delete_comment: (commentId: string) => `/comments/${commentId}`,

    //reaction
    'create_reaction': '/reactions',
    update_reaction: (reactionId: string) => `/reactions/${reactionId}`,
    delete_reaction: (reactionId: string) => `/reactions/${reactionId}`,

      // Friend requests
    // 'friend_pending': (userId) => `/friends/pending/${userId}`,
    // 'accept_friend': (friendId) => `/friends/${friendId}`,
    // 'reject_friend': (friendId) => `/friends/${friendId}`,
} 

//json -> có token
export const authApis = () => {
    return axios.create({
        baseURL: BASE_URL,
        headers: {
            'Authorization': `Bearer ${cookie.load('token')}`,
            //Bổ sung để lưu from
            'Content-Type': 'application/json'
        }
    })
}

//form -> có token
export const authformdataApis = () => {
    return axios.create({
        baseURL: BASE_URL,
        headers: {
            'Authorization': `Bearer ${cookie.load('token')}`,
            //Bổ sung để lưu from
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
}


//không có token
export default axios.create({
    baseURL: BASE_URL
})