import axios from "axios"
import cookie from 'react-cookies';



const BASE_URL = "http://localhost:8080/SpringBoot_Medical_News/api/";
export const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dxiawzgnz/image/upload";
export const CLOUDINARY_PRESET = "healthapp";



export const endpoint = {


    'register': '/users',
    'login': '/auth/login',
    'current_user': '/users/secure/profile',


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