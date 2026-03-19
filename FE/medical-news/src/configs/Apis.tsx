import axios from "axios"
import { create } from "domain";
import cookie from 'react-cookies';



const BASE_URL = "http://localhost:8080/SpringBoot_Medical_News/api/";
export const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dxiawzgnz/image/upload";
export const CLOUDINARY_PRESET = "healthapp";
export const BASE_URL_FIREBASE = 'http://127.0.0.1:5001/healthapp-a5a6d/us-central1/app'
export const  BASE_CHATBOT ='https://tta1301-medical-chatbot.hf.space/'


export const endpoint = {


    'register': '/users',
    'login': '/auth/login',
    'logout':'/auth/logout',
    'current_user': '/users/secure/profile',
    'upload_certificate': '/certificate',


    //Chỉ current 
    get_user_by_id: (userId:string) => `/users/${userId}`,

    get_otheruser_by_id : (userId:string) => `/users/otherUser/${userId}`,


    'top_posts': '/posts/public/normal/doctor/top-reactions',


    //Post
    'create_post': '/posts',
    'update_post': (postId: string) => `/posts/${postId}`,
    get_posts_timeline: (currentUserId: string) => `/posts/visible?currentUserId=${currentUserId}`,


    //profile
    get_post_userId : (userId: string) => `/posts/user/${userId}`,
    get_list_friends: (userId: string) => `/friends/${userId}`,
    update_profile_user :(userId:string) => `/users/${userId}`,
    update_doctor : (doctorId:string) => `/doctors/${doctorId}`,
    'change_password' :'/users/change-password',



    //vote
    'vote_survey': (postId: string, userId: string) => `/posts/survey/vote/${postId}?userId=${userId}`,



    //notification

    all_notification : (userId:string) => `/notifications/user/${userId}`,
    read_notification : (id:string) => `/notifications/${id}/read`,
    read_all_notification : (userId:string) => `/notifications/user/${userId}/read-all`,

    //Comment
    'create_comment':'/comments',
    update_comment: (commentId: string) => `/comments/${commentId}`,
    delete_comment: (commentId: string) => `/comments/${commentId}`,


    //reaction
    'create_reaction': '/reactions',
    update_reaction: (reactionId: string) => `/reactions/${reactionId}`,
    delete_reaction: (reactionId: string) => `/reactions/${reactionId}`,

      // Friend requests
    
    'send_friend' :"/friends",
    'friend_pending': (userId:string) => `/friends/pending/${userId}`,
    'accept_friend': (friendId:string,secondId:string) => `/friends/${friendId}/${secondId}`,
    'reject_friend': (friendId:string,secondId:string) => `/friends/${friendId}/${secondId}`,

    sent_friend : (userId:string) => `/friends/${userId}/sent-requests`,

    //Follow
    'follow' : "/follows",
    sent_follow : (userId:string) => `/follows/following/${userId}`,
    check_follow_status: (followerId: string, followingId: string) => `/follows/check?followerId=${followerId}&followingId=${followingId}`,

    'chats': '/chats',
    chatMessages: (chatId:string) => `/chats/${chatId}/messages`,
    search_post : (keyword:string) => `/search/posts?keyword=${keyword}`,
    
    chat_create: '/chat/conversations',
    chat_messages: (id: string) => `/chat/conversations/${id}/messages`,
    chat_list: '/chat/conversations'
    
} 

export const chatbotApis = () => {
    return axios.create({
        baseURL : BASE_CHATBOT,
        timeout: 30000
    })
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

export const fbApis = () => {
    return axios.create({
        baseURL: BASE_URL_FIREBASE,

    })
}


//không có token
export default axios.create({
    baseURL: BASE_URL
})