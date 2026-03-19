import { useContext, useEffect, useState, createElement } from "react";
import { MyUserContext } from "../../configs/MyContexts";
import { useNavigate, useParams } from "react-router-dom";
import { authApis, endpoint } from "../../configs/Apis";
import { handleApiError } from "../../utils/errorHandler";
import MySpinner from "../layout/MySpinner";
import styles from "./Styles/otherprofile.module.css";
import { showCustomToast } from "../layout/MyToaster";
import PrivacyIcon from "../../utils/privacyIcon";
import {
    FiMail, FiPhone, FiMapPin, FiCalendar,
    FiUserPlus, FiUserCheck, FiUserX, FiChevronDown,
    FiMessageSquare, FiAward, FiBriefcase, FiBook, FiCamera
} from "react-icons/fi";
import { RiHospitalLine } from "react-icons/ri";

const ico = (C: any, size: number) => createElement(C, { size });

const OtherProfile = () => {
    const currentUser = useContext(MyUserContext);
    const { userId }  = useParams();
    const navigate    = useNavigate();

    const [profileUser,       setProfileUser]       = useState<any>(null);
    const [posts,             setPosts]             = useState<any[]>([]);
    const [loading,           setLoading]           = useState(false);
    const [page,              setPage]              = useState(0);
    const [hasMore,           setHasMore]           = useState(true);
    const [refreshFlag,       setRefreshFlag]       = useState(0);
    const [friendStatus,      setFriendStatus]      = useState<string | null>(null);
    const [followStatus,      setFollowStatus]      = useState(false);
    const [isLoadingAction,   setIsLoadingAction]   = useState(false);
    const [pendingRequestFrom, setPendingRequestFrom] = useState<string | null>(null);

    // Fetch profile user
    useEffect(() => {
        if (!userId) return;
        const fetch = async () => {
            try {
                const res = await authApis().get(endpoint.get_otheruser_by_id(userId));
                setProfileUser(res.data.result);
            } catch (error) {
                handleApiError(error, "Không thể tải thông tin người dùng");
                navigate(-1);
            }
        };
        fetch();
    }, [userId, navigate]);

    // Fetch relationship status
    useEffect(() => {
        if (!currentUser || !profileUser || currentUser.id === profileUser.id) return;
        const fetchRelationship = async () => {
            try {
                const friendsRes = await authApis().get(endpoint.get_list_friends(currentUser.id));
                const friendsList = friendsRes.data.result.content;
                const isFriend = friendsList.some((f: any) =>
                    (f.firstUserId.id === currentUser.id && f.secondUserId.id === profileUser.id) ||
                    (f.firstUserId.id === profileUser.id && f.secondUserId.id === currentUser.id)
                );
                if (isFriend) {
                    setFriendStatus("ACCEPTED"); setPendingRequestFrom(null);
                } else {
                    try {
                        const sentRes = await authApis().get(endpoint.sent_friend(currentUser.id));
                        const sent = sentRes.data.result.content.find((r: any) =>
                            r.secondUserId.id === profileUser.id && r.status === "PENDING"
                        );
                        if (sent) { setFriendStatus("PENDING"); setPendingRequestFrom("YOU"); }
                        else {
                            try {
                                const recvRes = await authApis().get(endpoint.sent_friend(profileUser.id));
                                const recv = recvRes.data.result.content.find((r: any) =>
                                    r.secondUserId.id === currentUser.id && r.status === "PENDING"
                                );
                                if (recv) { setFriendStatus("PENDING"); setPendingRequestFrom("THEM"); }
                                else { setFriendStatus(null); setPendingRequestFrom(null); }
                            } catch { setFriendStatus(null); setPendingRequestFrom(null); }
                        }
                    } catch { setFriendStatus(null); setPendingRequestFrom(null); }
                }
                try {
                    const followRes = await authApis().get(endpoint.sent_follow(currentUser.id));
                    const isFollowing = (followRes.data.result.content || []).some(
                        (f: any) => f.followingId?.id === profileUser.id
                    );
                    setFollowStatus(isFollowing);
                } catch { setFollowStatus(false); }
            } catch (error) { console.error(error); }
        };
        fetchRelationship();
    }, [currentUser, profileUser, refreshFlag]);

    // Fetch posts
    useEffect(() => {
        if (!profileUser) return;
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const res = await authApis().get(endpoint.get_post_userId(profileUser.id) + `?page=${page}`);
                const newPosts = res.data.result.content || [];
                setHasMore(page < res.data.result.totalPages - 1);
                setPosts(prev => page === 0 ? newPosts : [...prev, ...newPosts]);
            } catch (error) { console.error(error); }
            finally { setLoading(false); }
        };
        fetchPosts();
    }, [profileUser, page, refreshFlag]);

    useEffect(() => { setPage(0); }, [profileUser]);

    const refreshData = () => setRefreshFlag(p => p + 1);

    const handleSendFriendRequest = async () => {
        setIsLoadingAction(true);
        try {
            await authApis().post(endpoint.send_friend, { firstUser: currentUser.id, secondUser: profileUser.id });
            setFriendStatus("PENDING"); setPendingRequestFrom("YOU");
            showCustomToast("Đã gửi lời mời kết bạn!", "success"); refreshData();
        } catch (ex: any) { handleApiError(ex, "Gửi lời mời kết bạn thất bại!"); }
        finally { setIsLoadingAction(false); }
    };

    const handleCancelFriendRequest = async () => {
        setIsLoadingAction(true);
        try {
            const sentRes = await authApis().get(endpoint.sent_friend(currentUser.id));
            const req = sentRes.data.result.content.find((r: any) =>
                r.secondUserId.id === profileUser.id && r.status === "PENDING"
            );
            if (req) {
                await authApis().delete(endpoint.reject_friend(req.firstUserId.id, req.secondUserId.id));
                setFriendStatus(null); setPendingRequestFrom(null);
                showCustomToast("Đã hủy lời mời kết bạn!", "success"); refreshData();
            }
        } catch (ex: any) { handleApiError(ex, "Hủy lời mời kết bạn thất bại!"); }
        finally { setIsLoadingAction(false); }
    };

    const handleAcceptFriendRequest = async () => {
        setIsLoadingAction(true);
        try {
            await authApis().patch(endpoint.accept_friend(profileUser.id, currentUser.id));
            setFriendStatus("ACCEPTED"); setPendingRequestFrom(null);
            showCustomToast("Đã chấp nhận lời mời kết bạn!", "success"); refreshData();
        } catch (ex: any) { handleApiError(ex, "Chấp nhận lời mời kết bạn thất bại!"); }
        finally { setIsLoadingAction(false); }
    };

    const handleUnfriend = async () => {
        setIsLoadingAction(true);
        try {
            await authApis().delete(endpoint.reject_friend(currentUser.id, profileUser.id));
            setFriendStatus(null); setPendingRequestFrom(null);
            showCustomToast("Đã hủy kết bạn!", "success"); refreshData();
        } catch (ex: any) { handleApiError(ex, "Hủy kết bạn thất bại!"); }
        finally { setIsLoadingAction(false); }
    };

    const handleFollow = async () => {
        setIsLoadingAction(true);
        try {
            await authApis().post(endpoint.follow, { followerId: currentUser.id, followingId: profileUser.id });
            setFollowStatus(true); showCustomToast("Đã theo dõi!", "success"); refreshData();
        } catch (ex: any) { handleApiError(ex, "Theo dõi thất bại!"); }
        finally { setIsLoadingAction(false); }
    };

    const handleUnfollow = async () => {
        setIsLoadingAction(true);
        try {
            await authApis().delete(endpoint.follow, { data: { followerId: currentUser.id, followingId: profileUser.id } });
            setFollowStatus(false); showCustomToast("Đã bỏ theo dõi!", "success"); refreshData();
        } catch (ex: any) { handleApiError(ex, "Bỏ theo dõi thất bại!"); }
        finally { setIsLoadingAction(false); }
    };

    if (!profileUser) return (
        <div className={styles.loadingWrap}><MySpinner /></div>
    );

    const isDoctor = profileUser.role?.name === "DOCTOR";
    const isMe     = currentUser?.id === profileUser.id;

    const infoItems = [
        { icon: FiMail,     label: "Email",    value: profileUser.email },
        { icon: FiPhone,    label: "SĐT",      value: profileUser.phoneNumber || "Chưa cập nhật" },
        { icon: FiMapPin,   label: "Địa chỉ",  value: profileUser.address || "Chưa cập nhật" },
        { icon: FiCalendar, label: "Ngày sinh", value: profileUser.dateOfBirth
            ? new Date(profileUser.dateOfBirth).toLocaleDateString("vi-VN")
            : "Chưa cập nhật" },
    ];

    return (
        <div className={styles.pageWrapper}>
            {/* ── COVER BANNER ── */}
            <div className={styles.coverOuter}>
                <div className={styles.coverBanner}>
                    <div className={styles.coverBlob1} />
                    <div className={styles.coverBlob2} />
                </div>
            </div>

            {/* ── PROFILE TOP ROW ── */}
            <div className={styles.profileTopRow}>
                <div className={styles.avatarFrame}>
                    <img src={profileUser.avatar} alt={profileUser.username} className={styles.avatar} />
                    {isDoctor && (
                        <span className={styles.doctorRing}>{ico(RiHospitalLine, 13)}</span>
                    )}
                </div>
                <div className={styles.profileHeadInfo}>
                    <div className={styles.profileNameRow}>
                        <h1 className={styles.profileName}>
                            {profileUser.firstName} {profileUser.lastName}
                        </h1>
                        {isDoctor && (
                            <span className={styles.doctorBadge}>
                                {ico(RiHospitalLine, 12)} Bác sĩ
                            </span>
                        )}
                    </div>
                    <p className={styles.profileUsername}>@{profileUser.username}</p>

                    {/* Action buttons */}
                    {currentUser && !isMe && (
                        <div className={styles.actionRow}>
                            {/* Friend button */}
                            {friendStatus === null && (
                                <button className={styles.btnPrimary} onClick={handleSendFriendRequest} disabled={isLoadingAction}>
                                    {ico(FiUserPlus, 14)} {isLoadingAction ? "Đang xử lý..." : "Kết bạn"}
                                </button>
                            )}
                            {friendStatus === "PENDING" && pendingRequestFrom === "YOU" && (
                                <button className={styles.btnOutline} onClick={handleCancelFriendRequest} disabled={isLoadingAction}>
                                    {ico(FiUserX, 14)} Hủy lời mời
                                </button>
                            )}
                            {friendStatus === "PENDING" && pendingRequestFrom === "THEM" && (
                                <>
                                    <button className={styles.btnSuccess} onClick={handleAcceptFriendRequest} disabled={isLoadingAction}>
                                        {ico(FiUserCheck, 14)} Chấp nhận
                                    </button>
                                    <button className={styles.btnDanger} onClick={handleCancelFriendRequest} disabled={isLoadingAction}>
                                        {ico(FiUserX, 14)} Từ chối
                                    </button>
                                </>
                            )}
                            {friendStatus === "ACCEPTED" && (
                                <button className={styles.btnFriend} onClick={handleUnfriend} disabled={isLoadingAction}>
                                    {ico(FiUserCheck, 14)} Bạn bè
                                </button>
                            )}

                            {/* Follow button */}
                            {!followStatus ? (
                                <button className={styles.btnOutline} onClick={handleFollow} disabled={isLoadingAction}>
                                    Theo dõi
                                </button>
                            ) : (
                                <button className={styles.btnOutline} onClick={handleUnfollow} disabled={isLoadingAction}>
                                    Đang theo dõi
                                </button>
                            )}

                            {/* Message */}
                            <button className={styles.btnIcon} onClick={() => navigate("/chat")} title="Nhắn tin">
                                {ico(FiMessageSquare, 16)}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ── MAIN LAYOUT ── */}
            <div className={styles.layout}>
                {/* Left sidebar */}
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

                    {/* Doctor info */}
                    {isDoctor && profileUser.doctor && (
                        <div className={styles.sideCard}>
                            <div className={styles.sideCardTitle}>{ico(RiHospitalLine, 14)} Thông tin bác sĩ</div>
                            <div className={styles.infoList}>
                                {profileUser.doctor.specialty && (
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoIcon}>{ico(FiAward, 14)}</span>
                                        <div className={styles.infoContent}>
                                            <span className={styles.infoLabel}>Chuyên khoa</span>
                                            <span className={styles.infoValue}>{profileUser.doctor.specialty}</span>
                                        </div>
                                    </div>
                                )}
                                {profileUser.doctor.workplace && (
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoIcon}>{ico(FiBriefcase, 14)}</span>
                                        <div className={styles.infoContent}>
                                            <span className={styles.infoLabel}>Nơi làm việc</span>
                                            <span className={styles.infoValue}>{profileUser.doctor.workplace}</span>
                                        </div>
                                    </div>
                                )}
                                {profileUser.doctor.educationalLevel && (
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoIcon}>{ico(FiBook, 14)}</span>
                                        <div className={styles.infoContent}>
                                            <span className={styles.infoLabel}>Học vấn</span>
                                            <span className={styles.infoValue}>{profileUser.doctor.educationalLevel}</span>
                                        </div>
                                    </div>
                                )}
                                {profileUser.doctor.yearsOfExperience && (
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoIcon}>{ico(FiAward, 14)}</span>
                                        <div className={styles.infoContent}>
                                            <span className={styles.infoLabel}>Kinh nghiệm</span>
                                            <span className={styles.infoValue}>{profileUser.doctor.yearsOfExperience} năm</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </aside>

                {/* Feed */}
                <div className={styles.feed}>
                    {loading && page === 0 ? (
                        <div className={styles.spinnerWrap}><MySpinner /></div>
                    ) : posts.length === 0 ? (
                        <div className={styles.emptyPosts}>Chưa có bài viết nào.</div>
                    ) : (
                        posts.map((post: any) => (
                            <div key={post.id} className={styles.postCard}>
                                {post.imagePostResponses?.length > 0 && (
                                    <img
                                        src={post.imagePostResponses[0].postImageUrl}
                                        alt={post.title}
                                        className={styles.postImg}
                                    />
                                )}
                                <div className={styles.postBody}>
                                    <div
                                        className={styles.postAuthorRow}
                                        onClick={() => navigate(`/otherprofile/${post.userResponse.id}`)}
                                    >
                                        <img src={post.userResponse.avatar} alt="" className={styles.postAvatar} />
                                        <div>
                                            <div className={styles.postAuthorName}>
                                                {post.userResponse.firstName} {post.userResponse.lastName}
                                            </div>
                                            <div className={styles.postTime}>
                                                {new Date(post.createdAt).toLocaleString("vi-VN")}
                                                <PrivacyIcon privacyMode={post.visibility} className={styles.privacyIcon} />
                                            </div>
                                        </div>
                                    </div>
                                    {post.title && <h3 className={styles.postTitle}>{post.title}</h3>}
                                    {post.content && <p className={styles.postContent}>{post.content}</p>}
                                </div>
                            </div>
                        ))
                    )}

                    {hasMore && !loading && (
                        <div className={styles.loadMoreWrap}>
                            <button className={styles.loadMoreBtn} onClick={() => setPage(p => p + 1)}>
                                {ico(FiChevronDown, 15)} Xem thêm
                            </button>
                        </div>
                    )}
                    {loading && page > 0 && (
                        <div className={styles.spinnerWrap}><MySpinner /></div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OtherProfile;