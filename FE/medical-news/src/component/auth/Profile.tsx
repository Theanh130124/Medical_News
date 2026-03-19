import { JSX, useContext, useEffect, useState, useRef, createElement } from "react";
import { MyUserContext } from "../../configs/MyContexts";
import { authApis, endpoint } from "../../configs/Apis";
import MySpinner from "../layout/MySpinner";
import styles from "./Styles/profile.module.css";
import CreatePost from "../post/CreatePost";
import { usePosts } from "../hooks/usePost";
import PostList from "../post/PostList";
import EditPostModal from "../post/EditPostModal";
import { handleApiError } from "../../utils/errorHandler";
import { useNavigate } from "react-router-dom";
import ChatSidebar from "../chat/ChatSidebar";
import {
    FiMail, FiPhone, FiMapPin, FiCalendar,
    FiUsers, FiChevronDown, FiEdit, FiAward,
    FiBriefcase, FiBook, FiCamera
} from "react-icons/fi";
import { RiHospitalLine } from "react-icons/ri";

const ico = (C: any, size: number) => createElement(C, { size });

const Profile = () => {
    const user     = useContext(MyUserContext);
    const navigate = useNavigate();
    const [friends, setFriends] = useState<any[]>([]);
    const [coverUrl, setCoverUrl] = useState<string>("");
    const coverInputRef = useRef<HTMLInputElement>(null);

    const {
        posts, loading, hasMore, editingPost,
        setEditingPost, loadMore, handleUpdatePost,
        handleDeletePost, handleRefresh
    } = usePosts(endpoint.get_post_userId(user?.id || ""));

    useEffect(() => {
        if (!user) return;
        const fetchFriends = async () => {
            try {
                const res = await authApis().get(endpoint.get_list_friends(user.id));
                setFriends(res.data.result.content || []);
            } catch (error) {
                handleApiError(error);
            }
        };
        fetchFriends();
    }, [user]);

    const handleNavigateToProfile = (userId: string) => {
        if (userId === user?.id) navigate("/profile");
        else navigate(`/otherprofile/${userId}`);
    };

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setCoverUrl(URL.createObjectURL(file));
    };

    const infoItems = [
        { icon: FiMail,     label: "Email",    value: user?.email },
        { icon: FiPhone,    label: "SĐT",      value: user?.phoneNumber },
        { icon: FiMapPin,   label: "Địa chỉ",  value: user?.address },
        { icon: FiCalendar, label: "Ngày sinh", value: user?.dateOfBirth
            ? new Date(user.dateOfBirth).toLocaleDateString("vi-VN")
            : "" },
    ].filter(i => i.value);

    return (
        <div className={styles.pageWrapper}>
            {/* ── COVER BANNER ── */}
            <div className={styles.coverOuter}>
                <div
                    className={styles.coverBanner}
                    style={coverUrl ? {
                        backgroundImage: `url(${coverUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    } : undefined}
                >
                    {!coverUrl && (
                        <>
                            <div className={styles.coverBlob1} />
                            <div className={styles.coverBlob2} />
                        </>
                    )}
                    {coverUrl && <div className={styles.coverOverlay} />}
                    <button
                        className={styles.coverEditBtn}
                        onClick={() => coverInputRef.current?.click()}
                        title="Đổi ảnh bìa"
                    >
                        {ico(FiCamera, 14)} Đổi ảnh bìa
                    </button>
                    <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleCoverChange}
                    />
                </div>
            </div>

            <div className={styles.profileTopRow}>
                <div className={styles.avatarFrame}>
                    <img src={user?.avatar} alt={user?.username} className={styles.avatar} />
                    {user?.role?.name === "DOCTOR" && (
                        <span className={styles.doctorRing} title="Bác sĩ">
                            {ico(RiHospitalLine, 13)}
                        </span>
                    )}
                </div>
                <div className={styles.profileHeadInfo}>
                    <div className={styles.profileNameRow}>
                        <h1 className={styles.profileName}>
                            {user?.firstName} {user?.lastName}
                        </h1>
                        {user?.role?.name === "DOCTOR" && (
                            <span className={styles.doctorBadge}>
                                {ico(RiHospitalLine, 12)} Bác sĩ
                            </span>
                        )}
                    </div>
                    
                    <button
                        className={styles.editBtn}
                        onClick={() => navigate("/editProfile")}
                    >
                        {ico(FiEdit, 13)} Chỉnh sửa trang cá nhân
                    </button>
                </div>
            </div>

            {/* ── MAIN LAYOUT ── */}
            <div className={styles.layout}>

                {/* ── LEFT SIDEBAR ── */}
                <aside className={styles.leftSidebar}>

                    {/* Info card */}
                    <div className={styles.sideCard}>
                        <div className={styles.sideCardTitle}>Thông tin</div>
                        <div className={styles.infoList}>
                            {infoItems.map(item => (
                                <div key={item.label} className={styles.infoItem}>
                                    <span className={styles.infoIcon}>{ico(item.icon, 14)}</span>
                                    <div className={styles.infoContent}>
                                        <span className={styles.infoLabel}>{item.label}</span>
                                        <span className={styles.infoValue}>{item.value}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Doctor card */}
                    {user?.doctor && (
                        <div className={styles.sideCard}>
                            <div className={styles.sideCardTitle}>
                                {ico(RiHospitalLine, 14)} Thông tin bác sĩ
                            </div>
                            <div className={styles.infoList}>
                                {user.doctor.specialty && (
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoIcon}>{ico(FiAward, 14)}</span>
                                        <div className={styles.infoContent}>
                                            <span className={styles.infoLabel}>Chuyên khoa</span>
                                            <span className={styles.infoValue}>{user.doctor.specialty}</span>
                                        </div>
                                    </div>
                                )}
                                {user.doctor.workplace && (
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoIcon}>{ico(FiBriefcase, 14)}</span>
                                        <div className={styles.infoContent}>
                                            <span className={styles.infoLabel}>Nơi làm việc</span>
                                            <span className={styles.infoValue}>{user.doctor.workplace}</span>
                                        </div>
                                    </div>
                                )}
                                {user.doctor.educationalLevel && (
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoIcon}>{ico(FiBook, 14)}</span>
                                        <div className={styles.infoContent}>
                                            <span className={styles.infoLabel}>Học vấn</span>
                                            <span className={styles.infoValue}>{user.doctor.educationalLevel}</span>
                                        </div>
                                    </div>
                                )}
                                {user.doctor.yearsOfExperience && (
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoIcon}>{ico(FiAward, 14)}</span>
                                        <div className={styles.infoContent}>
                                            <span className={styles.infoLabel}>Kinh nghiệm</span>
                                            <span className={styles.infoValue}>{user.doctor.yearsOfExperience} năm</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Friends card */}
                    <div className={styles.sideCard}>
                        <div className={styles.sideCardTitle}>
                            {ico(FiUsers, 14)} Bạn bè
                            <span className={styles.friendCount}>{friends.length}</span>
                        </div>
                        {friends.length === 0 ? (
                            <p className={styles.emptyFriends}>Chưa có bạn bè</p>
                        ) : (
                            <div className={styles.friendGrid}>
                                {friends.slice(0, 6).map((f: any) => {
                                    if (!f.firstUserId || !f.secondUserId || !user) return null;
                                    const friendUser = f.firstUserId.id === user.id ? f.secondUserId : f.firstUserId;
                                    if (!friendUser) return null;
                                    return (
                                        <div
                                            key={friendUser.id}
                                            className={styles.friendItem}
                                            onClick={() => navigate(`/otherprofile/${friendUser.id}`)}
                                            title={`${friendUser.firstName} ${friendUser.lastName}`}
                                        >
                                            <img
                                                src={friendUser.avatar}
                                                alt={friendUser.username}
                                                className={styles.friendAvatar}
                                            />
                                            <span className={styles.friendName}>
                                                {friendUser.firstName}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </aside>

                {/* ── FEED ── */}
                <div className={styles.feed}>
                    {loading && posts.length === 0 && (
                        <div className={styles.spinnerWrap}><MySpinner /></div>
                    )}

                    <CreatePost onPostCreated={handleRefresh} />

                    <PostList
                        posts={posts}
                        currentUser={user}
                        onEditPost={setEditingPost}
                        onDeletePost={handleDeletePost}
                        onVoteUpdate={handleRefresh}
                        onReactionUpdate={handleRefresh}
                        onCommentUpdate={handleRefresh}
                        onNavigateToProfile={handleNavigateToProfile}
                    />

                    {hasMore && (
                        <div className={styles.loadMoreWrap}>
                            <button
                                className={styles.loadMoreBtn}
                                onClick={loadMore}
                                disabled={loading}
                            >
                                {loading ? "Đang tải..." : <>{ico(FiChevronDown, 15)} Xem thêm</>}
                            </button>
                        </div>
                    )}
                </div>

                {/* ── RIGHT: Chat sidebar ── */}
                <aside className={styles.rightSidebar}>
                    <ChatSidebar />
                </aside>
            </div>

            <EditPostModal
                show={!!editingPost}
                editingPost={editingPost}
                onHide={() => setEditingPost(null)}
                onUpdatePost={handleUpdatePost}
                onTitleChange={(title)   => setEditingPost(prev => ({ ...prev!, title }))}
                onContentChange={(content) => setEditingPost(prev => ({ ...prev!, content }))}
                onAllowCommentsChange={(allowComments) => setEditingPost(prev => ({ ...prev!, allowComments }))}
            />
        </div>
    );
};

export default Profile;