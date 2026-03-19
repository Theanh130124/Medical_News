import { useContext, useState, useRef, ChangeEvent, createElement } from "react";
import { MyUserContext } from "../../configs/MyContexts";
import { authformdataApis, endpoint } from "../../configs/Apis";
import { CreatePostProps } from "../../types/post";
import { showCustomToast } from "../layout/MyToaster";
import { handleApiError } from "../../utils/errorHandler";
import styles from "./Styles/create.module.css";
import {
    FiImage, FiBarChart2, FiGlobe, FiUsers, FiLock,
    FiX, FiPlus, FiSend, FiFileText
} from "react-icons/fi";

const ico = (C: any, size: number) => createElement(C, { size });

const initialPost = {
    type: "NORMAL" as "NORMAL" | "SURVEY",
    title: "",
    content: "",
    visibility: "PUBLIC" as "PUBLIC" | "FRIENDS_ONLY" | "PRIVATE",
    images: [] as File[],
    surveyOptions: [""],
};

const visibilityOptions = [
    { value: "PUBLIC",       label: "Công khai",  icon: FiGlobe },
    { value: "FRIENDS_ONLY", label: "Bạn bè",     icon: FiUsers },
    { value: "PRIVATE",      label: "Riêng tư",   icon: FiLock  },
];

