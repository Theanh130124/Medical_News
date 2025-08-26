import { useContext, useState, useRef, ChangeEvent } from "react";
import { MyUserContext } from "../../configs/MyContexts";
import { authformdataApis, endpoint } from "../../configs/Apis";
import { Form, Button, Row, Col, Card, Badge, Image } from "react-bootstrap";
import { X } from "react-bootstrap-icons";
import { CreatePostProps } from "../../types/post";
import { showCustomToast } from "../layout/MyToaster";
import styles from "./Styles/create.module.css";


const initialPost = {
  type: "NORMAL" as "NORMAL" | "SURVEY",
  title: "",
  content: "",
  visibility: "PUBLIC" as "PUBLIC" | "FRIENDS_ONLY" | "PRIVATE",
  images: [] as File[],
  surveyOptions: [""],
};

//onPostCreated -> reload timeline
const CreatePost = ({ onPostCreated }: CreatePostProps) => {
  const user = useContext(MyUserContext);
  const [post, setPost] = useState(initialPost);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Xử lý ảnh
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      setPost((p) => ({ ...p, images: [...p.images, ...files] }));
    }
  };

  const removeImage = (i: number) =>
    setPost((p) => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }));

  // Khảo sát
  const addSurveyOption = () =>
    setPost((p) => ({ ...p, surveyOptions: [...p.surveyOptions, ""] }));
  const removeSurveyOption = (i: number) =>
    setPost((p) => ({
      ...p,
      surveyOptions: p.surveyOptions.filter((_, idx) => idx !== i),
    }));
  const updateSurveyOption = (i: number, val: string) =>
    setPost((p) => ({
      ...p,
      surveyOptions: p.surveyOptions.map((opt, idx) =>
        idx === i ? val : opt
      ),
    }));

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("userId", user.id);
      formData.append("title", post.title);
      formData.append("content", post.content);
      formData.append("visibility", post.visibility);
      formData.append("type", post.type);

      post.images.forEach((img) => formData.append("imagePosts", img));
      if (post.type === "SURVEY") {
            // Lọc bỏ các option trống trước khi gửi
            const validOptions = post.surveyOptions.filter(opt => opt.trim() !== "");
            
            // Đảm bảo có ít nhất 2 lựa chọn
            if (validOptions.length < 2) {
              showCustomToast("Khảo sát cần ít nhất 2 lựa chọn!", "error");
              setLoading(false);
              return;
            }

          validOptions.forEach((option, index) => {
          formData.append(`surveyOptions[${index}]`, option);
        });
      }
      await authformdataApis().post(endpoint['create_post'], formData);
      setPost(initialPost);
      onPostCreated?.();
      showCustomToast("Tạo bài viết thành công!", "success");
    } catch (err) {
      console.error(err);
      showCustomToast("Tạo bài viết viết thất bại", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={`mb-4 ${styles.createCard}`}>
      <Card.Header className={styles.createHeader}>
        <div className="d-flex align-items-center">
          <Image
            src={user?.avatar}
            roundedCircle
            width={40}
            height={40}
            className="me-2"
          />
          <div>
            <strong>
              {user?.firstName} {user?.lastName}
            </strong>
            <div className="text-muted small">Tạo bài viết mới</div>
          </div>
        </div>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          {/* Title */}
          <Form.Group className="mb-3">
            <Form.Control
              value={post.title}
              onChange={(e) => setPost({ ...post, title: e.target.value })}
              placeholder="Tiêu đề..."
              required
              className={styles.createInput}
            />
          </Form.Group>

          {/* Content */}
          <Form.Group className="mb-3">
            <Form.Control
              as="textarea"
              rows={3}
              value={post.content}
              onChange={(e) => setPost({ ...post, content: e.target.value })}
              placeholder="Bạn đang nghĩ gì?"
              required
              className={styles.createTextarea}
            />
          </Form.Group>

          {/* Visibility */}
          <Form.Group className="mb-3">
            <Form.Select
              value={post.visibility}
              onChange={(e) =>
                setPost({ ...post, visibility: e.target.value as any })
              }
              className={styles.createSelect}
            >
              <option value="PUBLIC">Công khai</option>
              <option value="FRIENDS_ONLY">Bạn bè</option>
              <option value="PRIVATE">Riêng tư</option>
            </Form.Select>
          </Form.Group>

          {/* Type */}
          <Form.Group className="mb-3">
            <Form.Select
              value={post.type}
              onChange={(e) =>
                setPost({
                  ...post,
                  type: e.target.value as "NORMAL" | "SURVEY",
                })
              }
            >
              <option value="NORMAL">Bài viết thường</option>
              <option value="SURVEY">Khảo sát</option>
            </Form.Select>
          </Form.Group>

          {/* Survey */}
          {post.type === "SURVEY" && (
            <Form.Group className="mb-3">
              {post.surveyOptions.map((opt, i) => (
                <div key={i} className="d-flex mb-2">
                  <Form.Control
                    value={opt}
                    onChange={(e) => updateSurveyOption(i, e.target.value)}
                    placeholder={`Lựa chọn ${i + 1}`}
                  />
                  {post.surveyOptions.length > 1 && (
                    <Button
                      variant="outline-danger"
                      className="ms-2"
                      onClick={() => removeSurveyOption(i)}
                    >
                      <X />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline-secondary" onClick={addSurveyOption}>
                Thêm lựa chọn
              </Button>
            </Form.Group>
          )}

          {/* Images */}
          <Form.Group className="mb-3">
            <Form.Label>Ảnh </Form.Label>
            <Form.Control
              type="file"
              multiple
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              disabled={post.images.length >= 4}
            />
            <Form.Text>{post.images.length}/4 ảnh</Form.Text>
          </Form.Group>

          {post.images.length > 0 && (
            <Row className="mb-3">
              {post.images.map((img, i) => (
                <Col xs={6} md={3} key={i}>
                  <Card className="position-relative">
                    <Card.Img
                      src={URL.createObjectURL(img)}
                      style={{ height: "100px", objectFit: "cover" }}
                    />
                    <Badge
                      bg="danger"
                      className="position-absolute top-0 end-0"
                      style={{ cursor: "pointer" }}
                      onClick={() => removeImage(i)}
                    >
                      <X size={12} />
                    </Badge>
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          <Button type="submit" disabled={loading} className={styles.createButton}>
            {loading ? "Đang đăng..." : "Đăng bài"}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default CreatePost;
