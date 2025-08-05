import { Container, Navbar, Nav, NavDropdown, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import styles from "./Styles/header.module.css";

const Header = () => {
    return (
        <Navbar expand="lg" bg="light" className={styles.header}>
            <Container>
                <Navbar.Brand as={Link} to="/" className={styles.logoLink}>
                    <span className={styles.logoHealth}>MEDICAL</span>
                    <span className={styles.logoNews}>NEWS</span>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="main-navbar" />
                <Navbar.Collapse id="main-navbar">
                    <Nav className="me-auto">
                        <Link to="/news" className={styles.navLink}>Tin tức</Link>
                        <Link to="/doctors" className={styles.navLink}>Bác sĩ</Link>
                        <Link to="/hospitals" className={styles.navLink}>Bệnh viện</Link>
                        <Link to="/reviews" className={styles.navLink}>Đánh giá</Link>
                        <NavDropdown title="Dịch vụ" id="services-dropdown" className={styles.navDropdown}>
                            <NavDropdown.Item as={Link} to="/booking">Đặt khám</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/health-records">Hồ sơ sức khỏe</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                    <Nav>
                        <Link to="/login">
                            <Button variant="outline-primary" className={styles.authBtn}>Đăng nhập</Button>
                        </Link>
                        <Link to="/register">
                            <Button variant="primary" className={styles.authBtn}>Đăng ký</Button>
                        </Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Header;