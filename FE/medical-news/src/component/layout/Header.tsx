import { Container, Navbar, Button, NavDropdown, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import styles from "./Styles/header.module.css";

const Header = () => {
    return (

        <Navbar collapseOnSelect expand="lg" variant="light" bg="light" className={styles.header}>
            <Container className="p-0">
                <Navbar.Brand as={Link} to="/" className={styles.logoLink}>
                    <h2 className={styles.logoTitle}>
                        <span className={styles.logoHealth}>HEALTH</span>
                        <span className={styles.logoCare}>CARE.</span>
                    </h2>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className={`me-auto ${styles.headerMenu} text-center`}>
                        <Link to="/calendar" className={`nav-link text-dark ${styles.navItemWithSubtext} ms-4`}>
                            Xem lịch trống
                            <span className={styles.subText}>Đặt khám ngay</span>
                        </Link>
                        <Link to="/review" className={`nav-link text-dark ${styles.navItemWithSubtext} ms-4`}>
                            Xem đánh giá
                            <span className={styles.subText}>Đánh giá về những bác sĩ</span>
                        </Link>
                        <NavDropdown
                            title={
                                <div className={styles.navItemWithSubtext}>
                                    Tìm bác sĩ
                                    <span className={styles.subText}>Tìm ngay...</span>
                                </div>
                            }
                            id="collapsible-nav-dropdown"
                            className={styles.navDropdown}
                        >
                            <NavDropdown.Item as={Link} to="/findDoctor">Tìm ngay...</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                    <Nav className={styles.headerAuth}>
                       <Link to="/register" className={styles.authBtn} style={{ textDecoration: "none" }}>
                            Đăng ký
                        </Link>
                        <Link to="/login" className={styles.authBtn} style={{ textDecoration: "none" }}>
                            Đăng nhập
                        </Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Header;



