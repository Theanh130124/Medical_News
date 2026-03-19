import { useContext, useEffect, useState, createElement } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Apis, { authApis, endpoint } from "../../configs/Apis";
import cookie from 'react-cookies';
import { showCustomToast } from "../layout/MyToaster";
import { MyDipatcherContext } from "../../configs/MyContexts";
import MySpinner from "../layout/MySpinner";
import styles from "./Styles/login.module.css";
import { handleApiError } from "../../utils/errorHandler";
import { FiUser, FiLock, FiEye, FiEyeOff, FiLogIn } from "react-icons/fi";
import { RiHospitalLine } from "react-icons/ri";

// Dùng createElement thay JSX để tránh lỗi TS2786 với react-icons
const ico = (C: any, size: number) => createElement(C, { size });

const info = [
    { label: "Tên đăng nhập", field: "username", type: "text",     Icon: FiUser },
    { label: "Mật khẩu",      field: "password", type: "password", Icon: FiLock },
];

const Login = () => {
    const [user, setUser]               = useState<any>({});
    const [loading, setLoading]         = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const nav      = useNavigate();
    const location = useLocation();
    const dispatch = useContext(MyDipatcherContext);
    const [message, setMessage] = useState(location.state?.message || "");

    useEffect(() => {
        if (message) {
            showCustomToast(message);
            setMessage("");
        }
    }, [message]);

    const setState = (value: string, field: string) => {
        setUser({ ...user, [field]: value });
    };

    const login = async (e: any) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await Apis.post(endpoint['login'], { ...user });
            const { code, message, result } = res.data;

            if (code !== 0) {
                showCustomToast(message, "error");
                return;
            }

            cookie.save("token", result.token, { path: '/' });
            const u = await authApis().get(endpoint['current_user']);
            const userData = u.data.result;
            console.log(userData);

            if (userData.role?.name === "DOCTOR" && !userData.isActive) {
                sessionStorage.setItem("doctorId", userData.doctor.id);
                nav("/uploadCertification");
                showCustomToast("Tài khoản chưa được kích hoạt. Vui lòng cung cấp chứng chỉ hành nghề cho admin để kích hoạt tài khoản!", "error");
                return;
            }

            cookie.save('user', userData, { path: '/' });
            dispatch({ type: "login", payload: userData });
            showCustomToast(message, "success");
            nav("/timeline");

        } catch (ex: any) {
            if (ex.response?.data) {
                handleApiError(ex, "Đăng nhập thất bại");
            } else {
                showCustomToast("Không thể kết nối đến server!", "error");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.blob1} />
            <div className={styles.blob2} />

            <div className={styles.card}>

                <div className={styles.logoRing}>
                    {ico(RiHospitalLine, 30)}
                </div>

                <h1 className={styles.title}>Chào mừng trở lại</h1>
                <p className={styles.subtitle}>Đăng nhập để tiếp tục sử dụng hệ thống</p>

                <form onSubmit={login}>
                    {info.map((f, i) => (
                        <div
                            key={f.field}
                            className={styles.fieldWrap}
                            style={{ animationDelay: `${0.1 + i * 0.1}s` }}
                        >
                            <label className={styles.fieldLabel}>{f.label}</label>
                            <div className={styles.inputWrap}>
                                <span className={styles.fieldIcon}>
                                    {ico(f.Icon, 17)}
                                </span>
                                <input
                                    className={styles.input}
                                    type={f.field === "password" ? (showPassword ? "text" : "password") : f.type}
                                    placeholder={f.label}
                                    required
                                    value={user[f.field] || ""}
                                    onChange={e => setState(e.target.value, f.field)}
                                />
                                {f.field === "password" && (
                                    <button
                                        type="button"
                                        className={styles.eyeBtn}
                                        onClick={() => setShowPassword(p => !p)}
                                        tabIndex={-1}
                                    >
                                        {ico(showPassword ? FiEyeOff : FiEye, 16)}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    {loading ? (
                        <div className={styles.spinnerWrap}>
                            <MySpinner />
                        </div>
                    ) : (
                        <button type="submit" className={styles.submitBtn}>
                            {ico(FiLogIn, 17)}
                            Đăng nhập
                        </button>
                    )}
                </form>

                <div className={styles.divider}>
                    <div className={styles.dividerLine} />
                    <span className={styles.dividerText}>Hệ thống y tế</span>
                    <div className={styles.dividerLine} />
                </div>

                <div className={styles.footer}>
                    Chưa có tài khoản?{" "}
                    <a href="/register" className={styles.footerLink}>Đăng ký ngay</a>
                </div>

            </div>
        </div>
    );
};

export default Login;