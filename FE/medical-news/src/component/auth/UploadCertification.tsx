import { useState, createElement } from "react";
import Apis, { endpoint } from "../../configs/Apis";
import { useNavigate } from "react-router-dom";
import { showCustomToast } from "../layout/MyToaster";
import { handleApiError } from "../../utils/errorHandler";
import styles from "./Styles/certifcation.module.css";
import { FiHash, FiCalendar, FiUpload, FiSend, FiShield } from "react-icons/fi";
import { RiHospitalLine } from "react-icons/ri";

const ico = (C: any, size: number) => createElement(C, { size });

const info = [
    { label: "Số chứng chỉ hành nghề", field: "certificateNumber", type: "text",  icon: FiHash     },
    { label: "Ngày cấp",               field: "issueDate",          type: "date",  icon: FiCalendar },
    { label: "Ngày hết hạn",           field: "expiryDate",         type: "date",  icon: FiCalendar },
];

const UploadCertification = () => {
    const [loading,      setLoading]      = useState(false);
    const [certifcation, setCertifcation] = useState<any>({});
    const [file,         setFile]         = useState<File | null>(null);
    const [filePreview,  setFilePreview]  = useState<string>("");
    const nav = useNavigate();

    const doctorId = sessionStorage.getItem("doctorId");

    const setState = (value: string, field: string) => {
        setCertifcation({ ...certifcation, [field]: value });
    };

    const handleFileChange = (e: any) => {
        const f = e.target.files[0];
        if (f) {
            setFile(f);
            setFilePreview(URL.createObjectURL(f));
        }
    };

    const uploadCertification = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!doctorId) {
            showCustomToast("Không tìm thấy doctorId trong session!", "error");
            return;
        }
        if (!file) {
            showCustomToast("Vui lòng chọn file chứng chỉ!", "error");
            return;
        }

        setLoading(true);
        try {
            let formData = new FormData();
            formData.append("doctorId",           doctorId);
            formData.append("certificateNumber",  certifcation.certificateNumber || "");
            formData.append("issueDate",          certifcation.issueDate || "");
            formData.append("expiryDate",         certifcation.expiryDate || "");
            formData.append("imageCertificate",   file);

            let res = await Apis.post(endpoint["upload_certificate"], formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            const { code, message } = res?.data || {};
            if (code === 0) {
                showCustomToast(message, "success");
                nav("/login");
            } else {
                showCustomToast(message, "error");
            }
        } catch (ex: any) {
            handleApiError(ex, "Gửi chứng chỉ hành nghề thất bại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.blob1} />
            <div className={styles.blob2} />

            <div className={styles.card}>
                {/* Header */}
                <div className={styles.cardHeader}>
                    <div className={styles.logoRing}>
                        {ico(RiHospitalLine, 26)}
                    </div>
                    <div>
                        <h1 className={styles.title}>Gửi chứng chỉ hành nghề</h1>
                        <p className={styles.subtitle}>
                            Vui lòng cung cấp thông tin chứng chỉ để kích hoạt tài khoản bác sĩ
                        </p>
                    </div>
                </div>

                {/* Notice */}
                <div className={styles.notice}>
                    {ico(FiShield, 14)}
                    <span>Thông tin sẽ được xác minh bởi admin trước khi tài khoản được kích hoạt</span>
                </div>

                <form onSubmit={uploadCertification} className={styles.form}>
                    {/* Info fields */}
                    {info.map((f, idx) => (
                        <div key={idx} className={styles.fieldWrap}>
                            <label className={styles.fieldLabel}>{f.label}</label>
                            <div className={styles.inputWrap}>
                                <span className={styles.fieldIcon}>{ico(f.icon, 15)}</span>
                                <input
                                    className={styles.input}
                                    type={f.type}
                                    required
                                    onChange={e => setState(e.target.value, f.field)}
                                />
                            </div>
                        </div>
                    ))}

                    {/* File upload */}
                    <div className={styles.fieldWrap}>
                        <label className={styles.fieldLabel}>Ảnh chứng chỉ</label>
                        <label className={styles.fileDropZone} htmlFor="certFile">
                            {filePreview ? (
                                <img src={filePreview} alt="preview" className={styles.filePreview} />
                            ) : (
                                <div className={styles.fileDropInner}>
                                    {ico(FiUpload, 28)}
                                    <span className={styles.fileDropText}>Nhấn để chọn ảnh chứng chỉ</span>
                                    <span className={styles.fileDropSub}>PNG, JPG, JPEG tối đa 10MB</span>
                                </div>
                            )}
                        </label>
                        <input
                            id="certFile"
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleFileChange}
                            required
                        />
                        {file && (
                            <span className={styles.fileName}>
                                {ico(FiUpload, 12)} {file.name}
                            </span>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={loading}
                    >
                        {loading
                            ? "Đang gửi..."
                            : <>{ico(FiSend, 15)} Gửi chứng chỉ</>
                        }
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UploadCertification;