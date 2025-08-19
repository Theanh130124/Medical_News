import { useEffect, useState } from "react";
import Apis from "../../configs/Apis"; // axios instance
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import MyToaster, { showCustomToast } from "../layout/MyToaster";

import styles from "./Styles/certifcation.module.css";


const UploadCertification = () => {
  const [loading, setLoading] = useState(false);
  const [license, setLicense] = useState<any>({});
  const [file, setFile] = useState<File | null>(null);
  const nav = useNavigate();

  // Lấy id trong sessionStorage
  const doctorId = sessionStorage.getItem("doctorId");

  const info = [
    { label: "Số chứng chỉ hành nghề", field: "certificateNumber", type: "text" },
    { label: "Ngày cấp", field: "issueDate", type: "date" },
    { label: "Ngày hết hạn", field: "expiryDate", type: "date" },
  ];

  const setState = (value: string, field: string) => {
    setLicense({ ...license, [field]: value });
  };

  const uploadLicense = async (e: any) => {
    e.preventDefault();
    if (!doctorId) {
      showCustomToast("Không tìm thấy doctorId trong session!","error");
      return;
    }
    if (!file) {
      showCustomToast("Vui lòng chọn file chứng chỉ!","error");
      return;
    }

    setLoading(true);
    try {

      let payload = { doctorId, ...license, imageCertificate: file, };
      
      let formData = new FormData(); 

      //Object.entries trả về mảng các cặp key-value

        Object.entries(license).forEach(([key, value]) => {
        formData.append(key, value != null ? String(value) : ""); 
        });

        // Append doctorId và file riêng
        formData.append("doctorId", doctorId);
        formData.append("imageCertificate", file);
      let res = await Apis.post("/api/certificate", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.code === 0) {
        showCustomToast("Gửi chứng chỉ hành nghề thành công!","success");
        nav("/login");
      } else {
        showCustomToast(res.data.message,"error");
      }
    } catch (ex: any) {
      showCustomToast("Lỗi khi upload: " + ex.message,"error");
    } finally {
      setLoading(false);
    }
  };

  return (

    <Container fluid className="p-0">
      <Row className={`justify-content-center mt-4 ${styles["custom-row-primary"]}`}>
        <Col lg={6} md={8} sm={12}>
          <h1 className="text-center text-success mb-4">
            Gửi chứng chỉ hành nghề
          </h1>

          <Form onSubmit={uploadLicense}>
            {info.map((f, idx) => (
              <Form.Group className="mb-3" key={idx}>
                <Form.Label>{f.label}</Form.Label>
                <Form.Control
                  type={f.type}
                  onChange={(e) => setState(e.target.value, f.field)}
                  required
                />
              </Form.Group>
            ))}

            <Form.Group className="mb-3">
              <Form.Label>Ảnh chứng chỉ</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e: any) => setFile(e.target.files[0])}
                required
              />
            </Form.Group>

            <div className="text-center">
              <Button
                type="submit"
                className="btn btn-success"
                disabled={loading}
              >
                {loading ? "Đang gửi..." : "Gửi chứng chỉ"}
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default UploadCertification;
