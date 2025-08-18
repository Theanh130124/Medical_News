import exp from "constants";
import { useEffect, useRef, useState } from "react";
import {  useNavigate } from "react-router-dom";
import Apis, { endpoint } from "../../configs/Apis";
import { Alert, Button, Col, Container,Form, FloatingLabel, Image, Row } from "react-bootstrap";
import MySpinner from "../layout/MySpinner";
import MyToaster, { showCustomToast } from "../layout/MyToaster";

import styles from "./Styles/register.module.css";




const Register = () => {

    const info = [
        { title: "Họ và tên lót", field: "lastName", type: "text" },
        { title: "Tên", field: "firstName", type: "text" },
        { title: "Tên đăng nhập", field: "username", type: "text" },
        { title: "Mật khẩu", field: "password", type: "password" },
        { title: "Xác nhận mật khẩu", field: "confirm", type: "password" },
        { title: "Địa chỉ Email", field: "email", type: "email" },
        { title: "Số điện thoại", field: "phoneNumber", type: "text" },
        { title: "Địa chỉ", field: "address", type: "text" },
        {
            title: "Giới tính", field: "gender", type: "select", options: [
                { label: "Nam", value: "MALE" },
                { label: "Nữ", value: "FEMALE" }
            ]
        },
        { title: "Ngày sinh", field: "dateOfBirth", type: "date" },
    ];

    const [user, setUser] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const avatar = useRef<any>(null);
    const nav = useNavigate();


        const setState = (value:string, field:string) => {
        setUser({ ...user, [field]: value })
    }

    


    const register = async (e: any) => {
        e.preventDefault();
        //Đảm bảo luôn có role trc submit
        const userData: any = { ...user };

        if(!userData.role){
            userData.role = "USER";
        }

        if (userData.password !== userData.confirm) {
            showCustomToast("Mật khẩu không khớp");
            return;
        }

        let form = new FormData();
        for (let key in userData) {
            if (key !== 'confirm')
                form.append(key, userData[key]);
        }
        if (avatar.current?.files?.length > 0) {
            form.append("avatar", avatar.current.files[0]);
        }

        try {
            setLoading(true);
            const res = await Apis.post(endpoint['register'], form, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            //Data
            const { code, message } = res?.data || {};
            if (code === 0) {
                showCustomToast(message); //Thành công
                setTimeout(() => nav("/login"), 800); //800ms   
            } else {
                showCustomToast(message);//Thất bại
            }
        }
        catch (ex:any) {
            console.error(ex);
            //ex msg của be
           const beMsg =
                ex?.response?.data?.message ||
                ex?.message ||
                "Đã có lỗi xảy ra khi đăng ký";
            showCustomToast(beMsg);
        } finally {
            setLoading(false);
        }
    }




    return (
    <Container fluid className="p-0">
      <Row className={`justify-content-center mt-4 ${styles["custom-row-primary"]}`}>
        <Col lg={6} md={4} sm={12}>
          <Image
            src="/assets/images/login-banner.png"
            alt="banner"
            className="mt-5 ms-3"
          />
          <p
            className="text-center mt-3 text-muted me-5"
            style={{
              fontSize: "1.5rem",
              color: "#007bff",
              fontWeight: "bold",
            }}
          >
            " Cập nhật nhanh chóng các thông tin y tế,sức khỏe từ đội ngũ bác sĩ và chuyên gia đáng tin cậy, đồng hành cùng bạn trong việc bảo vệ và nâng cao sức khỏe."
          </p>
        </Col>

        <Col lg={5} md={6} sm={12}>
        <MyToaster />
          <Container className="p-3 shadow rounded bg-light me-5">
            <h1 className="text-center text-success mb-4">ĐĂNG KÝ</h1>
        
            <Form onSubmit={register}>
              <Row>
                {/* Cột 1 */}
                <Col lg={6} md={6} sm={12}>
                  {info
                    .slice(0, Math.ceil(info.length / 2))
                    .map((i, index) => (
                      <div key={i.field} className="mb-3">
                        {i.type === "select" ? (
                          <Form.Select
                            value={user[i.field] || ""}
                            required
                            onChange={(e:any) =>
                              setState(e.target.value, i.field)
                            }
                          >
                            <option value="">-- {i.title} --</option>
                            {i.options?.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </Form.Select>
                        ) : (
                          <FloatingLabel
                            controlId={`floating-${i.field}`}
                            label={i.title}
                          >
                            <Form.Control
                              type={i.type}
                              placeholder={i.title}
                              required
                              value={user[i.field] || ""}
                              onChange={(e:any) =>
                                setState(e.target.value, i.field)
                              }
                            />
                          </FloatingLabel>
                        )}
                      </div>
                    ))}
                </Col>

                {/* Cột 2 */}
                <Col lg={6} md={6} sm={12}>
                  {info
                    .slice(Math.ceil(info.length / 2))
                    .map((i, index) => (
                      <div key={i.field} className="mb-3">
                        {i.type === "select" ? (
                          <Form.Select
                            value={user[i.field] || ""}
                            required
                            onChange={(e:any) =>
                              setState(e.target.value, i.field)
                            }
                          >
                            <option value="">-- {i.title} --</option>
                            {i.options?.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </Form.Select>
                        ) : (
                          <FloatingLabel
                            controlId={`floating-${i.field}`}
                            label={i.title}
                          >
                            <Form.Control
                              type={i.type}
                              placeholder={i.title}
                              required
                              value={user[i.field] || ""}
                              onChange={(e) =>
                                setState(e.target.value, i.field)
                              }
                            />
                          </FloatingLabel>
                        )}
                      </div>
                    ))}
                </Col>
              </Row>

              <Row>
                <Col lg={12} className="mb-3">
                  <Form.Control
                    ref={avatar}
                    type="file"
                    placeholder="Ảnh đại diện"
                  />
                </Col>
              </Row>

              <Button
                type="submit"
                variant="success"
                className="mt-3 w-100"
                disabled={loading}
              >
                {loading ? <MySpinner /> : "Đăng ký"}
              </Button>
            </Form>
          </Container>
        </Col>
      </Row>
    </Container>
  );
};


export default Register;