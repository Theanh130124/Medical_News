import { Container, Navbar, Button, NavDropdown, Nav } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Styles/header.module.css";
import { useContext } from "react";
import { MyDipatcherContext, MyUserContext } from "../../configs/MyContexts";

const Header = () => {
  const user = useContext(MyUserContext);
  const dispatch = useContext(MyDipatcherContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: "logout" });
    navigate("/login");
  };

  return (
    <Navbar collapseOnSelect expand="lg" variant="light" bg="light" className={styles.header}>
      <Container className="p-0">
        <Navbar.Brand as={Link} to="/" className={styles.logoLink}>
          <h2 className={styles.logoTitle}>
            <span className={styles.logoHealth}>MEDICAL</span>
            <span className={styles.logoCare}>NEWS</span>
          </h2>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">

          
          <Nav className={`me-auto ${styles.headerMenu} text-center`}>

            <Link to="/" className={`nav-link text-dark ${styles.navItemWithSubtext} ms-4`}>
              <i className="bi bi-house me-1"></i>
              <span className={styles.navText}>Trang chủ</span>
              <span className={styles.subText}>Home</span>
            </Link>

            {/* Timeline */}

            {user !== null ? <>
            
            <Link to="/timeline" className={`nav-link text-dark ${styles.navItemWithSubtext} ms-4`}>
              <i className="bi bi-clock-history me-1"></i>
              <span className={styles.navText}>Hoạt động</span>
              <span className={styles.subText}>Timeline</span>
            </Link>
            </> :<></>}
            

            {/* Tin tức */}
            <Link to="/news" className={`nav-link text-dark ${styles.navItemWithSubtext} ms-4`}>
              <i className="bi bi-newspaper me-1"></i>
              <span className={styles.navText}>Tin tức</span>
              <span className={styles.subText}>Xem ngay</span>
            </Link>
          </Nav>

          <Nav className={styles.headerAuth}>
            {user === null ? (
              <>
                <Link to="/register" className={styles.registerBtn} style={{ textDecoration: "none" }}>
                  Đăng ký
                </Link>
                <Link to="/login" className={styles.loginBtn} style={{ textDecoration: "none" }}>
                  Đăng nhập
                </Link>
              </>
            ) : (
              <NavDropdown
                title={
                  <span>
                    <img src={user.avatar} width="40" className="rounded-circle" alt="Avatar" /> Chào {user.username}!
                  </span>
                }
                id="user-dropdown"
                align="end"
              >
                <NavDropdown.Item as={Link} to="/editProfile">
                  Sửa thông tin cá nhân
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2"></i> Đăng xuất
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
