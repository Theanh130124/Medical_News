// Để lưu truyền thông tin giữa các component -> rồi đi tạo context bên App.js

import cookie from 'react-cookies'
import Apis, { endpoint } from '../configs/Apis';


const MyUserReducer = (currentState:any, action:any) => {
    switch (action.type) {
        case "login":
            return action.payload;
        case "logout":
            const token = cookie.load('token');
        if (token) {
            const token = cookie.load('token');
            //Gọi api của mình
            Apis.post(endpoint['logout'], { token }, {
            headers: {
                'Content-Type': 'application/json'
            }}).then(() => {console.log("Đăng xuất thành công trên server");
            })
            .catch((err) => {
                console.error("Lỗi khi logout API:", err);
                });
            }
            cookie.remove('token');
            cookie.remove('user');
            return null;
    }
    return currentState;
}
export default MyUserReducer;