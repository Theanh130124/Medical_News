import { Container, Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faYoutube, faLinkedin, faGoogle } from "@fortawesome/free-brands-svg-icons";
import styles from "./Styles/footer.module.css";

const Footer = () => {
    const currentYear = new Date().getFullYear();
    return (
        <footer className={styles.footer}>
            <Container>
                <Row>
                    <Col md={4} className={styles.info}>
                        <h5>HỆ THỐNG TIN TỨC Y TẾ MEDICALNEWS VIỆT NAM</h5>
                        <p>VPĐD: 420 LÊ VĂN THỌ, PHƯỜNG 16, QUẬN GÒ VẤP, TP.HCM</p>
                        <p>Số ĐKKD 0221357733 do Sở KHĐT TP.HCM cấp ngày 20/04/2025</p>
                        <p>Chủ trách nhiệm nội dung: Trần Thế Anh</p>
                    </Col>
                    <Col md={4} className={styles.links}>
                        <h5>Liên kết</h5>
                        <a href="/gioi-thieu">Giới thiệu</a>
                        <a href="/lien-he">Liên hệ</a>
                        <a href="/chinh-sach-bao-mat">Chính sách bảo mật</a>
                        <a href="/dieu-khoan-su-dung">Điều khoản sử dụng</a>
                    </Col>
                    <Col md={4} className={styles.social}>
                        <h5>Kết nối với chúng tôi</h5>
                        <div>
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faFacebook} /></a>
                            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faYoutube} /></a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faLinkedin} /></a>
                            <a href="https://google.com" target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faGoogle} /></a>
                        </div>
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col className={styles.bottom}>
                        <p>Thông tin trên MEDICALNEWS chỉ dành cho tham khảo, không thay thế cho việc chuẩn đoán hoặc điều trị y khoa.</p>
                        <p>Cần tuyệt đối tuân theo hướng dẫn của Bác sĩ và Nhân viên y tế.</p>
                        <p>Copyright © 2024 - {currentYear} MEDICALNEWS Việt Nam.</p>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;