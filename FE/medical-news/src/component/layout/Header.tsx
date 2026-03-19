import { useContext, useState, useEffect, createElement } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import styles from "./Styles/header.module.css";
import { MyDipatcherContext, MyUserContext } from "../../configs/MyContexts";
import { authApis, endpoint } from "../../configs/Apis";
import cookie from 'react-cookies';
import { FriendRequest } from "../../types/friends";
import { handleApiError } from "../../utils/errorHandler";
import {
    FiBell, FiHome, FiClock, FiFileText, FiLogOut,
    FiUser, FiEdit, FiCheck, FiX, FiRefreshCw,
    FiCheckSquare, FiMenu, FiChevronDown
} from "react-icons/fi";

const ico = (C: any, size: number) => createElement(C, { size });

interface Notification {
    id: string;
    userResponse: {
        id: string; username: string; firstName: string; lastName: string;
        phoneNumber: string; isActive: boolean; address: string; email: string;
        gender: string; avatar: string; dateOfBirth: string;
        role: { name: string; description: string };
        createdAt: string; doctor: any;
    };
    message: string;
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
}

const Header = () => {
    const user      = useContext(MyUserContext);
    const dispatch  = useContext(MyDipatcherContext);
    const navigate  = useNavigate();
    const location  = useLocation();

    const [friendRequests,      setFriendRequests]      = useState<FriendRequest[]>([]);
    const [notifications,       setNotifications]       = useState<Notification[]>([]);
    const [showNotifications,   setShowNotifications]   = useState(false);
    const [activeTab,           setActiveTab]           = useState<'notifications' | 'friendRequests'>('notifications');
    const [scrolled,            setScrolled]            = useState(false);
    const [mobileOpen,          setMobileOpen]          = useState(false);

    // Sticky on scroll
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const res = await authApis().get(endpoint.all_notification(user.id));
            if (res.data.code === 0) setNotifications(res.data.result);
        } catch (err) { handleApiError(err, "Lấy thông báo thất bại!"); }
    };

    const fetchFriendRequests = async () => {
        if (!user) return;
        try {
            const res = await authApis().get(endpoint.friend_pending(user.id));
            if (res.data.code === 0) setFriendRequests(res.data.result.content);
        } catch (err) { handleApiError(err, "Lấy lời mời kết bạn thất bại!"); }
    };

    const handleReadNotification = async (id: string) => {
        try {
            await authApis().patch(endpoint.read_notification(id));
            fetchNotifications();
        } catch (err) { handleApiError(err, "Đọc thông báo thất bại!"); }
    };

    const handleReadAllNotifications = async () => {
        if (!user) return;
        try {
            await authApis().patch(endpoint.read_all_notification(user.id));
            fetchNotifications();
        } catch (err) { handleApiError(err, "Đọc tất cả thông báo thất bại!"); }
    };

    const handleAcceptFriend = async (firstUserId: string) => {
        try {
            await authApis().patch(endpoint.accept_friend(firstUserId, user.id), { status: "ACCEPTED" });
            fetchFriendRequests();
        } catch (err) { handleApiError(err, "Chấp nhận lời mời kết bạn thất bại!"); }
    };

    const handleRejectFriend = async (firstUserId: string) => {
        try {
            await authApis().delete(endpoint.reject_friend(firstUserId, user.id));
            fetchFriendRequests();
        } catch (err) { handleApiError(err, "Từ chối lời mời kết bạn thất bại!"); }
    };

    const handleLogout = () => {
        dispatch({ type: "logout" });
        navigate("/login");
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            fetchFriendRequests();
            const interval = setInterval(() => {
                fetchNotifications();
                fetchFriendRequests();
            }, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const unreadCount   = notifications.filter(n => !n.isRead).length;
    const totalUnread   = unreadCount + friendRequests.length;

    const isActive = (path: string) => location.pathname === path;

    const navLinks = [
        { to: "/",         label: "Trang chủ", sub: "Home",     icon: FiHome,     always: true  },
        { to: "/timeline", label: "Hoạt động", sub: "Timeline", icon: FiClock,    always: false },
        { to: "/news",     label: "Tin tức",   sub: "News",     icon: FiFileText, always: true  },
    ];

    return (
        <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ""}`}>
            <div className={styles.inner}>

                {/* ── LOGO ── */}
                <Link to="/" className={styles.logo}>
                    <span className={styles.logoMedical}>MEDICAL</span>
                    <span className={styles.logoNews}>NEWS</span>
                </Link>

                {/* ── NAV (desktop) ── */}
                <nav className={styles.nav}>
                    {navLinks.filter(l => l.always || user !== null).map(l => (
                        <Link
                            key={l.to}
                            to={l.to}
                            className={`${styles.navItem} ${isActive(l.to) ? styles.navItemActive : ""}`}
                        >
                            <span className={styles.navIcon}>{ico(l.icon, 15)}</span>
                            <span className={styles.navLabel}>{l.label}</span>
                            <span className={styles.navSub}>{l.sub}</span>
                        </Link>
                    ))}
                </nav>

                {/* ── RIGHT ── */}
                <div className={styles.right}>
                    {user === null ? (
                        <>
                            <Link to="/register" className={styles.btnRegister}>Đăng ký</Link>
                            <Link to="/login"    className={styles.btnLogin}>Đăng nhập</Link>
                        </>
                    ) : (
                        <>
                            {/* Bell dropdown */}
                            <Dropdown
                                show={showNotifications}
                                onToggle={open => setShowNotifications(open)}
                                align="end"
                            >
                                <Dropdown.Toggle as="button" className={styles.bellBtn} bsPrefix="x">
                                    {ico(FiBell, 18)}
                                    {totalUnread > 0 && (
                                        <span className={styles.bellBadge}>{totalUnread}</span>
                                    )}
                                </Dropdown.Toggle>

                                <Dropdown.Menu className={styles.dropMenu}>
                                    {/* Tabs */}
                                    <div className={styles.dropTabs}>
                                        <button
                                            className={`${styles.dropTab} ${activeTab === 'notifications' ? styles.dropTabActive : ''}`}
                                            onClick={() => setActiveTab('notifications')}
                                        >
                                            Thông báo
                                            {unreadCount > 0 && <span className={styles.tabBadge}>{unreadCount}</span>}
                                        </button>
                                        <button
                                            className={`${styles.dropTab} ${activeTab === 'friendRequests' ? styles.dropTabActive : ''}`}
                                            onClick={() => setActiveTab('friendRequests')}
                                        >
                                            Lời mời kết bạn
                                            {friendRequests.length > 0 && <span className={styles.tabBadge}>{friendRequests.length}</span>}
                                        </button>
                                    </div>

                                    {/* Panel header */}
                                    <div className={styles.dropPanelHeader}>
                                        <span>{activeTab === 'notifications' ? 'Thông báo' : 'Lời mời kết bạn'}</span>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button className={styles.iconActionBtn} onClick={activeTab === 'notifications' ? fetchNotifications : fetchFriendRequests} title="Làm mới">
                                                {ico(FiRefreshCw, 13)}
                                            </button>
                                            {activeTab === 'notifications' && unreadCount > 0 && (
                                                <button className={styles.iconActionBtn} onClick={handleReadAllNotifications} title="Đọc tất cả">
                                                    {ico(FiCheckSquare, 13)}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Notification list */}
                                    <div className={styles.dropList}>
                                        {activeTab === 'notifications' ? (
                                            notifications.length === 0 ? (
                                                <div className={styles.dropEmpty}>Không có thông báo</div>
                                            ) : notifications.map(n => (
                                                <div
                                                    key={n.id}
                                                    className={`${styles.dropItem} ${!n.isRead ? styles.dropItemUnread : ''}`}
                                                    onClick={() => handleReadNotification(n.id)}
                                                >
                                                    {!n.isRead && <span className={styles.unreadDot} />}
                                                    <div className={styles.dropItemContent}>
                                                        <div className={styles.dropItemMsg}>{n.message}</div>
                                                        <div className={styles.dropItemTime}>
                                                            {new Date(n.createdAt).toLocaleString('vi-VN')}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            friendRequests.length === 0 ? (
                                                <div className={styles.dropEmpty}>Không có lời mời kết bạn</div>
                                            ) : friendRequests.map((req, i) => (
                                                <div key={i} className={styles.dropItem}>
                                                    <img
                                                        src={req.firstUserId.avatar}
                                                        alt={req.firstUserId.username}
                                                        className={styles.reqAvatar}
                                                    />
                                                    <div className={styles.dropItemContent}>
                                                        <div className={styles.dropItemMsg} style={{ fontWeight: 600 }}>
                                                            {req.firstUserId.firstName} {req.firstUserId.lastName}
                                                        </div>
                                                        <div className={styles.reqActions}>
                                                            <button
                                                                className={styles.reqAccept}
                                                                onClick={() => handleAcceptFriend(req.firstUserId.id)}
                                                            >
                                                                {ico(FiCheck, 13)} Chấp nhận
                                                            </button>
                                                            <button
                                                                className={styles.reqReject}
                                                                onClick={() => handleRejectFriend(req.firstUserId.id)}
                                                            >
                                                                {ico(FiX, 13)} Từ chối
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </Dropdown.Menu>
                            </Dropdown>

                            {/* User dropdown */}
                            <Dropdown align="end">
                                <Dropdown.Toggle as="button" className={styles.userBtn} bsPrefix="x">
                                    <img src={user.avatar} alt="avatar" className={styles.userAvatar} />
                                    <span className={styles.userName}>{user.username}</span>
                                    {ico(FiChevronDown, 13)}
                                </Dropdown.Toggle>
                                <Dropdown.Menu className={styles.dropMenu} style={{ minWidth: 200 }}>
                                    <div className={styles.dropUserInfo}>
                                        <img src={user.avatar} alt="avatar" className={styles.dropUserAvatar} />
                                        <div>
                                            <div className={styles.dropUserName}>{user.firstName} {user.lastName}</div>
                                            <div className={styles.dropUserRole}>{user.role?.name}</div>
                                        </div>
                                    </div>
                                    <div className={styles.dropDivider} />
                                    <Link to="/editProfile" className={styles.dropLink}>
                                        {ico(FiEdit, 14)} Sửa thông tin
                                    </Link>
                                    <Link to="/profile" className={styles.dropLink}>
                                        {ico(FiUser, 14)} Trang cá nhân
                                    </Link>
                                    <div className={styles.dropDivider} />
                                    <button className={`${styles.dropLink} ${styles.dropLogout}`} onClick={handleLogout}>
                                        {ico(FiLogOut, 14)} Đăng xuất
                                    </button>
                                </Dropdown.Menu>
                            </Dropdown>
                        </>
                    )}

                    {/* Mobile hamburger */}
                    <button className={styles.hamburger} onClick={() => setMobileOpen(o => !o)}>
                        {ico(FiMenu, 22)}
                    </button>
                </div>
            </div>

            {/* Mobile nav drawer */}
            {mobileOpen && (
                <div className={styles.mobileNav}>
                    {navLinks.filter(l => l.always || user !== null).map(l => (
                        <Link
                            key={l.to}
                            to={l.to}
                            className={`${styles.mobileNavItem} ${isActive(l.to) ? styles.mobileNavItemActive : ""}`}
                            onClick={() => setMobileOpen(false)}
                        >
                            {ico(l.icon, 16)} {l.label}
                        </Link>
                    ))}
                </div>
            )}
        </header>
    );
};

export default Header;