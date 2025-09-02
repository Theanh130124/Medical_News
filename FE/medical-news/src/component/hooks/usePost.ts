// hooks/usePosts.ts
import { useState, useEffect, useContext } from "react";
import { MyUserContext } from "../../configs/MyContexts";
import { authApis, authformdataApis, endpoint } from "../../configs/Apis";
import { Post } from "../../types/post";
import { handleApiError } from "../../utils/errorHandler";
import { showCustomToast } from "../layout/MyToaster";

export const usePosts = (fetchEndpoint: string) => {
  const user = useContext(MyUserContext);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // Fetch posts
  useEffect(() => {
    if (!user) return;

    const fetchPosts = async () => {
  setLoading(true);
  try {
    // Nếu endpoint đã có ?, thì dùng &, nếu chưa thì dùng ?
    const separator = fetchEndpoint.includes("?") ? "&" : "?";
    const res = await authApis().get(fetchEndpoint + `${separator}page=${page}`);
    
    const newPosts = res.data.result.content || [];
    setHasMore(page < res.data.result.totalPages - 1);

    if (page === 0) {
      setPosts(newPosts);
    } else {
      setPosts(prev => [...prev, ...newPosts]);
    }
  } catch (error) {
    console.error("Lỗi lấy posts:", error);
  } finally {
    setLoading(false);
  }
};


    fetchPosts();
  }, [user, page, refreshFlag, fetchEndpoint]);

  // Reset page khi user đổi
  useEffect(() => {
    setPage(0);
  }, [user]);

  const loadMore = () => {
    if (hasMore && !loading) setPage((prev) => prev + 1);
  };

  const handleUpdatePost = async (updatedPost: any) => {
    try {
      await authformdataApis().patch(endpoint.update_post(updatedPost.id), {
        title: updatedPost.title,
        content: updatedPost.content,
        allowComments: updatedPost.allowComments
      });
      showCustomToast("Cập nhật bài viết thành công!", "success");
      setEditingPost(null);
      setPage(0);
      setRefreshFlag(prev => prev + 1);
    } catch (error) {
      console.error(error);
      handleApiError(error, "Cập nhật bài viết thất bại!");
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await authApis().delete(endpoint.update_post(postId));
      showCustomToast("Xóa bài viết thành công!", "success");
      setRefreshFlag(prev => prev + 1);
    } catch (error) {
      console.error(error);
      handleApiError(error, "Xóa bài viết thất bại!");
    }
  };

  const handleRefresh = () => {
    setRefreshFlag(prev => prev + 1);
  };

  return {
    posts,
    loading,
    hasMore,
    editingPost,
    setEditingPost,
    loadMore,
    handleUpdatePost,
    handleDeletePost,
    handleRefresh
  };
};