const CreatePost = ({ onPostCreated }: CreatePostProps) => {
    const user        = useContext(MyUserContext);
    const [post, setPost]       = useState(initialPost);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        if (files.length > 0) setPost(p => ({ ...p, images: [...p.images, ...files] }));
    };

    const removeImage = (i: number) =>
        setPost(p => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }));

    const addSurveyOption = () =>
        setPost(p => ({ ...p, surveyOptions: [...p.surveyOptions, ""] }));

    const removeSurveyOption = (i: number) =>
        setPost(p => ({ ...p, surveyOptions: p.surveyOptions.filter((_, idx) => idx !== i) }));

    const updateSurveyOption = (i: number, val: string) =>
        setPost(p => ({ ...p, surveyOptions: p.surveyOptions.map((opt, idx) => idx === i ? val : opt) }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("userId",     user.id);
            formData.append("title",      post.title);
            formData.append("content",    post.content);
            formData.append("visibility", post.visibility);
            formData.append("type",       post.type);

            post.images.forEach(img => formData.append("imagePosts", img));

            if (post.type === "SURVEY") {
                const validOptions = post.surveyOptions.filter(opt => opt.trim() !== "");
                if (validOptions.length < 2) {
                    showCustomToast("Khảo sát cần ít nhất 2 lựa chọn!", "error");
                    setLoading(false);
                    return;
                }
                validOptions.forEach((option, index) => {
                    formData.append(`surveyOptions[${index}]`, option);
                });
            }

            await authformdataApis().post(endpoint["create_post"], formData);
            setPost(initialPost);
            setExpanded(false);
            onPostCreated?.();
            showCustomToast("Tạo bài viết thành công!", "success");
        } catch (err) {
            handleApiError(err, "Tạo bài viết thất bại!");
        } finally {
            setLoading(false);
        }
    };

    const currentVis = visibilityOptions.find(v => v.value === post.visibility)!;

    return (
        <div className={styles.createCard}>
            {/* ── HEADER (always visible) ── */}
            <div className={styles.cardHeader}>
                <img src={user?.avatar} alt={user?.username} className={styles.headerAvatar} />
                {!expanded ? (
                    <button
                        className={styles.expandTrigger}
                        onClick={() => setExpanded(true)}
                    >
                        Bạn đang nghĩ gì, {user?.firstName}?
                    </button>
                ) : (
                    <div className={styles.headerInfo}>
                        <span className={styles.headerName}>{user?.firstName} {user?.lastName}</span>
                        <span className={styles.headerSub}>Tạo bài viết mới</span>
                    </div>
                )}
            </div>

            {/* ── FORM (expanded) ── */}
            {expanded && (
                <form onSubmit={handleSubmit} className={styles.form}>

                    {/* Title */}
                    <div className={styles.fieldWrap}>
                        <span className={styles.fieldIcon}>{ico(FiFileText, 15)}</span>
                        <input
                            className={styles.input}
                            type="text"
                            placeholder="Tiêu đề bài viết..."
                            value={post.title}
                            onChange={e => setPost({ ...post, title: e.target.value })}
                            required
                        />
                    </div>

                    {/* Content */}
                    <textarea
                        className={styles.textarea}
                        rows={4}
                        placeholder="Bạn đang nghĩ gì?"
                        value={post.content}
                        onChange={e => setPost({ ...post, content: e.target.value })}
                        required
                    />

                    {/* Row: visibility + type */}
                    <div className={styles.selectRow}>
                        <div className={styles.selectWrap}>
                            <span className={styles.selectIcon}>
                                {ico(currentVis.icon, 14)}
                            </span>
                            <select
                                className={styles.select}
                                value={post.visibility}
                                onChange={e => setPost({ ...post, visibility: e.target.value as any })}
                            >
                                {visibilityOptions.map(v => (
                                    <option key={v.value} value={v.value}>{v.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.selectWrap}>
                            <span className={styles.selectIcon}>{ico(FiBarChart2, 14)}</span>
                            <select
                                className={styles.select}
                                value={post.type}
                                onChange={e => setPost({ ...post, type: e.target.value as any })}
                            >
                                <option value="NORMAL">Bài viết thường</option>
                                <option value="SURVEY">Khảo sát</option>
                            </select>
                        </div>
                    </div>

                    {/* Survey options */}
                    {post.type === "SURVEY" && (
                        <div className={styles.surveyWrap}>
                            <div className={styles.surveyLabel}>
                                {ico(FiBarChart2, 13)} Các lựa chọn khảo sát
                            </div>
                            {post.surveyOptions.map((opt, i) => (
                                <div key={i} className={styles.surveyRow}>
                                    <input
                                        className={styles.surveyInput}
                                        type="text"
                                        placeholder={`Lựa chọn ${i + 1}`}
                                        value={opt}
                                        onChange={e => updateSurveyOption(i, e.target.value)}
                                    />
                                    {post.surveyOptions.length > 1 && (
                                        <button
                                            type="button"
                                            className={styles.surveyRemoveBtn}
                                            onClick={() => removeSurveyOption(i)}
                                        >
                                            {ico(FiX, 13)}
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                className={styles.surveyAddBtn}
                                onClick={addSurveyOption}
                            >
                                {ico(FiPlus, 13)} Thêm lựa chọn
                            </button>
                        </div>
                    )}

                    {/* Image upload */}
                    <div className={styles.imageSection}>
                        <button
                            type="button"
                            className={styles.imageUploadBtn}
                            onClick={() => fileInputRef.current?.click()}
                            disabled={post.images.length >= 4}
                        >
                            {ico(FiImage, 15)}
                            <span>Thêm ảnh ({post.images.length}/4)</span>
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleImageChange}
                            disabled={post.images.length >= 4}
                        />
                    </div>

                    {/* Image previews */}
                    {post.images.length > 0 && (
                        <div className={styles.previewGrid}>
                            {post.images.map((img, i) => (
                                <div key={i} className={styles.previewItem}>
                                    <img
                                        src={URL.createObjectURL(img)}
                                        alt={`preview-${i}`}
                                        className={styles.previewImg}
                                    />
                                    <button
                                        type="button"
                                        className={styles.previewRemove}
                                        onClick={() => removeImage(i)}
                                    >
                                        {ico(FiX, 12)}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Footer actions */}
                    <div className={styles.formFooter}>
                        <button
                            type="button"
                            className={styles.cancelBtn}
                            onClick={() => { setExpanded(false); setPost(initialPost); }}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={loading}
                        >
                            {loading
                                ? "Đang đăng..."
                                : <>{ico(FiSend, 14)} Đăng bài</>
                            }
                        </button>
                    </div>
                </form>
            )}

            {/* Quick action bar (collapsed) */}
            {!expanded && (
                <div className={styles.quickBar}>
                    <button className={styles.quickBtn} onClick={() => setExpanded(true)}>
                        {ico(FiImage, 15)} Ảnh
                    </button>
                    <button className={styles.quickBtn} onClick={() => { setExpanded(true); setPost(p => ({ ...p, type: "SURVEY" })); }}>
                        {ico(FiBarChart2, 15)} Khảo sát
                    </button>
                </div>
            )}
        </div>
    );
};

export default CreatePost;