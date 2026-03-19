import { useRef, useState, createElement } from "react";
import { useNavigate } from "react-router-dom";
import Apis, { endpoint } from "../../configs/Apis";
import MySpinner from "../layout/MySpinner";
import { showCustomToast } from "../layout/MyToaster";
import styles from "./Styles/register.module.css";
import { handleApiError } from "../../utils/errorHandler";
import {
    FiUser, FiMail, FiPhone, FiMapPin, FiLock,
    FiCalendar, FiCamera, FiUserPlus, FiEye, FiEyeOff
} from "react-icons/fi";
import { RiHospitalLine } from "react-icons/ri";

const ico = (C: any, size: number) => createElement(C, { size });

const info = [
    { title: "Họ và tên lót",      field: "lastName",    type: "text",     Icon: FiUser     },
    { title: "Tên",                 field: "firstName",   type: "text",     Icon: FiUser     },
    { title: "Tên đăng nhập",       field: "username",    type: "text",     Icon: FiUser     },
    { title: "Mật khẩu",            field: "password",    type: "password", Icon: FiLock     },
    { title: "Xác nhận mật khẩu",  field: "confirm",     type: "password", Icon: FiLock     },
    { title: "Địa chỉ Email",       field: "email",       type: "email",    Icon: FiMail     },
    { title: "Số điện thoại",       field: "phoneNumber", type: "text",     Icon: FiPhone    },
    { title: "Địa chỉ",            field: "address",     type: "text",     Icon: FiMapPin   },
    {
        title: "Giới tính", field: "gender", type: "select", Icon: FiUser,
        options: [
            { label: "Nam", value: "MALE" },
            { label: "Nữ", value: "FEMALE" },
        ],
    },
    { title: "Ngày sinh", field: "dateOfBirth", type: "date", Icon: FiCalendar },
];

const Register = () => {
    const [user, setUser]       = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw]   = useState(false);
    const [showCf, setShowCf]   = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const avatar = useRef<any>(null);
    const nav    = useNavigate();

    const setState = (value: string, field: string) => {
        setUser((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleAvatarChange = (e: any) => {
        const file = e.target.files?.[0];
        if (file) setAvatarPreview(URL.createObjectURL(file));
    };

    const register = async (e: any) => {
        e.preventDefault();
        const userData: any = { ...user };
        if (!userData.role) userData.role = "USER";

        if (userData.password !== userData.confirm) {
            showCustomToast("Mật khẩu không khớp", "error");
            return;
        }

        const form = new FormData();
        for (let key in userData) {
            if (key !== "confirm") form.append(key, userData[key]);
        }
        if (avatar.current?.files?.length > 0) {
            form.append("avatar", avatar.current.files[0]);
        }

        try {
            setLoading(true);
            const res = await Apis.post(endpoint["register"], form, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            const { code, message } = res?.data || {};
            if (code === 0) {
                showCustomToast(message, "success");
                setTimeout(() => nav("/login"), 800);
            } else {
                showCustomToast(message, "error");
            }
        } catch (ex: any) {
            handleApiError(ex, "Đăng ký thất bại!");
        } finally {
            setLoading(false);
        }
    };

    const col1 = info.slice(0, Math.ceil(info.length / 2));
    const col2 = info.slice(Math.ceil(info.length / 2));

    const renderField = (f: typeof info[0]) => {
        if (f.type === "select") {
            return (
                <div key={f.field} className={styles.fieldWrap}>
                    <label className={styles.fieldLabel}>{f.title}</label>
                    <div className={styles.inputWrap}>
                        <span className={styles.fieldIcon}>{ico(f.Icon, 15)}</span>
                        <select
                            className={styles.input}
                            value={user[f.field] || ""}
                            required
                            onChange={e => setState(e.target.value, f.field)}
                        >
                            <option value="">-- Chọn {f.title} --</option>
                            {f.options?.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            );
        }

        const isPassword = f.type === "password";
        const showToggle = f.field === "password" ? showPw : showCf;
        const setToggle  = f.field === "password"
            ? () => setShowPw((p: boolean) => !p)
            : () => setShowCf((p: boolean) => !p);

        return (
            <div key={f.field} className={styles.fieldWrap}>
                <label className={styles.fieldLabel}>{f.title}</label>
                <div className={styles.inputWrap}>
                    <span className={styles.fieldIcon}>{ico(f.Icon, 15)}</span>
                    <input
                        className={styles.input}
                        type={isPassword ? (showToggle ? "text" : "password") : f.type}
                        placeholder={f.title}
                        required
                        value={user[f.field] || ""}
                        onChange={e => setState(e.target.value, f.field)}
                    />
                    {isPassword && (
                        <button
                            type="button"
                            className={styles.eyeBtn}
                            onClick={setToggle}
                            tabIndex={-1}
                        >
                            {ico(showToggle ? FiEyeOff : FiEye, 14)}
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.blob1} />
            <div className={styles.blob2} />

            <div className={styles.outerLayout}>

                {/* ── LEFT PANEL: ảnh + slogan ── */}
                <div className={styles.leftPanel}>
                    <img
                        src="/assets/images/login-banner.png"
                        alt="banner"
                        className={styles.bannerImg}
                    />
                    <p className={styles.slogan}>
                        "Cập nhật nhanh chóng các thông tin y tế, sức khỏe từ đội ngũ bác sĩ và chuyên gia đáng tin cậy, đồng hành cùng bạn trong việc bảo vệ và nâng cao sức khỏe."
                    </p>
                </div>

                {/* ── RIGHT PANEL: form card ── */}
                <div className={styles.card}>
                    {/* Header */}
                    <div className={styles.header}>
                        <div className={styles.logoRing}>
                            {ico(RiHospitalLine, 24)}
                        </div>
                        <div>
                            <h1 className={styles.title}>Tạo tài khoản</h1>
                            <p className={styles.subtitle}>Đăng ký để sử dụng hệ thống y tế</p>
                        </div>
                    </div>

                    <form onSubmit={register}>
                        {/* Avatar */}
                        <div className={styles.avatarRow} onClick={() => avatar.current?.click()}>
                            <div className={styles.avatarCircle}>
                                {avatarPreview
                                    ? <img src={avatarPreview} alt="avatar" className={styles.avatarImg} />
                                    : ico(FiCamera, 20)
                                }
                            </div>
                            <div className={styles.avatarHint}>
                                <span className={styles.avatarHintTitle}>Ảnh đại diện</span>
                                <span className={styles.avatarHintSub}>Nhấn để chọn ảnh (không bắt buộc)</span>
                            </div>
                            <input
                                ref={avatar}
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={handleAvatarChange}
                            />
                        </div>

                        {/* Fields 2 cột */}
                        <div className={styles.grid}>
                            <div className={styles.col}>{col1.map(renderField)}</div>
                            <div className={styles.col}>{col2.map(renderField)}</div>
                        </div>

                        {loading ? (
                            <div className={styles.spinnerWrap}><MySpinner /></div>
                        ) : (
                            <button type="submit" className={styles.submitBtn}>
                                {ico(FiUserPlus, 16)}
                                Đăng ký
                            </button>
                        )}
                    </form>

                    <div className={styles.divider}>
                        <div className={styles.dividerLine} />
                        <span className={styles.dividerText}>Hệ thống y tế</span>
                        <div className={styles.dividerLine} />
                    </div>

                    <div className={styles.footer}>
                        Đã có tài khoản?{" "}
                        <a href="/login" className={styles.footerLink}>Đăng nhập ngay</a>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Register;