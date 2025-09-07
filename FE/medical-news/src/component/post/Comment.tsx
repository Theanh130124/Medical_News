import { useState, useContext } from "react";
import { MyUserContext } from "../../configs/MyContexts";
import { authApis, endpoint } from "../../configs/Apis";
import { Card, Image, Button, InputGroup, Form, Modal } from "react-bootstrap";
import { showCustomToast } from "../layout/MyToaster";
import { handleApiError } from "../../utils/errorHandler";

interface CommentProps {
  post: any;
  onCommentUpdate: () => void;
}

const Comment = ({ post, onCommentUpdate }: CommentProps) => {
  const user = useContext(MyUserContext);
  const [commentContent, setCommentContent] = useState("");
  const [editingComment, setEditingComment] = useState<{ id: string; content: string } | null>(null);

  const handleCreateComment = async () => {
    if (!user) return;
    try {
      if (!commentContent) return;
      await authApis().post(endpoint['create_comment'], { 
        postId: post.id, 
        userId: user.id, 
        content: commentContent 
      });
      setCommentContent("");
      onCommentUpdate();
    } catch (ex) {
      console.error(ex);
       handleApiError(ex, "Bình luận thất bại!");
    }
  };

  const handleUpdateComment = async (commentId: string, content: string) => {
    try {
      await authApis().patch(endpoint.update_comment(commentId), { content });
      showCustomToast("Cập nhật bình luận thành công!", "success");
      onCommentUpdate();
      setEditingComment(null);
    } catch (ex) {
      console.error(ex);
      handleApiError(ex, "Cập nhât bình luận thất bại!");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await authApis().delete(endpoint.delete_comment(commentId));
      showCustomToast("Xóa bình luận thành công!", "success");
      onCommentUpdate();
    } catch (ex) {
      console.error(ex);
       handleApiError(ex, "Xóa bình luận thất bại!");
    }
  };

  return (
    <div className="mt-3">
      <strong>Bình luận:</strong>
      {post.comments?.map((c: any, index: number) => {
        const canEditComment = c.userResponse?.id === user?.id;
        const canDeleteComment = canEditComment || user?.role?.name === "ADMIN";
        
        return (
          <Card key={c.id ?? `${post.id}-comment-${index}`} className="mt-2 p-2">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <Image src={c.userResponse.avatar} roundedCircle width={30} height={30} className="me-2" />
                <strong>{c.userResponse.firstName} {c.userResponse.lastName}</strong>
                <small className="ms-2 text-muted">
                  {c.createdAt ? new Date(c.createdAt).toLocaleString("vi-VN") : ""}
                </small>
              </div>
              <div>
                {canEditComment && (
                  <Button
                    size="sm"
                    variant="warning"
                    className="me-1"
                    onClick={() => setEditingComment({ id: c.id, content: c.content })}
                  >
                    <i className="bi bi-pencil-square"></i>
                  </Button>
                )}
                {canDeleteComment && (
                  <Button size="sm" variant="danger" onClick={() => handleDeleteComment(c.id)}>
                    <i className="bi bi-trash"></i>
                  </Button>
                )}
              </div>
            </div>
            <div>{c.content}</div>
          </Card>
        );
      })}

      <InputGroup className="mt-2">
        <Form.Control
          placeholder={post.allowComments ? "Viết bình luận..." : "Bài viết này không cho phép bình luận"}
          value={commentContent}
          onChange={e => post.allowComments && setCommentContent(e.target.value)}
          disabled={!post.allowComments}
          onKeyPress={e => e.key === 'Enter' && handleCreateComment()}
        />
        <Button 
          variant="primary" 
          onClick={handleCreateComment} 
          disabled={!post.allowComments}
        >
          Gửi
        </Button>
      </InputGroup>

      {/* Modal update comment */}
      <Modal show={!!editingComment} onHide={() => setEditingComment(null)}>
        <Modal.Header closeButton><Modal.Title>Sửa bình luận</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Control 
              as="textarea" 
              value={editingComment?.content || ""} 
              onChange={e => setEditingComment(prev => prev && { ...prev, content: e.target.value })} 
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEditingComment(null)}>Hủy</Button>
          <Button variant="primary" onClick={() => editingComment && handleUpdateComment(editingComment.id, editingComment.content)}>
            Cập nhật
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Comment;