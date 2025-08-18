import { useContext, useEffect, useState } from "react";
import {  useLocation, useNavigate } from "react-router-dom";
import Apis, { authApis, endpoint } from "../../configs/Apis";
import cookie from 'react-cookies'
import MyToaster, { showCustomToast } from "../layout/MyToaster";
import { MyDipatcherContext } from "../../configs/MyContexts";
import {  Button, Col, Container, FloatingLabel, Form, Row } from "react-bootstrap";
import MySpinner from "../layout/MySpinner";
import styles from "./Styles/login.module.css";



const Login = () => {

    const [user, setUser] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const nav = useNavigate();
    const location = useLocation();
    const dispatch = useContext(MyDipatcherContext);

    const [message, setMessage] = useState(location.state?.message || "");

        useEffect(() => {
            if (message) {
                showCustomToast(message);
                setMessage(""); // clear để tránh toast lại khi re-render
            }
        }, [message]);


        const info = [
        { label: "Tên đăng nhập", field: "username", type: "text" },
        { label: "Mật khẩu", field: "password", type: "password" },

    ]

    //Cập nhật value vào field vào user 
    const setState = (value:string, field:string) => {
        setUser({ ...user, [field]: value })
    }


    const login = async (e:any) => {
        e.preventDefault();
        try{
            setLoading(true);
            let res = await Apis.post(endpoint['login'], {
                ...user
            });

            const {code,message,result} = res.data;

            if (code !== 0) {
            showCustomToast(message);  //Thất bại
            return;
            }
            //thành công
            cookie.save("token", result.token, { path: '/' });


            let u = await authApis().get(endpoint['current_user']);
            console.info(u.data);
            if(u.data.role === "DOCTOR" && !u.data.isActive){
                sessionStorage.setItem("doctorId", u.data.userId); // không lưu user vì sẽ hiện header 
                showCustomToast("Tài khoản chưa được kích hoạt. Vui lòng cung cấp chứng chỉ hành nghề cho admin để kích hoạt tài khoản!");
                nav("/uploadLicense");
                return;
            }
            //Luu lai cookie chỉ khi bác sĩ đã  đc duyệt 
            cookie.save('user', u.data, { path: '/' }); //path = / dùng cookie mọi trang ts bắt buộc
            //bác sĩ chưa đăng nhập không lưu context
            dispatch({
                "type": "login",
                "payload": u.data
            });
            showCustomToast(message); //Đăng nhập thành công
            nav("/");

        }catch (ex: any) {
        console.error("Lỗi đăng nhập:", ex);
        showCustomToast("Đã xảy ra lỗi. Vui lòng thử lại sau!");
    } finally {
        setLoading(false);
    }

    }



    return (
        <Container fluid className="p-0">
            <MyToaster />
            <Row className={`justify-content-center mt-4 ${styles["custom-row-primary"]}`}>
                <Col lg={6} md={4} sm={12} >
                    <h1 className="text-center text-success mb-4">ĐĂNG NHẬP</h1>
                    <Form onSubmit={login}>
                        {info.map(f => (
                            <FloatingLabel 
                                key={f.field} 
                                controlId={`floating-${f.field}`} 
                                label={f.label} 
                                className="mb-3"
                            >
                                <Form.Control 
                                    type={f.type} 
                                    placeholder={f.label} 
                                    required 
                                    value={user[f.field] || ""} 
                                    onChange={e => setState(e.target.value, f.field)} 
                                />
                            </FloatingLabel>
                        ))}
                        {loading ? (
                            <MySpinner />
                        ) : (
                            <Button type="submit" variant="success" className="mt-1 mb-1">
                                Đăng nhập
                            </Button>
                        )}
                    </Form>
                </Col>
            </Row>
        </Container>


    );
}

export default Login;