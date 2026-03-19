import { createElement } from "react";
import { Link } from "react-router-dom";
import styles from "./Styles/footer.module.css";
import { FaFacebook, FaYoutube, FaLinkedin, FaGoogle } from "react-icons/fa";
import { FiMapPin, FiFileText, FiPhone, FiArrowRight } from "react-icons/fi";

const ico = (C: any, size: number) => createElement(C, { size });

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.footerBlob1} />
            <div className={styles.footerBlob2} />

            <div className={styles.inner}>
                <div className={styles.grid}>

                    {/* ── Col 1: Brand ── */}
                    <div className={styles.brandCol}>
                        <div className={styles.logoWrap}>
                            <span className={styles.logoMedical}>MEDICAL</span>
                            <span className={styles.logoNews}>NEWS</span>
                        </div>
                        <p className={styles.brandDesc}>
                            Hệ thống tin tức y tế chính thống, cập nhật nhanh chóng từ đội ngũ bác sĩ và chuyên gia đáng tin cậy tại Việt Nam.
                        </p>
                        <div className={styles.socialRow}>
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={styles.socialBtn} aria-label="Facebook">
                                {ico(FaFacebook, 16)}
                            </a>
                            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className={styles.socialBtn} aria-label="Youtube">
                                {ico(FaYoutube, 16)}
                            </a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={styles.socialBtn} aria-label="LinkedIn">
                                {ico(FaLinkedin, 16)}
                            </a>
                            <a href="https://google.com" target="_blank" rel="noopener noreferrer" className={styles.socialBtn} aria-label="Google">
                                {ico(FaGoogle, 16)}
                            </a>
                        </div>
                    </div>

                    {/* ── Col 2: Info ── */}
                    <div className={styles.col}>
                        <h5 className={styles.colTitle}>Thông tin</h5>
                        <div className={styles.infoList}>
                            <div className={styles.infoItem}>
                                <span className={styles.infoIcon}>{ico(FiMapPin, 13)}</span>
                                <span>420 Lê Văn Thọ, P.16, Q.Gò Vấp, TP.HCM</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoIcon}>{ico(FiFileText, 13)}</span>
                                <span>Số ĐKKD 0221357733 do Sở KHĐT TP.HCM cấp ngày 20/04/2025</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoIcon}>{ico(FiPhone, 13)}</span>
                                <span>Chủ trách nhiệm nội dung: Trần Thế Anh</span>
                            </div>
                        </div>
                    </div>

                    {/* ── Col 3: Links ── */}
                    <div className={styles.col}>
                        <h5 className={styles.colTitle}>Liên kết</h5>
                        <div className={styles.linkList}>
                            {[
                                { to: "/gioi-thieu",          label: "Giới thiệu" },
                                { to: "/lien-he",             label: "Liên hệ" },
                                { to: "/chinh-sach-bao-mat",  label: "Chính sách bảo mật" },
                                { to: "/dieu-khoan-su-dung",  label: "Điều khoản sử dụng" },
                            ].map(l => (
                                <a key={l.to} href={l.to} className={styles.footerLink}>
                                    <span className={styles.linkArrow}>{ico(FiArrowRight, 12)}</span>
                                    {l.label}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* ── Col 4: Disclaimer ── */}
                    <div className={styles.col}>
                        <h5 className={styles.colTitle}>Lưu ý</h5>
                        <p className={styles.disclaimer}>
                            Thông tin trên MEDICALNEWS chỉ dành cho tham khảo, không thay thế cho việc chẩn đoán hoặc điều trị y khoa.
                        </p>
                        <p className={styles.disclaimer}>
                            Cần tuyệt đối tuân theo hướng dẫn của Bác sĩ và Nhân viên y tế.
                        </p>
                    </div>

                </div>

                {/* ── Bottom bar ── */}
                <div className={styles.bottomBar}>
                    <div className={styles.bottomDivider} />
                    <div className={styles.bottomRow}>
                        <span className={styles.copyright}>
                            © 2024 – {currentYear} <strong>MEDICALNEWS</strong> Việt Nam. All rights reserved.
                        </span>
                        <div className={styles.bottomLinks}>
                            <a href="/chinh-sach-bao-mat" className={styles.bottomLink}>Bảo mật</a>
                            <span className={styles.bottomDot} />
                            <a href="/dieu-khoan-su-dung" className={styles.bottomLink}>Điều khoản</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;