import React, { useContext, useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Image } from 'react-bootstrap';
import { MyUserContext } from '../../configs/MyContexts';
import { authApis, authformdataApis, endpoint, CLOUDINARY_URL, CLOUDINARY_PRESET } from '../../configs/Apis';
import { handleApiError } from '../../utils/errorHandler';
import MySpinner from '../layout/MySpinner';
import styles from './Styles/editprofile.module.css';

const EditProfile = () => {
  const user = useContext(MyUserContext);
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    gender: '',
    dateOfBirth: '',
    avatar: null
  });
  const [doctorData, setDoctorData] = useState({
    specialty: '',
    yearsOfExperience: '',
    workplace: '',
    educationalLevel: '',
    introduction: ''
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  useEffect(() => {
    if (user) {
      setUserData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        address: user.address || '',
        gender: user.gender || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        avatar: null
      });
      
      setAvatarPreview(user.avatar || '');

      if (user.doctor) {
        setDoctorData({
          specialty: user.doctor.specialty || '',
          yearsOfExperience: user.doctor.yearsOfExperience || '',
          workplace: user.doctor.workplace || '',
          educationalLevel: user.doctor.educationalLevel || '',
          introduction: user.doctor.introduction || ''
        });
      }
    }
  }, [user]);

  const handleUserChange = (e:any) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleDoctorChange = (e:any) => {
    const { name, value } = e.target;
    setDoctorData({ ...doctorData, [name]: value });
  };

  const handlePasswordChange = (e:any) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const handleAvatarChange = (e:any) => {
    const file = e.target.files[0];
    if (file) {
      setUserData({ ...userData, avatar: file });
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const uploadAvatarToCloudinary = async (file:any) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_PRESET);

      const response = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  };

  const handleUserSubmit = async (e:any) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', content: '' });

    try {
      const formData = new FormData();
      
      if (userData.firstName) formData.append('firstName', userData.firstName);
      if (userData.lastName) formData.append('lastName', userData.lastName);
      if (userData.address) formData.append('address', userData.address);
      if (userData.gender) formData.append('gender', userData.gender);
      if (userData.dateOfBirth) formData.append('dateOfBirth', userData.dateOfBirth);
      if (userData.avatar) {
        const avatarUrl = await uploadAvatarToCloudinary(userData.avatar);
        formData.append('avatar', avatarUrl);
      }

      await authformdataApis().patch(endpoint.update_profile_user(user.id), formData);
      setMessage({ type: 'success', content: 'Cập nhật thông tin thành công!' });
    } catch (error) {
      handleApiError(error, 'Cập nhật thông tin thất bại!');
      setMessage({ type: 'danger', content: 'Cập nhật thông tin thất bại!' });
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSubmit = async (e:any) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', content: '' });

    try {
      await authApis().patch(endpoint.update_doctor(user.doctor.id), doctorData);
      setMessage({ type: 'success', content: 'Cập nhật thông tin bác sĩ thành công!' });
    } catch (error) {
      handleApiError(error, 'Cập nhật thông tin bác sĩ thất bại!');
      setMessage({ type: 'danger', content: 'Cập nhật thông tin bác sĩ thất bại!' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e:any) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', content: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'danger', content: 'Mật khẩu mới và xác nhận mật khẩu không khớp!' });
      setLoading(false);
      return;
    }

    try {
      await authApis().post(endpoint.change_password, passwordData);
      setMessage({ type: 'success', content: 'Đổi mật khẩu thành công!' });
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      handleApiError(error, 'Đổi mật khẩu thất bại!');
      setMessage({ type: 'danger', content: 'Đổi mật khẩu thất bại!' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className={styles.editProfileContainer}>
      <Row className="justify-content-center">
        <Col md={8}>
          <h2 className="text-center mb-4">Chỉnh sửa thông tin cá nhân</h2>
          
          {message.content && (
            <Alert variant={message.type} className="mb-4">
              {message.content}
            </Alert>
          )}

          {/* User Information Form */}
          <Card className="mb-4">
            <Card.Header>
              <h5>Thông tin cá nhân</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleUserSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Họ</Form.Label>
                      <Form.Control
                        type="text"
                        name="firstName"
                        value={userData.firstName}
                        onChange={handleUserChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tên</Form.Label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        value={userData.lastName}
                        onChange={handleUserChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Email (chỉ hiển thị, không cho sửa) */}
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={user?.email || ''}
                    disabled
                    readOnly
                  />
                  <Form.Text className="text-muted">
                    Email không thể thay đổi
                  </Form.Text>
                </Form.Group>

                {/* Số điện thoại (chỉ hiển thị, không cho sửa) */}
                <Form.Group className="mb-3">
                  <Form.Label>Số điện thoại</Form.Label>
                  <Form.Control
                    type="text"
                    value={user?.phoneNumber || ''}
                    disabled
                    readOnly
                  />
                  <Form.Text className="text-muted">
                    Số điện thoại không thể thay đổi
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Địa chỉ</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={userData.address}
                    onChange={handleUserChange}
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Giới tính</Form.Label>
                      <Form.Select
                        name="gender"
                        value={userData.gender}
                        onChange={handleUserChange}
                      >
                        <option value="">Chọn giới tính</option>
                        <option value="MALE">Nam</option>
                        <option value="FEMALE">Nữ</option>
                        <option value="OTHER">Khác</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Ngày sinh</Form.Label>
                      <Form.Control
                        type="date"
                        name="dateOfBirth"
                        value={userData.dateOfBirth}
                        onChange={handleUserChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Ảnh đại diện</Form.Label>
                  <div className="d-flex align-items-center">
                    {avatarPreview && (
                      <Image 
                        src={avatarPreview} 
                        roundedCircle 
                        width={80} 
                        height={80} 
                        className="me-3"
                      />
                    )}
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                  </div>
                </Form.Group>

                <div className="d-flex justify-content-end">
                  <Button 
                    type="submit" 
                    variant="primary" 
                    disabled={loading}
                  >
                    {loading ? <MySpinner /> : 'Cập nhật thông tin'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>

          {/* Doctor Information Form (if user is a doctor) */}
          {user?.doctor && (
            <Card className="mb-4">
              <Card.Header>
                <h5>Thông tin bác sĩ</h5>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleDoctorSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Chuyên khoa</Form.Label>
                    <Form.Control
                      type="text"
                      name="specialty"
                      value={doctorData.specialty}
                      onChange={handleDoctorChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Số năm kinh nghiệm</Form.Label>
                    <Form.Control
                      type="number"
                      name="yearsOfExperience"
                      value={doctorData.yearsOfExperience}
                      onChange={handleDoctorChange}
                      min="0"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Nơi làm việc</Form.Label>
                    <Form.Control
                      type="text"
                      name="workplace"
                      value={doctorData.workplace}
                      onChange={handleDoctorChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Trình độ học vấn</Form.Label>
                    <Form.Control
                      type="text"
                      name="educationalLevel"
                      value={doctorData.educationalLevel}
                      onChange={handleDoctorChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Giới thiệu</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="introduction"
                      value={doctorData.introduction}
                      onChange={handleDoctorChange}
                    />
                  </Form.Group>

                  <div className="d-flex justify-content-end">
                    <Button 
                      type="submit" 
                      variant="primary" 
                      disabled={loading}
                    >
                      {loading ? <MySpinner /> : 'Cập nhật thông tin bác sĩ'}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          )}

          {/* Change Password Form */}
          <Card>
            <Card.Header>
              <h5>Đổi mật khẩu</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handlePasswordSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Mật khẩu hiện tại</Form.Label>
                  <Form.Control
                    type="password"
                    name="oldPassword"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Mật khẩu mới</Form.Label>
                  <Form.Control
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Xác nhận mật khẩu mới</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </Form.Group>

                <div className="d-flex justify-content-end">
                  <Button 
                    type="submit" 
                    variant="primary" 
                    disabled={loading}
                  >
                    {loading ? <MySpinner /> : 'Đổi mật khẩu'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EditProfile;