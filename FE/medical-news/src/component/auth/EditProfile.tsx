import { useContext, useState, useEffect, createElement } from "react";
import { MyUserContext } from "../../configs/MyContexts";
import { authApis, authformdataApis, endpoint, CLOUDINARY_URL, CLOUDINARY_PRESET } from "../../configs/Apis";
import { handleApiError } from "../../utils/errorHandler";
import MySpinner from "../layout/MySpinner";
import styles from "./Styles/editprofile.module.css";
import {
    FiUser, FiMail, FiPhone, FiMapPin, FiCalendar,
    FiCamera, FiLock, FiBriefcase, FiAward,
    FiBook, FiAlignLeft, FiCheck, FiAlertCircle,
    FiEye, FiEyeOff, FiSave
} from "react-icons/fi";
import { RiHospitalLine } from "react-icons/ri";

const ico = (C: any, size: number) => createElement(C, { size });

const EditProfile = () => {
    const user = useContext(MyUserContext);

    const [userData, setUserData] = useState({
        firstName: "", lastName: "", address: "",
        gender: "", dateOfBirth: "", avatar: null as any
    });
    const [doctorData, setDoctorData] = useState({
        specialty: "", yearsOfExperience: "",
        workplace: "", educationalLevel: "", introduction: ""
    });
    const [passwordData, setPasswordData] = useState({
        oldPassword: "", newPassword: "", confirmPassword: ""
    });
    const [avatarPreview,  setAvatarPreview]  = useState("");
    const [loading,        setLoading]        = useState(false);
    const [message,        setMessage]        = useState({ type: "", content: "" });
    const [showOldPw,      setShowOldPw]      = useState(false);
    const [showNewPw,      setShowNewPw]      = useState(false);
    const [showCfPw,       setShowCfPw]       = useState(false);
    const [activeSection,  setActiveSection]  = useState<"profile"|"doctor"|"password">("profile");

    useEffect(() => {
        if (user) {
            setUserData({
                firstName: user.firstName || "", lastName: user.lastName || "",
                address: user.address || "", gender: user.gender || "",
                dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
                avatar: null
            });
            setAvatarPreview(user.avatar || "");
            if (user.doctor) {
                setDoctorData({
                    specialty: user.doctor.specialty || "",
                    yearsOfExperience: user.doctor.yearsOfExperience || "",
                    workplace: user.doctor.workplace || "",
                    educationalLevel: user.doctor.educationalLevel || "",
                    introduction: user.doctor.introduction || ""
                });
            }
        }
    }, [user]);

    const handleUserChange    = (e: any) => setUserData({ ...userData, [e.target.name]: e.target.value });
    const handleDoctorChange  = (e: any) => setDoctorData({ ...doctorData, [e.target.name]: e.target.value });
    const handlePasswordChange = (e: any) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

    const handleAvatarChange = (e: any) => {
        const file = e.target.files[0];
        if (file) {
            setUserData({ ...userData, avatar: file });
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const uploadAvatarToCloudinary = async (file: any) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", CLOUDINARY_PRESET);
        const res = await fetch(CLOUDINARY_URL, { method: "POST", body: formData });
        const data = await res.json();
        return data.secure_url;
    };

    const handleUserSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true); setMessage({ type: "", content: "" });
        try {
            const formData = new FormData();
            if (userData.firstName)    formData.append("firstName",   userData.firstName);
            if (userData.lastName)     formData.append("lastName",    userData.lastName);
            if (userData.address)      formData.append("address",     userData.address);
            if (userData.gender)       formData.append("gender",      userData.gender);
            if (userData.dateOfBirth)  formData.append("dateOfBirth", userData.dateOfBirth);
            if (userData.avatar) {
                const url = await uploadAvatarToCloudinary(userData.avatar);
                formData.append("avatar", url);
            }
            await authformdataApis().patch(endpoint.update_profile_user(user.id), formData);
            setMessage({ type: "success", content: "Cập nhật thông tin thành công!" });
        } catch (error) {
            handleApiError(error, "Cập nhật thông tin thất bại!");
            setMessage({ type: "danger", content: "Cập nhật thông tin thất bại!" });
        } finally { setLoading(false); }
    };

    const handleDoctorSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true); setMessage({ type: "", content: "" });
        try {
            await authApis().patch(endpoint.update_doctor(user.doctor.id), doctorData);
            setMessage({ type: "success", content: "Cập nhật thông tin bác sĩ thành công!" });
        } catch (error) {
            handleApiError(error, "Cập nhật thông tin bác sĩ thất bại!");
            setMessage({ type: "danger", content: "Cập nhật thông tin bác sĩ thất bại!" });
        } finally { setLoading(false); }
    };

    const handlePasswordSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true); setMessage({ type: "", content: "" });
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: "danger", content: "Mật khẩu mới và xác nhận không khớp!" });
            setLoading(false); return;
        }
        try {
            await authApis().post(endpoint.change_password, passwordData);
            setMessage({ type: "success", content: "Đổi mật khẩu thành công!" });
            setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error) {
            handleApiError(error, "Đổi mật khẩu thất bại!");
            setMessage({ type: "danger", content: "Đổi mật khẩu thất bại!" });
        } finally { setLoading(false); }
    };

    const tabs = [
        { key: "profile",  label: "Thông tin cá nhân", icon: FiUser },
        ...(user?.doctor ? [{ key: "doctor", label: "Thông tin bác sĩ", icon: RiHospitalLine }] : []),
        { key: "password", label: "Đổi mật khẩu",      icon: FiLock },
    ] as { key: "profile"|"doctor"|"password"; label: string; icon: any }[];

    const Field = ({ label, icon, children }: { label: string; icon: any; children: React.ReactNode }) => (
        <div className={styles.fieldWrap}>
            <label className={styles.fieldLabel}>{label}</label>
            <div className={styles.inputWrap}>
                <span className={styles.fieldIcon}>{ico(icon, 15)}</span>
                {children}
            </div>
        </div>
    );

    return (
        <div className={styles.pageWrapper}>
            {/* ── HERO ── */}
            <div className={styles.heroBanner}>
                <div className={styles.heroBlob1} />
                <div className={styles.heroBlob2} />
                <div className={styles.heroInner}>
                    <div className={styles.avatarSection}>
                        <div className={styles.avatarWrap} onClick={() => document.getElementById("avatarInput")?.click()}>
                            {avatarPreview
                                ? <img src={avatarPreview} alt="avatar" className={styles.avatarImg} />
                                : <div className={styles.avatarPlaceholder}>{ico(FiCamera, 28)}</div>
                            }
                            <div className={styles.avatarOverlay}>{ico(FiCamera, 16)}</div>
                        </div>
                        <input
                            id="avatarInput"
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleAvatarChange}
                        />
                        <div className={styles.avatarHint}>Nhấn để đổi ảnh</div>
                    </div>
                    <div className={styles.heroInfo}>
                        <h1 className={styles.heroTitle}>
                            {user?.firstName} {user?.lastName}
                        </h1>
                        <p className={styles.heroSub}>{user?.email} · {user?.role?.name}</p>
                    </div>
                </div>
            </div>

            {/* ── CONTENT ── */}
            <div className={styles.contentWrap}>
                {/* Tabs */}
                <div className={styles.tabBar}>
                    {tabs.map(t => (
                        <button
                            key={t.key}
                            className={`${styles.tab} ${activeSection === t.key ? styles.tabActive : ""}`}
                            onClick={() => { setActiveSection(t.key); setMessage({ type: "", content: "" }); }}
                        >
                            {ico(t.icon, 15)} {t.label}
                        </button>
                    ))}
                </div>

                {/* Alert */}
                {message.content && (
                    <div className={`${styles.alert} ${message.type === "success" ? styles.alertSuccess : styles.alertDanger}`}>
                        {ico(message.type === "success" ? FiCheck : FiAlertCircle, 15)}
                        {message.content}
                    </div>
                )}

                {/* ── PROFILE SECTION ── */}
                {activeSection === "profile" && (
                    <form onSubmit={handleUserSubmit} className={styles.card}>
                        <div className={styles.cardHeader}>
                            {ico(FiUser, 17)} Thông tin cá nhân
                        </div>
                        <div className={styles.cardBody}>
                            <div className={styles.grid2}>
                                <Field label="Họ" icon={FiUser}>
                                    <input className={styles.input} type="text" name="firstName"
                                        value={userData.firstName} onChange={handleUserChange} required />
                                </Field>
                                <Field label="Tên" icon={FiUser}>
                                    <input className={styles.input} type="text" name="lastName"
                                        value={userData.lastName} onChange={handleUserChange} required />
                                </Field>
                            </div>

                            <Field label="Email (không thể thay đổi)" icon={FiMail}>
                                <input className={`${styles.input} ${styles.inputDisabled}`}
                                    type="email" value={user?.email || ""} disabled readOnly />
                            </Field>

                            <Field label="Số điện thoại (không thể thay đổi)" icon={FiPhone}>
                                <input className={`${styles.input} ${styles.inputDisabled}`}
                                    type="text" value={user?.phoneNumber || ""} disabled readOnly />
                            </Field>

                            <Field label="Địa chỉ" icon={FiMapPin}>
                                <input className={styles.input} type="text" name="address"
                                    value={userData.address} onChange={handleUserChange} />
                            </Field>

                            <div className={styles.grid2}>
                                <Field label="Giới tính" icon={FiUser}>
                                    <select className={styles.input} name="gender"
                                        value={userData.gender} onChange={handleUserChange}>
                                        <option value="">Chọn giới tính</option>
                                        <option value="MALE">Nam</option>
                                        <option value="FEMALE">Nữ</option>
                                        <option value="OTHER">Khác</option>
                                    </select>
                                </Field>
                                <Field label="Ngày sinh" icon={FiCalendar}>
                                    <input className={styles.input} type="date" name="dateOfBirth"
                                        value={userData.dateOfBirth} onChange={handleUserChange} />
                                </Field>
                            </div>

                            <div className={styles.submitRow}>
                                <button type="submit" className={styles.submitBtn} disabled={loading}>
                                    {loading ? <MySpinner /> : <>{ico(FiSave, 15)} Lưu thay đổi</>}
                                </button>
                            </div>
                        </div>
                    </form>
                )}

                {/* ── DOCTOR SECTION ── */}
                {activeSection === "doctor" && user?.doctor && (
                    <form onSubmit={handleDoctorSubmit} className={styles.card}>
                        <div className={styles.cardHeader}>
                            {ico(RiHospitalLine, 17)} Thông tin bác sĩ
                        </div>
                        <div className={styles.cardBody}>
                            <Field label="Chuyên khoa" icon={FiAward}>
                                <input className={styles.input} type="text" name="specialty"
                                    value={doctorData.specialty} onChange={handleDoctorChange} />
                            </Field>
                            <Field label="Số năm kinh nghiệm" icon={FiBriefcase}>
                                <input className={styles.input} type="number" name="yearsOfExperience"
                                    value={doctorData.yearsOfExperience} onChange={handleDoctorChange} min="0" />
                            </Field>
                            <Field label="Nơi làm việc" icon={FiBriefcase}>
                                <input className={styles.input} type="text" name="workplace"
                                    value={doctorData.workplace} onChange={handleDoctorChange} />
                            </Field>
                            <Field label="Trình độ học vấn" icon={FiBook}>
                                <input className={styles.input} type="text" name="educationalLevel"
                                    value={doctorData.educationalLevel} onChange={handleDoctorChange} />
                            </Field>
                            <div className={styles.fieldWrap}>
                                <label className={styles.fieldLabel}>Giới thiệu</label>
                                <div className={styles.inputWrap}>
                                    <span className={styles.fieldIcon} style={{ top: 14, transform: "none" }}>{ico(FiAlignLeft, 15)}</span>
                                    <textarea className={`${styles.input} ${styles.textarea}`}
                                        name="introduction" rows={4}
                                        value={doctorData.introduction} onChange={handleDoctorChange} />
                                </div>
                            </div>
                            <div className={styles.submitRow}>
                                <button type="submit" className={styles.submitBtn} disabled={loading}>
                                    {loading ? <MySpinner /> : <>{ico(FiSave, 15)} Lưu thông tin bác sĩ</>}
                                </button>
                            </div>
                        </div>
                    </form>
                )}

                {/* ── PASSWORD SECTION ── */}
                {activeSection === "password" && (
                    <form onSubmit={handlePasswordSubmit} className={styles.card}>
                        <div className={styles.cardHeader}>
                            {ico(FiLock, 17)} Đổi mật khẩu
                        </div>
                        <div className={styles.cardBody}>
                            {[
                                { label: "Mật khẩu hiện tại",     name: "oldPassword",     show: showOldPw, toggle: setShowOldPw },
                                { label: "Mật khẩu mới",          name: "newPassword",     show: showNewPw, toggle: setShowNewPw },
                                { label: "Xác nhận mật khẩu mới", name: "confirmPassword", show: showCfPw,  toggle: setShowCfPw  },
                            ].map(f => (
                                <div key={f.name} className={styles.fieldWrap}>
                                    <label className={styles.fieldLabel}>{f.label}</label>
                                    <div className={styles.inputWrap}>
                                        <span className={styles.fieldIcon}>{ico(FiLock, 15)}</span>
                                        <input
                                            className={styles.input}
                                            type={f.show ? "text" : "password"}
                                            name={f.name}
                                            value={(passwordData as any)[f.name]}
                                            onChange={handlePasswordChange}
                                            required
                                        />
                                        <button type="button" className={styles.eyeBtn}
                                            onClick={() => f.toggle((p: boolean) => !p)} tabIndex={-1}>
                                            {ico(f.show ? FiEyeOff : FiEye, 15)}
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <div className={styles.submitRow}>
                                <button type="submit" className={styles.submitBtn} disabled={loading}>
                                    {loading ? <MySpinner /> : <>{ico(FiLock, 15)} Đổi mật khẩu</>}
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EditProfile;