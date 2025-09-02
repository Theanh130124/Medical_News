// components/post/EditPostModal.tsx
import { JSX } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { Post } from "../../types/post";

interface EditPostModalProps {
  show: boolean;
  editingPost: Post | null;
  onHide: () => void;
  onUpdatePost: (updatedPost: any) => void;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onAllowCommentsChange: (allowComments: boolean) => void;
}

const EditPostModal = ({
  show,
  editingPost,
  onHide,
  onUpdatePost,
  onTitleChange,
  onContentChange,
  onAllowCommentsChange
}: EditPostModalProps): JSX.Element => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Sửa bài viết</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Tiêu đề</Form.Label>
            <Form.Control
              type="text"
              value={editingPost?.title || ""}
              onChange={e => onTitleChange(e.target.value)}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Nội dung</Form.Label>
            <Form.Control
              as="textarea"
              value={editingPost?.content || ""}
              onChange={e => onContentChange(e.target.value)}
            />
          </Form.Group>
          <Form.Group>
            <Form.Check
              type="checkbox"
              label="Cho phép bình luận"
              checked={editingPost?.allowComments || false}
              onChange={e => onAllowCommentsChange(e.target.checked)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Hủy</Button>
        <Button variant="primary" onClick={() => onUpdatePost(editingPost)}>Cập nhật</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditPostModal;